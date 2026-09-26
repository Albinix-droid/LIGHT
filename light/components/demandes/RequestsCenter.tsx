// components/demandes/RequestsCenter.tsx
// CENTRE DES DEMANDES & INVITATIONS (étudiant et encadrant)
// Reçues / Envoyées / Historique + découverte de projets (étudiant)

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Inbox, Send, History, Check, X, Loader2, Search, Users, UserPlus, GraduationCap, Mail, Clock,
  ArrowRight, Compass, MessageCircle,
} from "lucide-react";
import { cancelRequest, requestToJoinProject, respondToRequest, searchDiscoverableProjects } from "@/lib/demandes/actions";
import {
  INVITABLE_ROLES, REQUEST_KIND_LABELS, REQUEST_STATE_LABELS, TEAM_ROLE_LABELS,
  type DiscoverProject, type InvitableRole, type RequestItem, type RequestKind, type RequestState,
} from "@/lib/demandes/types";

type Tab = "received" | "sent" | "history";

const KIND_ICONS: Record<RequestKind, typeof Mail> = {
  PROJECT_INVITATION: UserPlus,
  JOIN_REQUEST: Users,
  SUPERVISION_REQUEST: GraduationCap,
};

const STATE_COLORS: Record<RequestState, { color: string; bg: string }> = {
  PENDING: { color: "#F5B544", bg: "rgba(245,158,11,0.12)" },
  ACCEPTED: { color: "#34D399", bg: "rgba(16,185,129,0.12)" },
  DECLINED: { color: "#F0928B", bg: "rgba(228,115,107,0.12)" },
  CANCELLED: { color: "rgba(200,215,235,0.55)", bg: "rgba(255,255,255,0.05)" },
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" });
const formatDate = (iso: string) => dateFormat.format(new Date(iso));

// Phrase décrivant la demande du point de vue de l'utilisateur
function describe(r: RequestItem, isEncadrant: boolean) {
  const role = r.role ? ` en tant que ${TEAM_ROLE_LABELS[r.role].toLowerCase()}` : "";
  if (r.direction === "received") {
    if (r.type === "PROJECT_INVITATION") return <><strong>{r.other.name}</strong> vous invite à rejoindre son projet{role}</>;
    if (r.type === "JOIN_REQUEST") return <><strong>{r.other.name}</strong> souhaite rejoindre votre projet</>;
    return <><strong>{r.other.name}</strong> vous demande d&apos;encadrer {isEncadrant ? "son projet" : "le projet"}</>;
  }
  if (r.type === "PROJECT_INVITATION") return <>Vous avez invité <strong>{r.other.name}</strong>{role}</>;
  if (r.type === "JOIN_REQUEST") return <>Vous avez demandé à <strong>{r.other.name}</strong> de rejoindre son projet</>;
  return <>Vous avez demandé à <strong>{r.other.name}</strong> d&apos;encadrer votre projet</>;
}

export default function RequestsCenter({
  requests,
  variant,
  initialDiscover = [],
}: {
  requests: RequestItem[];
  variant: "student" | "encadrant";
  initialDiscover?: DiscoverProject[];
}) {
  const isEncadrant = variant === "encadrant";
  const [tab, setTab] = useState<Tab>("received");

  const groups = useMemo(() => ({
    received: requests.filter((r) => r.direction === "received" && r.status === "PENDING"),
    sent: requests.filter((r) => r.direction === "sent" && r.status === "PENDING"),
    history: requests.filter((r) => r.status !== "PENDING"),
  }), [requests]);

  const tabs: { key: Tab; label: string; icon: typeof Inbox }[] = [
    { key: "received", label: "Reçues", icon: Inbox },
    ...(isEncadrant ? [] : [{ key: "sent" as Tab, label: "Envoyées", icon: Send }]),
    { key: "history", label: "Historique", icon: History },
  ];
  const list = groups[tab];

  return (
    <div className="dem-root">
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dem-root { max-width: 960px; margin: 0 auto; padding: 24px 20px 40px; font-family: 'Inter', -apple-system, sans-serif; color: #E8EDF5; }
        .dem-h1 { font-size: 28px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.5px; }
        .dem-sub { color: rgba(200,215,235,0.55); font-size: 14px; margin: 0 0 24px; line-height: 1.6; }
        .dem-tabs { display: flex; gap: 6px; padding: 4px; border-radius: 50px; background: rgba(255,255,255,0.04); border: 1px solid rgba(180,200,230,0.08); width: fit-content; max-width: 100%; overflow-x: auto; margin-bottom: 20px; }
        .dem-tab { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 50px; border: none; background: none; color: rgba(200,215,235,0.6); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .dem-tab-active { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; }
        .dem-count { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.12); }
        .dem-tab-active .dem-count { background: rgba(10,22,40,0.2); }
        .dem-card { padding: 16px 18px; border-radius: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(180,200,230,0.08); }
        .dem-list { display: flex; flex-direction: column; gap: 10px; }
        .dem-avatar { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
        .dem-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 50px; font-size: 11px; font-weight: 600; }
        .dem-quote { margin: 10px 0 0; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border-left: 3px solid rgba(212,175,55,0.5); font-size: 13px; color: rgba(232,237,245,0.8); line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
        .dem-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 50px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid rgba(180,200,230,0.18); background: none; color: rgba(200,215,235,0.85); text-decoration: none; }
        .dem-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .dem-btn:hover:not(:disabled) { border-color: rgba(180,200,230,0.35); color: #E8EDF5; }
        .dem-btn-primary { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; border: none; font-weight: 700; }
        .dem-btn-primary:hover:not(:disabled) { color: #0A1628; filter: brightness(1.05); }
        .dem-btn-danger { border-color: rgba(228,115,107,0.35); color: #F0928B; }
        .dem-input { width: 100%; box-sizing: border-box; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(180,200,230,0.15); background: rgba(255,255,255,0.04); color: #E8EDF5; font-size: 13px; outline: none; font-family: inherit; }
        .dem-input:focus { border-color: rgba(212,175,55,0.45); }
        .dem-empty { text-align: center; padding: 36px 20px; border-radius: 16px; border: 1px dashed rgba(180,200,230,0.15); color: rgba(200,215,235,0.5); font-size: 14px; }
        .dem-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .dem-h2 { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; margin: 36px 0 6px; }
        @media (max-width: 600px) { .dem-h1 { font-size: 23px; } .dem-root { padding: 16px 16px 32px; } }
      `}</style>

      <h1 className="dem-h1">{isEncadrant ? "Demandes d'encadrement" : "Demandes & invitations"}</h1>
      <p className="dem-sub">
        {isEncadrant
          ? "Les étudiants vous sollicitent pour accompagner leur projet. En acceptant, vous devenez leur encadrant et validez chacune de leurs étapes."
          : "Rejoignez des équipes, répondez aux invitations et suivez vos demandes d'encadrement. Pour inviter un étudiant, ouvrez votre projet et utilisez le bloc Équipe."}
      </p>

      <div className="dem-tabs" role="tablist">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} role="tab" aria-selected={tab === key} className={`dem-tab ${tab === key ? "dem-tab-active" : ""}`} onClick={() => setTab(key)}>
            <Icon size={15} /> {label}
            {groups[key].length > 0 && <span className="dem-count">{groups[key].length}</span>}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="dem-empty">
          {tab === "received" && (isEncadrant ? "Aucune demande d'encadrement en attente." : "Aucune invitation ni demande en attente de votre réponse.")}
          {tab === "sent" && "Aucune demande envoyée en attente."}
          {tab === "history" && "Aucune demande traitée pour le moment."}
        </div>
      ) : (
        <div className="dem-list">
          {list.map((r) => <RequestCard key={r.id} request={r} isEncadrant={isEncadrant} />)}
        </div>
      )}

      {!isEncadrant && <DiscoverSection initial={initialDiscover} />}
    </div>
  );
}

// ============================================================
// CARTE D'UNE DEMANDE
// ============================================================
function RequestCard({ request: r, isEncadrant }: { request: RequestItem; isEncadrant: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "accept" | "decline">(null);
  const [response, setResponse] = useState("");
  const [role, setRole] = useState<InvitableRole>("MEMBER");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const Icon = KIND_ICONS[r.type];
  const state = STATE_COLORS[r.status];
  const canRespond = r.direction === "received" && r.status === "PENDING";
  const canCancel = r.direction === "sent" && r.status === "PENDING";
  // Lien vers le projet quand l'utilisateur y a accès
  const projectHref = isEncadrant
    ? r.type === "SUPERVISION_REQUEST" && r.status === "ACCEPTED" ? `/encadrant/projets/${r.project.id}` : null
    : (r.direction === "sent" && r.type !== "JOIN_REQUEST") || (r.direction === "received" && r.type === "JOIN_REQUEST") || r.status === "ACCEPTED"
      ? `/dashboard/projets/${r.project.id}` : null;

  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) => {
    setError("");
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) return setError(result.error);
      setMode(null);
      router.refresh();
    });
  };

  return (
    <div className="dem-card">
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <span className="dem-avatar" style={{ background: "rgba(212,175,55,0.12)" }}>
          <Icon size={18} style={{ color: "#F5D76E" }} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(200,215,235,0.45)" }}>{REQUEST_KIND_LABELS[r.type]}</span>
            <span className="dem-badge" style={{ color: state.color, background: state.bg }}>{REQUEST_STATE_LABELS[r.status]}</span>
          </div>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, color: "rgba(232,237,245,0.9)" }}>{describe(r, isEncadrant)}</p>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(200,215,235,0.6)" }}>
            Projet <strong style={{ color: "#F5D76E" }}>{r.project.title}</strong> · étape {r.project.stageLabel}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "flex", alignItems: "center", gap: "5px" }}>
            <Clock size={11} /> {formatDate(r.createdAt)}
            {r.respondedAt && ` · ${r.status === "CANCELLED" ? "annulée" : "réponse"} le ${formatDate(r.respondedAt)}`}
          </p>
          {r.message && <p className="dem-quote">{r.message}</p>}
          {r.responseMessage && (
            <p className="dem-quote" style={{ borderLeftColor: state.color }}>
              <span style={{ display: "block", fontSize: "11px", color: "rgba(200,215,235,0.45)", marginBottom: "2px" }}>Réponse</span>
              {r.responseMessage}
            </p>
          )}

          {/* Réponse en cours de rédaction */}
          {canRespond && mode && (
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {mode === "accept" && r.type === "JOIN_REQUEST" && (
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "rgba(200,215,235,0.6)", flexWrap: "wrap" }}>
                  Rôle attribué
                  <select className="dem-input" value={role} onChange={(e) => setRole(e.target.value as InvitableRole)} style={{ width: "auto", flex: 1, minWidth: "180px" }}>
                    {INVITABLE_ROLES.map((ro) => <option key={ro} value={ro} style={{ background: "#0A1628" }}>{TEAM_ROLE_LABELS[ro]}</option>)}
                  </select>
                </label>
              )}
              <textarea
                className="dem-input"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                maxLength={500}
                placeholder={mode === "accept" ? "Un mot d'accueil (facultatif)" : "Expliquez brièvement votre refus (facultatif)"}
                aria-label="Message de réponse"
                style={{ minHeight: "60px", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className={`dem-btn ${mode === "accept" ? "dem-btn-primary" : "dem-btn-danger"}`}
                  disabled={isPending}
                  onClick={() => run(() => respondToRequest({ requestId: r.id, accept: mode === "accept", responseMessage: response, role: r.type === "JOIN_REQUEST" ? role : undefined }))}
                >
                  {isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : mode === "accept" ? <Check size={13} /> : <X size={13} />}
                  {mode === "accept" ? "Confirmer l'acceptation" : "Confirmer le refus"}
                </button>
                <button className="dem-btn" onClick={() => setMode(null)} disabled={isPending}>Retour</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
            {canRespond && !mode && (
              <>
                <button className="dem-btn dem-btn-primary" onClick={() => setMode("accept")}><Check size={13} /> Accepter</button>
                <button className="dem-btn dem-btn-danger" onClick={() => setMode("decline")}><X size={13} /> Refuser</button>
              </>
            )}
            {canCancel && (
              <button className="dem-btn dem-btn-danger" disabled={isPending} onClick={() => run(() => cancelRequest(r.id))}>
                {isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <X size={13} />} Annuler la demande
              </button>
            )}
            {projectHref && <Link href={projectHref} className="dem-btn">Voir le projet <ArrowRight size={13} /></Link>}
            <Link href={`${isEncadrant ? "/encadrant" : "/dashboard"}/messagerie`} className="dem-btn"><MessageCircle size={13} /> Écrire à {r.other.name.split(" ")[0] || "la personne"}</Link>
          </div>
          {error && <p role="alert" style={{ color: "#F0928B", fontSize: "12px", margin: "8px 0 0" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DÉCOUVRIR DES PROJETS (étudiant)
// ============================================================
function DiscoverSection({ initial }: { initial: DiscoverProject[] }) {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => setProjects(initial), [initial]);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 1) return;
    setLoading(true);
    const timer = setTimeout(async () => {
      const result = await searchDiscoverableProjects(q);
      if (result.ok) setProjects(result.projects);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <section aria-labelledby="dem-discover">
      <h2 id="dem-discover" className="dem-h2"><Compass size={20} style={{ color: "#F5D76E" }} /> Découvrir des projets</h2>
      <p className="dem-sub" style={{ marginBottom: "14px" }}>Proposez vos compétences à une équipe : le porteur du projet recevra votre demande.</p>
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(200,215,235,0.35)" }} />
        <input className="dem-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un projet par titre ou description" aria-label="Rechercher un projet" style={{ paddingLeft: "38px" }} />
        {loading && <Loader2 size={15} style={{ position: "absolute", right: "14px", top: "50%", marginTop: "-7px", animation: "spin 1s linear infinite", color: "#F5D76E" }} />}
      </div>
      {projects.length === 0 ? (
        <div className="dem-empty">{query.trim() ? "Aucun projet ne correspond à votre recherche." : "Aucun autre projet à rejoindre pour le moment."}</div>
      ) : (
        <div className="dem-grid">
          {projects.map((p) => <DiscoverCard key={p.id} project={p} />)}
        </div>
      )}
    </section>
  );
}

function DiscoverCard({ project: p }: { project: DiscoverProject }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(p.hasPendingRequest);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => setSent(p.hasPendingRequest), [p.hasPendingRequest]);

  const send = () => {
    setError("");
    startTransition(async () => {
      const result = await requestToJoinProject({ projectId: p.id, message });
      if (!result.ok) return setError(result.error);
      setSent(true);
      setOpen(false);
      setMessage("");
      router.refresh();
    });
  };

  return (
    <div className="dem-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{p.title}</p>
      <p style={{ margin: 0, fontSize: "12px", color: "rgba(200,215,235,0.5)" }}>
        Porté par {p.ownerName} · étape {p.stageLabel} · {p.memberCount}/{p.teamSize} membre{p.teamSize > 1 ? "s" : ""}
      </p>
      {p.description && <p style={{ margin: 0, fontSize: "13px", color: "rgba(232,237,245,0.75)", lineHeight: 1.5 }}>{p.description}</p>}
      <div style={{ marginTop: "auto", paddingTop: "6px" }}>
        {sent ? (
          <span className="dem-badge" style={{ color: "#F5B544", background: "rgba(245,158,11,0.12)" }}><Clock size={11} /> Demande envoyée</span>
        ) : open ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <textarea className="dem-input" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} autoFocus placeholder="Présentez-vous et ce que vous pouvez apporter (facultatif)" aria-label="Message au porteur du projet" style={{ minHeight: "70px", resize: "vertical" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="dem-btn dem-btn-primary" onClick={send} disabled={isPending}>
                {isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={13} />} Envoyer
              </button>
              <button className="dem-btn" onClick={() => setOpen(false)} disabled={isPending}>Annuler</button>
            </div>
          </div>
        ) : (
          <button className="dem-btn dem-btn-primary" onClick={() => setOpen(true)}><UserPlus size={13} /> Demander à rejoindre</button>
        )}
        {error && <p role="alert" style={{ color: "#F0928B", fontSize: "12px", margin: "8px 0 0" }}>{error}</p>}
      </div>
    </div>
  );
}
