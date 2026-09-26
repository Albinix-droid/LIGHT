// app/encadrant/projectStatus.ts
// Statut de suivi d'un projet vu par l'encadrant (dérivé du statut de ses étapes)

export function getFollowUpStatus(project: { progress: number; steps: { status: string }[] }) {
    if (project.steps.some((s) => s.status === "SUBMITTED")) {
        return { label: "À examiner", color: "#F5B544", bg: "rgba(245,158,11,0.12)" };
    }
    if (project.progress >= 100) {
        return { label: "Concrétisé", color: "#34D399", bg: "rgba(16,185,129,0.12)" };
    }
    if (project.steps.some((s) => s.status === "CHANGES_REQUESTED")) {
        return { label: "Corrections en cours", color: "#F0928B", bg: "rgba(228,115,107,0.12)" };
    }
    return { label: "En cours", color: "#A5B4FC", bg: "rgba(99,102,241,0.12)" };
}

export const STEP_STATUS_COLORS: Record<string, string> = {
    COMPLETED: "#34D399",
    SUBMITTED: "#F5B544",
    CHANGES_REQUESTED: "#F0928B",
    IN_PROGRESS: "#F5D76E",
};
