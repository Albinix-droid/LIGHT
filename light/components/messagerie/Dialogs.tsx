// components/messagerie/Dialogs.tsx
// FENÊTRES DE LA MESSAGERIE : nouveau message, nouveau groupe, nouveau canal, parcourir les canaux, membres

"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Search, Loader2, Hash, Users, Check, LogOut, UserPlus, Crown } from "lucide-react";
import {
  addMembers, createChannel, createGroup, fetchChannels, joinChannel, leaveConversation, searchUsers, startDirectConversation,
} from "@/lib/messagerie/actions";
import {
  ROLE_LABELS, TRACK_LABELS,
  type ChannelListing, type ChannelTrack, type ConversationDetail, type PersonWithEmail,
} from "@/lib/messagerie/types";

// ============================================================
// BRIQUES
// ============================================================
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="msg-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="msg-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>{title}</h2>
          <button className="msg-icon-btn" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Avatar({ initials, size = 36, role }: { initials: string; size?: number; role?: string }) {
  const encadrant = role === "ENCADRANT";
  return (
    <span
      className="msg-avatar"
      style={{
        width: size, height: size, fontSize: Math.round(size * 0.34),
        background: encadrant ? "linear-gradient(140deg, #4d7cff, #1f4fd8)" : "linear-gradient(140deg, #f1d48a, #c9993a)",
        color: encadrant ? "#fff" : "#2a1d05",
      }}
    >
      {initials}
    </span>
  );
}

function ErrorText({ error }: { error: string }) {
  return error ? <p role="alert" style={{ color: "var(--danger)", fontSize: "13px", margin: "10px 0 0" }}>{error}</p> : null;
}

// Recherche d'utilisateurs (sélection simple ou multiple)
function UserPicker({
  selected,
  onToggle,
  excludeIds = [],
  autoFocus,
}: {
  selected: PersonWithEmail[];
  onToggle: (user: PersonWithEmail) => void;
  excludeIds?: string[];
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonWithEmail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    // Petite temporisation pour ne pas interroger le serveur à chaque frappe
    const timer = setTimeout(async () => {
      const result = await searchUsers(query);
      setResults(result.ok ? result.users : []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const visible = results.filter((u) => !excludeIds.includes(u.id));

  return (
    <div>
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--ink)" }} />
        <input
          className="msg-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou email (2 lettres minimum)"
          autoFocus={autoFocus}
          style={{ paddingLeft: "36px" }}
        />
        {loading && <Loader2 size={15} style={{ position: "absolute", right: "12px", top: "50%", marginTop: "-7px", animation: "spin 1s linear infinite", color: "var(--brand)" }} />}
      </div>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
          {selected.map((u) => (
            <button key={u.id} type="button" className="msg-chip" onClick={() => onToggle(u)} aria-label={`Retirer ${u.name}`}>
              {u.name} <X size={12} />
            </button>
          ))}
        </div>
      )}
      <div style={{ marginTop: "10px", maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }} className="msg-scroll">
        {query.trim().length >= 2 && !loading && visible.length === 0 && (
          <p style={{ fontSize: "13px", color: "var(--ink-subtle)", textAlign: "center", padding: "14px 0", margin: 0 }}>Aucun utilisateur trouvé.</p>
        )}
        {visible.map((u) => {
          const isSelected = selected.some((s) => s.id === u.id);
          return (
            <button key={u.id} type="button" className={`msg-row ${isSelected ? "msg-row-active" : ""}`} onClick={() => onToggle(u)}>
              <Avatar initials={u.initials} size={32} role={u.role} />
              <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <span style={{ display: "block", fontSize: "14px", color: "var(--ink)", fontWeight: 500 }}>{u.name}</span>
                <span style={{ fontSize: "12px", color: "var(--ink-subtle)" }}>{ROLE_LABELS[u.role]} · {u.email}</span>
              </span>
              {isSelected && <Check size={16} style={{ color: "var(--brand)" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// NOUVEAU MESSAGE PRIVÉ
// ============================================================
export function NewDirectDialog({ onClose, onOpen }: { onClose: () => void; onOpen: (id: string) => void }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const pick = (user: PersonWithEmail) => {
    setError("");
    startTransition(async () => {
      const result = await startDirectConversation(user.id);
      if (result.ok) onOpen(result.id);
      else setError(result.error);
    });
  };

  return (
    <Modal title="Nouveau message privé" onClose={onClose}>
      <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: "0 0 12px" }}>
        Écrivez à un étudiant ou à un encadrant de la plateforme.
      </p>
      <UserPicker selected={[]} onToggle={pick} autoFocus />
      {isPending && <p style={{ fontSize: "13px", color: "var(--brand)", margin: "10px 0 0" }}>Ouverture de la conversation…</p>}
      <ErrorText error={error} />
    </Modal>
  );
}

// ============================================================
// NOUVEAU GROUPE (ÉTUDIANTS)
// ============================================================
export function NewGroupDialog({
  projects,
  onClose,
  onOpen,
}: {
  projects: { id: string; title: string }[];
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [members, setMembers] = useState<PersonWithEmail[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const toggle = (u: PersonWithEmail) =>
    setMembers((prev) => (prev.some((m) => m.id === u.id) ? prev.filter((m) => m.id !== u.id) : [...prev, u]));

  // Le nom du projet sert de nom par défaut
  const chooseProject = (id: string) => {
    setProjectId(id);
    const project = projects.find((p) => p.id === id);
    if (project && !name.trim()) setName(`Équipe ${project.title}`);
  };

  const submit = () => {
    setError("");
    startTransition(async () => {
      const result = await createGroup({ name, description, projectId: projectId || undefined, memberIds: members.map((m) => m.id) });
      if (result.ok) onOpen(result.id);
      else setError(result.error);
    });
  };

  return (
    <Modal title="Nouveau groupe" onClose={onClose}>
      <label className="msg-label" htmlFor="group-project">Projet (facultatif)</label>
      <select id="group-project" className="msg-input" value={projectId} onChange={(e) => chooseProject(e.target.value)} style={{ marginBottom: "12px" }}>
        <option value="">Groupe libre, sans projet</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
      </select>

      <label className="msg-label" htmlFor="group-name">Nom du groupe</label>
      <input id="group-name" className="msg-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Ex : Équipe Innov'Afrique" style={{ marginBottom: "12px" }} />

      <label className="msg-label" htmlFor="group-description">Description (facultatif)</label>
      <input id="group-description" className="msg-input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} placeholder="À quoi sert ce groupe ?" style={{ marginBottom: "12px" }} />

      <span className="msg-label">Membres</span>
      <UserPicker selected={members} onToggle={toggle} />

      <ErrorText error={error} />
      <button className="msg-btn msg-btn-primary" onClick={submit} disabled={isPending || !name.trim() || members.length === 0} style={{ width: "100%", marginTop: "16px" }}>
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
        Créer le groupe{members.length > 0 ? ` (${members.length + 1} membres)` : ""}
      </button>
    </Modal>
  );
}

// ============================================================
// NOUVEAU CANAL (ENCADRANTS)
// ============================================================
export function NewChannelDialog({ onClose, onOpen }: { onClose: () => void; onOpen: (id: string) => void }) {
  const [track, setTrack] = useState<ChannelTrack>("GL");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError("");
    startTransition(async () => {
      const result = await createChannel({ name, track, description });
      if (result.ok) onOpen(result.id);
      else setError(result.error);
    });
  };

  return (
    <Modal title="Nouveau canal de filière" onClose={onClose}>
      <span className="msg-label">Filière</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }} role="radiogroup" aria-label="Filière">
        {(["GL", "SR"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={track === t}
            onClick={() => setTrack(t)}
            className={`msg-choice ${track === t ? "msg-choice-active" : ""}`}
          >
            <span style={{ fontSize: "18px", fontWeight: 800 }}>{t}</span>
            <span style={{ fontSize: "12px", opacity: 0.75 }}>{TRACK_LABELS[t]}</span>
          </button>
        ))}
      </div>

      <label className="msg-label" htmlFor="channel-name">Nom du canal</label>
      <input id="channel-name" className="msg-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder={`Ex : ${track} — Promotion 2026`} style={{ marginBottom: "12px" }} autoFocus />

      <label className="msg-label" htmlFor="channel-description">Description (facultatif)</label>
      <input id="channel-description" className="msg-input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} placeholder="Annonces, questions, entraide…" />

      <p style={{ fontSize: "12px", color: "var(--ink-subtle)", margin: "10px 0 0" }}>
        Le canal est visible par tous : étudiants et encadrants peuvent le rejoindre depuis « Parcourir les canaux ».
      </p>
      <ErrorText error={error} />
      <button className="msg-btn msg-btn-primary" onClick={submit} disabled={isPending || !name.trim()} style={{ width: "100%", marginTop: "16px" }}>
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Hash size={16} />}
        Créer le canal {track}
      </button>
    </Modal>
  );
}

// ============================================================
// PARCOURIR LES CANAUX
// ============================================================
export function BrowseChannelsDialog({ onClose, onOpen }: { onClose: () => void; onOpen: (id: string) => void }) {
  const [channels, setChannels] = useState<ChannelListing[] | null>(null);
  const [filter, setFilter] = useState<"ALL" | ChannelTrack>("ALL");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels().then((r) => (r.ok ? setChannels(r.channels) : setError(r.error)));
  }, []);

  const join = async (c: ChannelListing) => {
    if (c.joined) return onOpen(c.id);
    setBusyId(c.id);
    const result = await joinChannel(c.id);
    setBusyId(null);
    if (result.ok) onOpen(c.id);
    else setError(result.error);
  };

  const visible = (channels ?? []).filter((c) => filter === "ALL" || c.track === filter);

  return (
    <Modal title="Canaux de filière" onClose={onClose}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {(["ALL", "GL", "SR"] as const).map((f) => (
          <button key={f} className={`msg-tab ${filter === f ? "msg-tab-active" : ""}`} onClick={() => setFilter(f)}>
            {f === "ALL" ? "Tous" : `${f} · ${TRACK_LABELS[f]}`}
          </button>
        ))}
      </div>
      {channels === null ? (
        <p style={{ textAlign: "center", padding: "20px 0" }}><Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--brand)" }} /></p>
      ) : visible.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--ink-subtle)", textAlign: "center", padding: "20px 0", margin: 0 }}>
          Aucun canal pour le moment. Les encadrants créent les canaux GL et SR.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "360px", overflowY: "auto" }} className="msg-scroll">
          {visible.map((c) => (
            <div key={c.id} className="msg-row" style={{ cursor: "default" }}>
              <span className="msg-track">{c.track}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "14px", color: "var(--ink)", fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: "12px", color: "var(--ink-subtle)" }}>
                  {c.memberCount} membre{c.memberCount > 1 ? "s" : ""} · créé par {c.createdByName}
                  {c.description ? ` · ${c.description}` : ""}
                </span>
              </span>
              <button className={`msg-btn ${c.joined ? "" : "msg-btn-primary"}`} onClick={() => join(c)} disabled={busyId === c.id} style={{ padding: "7px 14px" }}>
                {busyId === c.id ? <Loader2 size={14} className="animate-spin" /> : c.joined ? "Ouvrir" : "Rejoindre"}
              </button>
            </div>
          ))}
        </div>
      )}
      <ErrorText error={error} />
    </Modal>
  );
}

// ============================================================
// MEMBRES D'UNE CONVERSATION
// ============================================================
export function MembersDialog({
  detail,
  meId,
  onClose,
  onChanged,
  onLeft,
}: {
  detail: ConversationDetail;
  meId: string;
  onClose: () => void;
  onChanged: () => void;
  onLeft: () => void;
}) {
  const [adding, setAdding] = useState<PersonWithEmail[]>([]);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const canAdd = detail.type === "GROUP" && detail.isAdmin;

  const toggle = (u: PersonWithEmail) =>
    setAdding((prev) => (prev.some((m) => m.id === u.id) ? prev.filter((m) => m.id !== u.id) : [...prev, u]));

  const add = () =>
    startTransition(async () => {
      setError("");
      const result = await addMembers(detail.id, adding.map((u) => u.id));
      if (result.ok) {
        setAdding([]);
        onChanged();
      } else setError(result.error);
    });

  const leave = () =>
    startTransition(async () => {
      const result = await leaveConversation(detail.id);
      if (result.ok) onLeft();
      else setError(result.error);
    });

  return (
    <Modal title={`${detail.members.length} membre${detail.members.length > 1 ? "s" : ""}`} onClose={onClose}>
      {detail.description && <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: "0 0 12px" }}>{detail.description}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "240px", overflowY: "auto" }} className="msg-scroll">
        {detail.members.map((m) => (
          <div key={m.id} className="msg-row" style={{ cursor: "default" }}>
            <Avatar initials={m.initials} size={32} role={m.role} />
            <span style={{ flex: 1, fontSize: "14px", color: "var(--ink)" }}>
              {m.name}{m.id === meId ? " (vous)" : ""}
              <span style={{ display: "block", fontSize: "12px", color: "var(--ink-subtle)" }}>{ROLE_LABELS[m.role]}</span>
            </span>
            {m.isAdmin && <span className="msg-badge" title="Administrateur"><Crown size={11} /> Admin</span>}
          </div>
        ))}
      </div>

      {canAdd && (
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
          <span className="msg-label">Ajouter des membres</span>
          <UserPicker selected={adding} onToggle={toggle} excludeIds={detail.members.map((m) => m.id)} />
          {adding.length > 0 && (
            <button className="msg-btn msg-btn-primary" onClick={add} disabled={isPending} style={{ width: "100%", marginTop: "12px" }}>
              <UserPlus size={15} /> Ajouter {adding.length} membre{adding.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {detail.type !== "DIRECT" && (
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
          {confirmLeave ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", color: "var(--danger)", flex: 1 }}>
                Quitter {detail.type === "CHANNEL" ? "ce canal" : "ce groupe"} ?
              </span>
              <button className="msg-btn" onClick={() => setConfirmLeave(false)} disabled={isPending}>Annuler</button>
              <button className="msg-btn msg-btn-danger" onClick={leave} disabled={isPending}>
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />} Quitter
              </button>
            </div>
          ) : (
            <button className="msg-btn msg-btn-danger" onClick={() => setConfirmLeave(true)} style={{ width: "100%" }}>
              <LogOut size={14} /> Quitter {detail.type === "CHANNEL" ? "le canal" : "le groupe"}
            </button>
          )}
        </div>
      )}
      <ErrorText error={error} />
    </Modal>
  );
}
