// app/dashboard/projets/[id]/loadStep.ts
// Chargement commun des pages d'étape : authentification, accès au projet, suivi encadrant
// Toutes les étapes sont consultables et modifiables ; seule la SOUMISSION suit l'ordre du parcours.
import 'server-only';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getAccessibleProject, isStageUnlocked, fullName } from '@/lib/projects';
import { STAGES, getStageBySlug, getStageIndex, type StageSlug } from '@/lib/parcours';
import type { StepReviewInfo, StepStatusKey } from './StepStatusBanner';

export interface StepProps<T> {
    projectId: string;
    projectTitle: string;
    initialData: Partial<T> | null;
    completed: boolean;
    status: StepStatusKey;
    supervisorName: string | null;
    review: StepReviewInfo | null;
    // Étape à venir : on peut la préparer, pas encore la soumettre
    locked: boolean;
    previousStageLabel: string | null;
}

export async function loadStep<T>(params: Promise<{ id: string }>, slug: StageSlug): Promise<StepProps<T>> {
    const { id } = await params;
    const user = await requireUser();

    const project = await getAccessibleProject(id, user.id);
    if (!project) notFound();

    const stage = getStageBySlug(slug)!;
    const locked = !isStageUnlocked(project.stage, stage.stage);
    const stageIndex = getStageIndex(stage.stage);

    const step = project.steps.find((s) => s.stage === stage.stage);
    const last = step?.submissions[0];

    return {
        projectId: project.id,
        projectTitle: project.title,
        initialData: (step?.data as Partial<T> | undefined) ?? null,
        completed: step?.status === 'COMPLETED',
        status: step?.status ?? 'IN_PROGRESS',
        supervisorName: fullName(project.supervisor) || null,
        locked,
        previousStageLabel: stageIndex > 0 ? STAGES[stageIndex - 1].label : null,
        review: last
            ? {
                submittedAt: last.submittedAt.toISOString(),
                note: last.note,
                decision: last.decision,
                feedback: last.feedback,
                rating: last.rating,
                reviewedAt: last.reviewedAt?.toISOString() ?? null,
                reviewerName: fullName(last.reviewer) || null,
            }
            : null,
    };
}
