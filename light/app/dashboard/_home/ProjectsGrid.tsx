// app/dashboard/_home/ProjectsGrid.tsx
// « Mes projets » : cartes avec couverture générée, étape et progression

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import ProjectCover from "@/components/ui/ProjectCover";
import { SECTOR_LABELS } from "@/lib/parcours";
import type { StudentHome } from "@/lib/dashboard/queries";

// « 20 sept. » cette année, « 20 sept. 2025 » sinon
const formatDate = (iso: string) => {
  const date = new Date(iso);
  const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }), timeZone: "Africa/Douala" }).format(date);
};

export default function ProjectsGrid({ projects }: { projects: StudentHome["projects"] }) {
  return (
    <section aria-labelledby="projects-title">
      <div className="mb-4 flex items-end justify-between">
        <h2 id="projects-title" className="font-display text-[20px] font-semibold tracking-tight text-ink">Mes projets</h2>
        <Link href="/dashboard/projets" className="text-[13px] font-semibold text-brand hover:text-brand-strong">
          Tout voir
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {projects.slice(0, 7).map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/projets/${p.id}`}
            className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
          >
            <div className="relative h-36 overflow-hidden">
              <ProjectCover sector={p.sector} title={p.title} className="h-full transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
              <span className="absolute bottom-3 left-3 flex gap-1.5">
                <span className="inline-flex items-center rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/15 backdrop-blur-md">
                  {SECTOR_LABELS[p.sector ?? ""] ?? "Projet"}
                </span>
                {!p.isOwner && (
                  <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#14244f]">Membre de l&apos;équipe</span>
                )}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="line-clamp-1 text-[15px] font-semibold text-ink">{p.title}</p>
              <div className="mt-1 flex items-center justify-between text-[12px] text-ink-muted">
                <span>Étape {p.stageIndex + 1}/5 · {p.stageLabel}</span>
                <span className="tabular-nums">{p.progress}%</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#1f4fd8,#4d86f7)]" style={{ width: `${Math.max(p.progress, 3)}%` }} />
              </div>
              <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3 text-[12px] text-ink-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" strokeWidth={1.75} /> {p.members} membre{p.members > 1 ? "s" : ""}
                </span>
                <span>{formatDate(p.updatedAt)}</span>
              </div>
            </div>
          </Link>
        ))}

        <Link
          href="/dashboard/projets/nouveau"
          className="group flex min-h-[264px] flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-line-strong bg-surface/50 p-6 text-center transition-colors duration-200 hover:border-brand hover:bg-brand-soft/40"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink transition-colors group-hover:bg-brand group-hover:text-white">
            <Plus className="size-5" strokeWidth={2} />
          </span>
          <span className="text-[14px] font-semibold text-ink">Nouveau projet</span>
          <span className="max-w-[200px] text-[12px] leading-relaxed text-ink-muted">Lancez une nouvelle idée sur le parcours en 5 étapes.</span>
        </Link>
      </div>
    </section>
  );
}
