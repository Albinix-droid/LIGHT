// app/encadrant/actions.ts
// SERVER ACTIONS ENCADRANT - DÉCISION SUR UNE ÉTAPE SOUMISE
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { advanceProjectAfterApproval, getProjectStudentIds, notify } from '@/lib/accompagnement';
import { STAGES, MIN_FEEDBACK_LENGTH } from '@/lib/parcours';

type ActionResult = { ok: true } | { ok: false; error: string };

export async function reviewSubmission(input: {
    submissionId: string;
    decision: 'APPROVED' | 'CHANGES_REQUESTED';
    feedback: string;
    rating: number;
}): Promise<ActionResult> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ENCADRANT') return { ok: false, error: 'Action réservée aux encadrants.' };

    if (input.decision !== 'APPROVED' && input.decision !== 'CHANGES_REQUESTED') {
        return { ok: false, error: 'Décision invalide.' };
    }
    const feedback = input.feedback?.trim() ?? '';
    if (feedback.length < MIN_FEEDBACK_LENGTH) {
        return { ok: false, error: `Le retour doit contenir au moins ${MIN_FEEDBACK_LENGTH} caractères pour guider l'étudiant.` };
    }
    const rating = Math.round(Number(input.rating));
    if (!(rating >= 1 && rating <= 5)) return { ok: false, error: 'Attribuez une note de 1 à 5 étoiles.' };

    const submission = await prisma.stepSubmission.findUnique({
        where: { id: input.submissionId },
        include: { step: { include: { project: { select: { id: true, title: true, supervisorId: true } } } } },
    });
    if (!submission || submission.step.project.supervisorId !== user.id) {
        return { ok: false, error: 'Soumission introuvable.' };
    }
    if (submission.decision) return { ok: false, error: 'Une décision a déjà été rendue pour cette soumission.' };

    const { step } = submission;
    const approved = input.decision === 'APPROVED';

    await prisma.$transaction([
        prisma.stepSubmission.update({
            where: { id: submission.id },
            data: { decision: input.decision, feedback, rating, reviewerId: user.id, reviewedAt: new Date() },
        }),
        prisma.projectStep.update({
            where: { id: step.id },
            data: approved
                ? { status: 'COMPLETED', completedAt: new Date() }
                : { status: 'CHANGES_REQUESTED' },
        }),
    ]);

    if (approved) await advanceProjectAfterApproval(step.projectId, step.stage);

    const stage = STAGES.find((s) => s.stage === step.stage)!;
    await notify(await getProjectStudentIds(step.projectId), {
        projectId: step.projectId,
        type: 'VALIDATION',
        message: approved
            ? `${user.firstName} ${user.lastName} a validé l'étape ${stage.label} de « ${step.project.title} »`
            : `${user.firstName} ${user.lastName} demande des modifications sur l'étape ${stage.label} de « ${step.project.title} »`,
        link: `/dashboard/projets/${step.projectId}/${stage.slug}`,
    });

    revalidatePath('/encadrant', 'layout');
    revalidatePath('/dashboard', 'layout');
    return { ok: true };
}

