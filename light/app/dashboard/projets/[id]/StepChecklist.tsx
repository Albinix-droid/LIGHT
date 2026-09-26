// app/dashboard/projets/[id]/StepChecklist.tsx
// Liste des critères à remplir pour valider une étape (✓ rempli / ○ manquant)

import { CheckCircle, Circle } from "lucide-react";
import type { StepRequirement } from "@/lib/parcours";

export default function StepChecklist({ requirements }: { requirements: StepRequirement[] }) {
  return (
    <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {requirements.map((r) => (
        <li
          key={r.label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "50px",
            fontSize: "12px",
            fontWeight: 500,
            background: r.ok ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
            border: `1px solid ${r.ok ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
            color: r.ok ? "#10B981" : "#F5B544",
          }}
        >
          {r.ok ? <CheckCircle size={13} /> : <Circle size={13} />}
          {r.label}
        </li>
      ))}
    </ul>
  );
}
