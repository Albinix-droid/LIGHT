// app/encadrant/projets/page.tsx
// PROJETS SUIVIS PAR L'ENCADRANT

import Link from "next/link";
import { FolderKanban, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listSupervisedProjects, fullName } from "@/lib/projects";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { formatShortDate } from "@/lib/format";
import ProjectCover from "@/components/ui/ProjectCover";
import StageTrack from "@/components/ui/StageTrack";
import { Badge, EmptyState, PageHeader, buttonClass } from "@/components/ui/kit";
import { getFollowUpStatus } from "../projectStatus";

export const metadata = { title: "Projets suivis" };

export default async function EncadrantProjectsPage() {
  const user = await requireRole("ENCADRANT");
  const projects = await listSupervisedProjects(user.id);

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        eyebrow="Accompagnement"
        title="Projets suivis"
        description={
          projects.length === 0
            ? "Aucun étudiant ne vous a encore choisi comme encadrant."
            : `Vous accompagnez ${projects.length} projet${projects.length > 1 ? "s" : ""}. Suivez leur avancement étape par étape.`
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet suivi"
          description="Les étudiants vous envoient des demandes d'encadrement. Les projets que vous acceptez apparaîtront ici."
          action={<Link href="/encadrant/demandes" className={buttonClass("primary")}><Inbox /> Voir les demandes</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 animate-rise">
          {projects.map((p) => {
            const status = getFollowUpStatus(p);
            const current = getStageIndex(p.stage);
            return (
              <Link
                key={p.id}
                href={`/encadrant/projets/${p.id}`}
                className="group flex flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
              >
                <div className="relative h-32 overflow-hidden">
                  <ProjectCover sector={p.sector} title={p.title} className="h-full transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                  <span className="absolute top-3 left-3">
                    <Badge tone={status.tone} className="bg-surface/95 shadow-sm">{status.label}</Badge>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="line-clamp-1 text-[15px] font-semibold text-ink">{p.title}</p>
                  <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                    {fullName(p.owner)} · {p.sector ? SECTOR_LABELS[p.sector] ?? p.sector : "Secteur non renseigné"}
                  </p>
                  <StageTrack stage={p.stage} steps={p.steps} className="mt-4" />
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[12px] text-ink-subtle">
                    <span>
                      Étape {current + 1}/5 · <span className="text-ink-muted">{STAGES[current].label}</span>
                    </span>
                    <span className="tabular-nums">{p.progress}% · {formatShortDate(p.updatedAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
