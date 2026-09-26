// lib/assistant/context.ts
// Dossier du projet transmis à l'assistant : informations générales, contenu des 5 étapes, retours de l'encadrant.
import 'server-only';
import prisma from '@/lib/prisma';
import { STAGES, SECTOR_LABELS, getStageIndex } from '@/lib/parcours';

const MAX_FIELD_LENGTH = 1500; // un champ trop long est tronqué
const MAX_DOSSIER_LENGTH = 40_000; // plafond global (~10 000 tokens)

const STATUS_LABELS: Record<string, string> = {
    IN_PROGRESS: 'en cours de rédaction',
    SUBMITTED: "soumise, en attente de l'encadrant",
    CHANGES_REQUESTED: "modifications demandées par l'encadrant",
    COMPLETED: "validée par l'encadrant",
};

// Noms lisibles des champs saisis dans les formulaires d'étape
const FIELD_LABELS: Record<string, string> = {
    title: 'Nom', description: 'Description', problem: 'Problème', solution: 'Solution',
    targetAudience: 'Clients cibles', valueProposition: 'Valeur ajoutée', revenueModel: 'Modèle de revenus',
    brainstorming: 'Notes', functional: 'Spécifications fonctionnelles', objectives: 'Objectifs',
    features: 'Fonctionnalités', useCases: "Cas d'usage", architecture: 'Architecture technique', ux: 'UX',
    wireframes: 'Maquettes', userJourney: 'Parcours utilisateur', planning: 'Planification', milestones: 'Jalons',
    resources: 'Ressources', risks: 'Risques', constraints: 'Contraintes', repoUrl: 'Dépôt', tasks: 'Tâches',
    testCoverage: 'Couverture de tests (%)', deployments: 'Déploiements', testCases: 'Cas de test',
    userTests: 'Retours utilisateurs', bugs: 'Bugs', launch: 'Lancement', goToMarket: 'Go-to-market',
    communication: 'Communication', postLaunch: 'Suivi post-lancement', kpis: 'KPI', partners: 'Partenaires',
    nextSteps: 'Prochaines étapes', businessPlanUrl: 'Business plan', pitchDeckUrl: 'Pitch deck',
};

// Transforme le JSON d'une étape en texte compact et lisible (sans images ni champs vides)
function render(value: unknown, indent = ''): string {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'string') {
        if (value.startsWith('data:image/')) return '[image]';
        const text = value.trim();
        return text.length > MAX_FIELD_LENGTH ? `${text.slice(0, MAX_FIELD_LENGTH)}… [tronqué]` : text;
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
        const items = value.map((v) => render(v, indent + '  ')).filter(Boolean);
        if (items.length === 0) return '';
        // Les maquettes sont des images : on indique seulement leur nombre
        if (items.every((i) => i === '[image]')) return `${items.length} image(s) importée(s)`;
        return items.map((i) => `\n${indent}- ${i.replace(/\n/g, `\n${indent}  `)}`).join('');
    }
    if (typeof value === 'object') {
        const lines = Object.entries(value as Record<string, unknown>)
            .filter(([key]) => !['id', 'createdAt', 'logo'].includes(key))
            .map(([key, v]) => {
                const rendered = render(v, indent + '  ');
                return rendered ? `\n${indent}${FIELD_LABELS[key] ?? key} : ${rendered}` : '';
            })
            .filter(Boolean);
        return lines.join('');
    }
    return '';
}

export async function buildProjectDossier(projectId: string, userId: string): Promise<string | null> {
    const project = await prisma.project.findFirst({
        where: { id: projectId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
        include: {
            supervisor: { select: { firstName: true, lastName: true } },
            _count: { select: { members: true } },
            steps: {
                include: { submissions: { orderBy: { submittedAt: 'desc' }, take: 1 } },
            },
        },
    });
    if (!project) return null;

    const current = getStageIndex(project.stage);
    const parts: string[] = [
        `# Projet : ${project.title}`,
        `Secteur : ${project.sector ? SECTOR_LABELS[project.sector] ?? project.sector : 'non renseigné'}`,
        `Équipe : ${project.teamSize} personne(s) prévue(s), ${project._count.members} inscrite(s) sur la plateforme`,
        `Étape actuelle : ${current + 1}/5 – ${STAGES[current].label} · progression ${project.progress} %`,
        `Encadrant : ${project.supervisor ? `${project.supervisor.firstName} ${project.supervisor.lastName}`.trim() : 'aucun encadrant choisi'}`,
        project.budgetEstimated ? `Budget estimé : ${project.budgetEstimated.toLocaleString('fr-FR')} FCFA (dépensé : ${project.budgetSpent.toLocaleString('fr-FR')} FCFA)` : '',
        project.description ? `\nDescription : ${project.description}` : '',
    ];

    for (const [index, stage] of STAGES.entries()) {
        const step = project.steps.find((s) => s.stage === stage.stage);
        const content = step ? render(step.data) : '';
        const status = step ? STATUS_LABELS[step.status] : index > current ? 'pas encore commencée' : 'non commencée';
        parts.push(`\n## Étape ${index + 1} – ${stage.label} (${status})`);
        parts.push(content || '(aucun contenu saisi)');

        const review = step?.submissions[0];
        if (review?.decision && review.feedback) {
            parts.push(
                `\nRetour de l'encadrant (${review.decision === 'APPROVED' ? 'étape validée' : 'modifications demandées'}${review.rating ? `, note ${review.rating}/5` : ''}) : ${review.feedback}`,
            );
        }
    }

    const dossier = parts.filter(Boolean).join('\n');
    return dossier.length > MAX_DOSSIER_LENGTH ? `${dossier.slice(0, MAX_DOSSIER_LENGTH)}\n… [dossier tronqué]` : dossier;
}
