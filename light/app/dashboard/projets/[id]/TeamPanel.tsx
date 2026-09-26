// app/dashboard/projets/[id]/TeamPanel.tsx
// ÉQUIPE DU PROJET : membres et rôles, invitations (porteur), départ d'un membre

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Search, Loader2, X, Clock, Crown, LogOut, Check } from "lucide-react";
import { cancelRequest, removeTeamMember, searchStudentsForProject, sendProjectInvitation } from "@/lib/demandes/actions";
import {
  INVITABLE_ROLES, TEAM_ROLE_LABELS,
  type InvitableRole, type PendingInvitationInfo, type StudentOption, type TeamMemberInfo,
} from "@/lib/demandes/types";

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

  const field: React.CSSProperties = {
    padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(180,200,230,0.15)", background: "rgba(255,255,255,0.04)",
    color: "#E8EDF5", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "18px 20px", borderRadius: "16px", marginBottom: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(180,200,230,0.1)" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .team-row { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 12px; }
        .team-row:hover { background: rgba(255,255,255,0.03); }
        .team-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 50px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid rgba(180,200,230,0.18); background: none; color: rgba(200,215,235,0.8); }
        .team-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .team-btn-danger { border-color: rgba(228,115,107,0.35); color: #F0928B; }
        .team-btn-primary { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; border: none; font-weight: 700; }
        .team-result { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; background: rgba(255,255,255,0.02); cursor: pointer; font-family: inherit; text-align: left; }
        .team-result:hover { background: rgba(255,255,255,0.05); }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <p style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
          <Users size={18} style={{ color: "#F5D76E" }} />
          Équipe · {team.length} membre{team.length > 1 ? "s" : ""}
          <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(200,215,235,0.45)" }}>(taille prévue : {teamSize})</span>
        </p>
        {isOwner && !inviting && (
          <button className="team-btn team-btn-primary" onClick={() => { setInviting(true); setSuccess(""); }}>
            <UserPlus size={14} /> Inviter un étudiant
          </button>
        )}
      </div>

      {/* Membres */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {team.map((m) => (
          <div key={m.userId} className="team-row">
            <span style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #D4AF37, #F5D76E)", color: "#0A1628", fontSize: "12px", fontWeight: 700,
            }}>{m.initials}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "14px", color: "#E8EDF5", fontWeight: 500 }}>{m.name}{m.isMe ? " (vous)" : ""}</span>
              <span style={{ fontSize: "12px", color: m.role === "OWNER" ? "#F5D76E" : "rgba(200,215,235,0.5)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                {m.role === "OWNER" && <Crown size={11} />} {TEAM_ROLE_LABELS[m.role]}
              </span>
            </span>
            {m.role !== "OWNER" && (isOwner || m.isMe) && (
              confirmId === m.userId ? (
                <span style={{ display: "flex", gap: "6px" }}>
                  <button className="team-btn team-btn-danger" disabled={isPending} onClick={() => run(() => removeTeamMember(projectId, m.userId), m.isMe ? undefined : `${m.name} a été retiré de l'équipe.`)}>
                    {isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={13} />} Confirmer
                  </button>
                  <button className="team-btn" onClick={() => setConfirmId(null)}>Annuler</button>
                </span>
              ) : (
                <button className="team-btn team-btn-danger" onClick={() => setConfirmId(m.userId)}>
                  {m.isMe ? <><LogOut size={13} /> Quitter le projet</> : <><X size={13} /> Retirer</>}
                </button>
              )
            )}
          </div>
        ))}
      </div>

      {/* Invitations en attente */}
      {isOwner && pendingInvitations.length > 0 && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(180,200,230,0.08)" }}>
          <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.5)", margin: "0 0 6px" }}>Invitations en attente de réponse</p>
          {pendingInvitations.map((inv) => (
            <div key={inv.id} className="team-row">
              <Clock size={15} style={{ color: "#F5B544", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "13px", color: "#E8EDF5" }}>
                {inv.name} <span style={{ color: "rgba(200,215,235,0.45)" }}>· {inv.role ? TEAM_ROLE_LABELS[inv.role] : "Membre"}</span>
              </span>
              <button className="team-btn" disabled={isPending} onClick={() => run(() => cancelRequest(inv.id), "Invitation annulée.")}>
                <X size={13} /> Annuler
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'invitation */}
      {isOwner && inviting && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(180,200,230,0.08)" }}>
          {chosen ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", color: "#E8EDF5", flex: 1 }}>
                Inviter <strong>{chosen.name}</strong> <span style={{ color: "rgba(200,215,235,0.45)" }}>({chosen.email})</span>
              </span>
              <button className="team-btn" onClick={() => setChosen(null)}>Changer</button>
            </div>
          ) : (
            <>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(200,215,235,0.35)" }} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un étudiant par nom ou email" autoFocus aria-label="Rechercher un étudiant" style={{ ...field, width: "100%", paddingLeft: "34px" }} />
                {searching && <Loader2 size={14} style={{ position: "absolute", right: "12px", top: "50%", marginTop: "-7px", animation: "spin 1s linear infinite", color: "#F5D76E" }} />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px", maxHeight: "200px", overflowY: "auto" }}>
                {query.trim().length >= 2 && !searching && results.length === 0 && (
                  <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)", margin: "4px 0" }}>Aucun étudiant trouvé (déjà membres et déjà invités exclus).</p>
                )}
                {results.map((s) => (
                  <button key={s.id} className="team-result" onClick={() => setChosen(s)}>
                    <span style={{ fontSize: "13px", color: "#E8EDF5", fontWeight: 500 }}>{s.name}</span>
                    <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)" }}>{s.email}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {chosen && (
            <>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                <label htmlFor="invite-role" style={{ fontSize: "12px", color: "rgba(200,215,235,0.55)", alignSelf: "center" }}>Rôle proposé</label>
                <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as InvitableRole)} style={{ ...field, flex: 1, minWidth: "180px" }}>
                  {INVITABLE_ROLES.map((r) => <option key={r} value={r} style={{ background: "#0A1628" }}>{TEAM_ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder="Un mot pour présenter le projet et ce que vous attendez de cette personne (facultatif)" aria-label="Message d'invitation" style={{ ...field, width: "100%", minHeight: "64px", resize: "vertical" }} />
            </>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            {chosen && (
              <button className="team-btn team-btn-primary" onClick={invite} disabled={isPending}>
                {isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <UserPlus size={13} />} Envoyer l&apos;invitation
              </button>
            )}
            <button className="team-btn" onClick={() => { setInviting(false); setChosen(null); setQuery(""); }}>Fermer</button>
          </div>
        </div>
      )}

      {error && <p role="alert" style={{ color: "#F0928B", fontSize: "12px", margin: "10px 0 0" }}>{error}</p>}
      {success && <p role="status" style={{ color: "#34D399", fontSize: "12px", margin: "10px 0 0" }}>{success}</p>}
    </div>
  );
}
