// app/admin/utilisateurs/UserActions.tsx
// Actions sur un compte : rôle, suspension, refus d'une demande de rôle

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck, UserX, XCircle } from "lucide-react";
import { rejectPendingRole, setUserRole, setUserSuspension } from "@/lib/admin/actions";
import { Field, Modal, buttonClass, cx, selectClass, textareaClass } from "@/components/ui/kit";

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

  if (isSelf) return <span className="text-[12px] text-ink-subtle">Votre compte</span>;

  const changeRole = (role: Role) => {
    if (role === user.role) return;
    const label = ROLE_OPTIONS.find((r) => r.value === role)!.label.toLowerCase();
    const warning = role === "STUDENT" ? "" : "\n\nCe rôle est normalement confirmé avec les identifiants de l'école : ne l'attribuez directement qu'après vérification.";
    if (!window.confirm(`Attribuer le rôle ${label} à ${user.name} ?${warning}`)) return;
    run(() => setUserRole(user.id, role));
  };

  return (
    <div className="inline-flex flex-col items-end gap-1.5">
      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
        {pending && <Loader2 className="size-4 animate-spin text-brand" />}
        <select
          className={cx(selectClass, "h-9 w-auto py-0 pl-3 text-[12.5px]")}
          value={user.role}
          onChange={(e) => changeRole(e.target.value as Role)}
          disabled={pending}
          aria-label={`Rôle de ${user.name}`}
        >
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        {user.pendingRole && (
          <button
            className={buttonClass("secondary", "sm")}
            disabled={pending}
            title="Refuser la demande : le compte reste étudiant"
            onClick={() => window.confirm(`Refuser la demande de rôle de ${user.name} ? Le compte restera étudiant.`) && run(() => rejectPendingRole(user.id))}
          >
            <XCircle /> Refuser
          </button>
        )}
        {user.suspended ? (
          <button className={buttonClass("secondary", "sm")} disabled={pending} onClick={() => run(() => setUserSuspension(user.id, false))}>
            <UserCheck /> Réactiver
          </button>
        ) : (
          <button className={buttonClass("danger", "sm")} disabled={pending} onClick={() => setSuspendOpen(true)}>
            <UserX /> Suspendre
          </button>
        )}
      </div>
      {error && !suspendOpen && <span role="alert" className="max-w-[280px] text-right text-[12px] text-danger">{error}</span>}

      <Modal
        open={suspendOpen}
        onClose={() => !pending && setSuspendOpen(false)}
        icon={UserX}
        title={`Suspendre ${user.name}`}
        description="Le compte perd immédiatement l'accès à la plateforme et ne peut plus se connecter. Ses projets et messages sont conservés ; vous pourrez le réactiver à tout moment."
        footer={
          <>
            <button className={buttonClass("secondary")} onClick={() => setSuspendOpen(false)} disabled={pending}>Annuler</button>
            <button
              className={buttonClass("danger")}
              disabled={pending || !reason.trim()}
              onClick={() => run(() => setUserSuspension(user.id, true, reason), () => { setSuspendOpen(false); setReason(""); })}
            >
              {pending ? <Loader2 className="animate-spin" /> : <UserX />} Suspendre le compte
            </button>
          </>
        }
      >
        <div className="text-left">
          <Field label="Motif" htmlFor={`reason-${user.id}`} hint="Visible dans le journal d'administration." error={error || undefined}>
            <textarea
              id={`reason-${user.id}`}
              className={textareaClass}
              rows={3}
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. usurpation d'identité, comportement inapproprié…"
              autoFocus
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
