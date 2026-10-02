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
import Avatar from "@/components/ui/Avatar";
import ProjectCover from "@/components/ui/ProjectCover";
import { Badge, EmptyState, PageHeader, Segmented, buttonClass, cx, inputClass, selectClass, textareaClass, type Tone } from "@/components/ui/kit";

type Tab = "received" | "sent" | "history";

const KIND_ICONS: Record<RequestKind, typeof Mail> = {
  PROJECT_INVITATION: UserPlus,
  JOIN_REQUEST: Users,
  SUPERVISION_REQUEST: GraduationCap,
};

const KIND_TONES: Record<RequestKind, Tone> = {
  PROJECT_INVITATION: "brand",
  JOIN_REQUEST: "success",
  SUPERVISION_REQUEST: "gold",
};

const TONE_TILES: Partial<Record<Tone, string>> = {
  brand: "bg-brand text-white",
  success: "bg-brand-soft text-brand",
  gold: "bg-surface text-brand shadow-card",
};

const STATE_TONES: Record<RequestState, Tone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "neutral",
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" });
const formatDate = (iso: string) => dateFormat.format(new Date(iso));

// Phrase décrivant la demande du point de vue de l'utilisateur
function describe(r: RequestItem, isEncadrant: boolean) {
  const role = r.role ? ` en tant que ${TEAM_ROLE_LABELS[r.role].toLowerCase()}` : "";
  const name = <strong className="font-semibold text-ink">{r.other.name}</strong>;
  if (r.direction === "received") {
    if (r.type === "PROJECT_INVITATION") return <>{name} vous invite à rejoindre son projet{role}</>;
    if (r.type === "JOIN_REQUEST") return <>{name} souhaite rejoindre votre projet</>;
    return <>{name} vous demande d&apos;encadrer {isEncadrant ? "son projet" : "le projet"}</>;
  }
  if (r.type === "PROJECT_INVITATION") return <>Vous avez invité {name}{role}</>;
  if (r.type === "JOIN_REQUEST") return <>Vous avez demandé à {name} de rejoindre son projet</>;
  return <>Vous avez demandé à {name} d&apos;encadrer votre projet</>;
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
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        eyebrow={isEncadrant ? "Accompagnement" : "Collaboration"}
        title={isEncadrant ? "Demandes d'encadrement" : "Demandes & invitations"}
        description={
          isEncadrant
            ? "Les étudiants vous sollicitent pour accompagner leur projet. En acceptant, vous devenez leur encadrant et validez chacune de leurs étapes."
            : "Rejoignez des équipes, répondez aux invitations et suivez vos demandes d'encadrement. Pour inviter un étudiant, ouvrez votre projet et utilisez le bloc Équipe."
        }
      />

      <Segmented
        className="mb-5 w-fit"
        label="Catégories de demandes"
        value={tab}
        onChange={setTab}
        items={tabs.map(({ key, label, icon }) => ({ value: key, label, icon, count: groups[key].length }))}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={tab === "history" ? History : tab === "sent" ? Send : Inbox}
          title={tab === "received" ? "Rien en attente" : tab === "sent" ? "Aucune demande envoyée" : "Historique vide"}
          description={
            tab === "received"
              ? isEncadrant ? "Aucune demande d'encadrement en attente." : "Aucune invitation ni demande en attente de votre réponse."
              : tab === "sent" ? "Aucune demande envoyée en attente." : "Aucune demande traitée pour le moment."
          }
        />
      ) : (
        <div className="flex flex-col gap-3 animate-rise">
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
    <article className="rounded-[22px] border border-line bg-surface p-5 shadow-card">
      <div className="flex gap-4">
        <div className="relative h-fit shrink-0">
          <Avatar name={r.other.name} size="lg" />
          <span className={cx("absolute -right-1.5 -bottom-1.5 inline-flex size-6 items-center justify-center rounded-lg ring-2 ring-surface", TONE_TILES[KIND_TONES[r.type]])}>
            <Icon className="size-3.5" strokeWidth={2} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.1em] text-ink-subtle uppercase">{REQUEST_KIND_LABELS[r.type]}</span>
            <Badge tone={STATE_TONES[r.status]}>{REQUEST_STATE_LABELS[r.status]}</Badge>
          </div>
          <p className="text-[14.5px] leading-snug text-ink-muted">{describe(r, isEncadrant)}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <ProjectCover sector={r.project.sector} title={r.project.title} variant="tile" className="size-5 rounded-md" />
            <span className="font-semibold text-ink">{r.project.title}</span>
            <span className="text-ink-subtle">· étape {r.project.stageLabel}</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-ink-subtle">
            <Clock className="size-3" /> {formatDate(r.createdAt)}
            {r.respondedAt && ` · ${r.status === "CANCELLED" ? "annulée" : "réponse"} le ${formatDate(r.respondedAt)}`}
          </p>
          {r.message && (
            <blockquote className="mt-3 rounded-xl border-l-[3px] border-gold/60 bg-surface-muted px-4 py-2.5 text-[13px] leading-relaxed break-words whitespace-pre-wrap text-ink">
              {r.message}
            </blockquote>
          )}
          {r.responseMessage && (
            <blockquote className="mt-2 rounded-xl border-l-[3px] border-brand/60 bg-surface-muted px-4 py-2.5 text-[13px] leading-relaxed break-words whitespace-pre-wrap text-ink">
              <span className="mb-0.5 block text-[11px] font-semibold text-ink-subtle">Réponse</span>
              {r.responseMessage}
            </blockquote>
          )}

          {/* Réponse en cours de rédaction */}
          {canRespond && mode && (
            <div className="mt-4 space-y-3 rounded-2xl border border-line bg-surface-muted p-4">
              {mode === "accept" && r.type === "JOIN_REQUEST" && (
                <label className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-ink">
                  Rôle attribué
                  <select className={cx(selectClass, "!w-auto min-w-[200px] flex-1")} value={role} onChange={(e) => setRole(e.target.value as InvitableRole)}>
                    {INVITABLE_ROLES.map((ro) => <option key={ro} value={ro}>{TEAM_ROLE_LABELS[ro]}</option>)}
                  </select>
                </label>
              )}
              <textarea
                className={cx(textareaClass, "min-h-[80px]")}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                maxLength={500}
                placeholder={mode === "accept" ? "Un mot d'accueil (facultatif)" : "Expliquez brièvement votre refus (facultatif)"}
                aria-label="Message de réponse"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  className={buttonClass(mode === "accept" ? "primary" : "danger", "sm")}
                  disabled={isPending}
                  onClick={() => run(() => respondToRequest({ requestId: r.id, accept: mode === "accept", responseMessage: response, role: r.type === "JOIN_REQUEST" ? role : undefined }))}
                >
                  {isPending ? <Loader2 className="animate-spin" /> : mode === "accept" ? <Check /> : <X />}
                  {mode === "accept" ? "Confirmer l'acceptation" : "Confirmer le refus"}
                </button>
                <button className={buttonClass("ghost", "sm")} onClick={() => setMode(null)} disabled={isPending}>Retour</button>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {canRespond && !mode && (
              <>
                <button className={buttonClass("primary", "sm")} onClick={() => setMode("accept")}><Check /> Accepter</button>
                <button className={buttonClass("danger", "sm")} onClick={() => setMode("decline")}><X /> Refuser</button>
              </>
            )}
            {canCancel && (
              <button className={buttonClass("danger", "sm")} disabled={isPending} onClick={() => run(() => cancelRequest(r.id))}>
                {isPending ? <Loader2 className="animate-spin" /> : <X />} Annuler la demande
              </button>
            )}
            {projectHref && <Link href={projectHref} className={buttonClass("secondary", "sm")}>Voir le projet <ArrowRight /></Link>}
            <Link href={`${isEncadrant ? "/encadrant" : "/dashboard"}/messagerie`} className={buttonClass("ghost", "sm")}>
              <MessageCircle /> Écrire à {r.other.name.split(" ")[0] || "la personne"}
            </Link>
          </div>
          {error && <p role="alert" className="mt-2 text-[12px] text-danger">{error}</p>}
        </div>
      </div>
    </article>
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
    <section aria-labelledby="dem-discover" className="mt-12">
      <h2 id="dem-discover" className="flex items-center gap-2 font-display text-[19px] font-semibold tracking-tight text-ink">
        <Compass className="size-5 text-brand" strokeWidth={1.75} /> Découvrir des projets
      </h2>
      <p className="mt-1 mb-4 text-[13.5px] text-ink-muted">Proposez vos compétences à une équipe : le porteur du projet recevra votre demande.</p>
      <div className="relative mb-5 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink" />
        <input
          className={cx(inputClass, "h-11 py-0 pl-10 shadow-card")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un projet par titre ou description"
          aria-label="Rechercher un projet"
        />
        {loading && <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-brand" />}
      </div>
      {projects.length === 0 ? (
        <EmptyState icon={Compass} title="Aucun projet" description={query.trim() ? "Aucun projet ne correspond à votre recherche." : "Aucun autre projet à rejoindre pour le moment."} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
    <article className="flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
      <ProjectCover sector={p.sector} title={p.title} className="h-24" />
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-1 text-[15px] font-semibold text-ink">{p.title}</p>
        <p className="mt-0.5 text-[12px] text-ink-muted">
          Porté par {p.ownerName} · étape {p.stageLabel} · {p.memberCount}/{p.teamSize} membre{p.teamSize > 1 ? "s" : ""}
        </p>
        {p.description && <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-muted">{p.description}</p>}
        <div className="mt-auto pt-4">
          {sent ? (
            <Badge tone="warning" icon={Clock}>Demande envoyée</Badge>
          ) : open ? (
            <div className="space-y-2">
              <textarea
                className={cx(textareaClass, "min-h-[90px]")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                autoFocus
                placeholder="Présentez-vous et ce que vous pouvez apporter (facultatif)"
                aria-label="Message au porteur du projet"
              />
              <div className="flex gap-2">
                <button className={buttonClass("primary", "sm")} onClick={send} disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : <Send />} Envoyer
                </button>
                <button className={buttonClass("ghost", "sm")} onClick={() => setOpen(false)} disabled={isPending}>Annuler</button>
              </div>
            </div>
          ) : (
            <button className={buttonClass("soft", "sm")} onClick={() => setOpen(true)}><UserPlus /> Demander à rejoindre</button>
          )}
          {error && <p role="alert" className="mt-2 text-[12px] text-danger">{error}</p>}
        </div>
      </div>
    </article>
  );
}
