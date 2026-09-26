// lib/accompagnement.ts
// Logique partagée du suivi étudiant ↔ encadrant (serveur uniquement)
import 'server-only';
import prisma from '@/lib/prisma';
import { STAGES, getStageIndex, type StageKey } from '@/lib/parcours';
import type { NotificationType } from '@/lib/generated/prisma/client';

// Après validation d'une étape par l'encadrant : progression et déblocage de l'étape suivante
export async function advanceProjectAfterApproval(projectId: string, stage: StageKey) {
    const [project, completedCount] = await Promise.all([
        prisma.project.findUniqueOrThrow({ where: { id: projectId }, select: { stage: true } }),
        prisma.projectStep.count({ where: { projectId, status: 'COMPLETED' } }),
    ]);

    const stageIndex = getStageIndex(stage);
    const next = STAGES[stageIndex + 1];
    // L'étape courante n'avance que si l'étape validée est l'étape en cours
    const advance = next && getStageIndex(project.stage) === stageIndex;

    await prisma.project.update({
        where: { id: projectId },
        data: {
            progress: Math.round((completedCount / STAGES.length) * 100),
            ...(advance ? { stage: next.stage } : {}),
        },
    });
}

export async function notify(
    userIds: string[],
    notification: { projectId: string; type: NotificationType; message: string; link: string },
) {
    const unique = [...new Set(userIds)];
    if (unique.length === 0) return;
    await prisma.notification.createMany({
        data: unique.map((userId) => ({ userId, ...notification })),
    });
}

// Étudiants à prévenir d'une décision : propriétaire et membres du projet
export async function getProjectStudentIds(projectId: string) {
    const project = await prisma.project.findUniqueOrThrow({
        where: { id: projectId },
        select: { ownerId: true, members: { select: { userId: true } } },
    });
    return [project.ownerId, ...project.members.map((m) => m.userId)];
}
