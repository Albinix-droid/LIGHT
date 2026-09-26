// app/dashboard/projets/[id]/SupervisorPicker.tsx
// Demande d'encadrement : le porteur envoie une demande, l'encadrant l'accepte ou la refuse

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Clock, X } from "lucide-react";
import { cancelRequest, requestSupervision } from "@/lib/demandes/actions";

export interface EncadrantOption {
  id: string;
  name: string;
  email: string;
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "Africa/Douala" });

export default function SupervisorPicker({
  projectId,
  currentId,
  encadrants,
  canEdit,
  pendingRequest,
}: {
  projectId: string;
  currentId: string | null;
  encadrants: EncadrantOption[];
  canEdit: boolean;
  pendingRequest: { id: string; encadrantName: string; createdAt: string } | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error);
      else {
        setSelected("");
        setMessage("");
        router.refresh();
      }
    });
  };

  if (pendingRequest) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#F5B544" }}>
          <Clock size={15} />
          Demande envoyée à <strong style={{ color: "#E8EDF5" }}>{pendingRequest.encadrantName}</strong> le {dateFormat.format(new Date(pendingRequest.createdAt))}, en attente de sa réponse.
        </span>
        {canEdit && (
          <button
            onClick={() => run(() => cancelRequest(pendingRequest.id))}
            disabled={isPending}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "50px", fontSize: "12px",
              fontWeight: 600, border: "1px solid rgba(228,115,107,0.35)", background: "none", color: "#F0928B", cursor: "pointer",
            }}
          >
            {isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <X size={13} />} Annuler la demande
          </button>
        )}
        {error && <p style={{ color: "#E4736B", fontSize: "12px", margin: "4px 0 0", width: "100%" }}>{error}</p>}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
        Seul le porteur du projet peut demander un encadrant.
      </p>
    );
  }

  const options = encadrants.filter((e) => e.id !== currentId);
  const fieldStyle: React.CSSProperties = {
    padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(180,200,230,0.15)", background: "rgba(255,255,255,0.04)",
    color: "#E8EDF5", fontSize: "14px", outline: "none", fontFamily: "inherit",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Choisir un encadrant" disabled={isPending} style={{ ...fieldStyle, flex: 1, minWidth: "200px" }}>
          <option value="" style={{ background: "#0A1628" }}>{currentId ? "Demander un autre encadrant…" : "Sélectionnez un encadrant…"}</option>
          {options.map((e) => (
            <option key={e.id} value={e.id} style={{ background: "#0A1628" }}>{e.name} — {e.email}</option>
          ))}
        </select>
      </div>
      {selected && (
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          placeholder="Présentez votre projet en quelques mots et ce que vous attendez de son accompagnement (facultatif)"
          aria-label="Message pour l'encadrant"
          style={{ ...fieldStyle, width: "100%", minHeight: "70px", marginTop: "8px", resize: "vertical", boxSizing: "border-box", fontSize: "13px" }}
        />
      )}
      {selected && (
        <button
          onClick={() => run(() => requestSupervision({ projectId, encadrantId: selected, message }))}
          disabled={isPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", marginTop: "8px", borderRadius: "50px",
            border: "none", fontSize: "13px", fontWeight: 700, background: "linear-gradient(135deg, #D4AF37, #F5D76E)", color: "#0A1628",
            cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={15} />}
          Envoyer la demande d&apos;encadrement
        </button>
      )}
      {error && <p style={{ color: "#E4736B", fontSize: "12px", margin: "8px 0 0" }}>{error}</p>}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
