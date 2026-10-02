// app/dashboard/_home/SummaryBanner.tsx
// Bandeau de synthèse du projet mis en avant : progression, étapes validées, dernière évaluation

import Link from "next/link";
import { ArrowRight, Award, Star } from "lucide-react";
import ProgressRing from "@/components/ui/ProgressRing";
import { STAGES } from "@/lib/parcours";
import type { StudentHome } from "@/lib/dashboard/queries";

const STATUS_HINT: Record<string, string> = {
  IN_PROGRESS: "En cours de rédaction",
  SUBMITTED: "Soumise, en attente de l'encadrant",
  CHANGES_REQUESTED: "Modifications demandées",
  COMPLETED: "Validée par l'encadrant",
};

export default function SummaryBanner({ project }: { project: StudentHome["featured"] }) {
  const review = project.lastReview;

  return (
    <section
      aria-label="Synthèse du projet"
      className="relative isolate overflow-hidden rounded-[22px] bg-[linear-gradient(118deg,#162f86_0%,#1f4fd8_48%,#3a78f2_100%)] text-white shadow-[0_18px_40px_-18px_rgba(31,79,216,0.65)]"
    >
      {/* Décor : trame fine, halos, filet doré */}
      <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full opacity-[0.07]">
        <defs>
          <pattern id="banner-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="white" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#banner-grid)" />
      </svg>
      <div aria-hidden="true" className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-[#7fb0ff]/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 left-1/3 -z-10 size-64 rounded-full bg-[#0b1a52]/40 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(236,208,138,0.8),transparent)]" />

      <div className="grid gap-6 p-6 md:grid-cols-[1.25fr_1fr_1fr] md:gap-0">
        {/* ===== PROGRESSION ===== */}
        <div className="flex items-center gap-4 md:pr-6">
          <ProgressRing value={project.progress} size={68} stroke={6} trackClassName="stroke-white/15" barClassName="stroke-white">
            <span className="font-display text-[15px] font-bold tabular-nums">{project.progress}%</span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-white/65 uppercase">Étape {project.stageIndex + 1} sur 5</p>
            <p className="mt-1 truncate font-display text-[18px] leading-tight font-semibold">{project.stageLabel}</p>
            <p className="mt-1 text-[12px] leading-snug text-white/70">{STATUS_HINT[project.currentStatus] ?? STATUS_HINT.IN_PROGRESS}</p>
          </div>
        </div>

        {/* ===== ÉTAPES VALIDÉES ===== */}
        <div className="flex flex-col justify-center border-white/15 md:border-l md:px-6">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-white/65 uppercase">Étapes validées</p>
          <p className="mt-1 font-display text-[28px] leading-none font-bold tabular-nums">
            {project.completedSteps}
            <span className="text-[16px] font-semibold text-white/55">/5</span>
          </p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {STAGES.map((s, i) => (
              <span
                key={s.slug}
                title={s.label}
                className={`h-1.5 flex-1 rounded-full ${i < project.completedSteps ? "bg-white" : i === project.stageIndex ? "bg-white/45" : "bg-white/15"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-[12px] text-white/70">
            {project.completedSteps === 5
              ? "Parcours terminé, félicitations."
              : `Encore ${5 - project.completedSteps} étape${5 - project.completedSteps > 1 ? "s" : ""} à valider`}
          </p>
        </div>

        {/* ===== DERNIÈRE ÉVALUATION ===== */}
        <div className="flex flex-col justify-center border-white/15 md:border-l md:pl-6">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/65 uppercase">
            <Award className="size-3.5 text-brand" strokeWidth={2} /> Dernière évaluation
          </p>
          {review?.rating ? (
            <>
              <p className="mt-1 font-display text-[28px] leading-none font-bold tabular-nums">
                {review.rating}
                <span className="text-[16px] font-semibold text-white/55">/5</span>
              </p>
              <div className="mt-2.5 flex gap-0.5" aria-label={`${review.rating} sur 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`size-4 ${n <= review.rating! ? "fill-brand text-brand" : "text-white/25"}`} strokeWidth={1.5} />
                ))}
              </div>
              <p className="mt-2 text-[12px] text-white/70">
                {review.stageLabel} · {review.approved ? "validée" : "à reprendre"}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 font-display text-[18px] leading-tight font-semibold">Pas encore évaluée</p>
              <p className="mt-1 text-[12px] leading-snug text-white/70">
                {project.hasSupervisor ? "Soumettez votre étape pour recevoir un retour." : "Choisissez un encadrant pour être évalué."}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.04] px-6 py-3.5">
        <p className="min-w-0 truncate text-[13px] text-white/70">
          <span className="font-semibold text-white">{project.title}</span>
          {project.supervisorName ? ` · Encadré par ${project.supervisorName}` : " · Sans encadrant"}
        </p>
        <Link
          href={`/dashboard/projets/${project.id}/${project.stageSlug}`}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-brand-strong shadow-sm transition-transform duration-150 hover:-translate-y-px"
        >
          Continuer : {project.stageLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
