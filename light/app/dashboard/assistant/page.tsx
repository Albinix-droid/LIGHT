// app/dashboard/assistant/page.tsx
// ASSISTANT IA - MENTOR ENTREPRENEURIAL (Claude)

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects";
import { STAGES } from "@/lib/parcours";
import { ASSISTANT_DAILY_LIMIT } from "@/lib/assistant/limits";
import AssistantApp from "@/components/assistant/AssistantApp";

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ t?: string; projet?: string }> }) {
  const user = await requireUser();
  const { t, projet } = await searchParams;

  const [projects, threads, usedToday, openThread] = await Promise.all([
    listProjectsForUser(user.id),
    prisma.assistantThread.findMany({
      where: { userId: user.id },
      include: { project: { select: { title: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.assistantMessage.count({
      where: { role: "USER", createdAt: { gte: new Date(Date.now() - 86_400_000) }, thread: { userId: user.id } },
    }),
    // Conversation ouverte via ?t=… (uniquement si elle appartient à l'utilisateur)
    t
      ? prisma.assistantThread.findFirst({ where: { id: t, userId: user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } })
      : null,
  ]);

  return (
    <AssistantApp
      firstName={user.firstName}
      projects={projects.map((p) => ({
        id: p.id,
        title: p.title,
        stageLabel: STAGES.find((s) => s.stage === p.stage)?.label ?? p.stage,
        progress: p.progress,
      }))}
      initialThreads={threads.map((th) => ({
        id: th.id,
        title: th.title,
        projectId: th.projectId,
        projectTitle: th.project?.title ?? null,
        updatedAt: th.updatedAt.toISOString(),
      }))}
      initialThreadId={openThread?.id ?? null}
      initialMessages={
        openThread?.messages.map((m) => ({
          id: m.id,
          role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
          content: m.content,
          sources: Array.isArray(m.sources) ? (m.sources as { url: string; title: string }[]) : [],
        })) ?? []
      }
      // ?projet=… permet d'ouvrir l'assistant directement sur un projet (depuis la page du projet)
      initialProjectId={openThread?.projectId ?? (projects.some((p) => p.id === projet) ? projet! : null)}
      initialRemaining={Math.max(0, ASSISTANT_DAILY_LIMIT - usedToday)}
    />
  );
}
