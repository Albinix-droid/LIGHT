// app/dashboard/projets/[id]/TeamPanel.tsx
// ÉQUIPE DU PROJET : membres et rôles, invitations (porteur), départ d'un membre

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Crown, Loader2, LogOut, Search, UserPlus, Users, X } from "lucide-react";
import { cancelRequest, removeTeamMember, searchStudentsForProject, sendProjectInvitation } from "@/lib/demandes/actions";
import {
  INVITABLE_ROLES, TEAM_ROLE_LABELS,
  type InvitableRole, type PendingInvitationInfo, type StudentOption, type TeamMemberInfo,
} from "@/lib/demandes/types";
import Avatar from "@/components/ui/Avatar";
import { Alert, Card, CardHeader, buttonClass, cx, inputClass, selectClass, textareaClass } from "@/components/ui/kit";

export default function TeamPanel({
  projectId,
  isOwner,
  team,
  pendingInvitations,
  teamSize,
}: {
  projectId: string;
  isOwner: boolean;
  team: TeamMemberInfo[];
  pendingInvitations: PendingInvitationInfo[];
  teamSize: number;
}) {
  const router = useRouter();
  const [inviting, setInviting] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [chosen, setChosen] = useState<StudentOption | null>(null);
  const [role, setRole] = useState<InvitableRole>("MEMBER");
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  // Recherche d'étudiants avec une petite temporisation
  useEffect(() => {
    if (!inviting || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const result = await searchStudentsForProject(projectId, query);
      setResults(result.ok ? result.students : []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, inviting, projectId]);

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, done?: string) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) return setError(result.error);
      setConfirmId(null);
      if (done) setSuccess(done);
      router.refresh();
    });
  };

  const invite = () => {
    if (!chosen) return;
    run(async () => {
      const result = await sendProjectInvitation({ projectId, userId: chosen.id, role, message });
      if (result.ok) {
        setChosen(null);
        setQuery("");
        setMessage("");
        setRole("MEMBER");
        setInviting(false);
      }
      return result;
    }, `Invitation envoyée à ${chosen.name}.`);
  };

  return (
    <Card>
      <CardHeader
        title={`Équipe · ${team.length} membre${team.length > 1 ? "s" : ""}`}
        icon={Users}
        description={`Taille prévue : ${teamSize} personne${teamSize > 1 ? "s" : ""}`}
        action={
          isOwner && !inviting ? (
            <button className={buttonClass("soft", "sm")} onClick={() => { setInviting(true); setSuccess(""); }}>
              <UserPlus /> Inviter
            </button>
          ) : undefined
        }
      />

      {/* Membres */}
      <ul className="flex flex-col gap-1">
        {team.map((m) => (
          <li key={m.userId} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-muted">
            <Avatar name={m.name} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-ink">{m.name}{m.isMe ? " (vous)" : ""}</span>
              <span className={cx("inline-flex items-center gap-1 text-[12px]", m.role === "OWNER" ? "font-semibold text-gold" : "text-ink-muted")}>
                {m.role === "OWNER" && <Crown className="size-3" strokeWidth={2.25} />} {TEAM_ROLE_LABELS[m.role]}
              </span>
            </span>
            {m.role !== "OWNER" && (isOwner || m.isMe) && (
              confirmId === m.userId ? (
                <span className="flex gap-1.5">
                  <button
                    className={buttonClass("danger", "sm")}
                    disabled={isPending}
                    onClick={() => run(() => removeTeamMember(projectId, m.userId), m.isMe ? undefined : `${m.name} a été retiré de l'équipe.`)}
                  >
                    {isPending ? <Loader2 className="animate-spin" /> : <Check />} Confirmer
                  </button>
                  <button className={buttonClass("ghost", "sm")} onClick={() => setConfirmId(null)}>Annuler</button>
                </span>
              ) : (
                <button className={buttonClass("ghost", "sm", "text-danger hover:bg-danger-soft hover:text-danger")} onClick={() => setConfirmId(m.userId)}>
                  {m.isMe ? <><LogOut /> Quitter</> : <><X /> Retirer</>}
                </button>
              )
            )}
          </li>
        ))}
      </ul>

      {/* Invitations en attente */}
      {isOwner && pendingInvitations.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-[12px] font-semibold text-ink-subtle">Invitations en attente de réponse</p>
          <ul className="flex flex-col gap-1">
            {pendingInvitations.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 rounded-xl p-2">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
                  <Clock className="size-4" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 text-[13px] text-ink">
                  {inv.name} <span className="text-ink-subtle">· {inv.role ? TEAM_ROLE_LABELS[inv.role] : "Membre"}</span>
                </span>
                <button className={buttonClass("ghost", "sm")} disabled={isPending} onClick={() => run(() => cancelRequest(inv.id), "Invitation annulée.")}>
                  <X /> Annuler
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulaire d'invitation */}
      {isOwner && inviting && (
        <div className="mt-4 space-y-3 rounded-2xl border border-line bg-surface-muted p-4">
          {chosen ? (
            <div className="flex items-center gap-3">
              <Avatar name={chosen.name} size="sm" />
              <span className="min-w-0 flex-1 text-[13px] text-ink">
                Inviter <strong className="font-semibold">{chosen.name}</strong> <span className="text-ink-subtle">({chosen.email})</span>
              </span>
              <button className={buttonClass("ghost", "sm")} onClick={() => setChosen(null)}>Changer</button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un étudiant par nom ou email"
                  autoFocus
                  aria-label="Rechercher un étudiant"
                  className={cx(inputClass, "pl-10")}
                />
                {searching && <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-brand" />}
              </div>
              <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto">
                {query.trim().length >= 2 && !searching && results.length === 0 && (
                  <p className="py-1 text-[12px] text-ink-subtle">Aucun étudiant trouvé (déjà membres et déjà invités exclus).</p>
                )}
                {results.map((s) => (
                  <button key={s.id} className="flex items-center gap-3 rounded-xl bg-surface p-2.5 text-left ring-1 ring-line transition-colors ring-inset hover:ring-brand" onClick={() => setChosen(s)}>
                    <Avatar name={s.name} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">{s.name}</span>
                      <span className="block truncate text-[12px] text-ink-subtle">{s.email}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {chosen && (
            <>
              <label className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-ink">
                Rôle proposé
                <select value={role} onChange={(e) => setRole(e.target.value as InvitableRole)} className={cx(selectClass, "!w-auto min-w-[200px] flex-1")}>
                  {INVITABLE_ROLES.map((r) => <option key={r} value={r}>{TEAM_ROLE_LABELS[r]}</option>)}
                </select>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Un mot pour présenter le projet et ce que vous attendez de cette personne (facultatif)"
                aria-label="Message d'invitation"
                className={cx(textareaClass, "min-h-[80px]")}
              />
            </>
          )}

          <div className="flex gap-2">
            {chosen && (
              <button className={buttonClass("primary", "sm")} onClick={invite} disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />} Envoyer l&apos;invitation
              </button>
            )}
            <button className={buttonClass("ghost", "sm")} onClick={() => { setInviting(false); setChosen(null); setQuery(""); }}>Fermer</button>
          </div>
        </div>
      )}

      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
      {success && <Alert tone="success" className="mt-4">{success}</Alert>}
    </Card>
  );
}
