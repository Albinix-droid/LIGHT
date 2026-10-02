// lib/dashboard/queries.ts
// Données de l'accueil étudiant (serveur uniquement) : projet mis en avant, activité, équipe, projets
import 'server-only';
import prisma from '@/lib/prisma';
import { STAGES, getStageIndex } from '@/lib/parcours';
import { getActionItems, listNotifications } from '@/lib/notifications/queries';

const DAY = 86_400_000;
const ACTIVITY_WINDOW_DAYS = 180;

const personSelect = {
    id: true, firstName: true, lastName: true, avatarUrl: true, role: true, grade: true, specialty: true,
} as const;

export type ActivityKind = 'created' | 'submitted' | 'approved' | 'changes';

export interface ActivityEvent {
    id: string;
    kind: ActivityKind;
    date: string; // ISO
    title: string;
    detail: string;
    href: string;
}

export interface HomeContact {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
    detail: string;
    isSupervisor: boolean;
}

export async function getStudentHome(userId: string, preferredProjectId?: string) {
    const mine = { OR: [{ ownerId: userId }, { members: { some: { userId } } }] };

    const projects = await prisma.project.findMany({
        where: mine,
        select: {
            id: true, title: true, sector: true, stage: true, progress: true, updatedAt: true, createdAt: true, ownerId: true,
            steps: { select: { stage: true, status: true } },
            _count: { select: { members: true } },
        },
        orderBy: { updatedAt: 'desc' },
    });
    if (projects.length === 0) return null;

    const featuredSummary = projects.find((p) => p.id === preferredProjectId) ?? projects[0];
    const projectIds = projects.map((p) => p.id);
    const since = new Date(Date.now() - ACTIVITY_WINDOW_DAYS * DAY);

    const [featured, lastReview, submissions, actionItems, notifications] = await Promise.all([
        prisma.project.findUniqueOrThrow({
            where: { id: featuredSummary.id },
            select: {
                supervisor: { select: personSelect },
                members: { select: { role: true, user: { select: personSelect } }, orderBy: { joinedAt: 'asc' } },
            },
        }),
        prisma.stepSubmission.findFirst({
            where: { step: { projectId: featuredSummary.id }, decision: { not: null } },
            select: { rating: true, decision: true, reviewedAt: true, step: { select: { stage: true } } },
            orderBy: { reviewedAt: 'desc' },
        }),
        prisma.stepSubmission.findMany({
            where: { step: { projectId: { in: projectIds } }, OR: [{ submittedAt: { gte: since } }, { reviewedAt: { gte: since } }] },
            select: {
                id: true, submittedAt: true, reviewedAt: true, decision: true,
                step: { select: { stage: true, project: { select: { id: true, title: true } } } },
            },
            orderBy: { submittedAt: 'desc' },
            take: 200,
        }),
        getActionItems(userId, 'STUDENT'),
        listNotifications(userId, 'STUDENT', { take: 4 }),
    ]);

    // ===== Activité du parcours (calendrier) =====
    const stageLabel = (stage: string) => STAGES.find((s) => s.stage === stage)?.label ?? stage;
    const stageSlug = (stage: string) => STAGES.find((s) => s.stage === stage)?.slug ?? '';
    const activity: ActivityEvent[] = [];
    for (const s of submissions) {
        const { project, stage } = s.step;
        const href = `/dashboard/projets/${project.id}/${stageSlug(stage)}`;
        activity.push({
            id: `${s.id}-sub`, kind: 'submitted', date: s.submittedAt.toISOString(),
            title: `${stageLabel(stage)} soumise`, detail: project.title, href,
        });
        if (s.reviewedAt && s.decision) {
            activity.push({
                id: `${s.id}-rev`, kind: s.decision === 'APPROVED' ? 'approved' : 'changes', date: s.reviewedAt.toISOString(),
                title: s.decision === 'APPROVED' ? `${stageLabel(stage)} validée` : `Modifications demandées · ${stageLabel(stage)}`,
                detail: project.title, href,
            });
        }
    }
    for (const p of projects) {
        if (p.createdAt >= since) {
            activity.push({ id: `${p.id}-new`, kind: 'created', date: p.createdAt.toISOString(), title: 'Projet créé', detail: p.title, href: `/dashboard/projets/${p.id}` });
        }
    }
    activity.sort((a, b) => b.date.localeCompare(a.date));

    // ===== Équipe d'accompagnement =====
    const roleLabels: Record<string, string> = { OWNER: 'Porteur', CO_DIRECTOR: 'Co-directeur', SECRETARY: 'Secrétaire', MEMBER: 'Membre' };
    const contacts: HomeContact[] = [];
    if (featured.supervisor) {
        const s = featured.supervisor;
        contacts.push({
            id: s.id, name: `${s.firstName} ${s.lastName}`.trim(), avatarUrl: s.avatarUrl, role: 'Encadrant',
            detail: [s.grade, s.specialty].filter(Boolean).join(' · ') || 'Encadrant académique', isSupervisor: true,
        });
    }
    for (const m of featured.members) {
        if (m.user.id === userId) continue;
        contacts.push({
            id: m.user.id, name: `${m.user.firstName} ${m.user.lastName}`.trim(), avatarUrl: m.user.avatarUrl,
            role: roleLabels[m.role] ?? 'Membre', detail: roleLabels[m.role] ?? 'Membre', isSupervisor: false,
        });
    }

    const stageIndex = getStageIndex(featuredSummary.stage);
    const completedSteps = featuredSummary.steps.filter((s) => s.status === 'COMPLETED').length;
    const currentStep = featuredSummary.steps.find((s) => s.stage === featuredSummary.stage);

    return {
        featured: {
            id: featuredSummary.id,
            title: featuredSummary.title,
            sector: featuredSummary.sector,
            progress: featuredSummary.progress,
            stageIndex,
            stageLabel: STAGES[stageIndex].label,
            stageSlug: STAGES[stageIndex].slug,
            currentStatus: currentStep?.status ?? 'IN_PROGRESS',
            completedSteps,
            hasSupervisor: !!featured.supervisor,
            supervisorName: featured.supervisor ? `${featured.supervisor.firstName} ${featured.supervisor.lastName}`.trim() : null,
            lastReview: lastReview?.reviewedAt
                ? {
                    rating: lastReview.rating,
                    approved: lastReview.decision === 'APPROVED',
                    stageLabel: stageLabel(lastReview.step.stage),
                    reviewedAt: lastReview.reviewedAt.toISOString(),
                }
                : null,
        },
        projects: projects.map((p) => ({
            id: p.id,
            title: p.title,
            sector: p.sector,
            progress: p.progress,
            stageLabel: STAGES[getStageIndex(p.stage)].label,
            stageIndex: getStageIndex(p.stage),
            members: p._count.members,
            updatedAt: p.updatedAt.toISOString(),
            isOwner: p.ownerId === userId,
        })),
        activity,
        contacts,
        actionItems,
        notifications: notifications.items,
    };
}

// Heure de la requête : une page serveur est rendue une fois par requête, la valeur est donc stable
// et transmise aux composants clients (calendrier, temps relatifs) pour un affichage identique à l'hydratation.
export function requestTime() {
    return Date.now();
}

export type StudentHome = NonNullable<Awaited<ReturnType<typeof getStudentHome>>>;
