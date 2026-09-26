// lib/assistant/actions.ts
// SERVER ACTIONS DE L'ASSISTANT IA : historique des conversations
'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { AssistantChatMessage, AssistantThreadSummary } from './types';

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };
const NOT_LOGGED = { ok: false as const, error: 'Session expirée. Veuillez vous reconnecter.' };

export async function listAssistantThreads(): Promise<Result<{ threads: AssistantThreadSummary[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const threads = await prisma.assistantThread.findMany({
        where: { userId: user.id },
        include: { project: { select: { title: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 50,
    });
    return {
        ok: true,
        threads: threads.map((t) => ({
            id: t.id,
            title: t.title,
            projectId: t.projectId,
            projectTitle: t.project?.title ?? null,
            updatedAt: t.updatedAt.toISOString(),
        })),
    };
}

export async function getAssistantThread(threadId: string): Promise<Result<{ messages: AssistantChatMessage[]; projectId: string | null }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const thread = await prisma.assistantThread.findFirst({
        where: { id: threadId, userId: user.id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!thread) return { ok: false, error: 'Conversation introuvable.' };
    return {
        ok: true,
        projectId: thread.projectId,
        messages: thread.messages.map((m) => ({
            id: m.id,
            role: m.role === 'USER' ? 'user' : 'assistant',
            content: m.content,
            sources: Array.isArray(m.sources) ? (m.sources as { url: string; title: string }[]) : [],
        })),
    };
}

export async function deleteAssistantThread(threadId: string): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const { count } = await prisma.assistantThread.deleteMany({ where: { id: threadId, userId: user.id } });
    return count ? { ok: true } : { ok: false, error: 'Conversation introuvable.' };
}
