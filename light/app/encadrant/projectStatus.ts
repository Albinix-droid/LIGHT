// app/encadrant/projectStatus.ts
// Statut de suivi d'un projet vu par l'encadrant (dérivé du statut de ses étapes)

import type { Tone } from "@/components/ui/kit";

export function getFollowUpStatus(project: { progress: number; steps: { status: string }[] }): { label: string; tone: Tone } {
    if (project.steps.some((s) => s.status === "SUBMITTED")) return { label: "À examiner", tone: "warning" };
    if (project.progress >= 100) return { label: "Concrétisé", tone: "success" };
    if (project.steps.some((s) => s.status === "CHANGES_REQUESTED")) return { label: "Corrections en cours", tone: "danger" };
    return { label: "En cours", tone: "brand" };
}

// Couleur de chaque segment de la frise des 5 étapes
export const STEP_SEGMENT_CLASSES: Record<string, string> = {
    COMPLETED: "bg-success",
    SUBMITTED: "bg-warning",
    CHANGES_REQUESTED: "bg-danger",
    IN_PROGRESS: "bg-brand",
};
