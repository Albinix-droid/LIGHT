// lib/projects.ts
// Accès aux projets (serveur uniquement)
import 'server-only';
import prisma from '@/lib/prisma';
import { getStageIndex, type StageKey } from '@/lib/parcours';

const personSelect = { id: true, firstName: true, lastName: true, email: true } as const;

// ============================================================
// CÔTÉ ÉTUDIANT
// ============================================================

// Projet accessible si l'utilisateur en est propriétaire ou membre
export function getAccessibleProject(projectId: string, userId: string) {
    return prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        include: {
            supervisor: { select: personSelect },
            steps: {
                include: {
                    // Dernier tour d'accompagnement de chaque étape
                    submissions: {
                        orderBy: { submittedAt: 'desc' },
                        take: 1,
                        include: { reviewer: { select: personSelect } },
                    },
                },
            },
        },
    });
}

export function listProjectsForUser(userId: string) {
    return prisma.project.findMany({
        where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
        include: { _count: { select: { members: true } } },
        orderBy: { updatedAt: 'desc' },
    });
}

export function listEncadrants() {
    return prisma.user.findMany({
        where: { role: 'ENCADRANT' },
        select: personSelect,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
}

// Une étape est accessible si elle précède ou égale l'étape courante du projet
export function isStageUnlocked(currentStage: StageKey, stage: StageKey) {
    return getStageIndex(stage) <= getStageIndex(currentStage);
}

// ============================================================
// CÔTÉ ENCADRANT
// ============================================================

export function listSupervisedProjects(supervisorId: string) {
    return prisma.project.findMany({
        where: { supervisorId },
        include: {
            owner: { select: personSelect },
            steps: { select: { stage: true, status: true } },
        },
        orderBy: { updatedAt: 'desc' },
    });
}

export function getSupervisedProject(projectId: string, supervisorId: string) {
    return prisma.project.findFirst({
        where: { id: projectId, supervisorId },
        include: {
            owner: { select: personSelect },
            members: { include: { user: { select: personSelect } } },
            steps: {
                include: {
                    submissions: {
                        orderBy: { submittedAt: 'desc' },
                        include: {
                            author: { select: personSelect },
                            reviewer: { select: personSelect },
                        },
                    },
                },
            },
        },
    });
}

// Soumissions en attente de décision, les plus anciennes d'abord
export function listPendingSubmissions(supervisorId: string) {
    return prisma.stepSubmission.findMany({
        where: { decision: null, step: { project: { supervisorId } } },
        include: {
            author: { select: personSelect },
            step: {
                select: {
                    stage: true,
                    project: { select: { id: true, title: true, progress: true, sector: true } },
                },
            },
        },
        orderBy: { submittedAt: 'asc' },
    });
}

export function listReviewedSubmissions(reviewerId: string, take = 20) {
    return prisma.stepSubmission.findMany({
        where: { reviewerId, decision: { not: null } },
        include: {
            author: { select: personSelect },
            step: { select: { stage: true, project: { select: { id: true, title: true } } } },
        },
        orderBy: { reviewedAt: 'desc' },
        take,
    });
}

// Historique des tours précédents d'une étape (pour contextualiser une revue)
export function listStepRounds(stepId: string) {
    return prisma.stepSubmission.findMany({
        where: { stepId },
        include: { reviewer: { select: personSelect } },
        orderBy: { submittedAt: 'desc' },
    });
}

export function fullName(p: { firstName: string; lastName: string } | null | undefined) {
    return p ? `${p.firstName} ${p.lastName}`.trim() : '';
}
