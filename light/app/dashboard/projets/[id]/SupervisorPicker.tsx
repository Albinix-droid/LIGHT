// app/dashboard/projets/[id]/SupervisorPicker.tsx
// Choix (ou changement) de l'encadrant du projet par l'étudiant

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck } from "lucide-react";
import { setSupervisor } from "../actions";

export interface EncadrantOption {
  id: string;
  name: string;
  email: string;
}

export default function SupervisorPicker({
  projectId,
  currentId,
  encadrants,
  canEdit,
}: {
  projectId: string;
  currentId: string | null;
  encadrants: EncadrantOption[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentId ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (encadrants.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", margin: 0 }}>
        Aucun encadrant n&apos;est encore inscrit sur la plateforme. Un encadrant crée son compte en choisissant le rôle « Encadrant » à l&apos;inscription. En attendant, vous pouvez préparer toutes vos étapes.
      </p>
    );
  }
  if (!canEdit) {
    return (
      <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", margin: 0 }}>
        Seul le porteur du projet peut choisir l&apos;encadrant.
      </p>
    );
  }

  const submit = () => {
    if (!selected) return;
    setError("");
    startTransition(async () => {
      const result = await setSupervisor(projectId, selected);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Choisir un encadrant"
          disabled={isPending}
          style={{
            flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "12px",
            border: "1px solid rgba(180,200,230,0.15)", background: "rgba(255,255,255,0.04)",
            color: "#E8EDF5", fontSize: "14px", outline: "none",
          }}
        >
          <option value="" style={{ background: "#0A1628" }}>Sélectionnez un encadrant…</option>
          {encadrants.map((e) => (
            <option key={e.id} value={e.id} style={{ background: "#0A1628" }}>
              {e.name} — {e.email}
            </option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={!selected || selected === currentId || isPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px",
            borderRadius: "50px", border: "none", fontSize: "13px", fontWeight: 700,
            background: "linear-gradient(135deg, #D4AF37, #F5D76E)", color: "#0A1628",
            cursor: !selected || selected === currentId || isPending ? "not-allowed" : "pointer",
            opacity: !selected || selected === currentId || isPending ? 0.5 : 1,
          }}
        >
          {isPending ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <UserCheck size={15} />}
          {currentId ? "Changer d'encadrant" : "Confirmer"}
        </button>
      </div>
      {error && <p style={{ color: "#E4736B", fontSize: "12px", margin: "8px 0 0" }}>{error}</p>}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
