// app/admin/projets/page.tsx
// TOUS LES PROJETS DE L'ÉCOLE : avancement, porteur, encadrant

import { FolderKanban } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listAllProjects } from "@/lib/admin/queries";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import ProjectCover from "@/components/ui/ProjectCover";
import StageTrack from "@/components/ui/StageTrack";
import { Badge, EmptyState, LinkTabs, PageHeader, SearchForm } from "@/components/ui/kit";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { formatDate } from "../format";

export const metadata = { title: "Projets" };

const SUPERVISION_FILTERS = [
  { id: "tous", label: "Tous" },
  { id: "aucun", label: "Sans encadrant" },
  { id: "avec", label: "Avec encadrant" },
] as const;

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; encadrant?: string }> }) {
  const [, params] = await Promise.all([requireRole("ADMIN"), searchParams]);
  const q = params.q?.trim() ?? "";
  const supervision = SUPERVISION_FILTERS.some((f) => f.id === params.encadrant) ? params.encadrant! : "tous";
  const all = await listAllProjects(q);
  const projects = all.filter((p) => supervision === "tous" || (supervision === "aucun" ? !p.supervisor : !!p.supervisor));

  const hrefFor = (id: string) => {
    const sp = new URLSearchParams();
    if (id !== "tous") sp.set("encadrant", id);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `/admin/projets?${s}` : "/admin/projets";
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader eyebrow="Administration" title="Projets" description={`${projects.length} projet${projects.length > 1 ? "s" : ""}${q ? ` pour « ${q} »` : ""}`} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchForm
          action="/admin/projets"
          defaultValue={q}
          placeholder="Titre du projet ou nom du porteur…"
          hidden={{ encadrant: supervision !== "tous" ? supervision : undefined }}
          className="min-w-[240px] flex-1"
        />
        <LinkTabs label="Filtrer par encadrement" activeHref={hrefFor(supervision)} items={SUPERVISION_FILTERS.map((f) => ({ href: hrefFor(f.id), label: f.label }))} />
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Aucun projet trouvé" description="Aucun projet ne correspond à cette recherche." />
      ) : (
        <Table minWidth={960}>
          <thead>
            <tr>
              <Th>Projet</Th>
              <Th>Porteur</Th>
              <Th>Encadrant</Th>
              <Th>Parcours</Th>
              <Th>Équipe</Th>
              <Th>Mis à jour</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const current = getStageIndex(p.stage);
              return (
                <Tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <ProjectCover sector={p.sector} title={p.title} variant="tile" className="size-10 rounded-xl" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{p.title}</p>
                        <p className="truncate text-[12px] text-ink-muted">{p.sector ? SECTOR_LABELS[p.sector] ?? p.sector : "Secteur non renseigné"}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-ink">{`${p.owner.firstName} ${p.owner.lastName}`.trim()}</p>
                    <p className="text-[12px] text-ink-muted">{p.owner.email}</p>
                  </Td>
                  <Td>{p.supervisor ? `${p.supervisor.firstName} ${p.supervisor.lastName}`.trim() : <Badge tone="brand">Aucun</Badge>}</Td>
                  <Td className="min-w-[180px]">
                    <StageTrack stage={p.stage} steps={p.steps} />
                    <p className="mt-1.5 text-[12px] text-ink-muted">{current + 1}/5 · {STAGES[current].label} · {p.progress}%</p>
                  </Td>
                  <Td className="text-[12.5px] text-ink-muted">{p._count.members} membre{p._count.members > 1 ? "s" : ""}</Td>
                  <Td className="text-[12.5px] whitespace-nowrap text-ink-muted">{formatDate(p.updatedAt)}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
