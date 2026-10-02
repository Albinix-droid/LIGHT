// app/dashboard/projets/[id]/page.tsx
// VUE D'ENSEMBLE D'UN PROJET - PARCOURS EN 5 ÉTAPES ET SUIVI PAR L'ENCADRANT

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock, Code, Compass, GraduationCap, Lightbulb, PenTool, Rocket, Shield, Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAccessibleProject, listEncadrants, fullName } from "@/lib/projects";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { getProjectTeam } from "@/lib/demandes/queries";
import { markReadForPath } from "@/lib/notifications/queries";
import ProjectCover from "@/components/ui/ProjectCover";
import Avatar from "@/components/ui/Avatar";
import { Badge, Card, CardHeader, PageHeader, ProgressBar, cx, type Tone } from "@/components/ui/kit";
import SupervisorPicker from "./SupervisorPicker";
import TeamPanel from "./TeamPanel";
import { Stars, formatDate } from "./StepStatusBanner";

const STAGE_ICONS = [Lightbulb, PenTool, Code, Shield, Rocket];

const STATUS_DISPLAY: Record<string, { label: string; tone: Tone }> = {
  COMPLETED: { label: "Validée par l'encadrant", tone: "success" },
  SUBMITTED: { label: "Soumise · en attente de l'encadrant", tone: "warning" },
  CHANGES_REQUESTED: { label: "Modifications demandées", tone: "danger" },
  IN_PROGRESS: { label: "En cours", tone: "brand" },
  UPCOMING: { label: "À venir · vous pouvez déjà la préparer", tone: "neutral" },
};

const TILE: Record<Tone, string> = {
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  brand: "bg-brand text-white shadow-brand",
  neutral: "bg-surface-muted text-ink-subtle",
  gold: "bg-gold-soft text-gold",
};

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [project, encadrants] = await Promise.all([getAccessibleProject(id, user.id), listEncadrants()]);
  if (!project) notFound();

  const [{ team, pendingInvitations, pendingSupervision }] = await Promise.all([
    getProjectTeam(project.id, user.id),
    markReadForPath(user.id, user.role, `/dashboard/projets/${project.id}`),
  ]);
  const isOwner = project.ownerId === user.id;
  const currentIndex = getStageIndex(project.stage);

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader back={{ href: "/dashboard/projets", label: "Mes projets" }} title={project.title} />

      {/* ===== EN-TÊTE DU PROJET ===== */}
      <Card padded={false} className="mb-8 overflow-hidden animate-rise">
        <div className="relative">
          <ProjectCover sector={project.sector} title={project.title} className="h-32 sm:h-40" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-[linear-gradient(0deg,rgba(5,9,18,0.55),transparent)] px-6 pt-10 pb-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-black/25 px-3 py-1 text-[12px] font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
                {project.sector ? SECTOR_LABELS[project.sector] ?? project.sector : "Secteur non renseigné"}
              </span>
              <span className="inline-flex items-center rounded-full bg-black/25 px-3 py-1 text-[12px] font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
                {project.teamSize} personne{project.teamSize > 1 ? "s" : ""}
              </span>
            </div>
            <Link
              href={`/dashboard/assistant?projet=${project.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/95 px-4 text-[13px] font-semibold text-[#14244f] shadow-sm transition-transform hover:-translate-y-px"
            >
              <Sparkles className="size-4 text-gold" strokeWidth={2} /> Analyser avec le mentor IA
            </Link>
          </div>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {project.description ? (
              <p className="text-[14.5px] leading-relaxed text-ink-muted">{project.description}</p>
            ) : (
              <p className="text-[14px] text-ink-subtle">Aucune description pour le moment.</p>
            )}
          </div>
          <div className="rounded-2xl border border-line bg-surface-muted p-4">
            <div className="mb-2 flex justify-between text-[12.5px]">
              <span className="text-ink-muted">Étape {currentIndex + 1}/5 · {STAGES[currentIndex].label}</span>
              <span className="font-semibold text-brand tabular-nums">{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} />
            <p className="mt-2.5 text-[12px] text-ink-subtle">
              {project.steps.filter((s) => s.status === "COMPLETED").length} étape{project.steps.filter((s) => s.status === "COMPLETED").length > 1 ? "s" : ""} validée{project.steps.filter((s) => s.status === "COMPLETED").length > 1 ? "s" : ""} sur 5
            </p>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ===== PARCOURS ===== */}
        <section aria-labelledby="parcours-title" className="min-w-0 animate-rise [animation-delay:60ms]">
          <h2 id="parcours-title" className="mb-4 font-display text-[19px] font-semibold tracking-tight text-ink">Parcours en 5 étapes</h2>
          <ol className="relative space-y-3.5 before:absolute before:top-7 before:bottom-7 before:left-[27px] before:w-px before:bg-line">
            {STAGES.map((stage, index) => {
              const Icon = STAGE_ICONS[index];
              const step = project.steps.find((s) => s.stage === stage.stage);
              const last = step?.submissions[0];
              // Étape à venir : consultable et modifiable, soumise après validation de la précédente
              const isUpcoming = index > currentIndex && step?.status !== "COMPLETED";
              const statusKey = isUpcoming ? "UPCOMING" : step?.status ?? "IN_PROGRESS";
              const display = STATUS_DISPLAY[statusKey];
              const StatusIcon = statusKey === "COMPLETED" ? CheckCircle2
                : statusKey === "UPCOMING" ? Compass
                : statusKey === "SUBMITTED" ? Clock
                : statusKey === "CHANGES_REQUESTED" ? AlertTriangle
                : Icon;

              return (
                <li key={stage.slug} className="relative flex gap-4">
                  <span className={cx("relative z-10 inline-flex size-14 shrink-0 items-center justify-center rounded-2xl ring-4 ring-canvas", TILE[display.tone])}>
                    <StatusIcon className="size-5" strokeWidth={1.9} />
                  </span>
                  <Link
                    href={`/dashboard/projets/${project.id}/${stage.slug}`}
                    title={isUpcoming ? "Soumission possible après validation de l'étape précédente par votre encadrant" : undefined}
                    className={cx(
                      "group flex min-w-0 flex-1 items-start gap-4 rounded-[20px] border border-line bg-surface p-4 shadow-card transition-all duration-150 hover:-translate-y-px hover:border-line-strong hover:shadow-raised",
                      isUpcoming && "opacity-80 hover:opacity-100",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase">Étape {index + 1}</p>
                      <p className="font-display text-[16px] font-semibold text-ink group-hover:text-brand">{stage.label}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge tone={display.tone}>{display.label}</Badge>
                        <span className="text-[12px] text-ink-subtle">
                          {statusKey === "COMPLETED" && step?.completedAt && `le ${formatDate(step.completedAt.toISOString())}`}
                          {statusKey === "SUBMITTED" && last && `depuis le ${formatDate(last.submittedAt.toISOString())}`}
                        </span>
                      </div>
                      {/* Dernier retour de l'encadrant */}
                      {last?.feedback && last.decision && (
                        <div className={cx("mt-3 rounded-xl border-l-[3px] bg-surface-muted px-3.5 py-2.5", last.decision === "APPROVED" ? "border-success" : "border-danger")}>
                          <p className="mb-0.5 flex items-center gap-2 text-[11.5px] font-semibold text-ink-subtle">
                            {fullName(last.reviewer) || "Encadrant"}
                            {last.rating ? <Stars rating={last.rating} size={11} /> : null}
                          </p>
                          <p className="line-clamp-2 text-[13px] leading-relaxed text-ink">{last.feedback}</p>
                        </div>
                      )}
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ===== ENCADRANT & ÉQUIPE ===== */}
        <aside className="space-y-6 animate-rise [animation-delay:120ms]">
          <Card className={project.supervisor ? "" : "ring-1 ring-gold/30"}>
            <CardHeader
              title={project.supervisor ? "Votre encadrant" : "Demandez un encadrant"}
              icon={GraduationCap}
              description={
                project.supervisor
                  ? "Il examine chaque étape que vous soumettez et vous accompagne jusqu'à la concrétisation."
                  : "Votre encadrant reçoit une demande et l'accepte. Il valide ensuite chacune de vos étapes."
              }
            />
            {project.supervisor && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface-muted p-3">
                <div className="relative">
                  <Avatar name={fullName(project.supervisor)} size="lg" />
                  <span className="absolute -right-1 -bottom-1 inline-flex size-5 items-center justify-center rounded-full bg-gold-bright text-[#2a1d05] ring-2 ring-surface">
                    <GraduationCap className="size-3" strokeWidth={2.25} />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink">{fullName(project.supervisor)}</p>
                  <p className="truncate text-[12px] text-ink-muted">{project.supervisor.email}</p>
                </div>
              </div>
            )}
            <SupervisorPicker
              projectId={project.id}
              currentId={project.supervisorId}
              canEdit={isOwner}
              encadrants={encadrants.map((e) => ({ id: e.id, name: fullName(e), email: e.email }))}
              pendingRequest={pendingSupervision}
            />
          </Card>

          <TeamPanel projectId={project.id} isOwner={isOwner} team={team} pendingInvitations={pendingInvitations} teamSize={project.teamSize} />
        </aside>
      </div>
    </div>
  );
}
