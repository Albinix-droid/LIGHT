// app/dashboard/projets/page.tsx
// PAGE DE LISTE DES PROJETS - données réelles de l'utilisateur connecté

import { requireUser } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects";
import { STAGES, SECTOR_LABELS } from "@/lib/parcours";
import ProjectsList, { type ProjectSummary } from "./ProjectsList";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listProjectsForUser(user.id);

  const summaries: ProjectSummary[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    stage: STAGES.find((s) => s.stage === p.stage)?.label ?? p.stage,
    progress: p.progress,
    members: p._count.members,
    budget: p.budgetEstimated,
    spent: p.budgetSpent,
    sector: p.sector,
    tags: p.sector ? [SECTOR_LABELS[p.sector] ?? p.sector] : [],
  }));

  return <ProjectsList projects={summaries} />;
}
