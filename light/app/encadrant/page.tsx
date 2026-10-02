// app/encadrant/page.tsx
// TABLEAU DE BORD ENCADRANT : file de validation, projets suivis, dernières décisions

import Link from "next/link";
import { ArrowRight, Award, Bell, CheckSquare, Clock, FolderKanban, GraduationCap, History, Inbox, PartyPopper, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { listSupervisedProjects, listPendingSubmissions, listReviewedSubmissions, fullName } from "@/lib/projects";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { countPendingReceived } from "@/lib/demandes/queries";
import { listNotifications } from "@/lib/notifications/queries";
import { requestTime } from "@/lib/dashboard/queries";
import { formatDate, formatShortDate } from "@/lib/format";
import NotificationPreview from "@/components/notifications/NotificationPreview";
import Avatar from "@/components/ui/Avatar";
import ProjectCover from "@/components/ui/ProjectCover";
import StageTrack from "@/components/ui/StageTrack";
import Stars from "@/components/ui/Stars";
import { Badge, Card, CardHeader, EmptyState, StatCard, buttonClass } from "@/components/ui/kit";
import { getFollowUpStatus } from "./projectStatus";

const stageLabel = (key: string) => STAGES.find((s) => s.stage === key)?.label ?? key;

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Africa/Douala" }).format(now));
  return hour >= 5 && hour < 18 ? "Bonjour" : "Bonsoir";
}

export default async function EncadrantDashboardPage() {
  const user = await requireRole("ENCADRANT");
  const serverNow = requestTime();
  const now = new Date(serverNow);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [projects, pending, reviewed, notifications, approvedThisMonth, pendingRequests] = await Promise.all([
    listSupervisedProjects(user.id),
    listPendingSubmissions(user.id),
    listReviewedSubmissions(user.id, 5),
    listNotifications(user.id, user.role, { take: 5 }).then((r) => r.items),
    prisma.stepSubmission.count({ where: { reviewerId: user.id, decision: "APPROVED", reviewedAt: { gte: startOfMonth } } }),
    countPendingReceived(user.id),
  ]);

  const averageProgress = projects.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" }).format(now);

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* ===== EN-TÊTE ===== */}
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">{today}</p>
          <h1 className="mt-1.5 font-display text-[28px] leading-tight font-bold tracking-tight text-ink sm:text-[32px]">
            {greeting(now)}, {user.firstName}
          </h1>
          <p className="mt-2 text-[14px] text-ink-muted">
            {pending.length > 0
              ? `${pending.length} étape${pending.length > 1 ? "s attendent" : " attend"} votre décision. Vos étudiants comptent sur vos retours.`
              : "Aucune étape en attente. Voici l'avancement des projets que vous accompagnez."}
          </p>
        </div>
        <Link href="/encadrant/validations" className={buttonClass("primary", "lg")}>
          <CheckSquare /> Ouvrir la file de validation
        </Link>
      </header>

      {/* ===== DEMANDES D'ENCADREMENT ===== */}
      {pendingRequests > 0 && (
        <Link
          href="/encadrant/demandes"
          className="group flex items-center gap-4 rounded-[22px] border border-gold/30 bg-gold-soft/60 px-5 py-4 transition-colors hover:border-gold/60 animate-rise"
        >
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#f1d48a,#c9993a)] text-[#2a1d05]">
            <GraduationCap className="size-5" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] font-semibold text-ink">
              {pendingRequests} demande{pendingRequests > 1 ? "s" : ""} d&apos;encadrement en attente
            </span>
            <span className="block text-[13px] text-ink-muted">Des étudiants souhaitent que vous accompagniez leur projet.</span>
          </span>
          <ArrowRight className="size-5 text-gold transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* ===== CHIFFRES CLÉS ===== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-rise [animation-delay:60ms]">
        <StatCard icon={GraduationCap} tone="brand" label="Projets suivis" value={projects.length} href="/encadrant/projets" />
        <StatCard icon={Clock} tone={pending.length ? "warning" : "success"} label="Étapes à examiner" value={pending.length} href="/encadrant/validations" />
        <StatCard icon={Award} tone="gold" label="Étapes validées ce mois" value={approvedThisMonth} />
        <StatCard icon={TrendingUp} tone="success" label="Progression moyenne" value={`${averageProgress}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          {/* ===== À EXAMINER ===== */}
          <Card className="animate-rise [animation-delay:120ms]">
            <CardHeader
              title="À examiner"
              icon={Inbox}
              description={pending.length ? "Les plus anciennes soumissions d'abord." : undefined}
              action={pending.length > 0 ? <Link href="/encadrant/validations" className="text-[12.5px] font-semibold text-brand hover:text-brand-strong">Tout voir</Link> : undefined}
            />
            {pending.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl bg-success-soft/60 px-6 py-10 text-center">
                <PartyPopper className="size-7 text-success" strokeWidth={1.5} />
                <p className="mt-2 text-[14px] font-semibold text-ink">Toutes les soumissions ont été traitées</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">Vous serez notifié dès qu&apos;un étudiant soumettra une étape.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {pending.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/encadrant/validations?id=${s.id}`}
                      className="group flex items-center gap-4 rounded-2xl border border-line p-3 pr-4 transition-all duration-150 hover:border-line-strong hover:shadow-card"
                    >
                      <Avatar name={fullName(s.author)} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">{s.step.project.title}</span>
                        <span className="block truncate text-[12.5px] text-ink-muted">
                          {fullName(s.author)} · soumis le {formatDate(s.submittedAt)}
                        </span>
                      </span>
                      <Badge tone="warning">{stageLabel(s.step.stage)}</Badge>
                      <ArrowRight className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ===== PROJETS SUIVIS ===== */}
          <Card className="animate-rise [animation-delay:180ms]">
            <CardHeader
              title="Projets suivis"
              icon={FolderKanban}
              action={projects.length > 0 ? <Link href="/encadrant/projets" className="text-[12.5px] font-semibold text-brand hover:text-brand-strong">Tout voir</Link> : undefined}
            />
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="Aucun projet suivi pour le moment"
                description="Les étudiants vous envoient des demandes d'encadrement. Les projets que vous acceptez apparaîtront ici."
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-line">
                {projects.slice(0, 6).map((p) => {
                  const status = getFollowUpStatus(p);
                  const current = getStageIndex(p.stage);
                  return (
                    <li key={p.id}>
                      <Link href={`/encadrant/projets/${p.id}`} className="group flex flex-wrap items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                        <ProjectCover sector={p.sector} title={p.title} variant="tile" className="size-11 rounded-xl" />
                        <span className="min-w-[180px] flex-[2]">
                          <span className="block truncate text-[14px] font-semibold text-ink group-hover:text-brand">{p.title}</span>
                          <span className="block truncate text-[12.5px] text-ink-muted">
                            {fullName(p.owner)} · {p.sector ? SECTOR_LABELS[p.sector] ?? p.sector : "Secteur non renseigné"}
                          </span>
                        </span>
                        <span className="min-w-[140px] flex-1">
                          <StageTrack stage={p.stage} steps={p.steps} />
                          <span className="mt-1.5 block text-[11.5px] text-ink-subtle">
                            {current + 1}/5 · {STAGES[current].label} · {p.progress}%
                          </span>
                        </span>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-6 animate-rise [animation-delay:240ms]">
          {/* ===== NOTIFICATIONS ===== */}
          <Card>
            <CardHeader
              title="Notifications"
              icon={Bell}
              action={<Link href="/encadrant/notifications" className="text-[12.5px] font-semibold text-brand hover:text-brand-strong">Tout voir</Link>}
            />
            <NotificationPreview items={notifications} serverNow={serverNow} />
          </Card>

          {/* ===== DERNIÈRES DÉCISIONS ===== */}
          <Card>
            <CardHeader title="Vos dernières décisions" icon={History} />
            {reviewed.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-ink-muted">Vos décisions apparaîtront ici.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {reviewed.map((r) => (
                  <li key={r.id}>
                    <Link href={`/encadrant/projets/${r.step.project.id}`} className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-muted">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${r.decision === "APPROVED" ? "bg-success" : "bg-warning"}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">{r.step.project.title}</span>
                        <span className="block text-[12px] text-ink-muted">
                          {r.decision === "APPROVED" ? "Validée" : "À reprendre"} · {stageLabel(r.step.stage)}
                          {r.reviewedAt && ` · ${formatShortDate(r.reviewedAt, serverNow)}`}
                        </span>
                      </span>
                      {r.rating ? <Stars rating={r.rating} size={11} className="mt-1" /> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
