// app/dashboard/projets/[id]/StepChecklist.tsx
// Liste des critères à remplir pour valider une étape (✓ rempli / ○ manquant)

import { CheckCircle2, Circle } from "lucide-react";
import type { StepRequirement } from "@/lib/parcours";

export default function StepChecklist({ requirements }: { requirements: StepRequirement[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {requirements.map((r) => (
        <li
          key={r.label}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ring-1 ring-inset ${
            r.ok ? "bg-success-soft text-success ring-success/20" : "bg-surface-muted text-ink-muted ring-line"
          }`}
        >
          {r.ok ? <CheckCircle2 className="size-3.5" strokeWidth={2} /> : <Circle className="size-3.5" strokeWidth={2} />}
          {r.label}
        </li>
      ))}
    </ul>
  );
}
