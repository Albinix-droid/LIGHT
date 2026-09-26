// lib/parcours.ts
// Configuration des 5 étapes du parcours (partagée serveur / client)

export const STAGES = [
    { slug: "idealisation", stage: "IDEALISATION", label: "Idéalisation" },
    { slug: "conception", stage: "CONCEPTION", label: "Conception" },
    { slug: "developpement", stage: "DEVELOPPEMENT", label: "Développement" },
    { slug: "tests", stage: "TEST", label: "Tests" },
    { slug: "concretisation", stage: "CONCRETISATION", label: "Concrétisation" },
] as const;

export type StageSlug = (typeof STAGES)[number]["slug"];
export type StageKey = (typeof STAGES)[number]["stage"];

export function getStageBySlug(slug: string) {
    return STAGES.find((s) => s.slug === slug);
}

export function getStageIndex(stage: StageKey) {
    return STAGES.findIndex((s) => s.stage === stage);
}

export const SECTOR_LABELS: Record<string, string> = {
    tech: "Tech & Digital",
    agriculture: "Agriculture",
    commerce: "Commerce",
    services: "Services",
    health: "Santé",
    education: "Éducation",
    finance: "Finance",
    autre: "Autre",
};

// ============================================================
// CRITÈRES DE VALIDATION DES ÉTAPES
// Source unique : affichés côté client (checklist) et vérifiés côté serveur.
// ============================================================
export const MIN_DESCRIPTION_LENGTH = 50;
// Longueur minimale du retour écrit de l'encadrant
export const MIN_FEEDBACK_LENGTH = 20;

export interface StepRequirement {
    label: string;
    ok: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = Record<string, any> | null | undefined;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const statusOf = (v: unknown) => (v && typeof v === "object" ? (v as { status?: string }).status : undefined);

export function getStepRequirements(slug: StageSlug, d: AnyData): StepRequirement[] {
    d = d ?? {};
    switch (slug) {
        case "idealisation": {
            const length = text(d.description).length;
            return [
                { label: "Un nom de projet", ok: text(d.title).length > 0 },
                {
                    label: `Une description d'au moins ${MIN_DESCRIPTION_LENGTH} caractères (${length}/${MIN_DESCRIPTION_LENGTH})`,
                    ok: length >= MIN_DESCRIPTION_LENGTH,
                },
            ];
        }
        case "conception":
            return [
                { label: "Les objectifs du projet", ok: text(d.functional?.objectives).length > 0 },
                { label: "Au moins une fonctionnalité principale", ok: list(d.functional?.features).length > 0 },
                { label: "Au moins une maquette (image importée)", ok: list(d.ux?.wireframes).length > 0 },
            ];
        case "developpement":
            return [
                { label: "L'URL du dépôt (onglet « Code »)", ok: text(d.repoUrl).length > 0 },
                { label: "Au moins une tâche technique (onglet « Tâches »)", ok: list(d.tasks).length > 0 },
            ];
        case "tests": {
            const cases = list(d.testCases);
            const openBugs = list(d.bugs).filter((b) => statusOf(b) !== "resolved" && statusOf(b) !== "closed").length;
            return [
                { label: "Au moins un cas de test", ok: cases.length > 0 },
                { label: "Au moins un test au statut « Réussi »", ok: cases.some((t) => statusOf(t) === "passed") },
                {
                    label: openBugs > 0 ? `Tous les bugs résolus ou fermés (${openBugs} encore ouvert${openBugs > 1 ? "s" : ""})` : "Tous les bugs résolus ou fermés",
                    ok: openBugs === 0,
                },
            ];
        }
        case "concretisation":
            return [
                { label: "La date de lancement", ok: text(d.launch?.date).length > 0 },
                { label: "L'URL du projet", ok: text(d.launch?.url).length > 0 },
                { label: "Au moins un indicateur clé (KPI)", ok: list(d.postLaunch?.kpis).length > 0 },
                { label: "Au moins un partenaire ou investisseur", ok: list(d.partners).length > 0 },
            ];
    }
}

export function getMissingRequirements(slug: StageSlug, data: AnyData): string[] {
    return getStepRequirements(slug, data).filter((r) => !r.ok).map((r) => r.label);
}
