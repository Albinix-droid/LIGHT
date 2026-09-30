// app/admin/utilisateurs/UserActions.tsx
// Actions sur un compte : rôle, suspension, refus d'une demande de rôle

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserX, UserCheck, XCircle } from "lucide-react";
import { rejectPendingRole, setUserRole, setUserSuspension } from "@/lib/admin/actions";

type Role = "STUDENT" | "ENCADRANT" | "ADMIN";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "STUDENT", label: "Étudiant" },
  { value: "ENCADRANT", label: "Encadrant" },
  { value: "ADMIN", label: "Administrateur" },
];

export default function UserActions({
  user,
  isSelf,
}: {
  user: { id: string; name: string; role: Role; pendingRole: Role | null; suspended: boolean };
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const run = (action: () => Promise<{ ok: true } | { ok: false; error: string }>, onDone?: () => void) => {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone?.();
      router.refresh();
    });
  };

  if (isSelf) return <span className="enc-muted" style={{ fontSize: "12px" }}>Votre compte</span>;

  const changeRole = (role: Role) => {
    if (role === user.role) return;
    const label = ROLE_OPTIONS.find((r) => r.value === role)!.label.toLowerCase();
    const warning = role === "STUDENT"
      ? ""
      : "\n\nCe rôle est normalement confirmé avec les identifiants de l'école : ne l'attribuez directement qu'après vérification.";
    if (!window.confirm(`Attribuer le rôle ${label} à ${user.name} ?${warning}`)) return;
    run(() => setUserRole(user.id, role));
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {pending && <Loader2 size={14} style={{ animation: "spin 1s linear infinite", color: "#F5D76E" }} />}
        <select
          className="enc-select"
          value={user.role}
          onChange={(e) => changeRole(e.target.value as Role)}
          disabled={pending}
          aria-label={`Rôle de ${user.name}`}
          style={{ padding: "6px 30px 6px 10px", fontSize: "12px" }}
        >
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        {user.pendingRole && (
          <button
            className="enc-btn adm-btn-sm"
            disabled={pending}
            title="Refuser la demande : le compte reste étudiant"
            onClick={() => window.confirm(`Refuser la demande de rôle de ${user.name} ? Le compte restera étudiant.`) && run(() => rejectPendingRole(user.id))}
          >
            <XCircle size={13} /> Refuser
          </button>
        )}
        {user.suspended ? (
          <button className="enc-btn adm-btn-sm" disabled={pending} onClick={() => run(() => setUserSuspension(user.id, false))}>
            <UserCheck size={13} /> Réactiver
          </button>
        ) : (
          <button className="enc-btn adm-btn-sm adm-btn-danger" disabled={pending} onClick={() => setSuspendOpen(true)}>
            <UserX size={13} /> Suspendre
          </button>
        )}
      </div>
      {error && <span role="alert" style={{ fontSize: "12px", color: "#F0928B", maxWidth: "280px", textAlign: "right" }}>{error}</span>}

      {/* ===== SUSPENSION ===== */}
      {suspendOpen && (
        <div className="adm-overlay" onClick={() => !pending && setSuspendOpen(false)}>
          <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby={`suspend-${user.id}`} onClick={(e) => e.stopPropagation()} style={{ textAlign: "left" }}>
            <h2 id={`suspend-${user.id}`} className="enc-h2" style={{ fontSize: "17px", marginBottom: "8px" }}>
              <UserX size={17} style={{ color: "#F0928B" }} /> Suspendre {user.name}
            </h2>
            <p className="enc-muted" style={{ fontSize: "13px", lineHeight: 1.6, margin: "0 0 16px" }}>
              Le compte perd immédiatement l&apos;accès à la plateforme et ne peut plus se connecter. Ses projets et messages sont conservés ; vous pourrez le réactiver à tout moment.
            </p>
            <label className="adm-label" htmlFor={`reason-${user.id}`}>Motif (visible dans le journal)</label>
            <textarea
              id={`reason-${user.id}`}
              className="enc-input"
              rows={3}
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. usurpation d'identité, comportement inapproprié…"
              style={{ resize: "vertical" }}
              autoFocus
            />
            {error && <p role="alert" style={{ fontSize: "12px", color: "#F0928B", margin: "10px 0 0" }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "18px" }}>
              <button className="enc-btn" onClick={() => setSuspendOpen(false)} disabled={pending}>Annuler</button>
              <button
                className="enc-btn adm-btn-danger"
                disabled={pending || !reason.trim()}
                onClick={() => run(() => setUserSuspension(user.id, true, reason), () => { setSuspendOpen(false); setReason(""); })}
              >
                {pending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <UserX size={14} />}
                Suspendre le compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
