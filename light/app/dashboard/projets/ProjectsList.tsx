// app/dashboard/projets/ProjectsList.tsx
// MES PROJETS : recherche, filtre par étape, vue grille ou liste

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, FolderKanban, GraduationCap, LayoutGrid, List, Plus, Rocket, Search, Users, Wallet } from "lucide-react";
import ProjectCover from "@/components/ui/ProjectCover";
import StageTrack from "@/components/ui/StageTrack";
import { Badge, EmptyState, PageHeader, ProgressBar, StatCard, buttonClass, cx, inputClass, type Tone } from "@/components/ui/kit";
import { STAGES } from "@/lib/parcours";
import { formatShortDate } from "@/lib/format";

export interface ProjectSummary {
  id: string;
  title: string;
  stage: string;
  stageKey: string;
  stageIndex: number;
  steps: { stage: string; status: string }[];
  progress: number;
  members: number;
  budget: number | null;
  spent: number;
  sector: string | null;
  sectorLabel: string | null;
  supervisor: string | null;
  updatedAt: string;
  isOwner: boolean;
  awaitingReview: boolean;
  changesRequested: boolean;
}

function statusOf(p: ProjectSummary): { label: string; tone: Tone } {
  if (p.progress >= 100) return { label: "Concrétisé", tone: "success" };
  if (p.awaitingReview) return { label: "En attente de l'encadrant", tone: "warning" };
  if (p.changesRequested) return { label: "Modifications demandées", tone: "danger" };
  if (!p.supervisor) return { label: "Sans encadrant", tone: "gold" };
  return { label: "En cours", tone: "brand" };
}

const formatAmount = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;

export default function ProjectsList({ projects }: { projects: ProjectSummary[] }) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) => (stage === "all" || p.stageKey === stage) && (!q || p.title.toLowerCase().includes(q) || (p.sectorLabel ?? "").toLowerCase().includes(q)),
    );
  }, [projects, query, stage]);

  const completed = projects.filter((p) => p.progress >= 100).length;
  const awaiting = projects.filter((p) => p.awaitingReview).length;
  const presentStages = STAGES.filter((s) => projects.some((p) => p.stageKey === s.stage));

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        eyebrow="Parcours entrepreneurial"
        title="Mes projets"
        description="Retrouvez tous les projets que vous portez ou auxquels vous participez, et leur avancement dans le parcours en 5 étapes."
        actions={
          <Link href="/dashboard/projets/nouveau" className={buttonClass("primary", "lg")}>
            <Plus /> Nouveau projet
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Vous n'avez pas encore de projet"
          description="Créez votre premier projet pour démarrer le parcours, ou rejoignez l'équipe d'un autre étudiant depuis la page Invitations."
          action={
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link href="/dashboard/projets/nouveau" className={buttonClass("primary")}><Plus /> Créer un projet</Link>
              <Link href="/dashboard/invitations" className={buttonClass("secondary")}><Users /> Rejoindre une équipe</Link>
            </div>
          }
        />
      ) : (
        <>
          {/* ===== CHIFFRES CLÉS ===== */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-rise">
            <StatCard icon={FolderKanban} tone="brand" label="Projets" value={projects.length} />
            <StatCard icon={Rocket} tone="gold" label="En cours" value={projects.length - completed} />
            <StatCard icon={Clock} tone="warning" label="En attente de l'encadrant" value={awaiting} />
            <StatCard icon={CheckCircle2} tone="success" label="Concrétisés" value={completed} />
          </div>

          {/* ===== RECHERCHE & FILTRES ===== */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink" />
              <input
                className={cx(inputClass, "h-10 py-0 pl-10 shadow-card")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un projet ou un secteur…"
                aria-label="Rechercher un projet"
              />
            </div>
            <div role="tablist" aria-label="Filtrer par étape" className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 shadow-card">
              {[{ stage: "all", label: "Toutes les étapes" }, ...presentStages].map((s) => (
                <button
                  key={s.stage}
                  role="tab"
                  aria-selected={stage === s.stage}
                  onClick={() => setStage(s.stage)}
                  className={cx(
                    "shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors",
                    stage === s.stage ? "bg-brand text-white shadow-sm" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 rounded-xl border border-line bg-surface p-1 shadow-card" role="group" aria-label="Affichage">
              {([["grid", LayoutGrid, "Grille"], ["list", List, "Liste"]] as const).map(([mode, Icon, label]) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  aria-pressed={view === mode}
                  aria-label={`Affichage en ${label.toLowerCase()}`}
                  title={label}
                  className={cx("inline-flex size-8 items-center justify-center rounded-lg transition-colors", view === mode ? "bg-brand text-white" : "text-ink-muted hover:bg-surface-muted")}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon={Search} title="Aucun projet trouvé" description="Aucun projet ne correspond à ces critères." />
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 animate-rise">
              {visible.map((p) => {
                const status = statusOf(p);
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/projets/${p.id}`}
                    className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <ProjectCover sector={p.sector} title={p.title} className="h-full transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                      <span className="absolute top-3 left-3"><Badge tone={status.tone} className="bg-surface/95 shadow-sm">{status.label}</Badge></span>
                      <span className="absolute bottom-3 left-3 flex gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
                          {p.sectorLabel ?? "Projet"}
                        </span>
                        {!p.isOwner && (
                          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#14244f]">Membre de l&apos;équipe</span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="line-clamp-1 text-[15px] font-semibold text-ink">{p.title}</p>
                      <div className="mt-1 flex items-center justify-between text-[12px] text-ink-muted">
                        <span>Étape {p.stageIndex + 1}/5 · {p.stage}</span>
                        <span className="font-semibold text-ink tabular-nums">{p.progress}%</span>
                      </div>
                      <StageTrack stage={p.stageKey} steps={p.steps} className="mt-3" />
                      <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-[12px] text-ink-muted">
                        <p className="flex items-center gap-1.5 truncate">
                          <GraduationCap className="size-3.5 shrink-0 text-ink" strokeWidth={1.75} />
                          {p.supervisor ?? <span className="text-gold">Aucun encadrant choisi</span>}
                        </p>
                        <p className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5 text-ink" strokeWidth={1.75} /> {p.members} membre{p.members > 1 ? "s" : ""}
                          </span>
                          <span className="text-ink-subtle">{formatShortDate(p.updatedAt)}</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              <Link
                href="/dashboard/projets/nouveau"
                className="group flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-line-strong bg-surface/50 p-6 text-center transition-colors hover:border-brand hover:bg-brand-soft/40"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink transition-colors group-hover:bg-brand group-hover:text-white">
                  <Plus className="size-5" strokeWidth={2} />
                </span>
                <span className="text-[14px] font-semibold text-ink">Nouveau projet</span>
                <span className="max-w-[200px] text-[12px] leading-relaxed text-ink-muted">Lancez une nouvelle idée sur le parcours en 5 étapes.</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-card animate-rise">
              <ul className="divide-y divide-line">
                {visible.map((p) => {
                  const status = statusOf(p);
                  return (
                    <li key={p.id}>
                      <Link href={`/dashboard/projets/${p.id}`} className="group flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 transition-colors hover:bg-surface-muted">
                        <ProjectCover sector={p.sector} title={p.title} variant="tile" className="size-12 rounded-2xl" />
                        <div className="min-w-[200px] flex-[2]">
                          <p className="truncate text-[14.5px] font-semibold text-ink group-hover:text-brand">{p.title}</p>
                          <p className="truncate text-[12.5px] text-ink-muted">
                            {p.sectorLabel ?? "Secteur non renseigné"} · {p.supervisor ? `Encadré par ${p.supervisor}` : "Sans encadrant"}
                          </p>
                        </div>
                        <div className="min-w-[160px] flex-1">
                          <StageTrack stage={p.stageKey} steps={p.steps} />
                          <p className="mt-1.5 text-[11.5px] text-ink-subtle">Étape {p.stageIndex + 1}/5 · {p.stage} · {p.progress}%</p>
                        </div>
                        <div className="hidden min-w-[150px] flex-1 lg:block">
                          {p.budget ? (
                            <>
                              <ProgressBar value={(p.spent / p.budget) * 100} tone="gold" />
                              <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-subtle">
                                <Wallet className="size-3" /> {formatAmount(p.spent)} / {formatAmount(p.budget)}
                              </p>
                            </>
                          ) : (
                            <p className="flex items-center gap-1 text-[12px] text-ink-subtle"><Wallet className="size-3.5" /> Budget non estimé</p>
                          )}
                        </div>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
