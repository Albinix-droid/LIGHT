// app/dashboard/projets/actions.ts
// SERVER ACTIONS ÉTUDIANT - CRÉATION DE PROJET, PARCOURS EN 5 ÉTAPES, SOUMISSION À L'ENCADRANT
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getAccessibleProject, isStageUnlocked } from '@/lib/projects';
import { notify } from '@/lib/accompagnement';
import {
    STAGES, SECTOR_LABELS, MIN_DESCRIPTION_LENGTH, getStageBySlug, getMissingRequirements, type StageSlug,
} from '@/lib/parcours';
import type { Prisma } from '@/lib/generated/prisma/client';

type ActionResult = { ok: true } | { ok: false; error: string };

// Les maquettes sont stockées en data URL : on borne la taille d'une étape
const MAX_STEP_SIZE = 4_000_000;
const MAX_NOTE_LENGTH = 2000;

// ============================================================
// CRÉATION D'UN PROJET
// ============================================================
export async function createProject(input: {
    title: string;
    sector: string;
    description: string;
    teamSize: number;
    supervisorId?: string;
}): Promise<{ ok: true; projectId: string } | { ok: false; error: string }> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Vous devez être connecté pour créer un projet.' };

    const title = input.title?.trim() ?? '';
    const description = input.description?.trim() ?? '';
    if (title.length < 3) return { ok: false, error: 'Le titre doit contenir au moins 3 caractères.' };
    if (!(input.sector in SECTOR_LABELS)) return { ok: false, error: 'Secteur invalide.' };
    if (description.length < MIN_DESCRIPTION_LENGTH) {
        return { ok: false, error: `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères.` };
    }
    const teamSize = Math.min(10, Math.max(1, Math.round(Number(input.teamSize) || 1)));

    const supervisorId = input.supervisorId || null;
    if (supervisorId && !(await isEncadrant(supervisorId))) {
        return { ok: false, error: 'Encadrant invalide.' };
    }

    const project = await prisma.project.create({
        data: {
            title,
            description,
            sector: input.sector,
            teamSize,
            ownerId: user.id,
            members: { create: { userId: user.id, role: 'OWNER' } },
            // L'idéalisation démarre avec les informations saisies à la création
            steps: { create: { stage: 'IDEALISATION', data: { title, description } } },
        },
    });

    // L'encadrant choisi reçoit une demande d'encadrement : il accepte ou refuse de suivre le projet
    if (supervisorId) {
        await prisma.projectRequest.create({
            data: { type: 'SUPERVISION_REQUEST', projectId: project.id, senderId: user.id, recipientId: supervisorId },
        });
        await notify([supervisorId], {
            projectId: project.id,
            type: 'INVITATION',
            message: `${user.firstName} ${user.lastName} vous demande d'encadrer le projet « ${title} »`.replace(/\s+/g, ' '),
            link: '/encadrant/demandes',
        });
        revalidatePath('/encadrant', 'layout');
    }

    // 'layout' : le sélecteur de projet de la topbar doit aussi se mettre à jour
    revalidatePath('/dashboard', 'layout');
    return { ok: true, projectId: project.id };
}

// Le choix de l'encadrant passe par une demande d'encadrement : voir lib/demandes/actions.ts

// ============================================================
// SAUVEGARDE D'UNE ÉTAPE
// ============================================================
export async function saveStep(projectId: string, slug: StageSlug, data: unknown): Promise<ActionResult> {
    const checked = await checkStepAccess(projectId, slug, data);
    if (!checked.ok) return checked;
    const { stage } = checked;

    await persistStep(projectId, stage.stage, data as Prisma.InputJsonValue);

    // L'idéalisation peut renommer le projet (liste, topbar)
    revalidatePath('/dashboard', 'layout');
    return { ok: true };
}

// ============================================================
// SOUMISSION D'UNE ÉTAPE À L'ENCADRANT
// C'est l'encadrant qui valide (voir app/encadrant/actions.ts)
// ============================================================
export async function submitStep(
    projectId: string,
    slug: StageSlug,
    data: unknown,
    note?: string,
): Promise<ActionResult> {
    const checked = await checkStepAccess(projectId, slug, data);
    if (!checked.ok) return checked;
    const { stage, project, user } = checked;

    if (!project.supervisorId || !project.supervisor) {
        return { ok: false, error: "Choisissez d'abord un encadrant sur la page du projet pour pouvoir soumettre vos étapes." };
    }

    // Les étapes se préparent librement, mais se soumettent dans l'ordre du parcours
    if (!isStageUnlocked(project.stage, stage.stage)) {
        const previous = STAGES[STAGES.findIndex((s) => s.stage === stage.stage) - 1];
        return {
            ok: false,
            error: `Vous pourrez soumettre cette étape dès que votre encadrant aura validé l'étape ${previous.label}. Vos modifications peuvent déjà être sauvegardées.`,
        };
    }

    const current = project.steps.find((s) => s.stage === stage.stage);
    if (current?.status === 'SUBMITTED') {
        return { ok: false, error: 'Cette étape est déjà en attente de la décision de votre encadrant.' };
    }
    if (current?.status === 'COMPLETED') {
        return { ok: false, error: 'Cette étape a déjà été validée par votre encadrant.' };
    }

    const missing = getMissingRequirements(slug, data as Record<string, unknown>);
    if (missing.length > 0) {
        return { ok: false, error: `Pour soumettre cette étape, il manque : ${missing.join(' ; ')}.` };
    }

    const trimmedNote = note?.trim().slice(0, MAX_NOTE_LENGTH) || null;
    const step = await persistStep(projectId, stage.stage, data as Prisma.InputJsonValue, 'SUBMITTED');

    // Instantané : l'encadrant examine exactement ce qui a été soumis
    await prisma.stepSubmission.create({
        data: { stepId: step.id, authorId: user.id, note: trimmedNote, data: data as Prisma.InputJsonValue },
    });

    await notify([project.supervisorId], {
        projectId,
        type: 'VALIDATION',
        message: `${user.firstName} ${user.lastName} a soumis l'étape ${stage.label} du projet « ${project.title} »`.replace(/\s+/g, ' '),
        link: `/encadrant/validations`,
    });

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/encadrant', 'layout');
    return { ok: true };
}

// ============================================================
// HELPERS
// ============================================================
async function isEncadrant(userId: string) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return u?.role === 'ENCADRANT';
}

async function checkStepAccess(projectId: string, slug: StageSlug, data: unknown) {
    const user = await getCurrentUser();
    if (!user) return { ok: false as const, error: 'Session expirée. Veuillez vous reconnecter.' };

    const stage = getStageBySlug(slug);
    if (!stage) return { ok: false as const, error: 'Étape inconnue.' };

    const project = await getAccessibleProject(projectId, user.id);
    if (!project) return { ok: false as const, error: 'Projet introuvable.' };

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return { ok: false as const, error: 'Données invalides.' };
    }
    if (JSON.stringify(data).length > MAX_STEP_SIZE) {
        return { ok: false as const, error: 'Les données sont trop volumineuses (réduisez le nombre ou la taille des maquettes).' };
    }

    return { ok: true as const, stage, project, user };
}

async function persistStep(
    projectId: string,
    stage: (typeof STAGES)[number]['stage'],
    data: Prisma.InputJsonValue,
    status?: 'SUBMITTED',
) {
    const step = await prisma.projectStep.upsert({
        where: { projectId_stage: { projectId, stage } },
        update: { data, ...(status ? { status } : {}) },
        create: { projectId, stage, data, ...(status ? { status } : {}) },
    });

    // Le titre et la description de l'idéalisation sont ceux du projet
    if (stage === 'IDEALISATION') {
        const { title, description } = data as { title?: string; description?: string };
        if (title?.trim()) {
            await prisma.project.update({
                where: { id: projectId },
                data: { title: title.trim(), description: description?.trim() || null },
            });
        }
    }
    return step;
}
