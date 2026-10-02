// app/dashboard/projets/page.tsx
// PAGE DE LISTE DES PROJETS - données réelles de l'utilisateur connecté

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { markReadForPath } from "@/lib/notifications/queries";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import ProjectsList, { type ProjectSummary } from "./ProjectsList";

export const metadata = { title: "Mes projets" };

export default async function ProjectsPage() {
  const user = await requireUser();
  const [projects] = await Promise.all([
    prisma.project.findMany({
      where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
      select: {
        id: true, title: true, sector: true, stage: true, progress: true, budgetEstimated: true, budgetSpent: true, updatedAt: true, ownerId: true,
        steps: { select: { stage: true, status: true } },
        supervisor: { select: { firstName: true, lastName: true } },
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    markReadForPath(user.id, user.role, "/dashboard/projets"),
  ]);

  const summaries: ProjectSummary[] = projects.map((p) => {
    const index = getStageIndex(p.stage);
    return {
      id: p.id,
      title: p.title,
      stage: STAGES[index].label,
      stageKey: p.stage,
      stageIndex: index,
      steps: p.steps,
      progress: p.progress,
      members: p._count.members,
      budget: p.budgetEstimated,
      spent: p.budgetSpent,
      sector: p.sector,
      sectorLabel: p.sector ? SECTOR_LABELS[p.sector] ?? p.sector : null,
      supervisor: p.supervisor ? `${p.supervisor.firstName} ${p.supervisor.lastName}`.trim() : null,
      updatedAt: p.updatedAt.toISOString(),
      isOwner: p.ownerId === user.id,
      awaitingReview: p.steps.some((s) => s.status === "SUBMITTED"),
      changesRequested: p.steps.some((s) => s.status === "CHANGES_REQUESTED"),
    };
  });

  return <ProjectsList projects={summaries} />;
}
