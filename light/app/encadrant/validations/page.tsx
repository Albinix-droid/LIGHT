// app/encadrant/validations/page.tsx
// FILE DE VALIDATION : étapes soumises par les étudiants, examen détaillé et décision

import Link from "next/link";
import { ArrowRight, CheckSquare, Clock, FileText, History, Inbox, MessageSquare } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { markReadForPath } from "@/lib/notifications/queries";
import { listPendingSubmissions, listReviewedSubmissions, listStepRounds, fullName } from "@/lib/projects";
import { STAGES } from "@/lib/parcours";
import { formatDate, formatShortDate } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import Stars from "@/components/ui/Stars";
import { Alert, Badge, Card, CardHeader, EmptyState, PageHeader, buttonClass, cx } from "@/components/ui/kit";
import StepDataView from "../StepDataView";
import ReviewForm from "./ReviewForm";

export const metadata = { title: "Validations" };

const stageOf = (key: string) => STAGES.find((s) => s.stage === key)!;

export default async function ValidationsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireRole("ENCADRANT");
  const { id } = await searchParams;
  const [pending, reviewed] = await Promise.all([listPendingSubmissions(user.id), listReviewedSubmissions(user.id, 10)]);

  // Soumission examinée : celle de l'URL, sinon la plus ancienne en attente
  const selectedId = id ?? pending[0]?.id;
  const selected = selectedId
    ? await prisma.stepSubmission.findFirst({
        where: { id: selectedId, step: { project: { supervisorId: user.id } } },
        include: {
          author: { select: { firstName: true, lastName: true, email: true } },
          reviewer: { select: { firstName: true, lastName: true } },
          step: { include: { project: { select: { id: true, title: true, progress: true } } } },
        },
      })
    : null;
  // Consulter une soumission (ou la file) vaut lecture des notifications correspondantes
  await Promise.all([
    markReadForPath(user.id, user.role, "/encadrant/validations"),
    selected ? markReadForPath(user.id, user.role, `/encadrant/validations?id=${selected.id}`) : null,
  ]);
  const previousRounds = selected ? (await listStepRounds(selected.stepId)).filter((r) => r.id !== selected.id && r.decision) : [];

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        eyebrow="Accompagnement"
        title="Validations"
        description={
          pending.length === 0
            ? "Aucune étape en attente : vos étudiants sont à jour."
            : `${pending.length} étape${pending.length > 1 ? "s" : ""} en attente de votre décision, les plus anciennes d'abord.`
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* ===== FILE D'ATTENTE ===== */}
        <Card className="lg:sticky lg:top-[88px]" padded={false}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
              <Inbox className="size-[18px] text-brand" strokeWidth={1.75} /> File d&apos;attente
            </h2>
            {pending.length > 0 && <Badge tone="warning">{pending.length}</Badge>}
          </div>
          {pending.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-ink-muted">Rien à examiner pour le moment.</p>
          ) : (
            <ul className="flex max-h-[calc(100vh-220px)] flex-col gap-1.5 overflow-y-auto p-2.5">
              {pending.map((s) => {
                const active = selected?.id === s.id;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/encadrant/validations?id=${s.id}`}
                      aria-current={active ? "true" : undefined}
                      className={cx(
                        "flex gap-3 rounded-2xl p-3 transition-colors",
                        active ? "bg-brand-soft ring-1 ring-brand/25 ring-inset" : "hover:bg-surface-muted",
                      )}
                    >
                      <Avatar name={fullName(s.author)} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-ink">{s.step.project.title}</span>
                        <span className="block truncate text-[12px] text-ink-muted">{fullName(s.author)}</span>
                        <span className="mt-1.5 flex items-center justify-between gap-2">
                          <Badge tone="warning">{stageOf(s.step.stage).label}</Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] text-ink-subtle">
                            <Clock className="size-3" /> {formatShortDate(s.submittedAt)}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* ===== EXAMEN ===== */}
        <div className="min-w-0 space-y-6">
          {!selected ? (
            <EmptyState icon={CheckSquare} title="Aucune soumission à examiner" description="Les étapes soumises par vos étudiants apparaîtront ici." />
          ) : (
            <>
              <Card className="animate-rise">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Badge tone="brand">
                      Étape {STAGES.findIndex((x) => x.stage === selected.step.stage) + 1}/5 · {stageOf(selected.step.stage).label}
                    </Badge>
                    <h2 className="mt-2.5 font-display text-[22px] leading-tight font-bold tracking-tight text-ink">{selected.step.project.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-muted">
                      <Avatar name={fullName(selected.author)} size="sm" className="!size-6 !rounded-md !text-[9px]" />
                      {fullName(selected.author)} · soumis le {formatDate(selected.submittedAt)}
                    </p>
                  </div>
                  <Link href={`/encadrant/projets/${selected.step.project.id}`} className={buttonClass("secondary")}>
                    Voir le projet <ArrowRight />
                  </Link>
                </div>
                {selected.note && (
                  <div className="mt-5 rounded-2xl border border-brand/15 bg-brand-soft/60 px-4 py-3.5">
                    <p className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-brand-ink">
                      <MessageSquare className="size-3.5" strokeWidth={2} /> Message de l&apos;étudiant
                    </p>
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-ink">{selected.note}</p>
                  </div>
                )}
                {selected.decision && (
                  <Alert tone={selected.decision === "APPROVED" ? "success" : "warning"} className="mt-5">
                    Décision déjà rendue : {selected.decision === "APPROVED" ? "étape validée" : "modifications demandées"}
                    {selected.reviewedAt && ` le ${formatDate(selected.reviewedAt)}`}.
                  </Alert>
                )}
              </Card>

              {previousRounds.length > 0 && (
                <Card>
                  <CardHeader title="Tours précédents sur cette étape" icon={History} />
                  <div className="space-y-2.5">
                    {previousRounds.map((r) => (
                      <div key={r.id} className={cx("rounded-xl border-l-[3px] bg-surface-muted px-4 py-3", r.decision === "APPROVED" ? "border-success" : "border-warning")}>
                        <p className="mb-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-subtle">
                          {formatDate(r.reviewedAt ?? r.submittedAt)} · {r.decision === "APPROVED" ? "Validée" : "Modifications demandées"}
                          {r.rating ? <Stars rating={r.rating} size={11} /> : null}
                        </p>
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-ink">{r.feedback}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card>
                <CardHeader title="Contenu soumis" icon={FileText} description="Instantané exact de ce que l'étudiant vous a transmis." />
                <StepDataView slug={stageOf(selected.step.stage).slug} data={selected.data} />
              </Card>

              {!selected.decision && (
                <ReviewForm
                  key={selected.id}
                  submissionId={selected.id}
                  stageLabel={stageOf(selected.step.stage).label}
                  isLastStage={selected.step.stage === "CONCRETISATION"}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== HISTORIQUE ===== */}
      {reviewed.length > 0 && (
        <Card className="mt-8">
          <CardHeader title="Vos dernières décisions" icon={History} />
          <ul className="divide-y divide-line">
            {reviewed.map((r) => (
              <li key={r.id}>
                <Link href={`/encadrant/projets/${r.step.project.id}`} className="group flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={cx("size-2 shrink-0 rounded-full", r.decision === "APPROVED" ? "bg-success" : "bg-warning")} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="text-[14px] font-medium text-ink group-hover:text-brand">{r.step.project.title}</span>
                    <span className="ml-2 text-[12.5px] text-ink-muted">{stageOf(r.step.stage).label} · {fullName(r.author)}</span>
                  </span>
                  {r.rating ? <Stars rating={r.rating} size={12} /> : null}
                  <span className="text-[12px] text-ink-subtle">{r.reviewedAt && formatDate(r.reviewedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
