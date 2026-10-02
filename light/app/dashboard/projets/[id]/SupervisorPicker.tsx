// app/dashboard/projets/[id]/SupervisorPicker.tsx
// Demande d'encadrement : le porteur envoie une demande, l'encadrant l'accepte ou la refuse

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, Send, X } from "lucide-react";
import { cancelRequest, requestSupervision } from "@/lib/demandes/actions";
import { buttonClass, cx, selectClass, textareaClass } from "@/components/ui/kit";

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
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-warning-soft px-4 py-3 ring-1 ring-warning/15 ring-inset">
        <Clock className="size-4 shrink-0 text-warning" strokeWidth={2} />
        <span className="min-w-0 flex-1 text-[13px] text-ink">
          Demande envoyée à <strong className="font-semibold">{pendingRequest.encadrantName}</strong> le {dateFormat.format(new Date(pendingRequest.createdAt))}, en attente de sa réponse.
        </span>
        {canEdit && (
          <button onClick={() => run(() => cancelRequest(pendingRequest.id))} disabled={isPending} className={buttonClass("danger", "sm")}>
            {isPending ? <Loader2 className="animate-spin" /> : <X />} Annuler la demande
          </button>
        )}
        {error && <p className="w-full text-[12px] text-danger">{error}</p>}
      </div>
    );
  }

  if (encadrants.length === 0) {
    return (
      <p className="text-[13px] leading-relaxed text-ink-muted">
        Aucun encadrant n&apos;est encore inscrit sur la plateforme. En attendant, vous pouvez préparer toutes vos étapes.
      </p>
    );
  }
  if (!canEdit) {
    return <p className="text-[13px] text-ink-muted">Seul le porteur du projet peut demander un encadrant.</p>;
  }

  const options = encadrants.filter((e) => e.id !== currentId);

  return (
    <div className="space-y-2.5">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Choisir un encadrant" disabled={isPending} className={selectClass}>
        <option value="">{currentId ? "Demander un autre encadrant…" : "Sélectionnez un encadrant…"}</option>
        {options.map((e) => (
          <option key={e.id} value={e.id}>{e.name} — {e.email}</option>
        ))}
      </select>
      {selected && (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            placeholder="Présentez votre projet en quelques mots et ce que vous attendez de son accompagnement (facultatif)"
            aria-label="Message pour l'encadrant"
            className={cx(textareaClass, "min-h-[90px]")}
          />
          <button onClick={() => run(() => requestSupervision({ projectId, encadrantId: selected, message }))} disabled={isPending} className={buttonClass("primary")}>
            {isPending ? <Loader2 className="animate-spin" /> : <Send />} Envoyer la demande d&apos;encadrement
          </button>
        </>
      )}
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}
