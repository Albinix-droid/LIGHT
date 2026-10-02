// components/ui/StageTrack.tsx
// Frise compacte des 5 étapes : un segment par étape, coloré selon son statut

import { STAGES, getStageIndex, type StageKey } from "@/lib/parcours";

const SEGMENT: Record<string, string> = {
  COMPLETED: "bg-success",
  SUBMITTED: "bg-warning",
  CHANGES_REQUESTED: "bg-danger",
  IN_PROGRESS: "bg-brand",
};

export default function StageTrack({
  stage,
  steps,
  className = "",
}: {
  stage: StageKey | string;
  steps: { stage: string; status: string }[];
  className?: string;
}) {
  const current = getStageIndex(stage as StageKey);
  return (
    <div className={`flex gap-1 ${className}`} role="img" aria-label={`Étape actuelle : ${STAGES[current]?.label ?? ""}`}>
      {STAGES.map((s, i) => {
        const status = steps.find((x) => x.stage === s.stage)?.status;
        const color = status ? SEGMENT[status] ?? "bg-brand" : i <= current ? "bg-brand" : "bg-line";
        // Étape à venir avec un brouillon : couleur atténuée
        const dimmed = i > current && status && status !== "COMPLETED";
        return <span key={s.slug} title={s.label} className={`h-1.5 flex-1 rounded-full ${color} ${dimmed ? "opacity-40" : ""}`} />;
      })}
    </div>
  );
}
