// app/encadrant/projets/[id]/page.tsx
// SUIVI D'UN PROJET PAR L'ENCADRANT : frise des étapes, contenu, historique des échanges

import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Circle, Clock, Lock, MessageSquare, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { markReadForPath } from "@/lib/notifications/queries";
import { getSupervisedProject, fullName } from "@/lib/projects";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { formatDate } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import ProjectCover from "@/components/ui/ProjectCover";
import Stars from "@/components/ui/Stars";
import { Badge, Card, PageHeader, ProgressBar, buttonClass, cx, type Tone } from "@/components/ui/kit";
import StepDataView from "../../StepDataView";
import { getFollowUpStatus } from "../../projectStatus";

const STEP_DISPLAY: Record<string, { label: string; tone: Tone; Icon: typeof Circle }> = {
  COMPLETED: { label: "Validée", tone: "success", Icon: CheckCircle2 },
  SUBMITTED: { label: "Soumise · à examiner", tone: "warning", Icon: Clock },
  CHANGES_REQUESTED: { label: "Modifications demandées", tone: "danger", Icon: AlertTriangle },
  IN_PROGRESS: { label: "En cours de rédaction", tone: "brand", Icon: Circle },
  UPCOMING: { label: "À venir · préparation en cours", tone: "neutral", Icon: Lock },
  NOT_STARTED: { label: "Pas encore commencée", tone: "neutral", Icon: Lock },
};

const TILE: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  brand: "bg-brand-soft text-brand-ink",
  neutral: "bg-surface-muted text-ink-subtle",
  gold: "bg-gold-soft text-gold",
};

export default async function EncadrantProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("ENCADRANT");
  const project = await getSupervisedProject(id, user.id);
  if (!project) notFound();
  await markReadForPath(user.id, user.role, `/encadrant/projets/${project.id}`);

  const current = getStageIndex(project.stage);
  const status = getFollowUpStatus(project);
  const team = project.members.filter((m) => m.userId !== project.ownerId);

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader back={{ href: "/encadrant/projets", label: "Projets suivis" }} title={project.title} />

      {/* ===== EN-TÊTE DU PROJET ===== */}
      <Card padded={false} className="mb-8 overflow-hidden animate-rise">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <ProjectCover sector={project.sector} title={project.title} variant="tile" className="size-16 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={status.tone}>{status.label}</Badge>
              <Badge>{project.sector ? SECTOR_LABELS[project.sector] ?? project.sector : "Secteur non renseigné"}</Badge>
            </div>
            {project.description && <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{project.description}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px]">
              <span className="inline-flex items-center gap-2.5">
                <Avatar name={fullName(project.owner)} size="sm" />
                <span>
                  <span className="block font-semibold text-ink">{fullName(project.owner)}</span>
                  <span className="block text-[12px] text-ink-subtle">Porteur · {project.owner.email}</span>
                </span>
              </span>
              {team.length > 0 && (
                <span className="inline-flex items-center gap-2 text-ink-muted">
                  <Users className="size-4" strokeWidth={1.75} />
                  {team.map((m) => fullName(m.user)).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-line bg-surface-muted px-6 py-4">
          <div className="mb-2 flex justify-between text-[12.5px]">
            <span className="text-ink-muted">Étape {current + 1}/5 · {STAGES[current].label}</span>
            <span className="font-semibold text-brand tabular-nums">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} />
        </div>
      </Card>

      {/* ===== FRISE DES ÉTAPES ===== */}
      <ol className="relative space-y-4 before:absolute before:top-6 before:bottom-6 before:left-[27px] before:w-px before:bg-line">
        {STAGES.map((stage, index) => {
          const step = project.steps.find((s) => s.stage === stage.stage);
          // Les étapes à venir peuvent déjà contenir un brouillon de l'étudiant
          const key = index > current && step?.status !== "COMPLETED" ? (step ? "UPCOMING" : "NOT_STARTED") : step?.status ?? "IN_PROGRESS";
          const display = STEP_DISPLAY[key];
          const pending = step?.submissions.find((s) => !s.decision);
          const rounds = step?.submissions.filter((s) => s.decision) ?? [];

          return (
            <li key={stage.slug} className={cx("relative flex gap-4", key === "NOT_STARTED" && "opacity-60")}>
              <span className={cx("relative z-10 inline-flex size-14 shrink-0 items-center justify-center rounded-2xl ring-4 ring-canvas", TILE[display.tone])}>
                <display.Icon className="size-5" strokeWidth={1.75} />
              </span>
              <Card className="min-w-0 flex-1" padded={false}>
                <div className="flex flex-wrap items-center gap-3 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase">Étape {index + 1}</p>
                    <p className="font-display text-[16px] font-semibold text-ink">{stage.label}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-muted">
                      {display.label}
                      {key === "COMPLETED" && step?.completedAt && ` le ${formatDate(step.completedAt)}`}
                      {pending && ` depuis le ${formatDate(pending.submittedAt)}`}
                    </p>
                  </div>
                  {pending && (
                    <Link href={`/encadrant/validations?id=${pending.id}`} className={buttonClass("primary")}>
                      Examiner <ArrowRight />
                    </Link>
                  )}
                </div>

                {/* Historique des échanges sur l'étape */}
                {rounds.length > 0 && (
                  <div className="space-y-2.5 border-t border-line px-5 py-4">
                    {rounds.map((r) => (
                      <div key={r.id} className={cx("rounded-xl border-l-[3px] bg-surface-muted px-4 py-3", r.decision === "APPROVED" ? "border-success" : "border-warning")}>
                        {r.note && (
                          <p className="mb-2 flex gap-2 text-[12.5px] text-brand-ink">
                            <MessageSquare className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                            <span className="whitespace-pre-wrap">{fullName(r.author)} : {r.note}</span>
                          </p>
                        )}
                        <p className="mb-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-subtle">
                          {r.reviewedAt && formatDate(r.reviewedAt)} · {r.decision === "APPROVED" ? "Validée" : "Modifications demandées"} par {fullName(r.reviewer) || "l'encadrant"}
                          {r.rating ? <Stars rating={r.rating} size={11} /> : null}
                        </p>
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-ink">{r.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contenu actuel de l'étape (brouillon compris) */}
                {step && (
                  <details className="group border-t border-line">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-[13px] font-semibold text-brand hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
                      Voir le contenu actuel de l&apos;étape
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-line px-5 py-5">
                      <StepDataView slug={stage.slug} data={step.data} />
                    </div>
                  </details>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
