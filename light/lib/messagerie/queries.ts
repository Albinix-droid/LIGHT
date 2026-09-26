// lib/messagerie/queries.ts
// Lectures de la messagerie (serveur uniquement). Toutes filtrent sur l'appartenance à la conversation.
import 'server-only';
import prisma from '@/lib/prisma';
import type {
    ChannelListing, ChatMessage, ConversationDetail, ConversationSummary, Person, UserRole,
} from './types';
import { TRACK_LABELS, ROLE_LABELS } from './types';

const personSelect = { id: true, firstName: true, lastName: true, role: true } as const;
type PersonRow = { id: string; firstName: string; lastName: string; role: UserRole };

export const MESSAGES_PAGE_SIZE = 80;

export function toPerson(u: PersonRow): Person {
    const name = `${u.firstName} ${u.lastName}`.trim();
    const initials = [u.firstName, u.lastName].filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    return { id: u.id, name, initials, role: u.role };
}

function toMessage(m: { id: string; content: string; createdAt: Date; sender: PersonRow }, meId: string): ChatMessage {
    return { id: m.id, content: m.content, createdAt: m.createdAt.toISOString(), sender: toPerson(m.sender), mine: m.sender.id === meId };
}

// Nombre de messages non lus par conversation (une seule requête)
async function unreadByConversation(userId: string) {
    const rows = await prisma.$queryRaw<{ conversationId: string; unread: number }[]>`
        SELECT m."conversationId", COUNT(msg.id)::int AS unread
        FROM "ConversationMember" m
        JOIN "Message" msg
          ON msg."conversationId" = m."conversationId"
         AND msg."createdAt" > m."lastReadAt"
         AND msg."senderId" <> m."userId"
        WHERE m."userId" = ${userId}
        GROUP BY m."conversationId"`;
    return new Map(rows.map((r) => [r.conversationId, r.unread]));
}

export async function countUnreadMessages(userId: string) {
    const unread = await unreadByConversation(userId);
    return [...unread.values()].reduce((a, b) => a + b, 0);
}

export async function getInbox(userId: string): Promise<ConversationSummary[]> {
    const [memberships, unread] = await Promise.all([
        prisma.conversationMember.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        project: { select: { title: true } },
                        _count: { select: { members: true } },
                        // Pour les messages privés : l'autre membre
                        members: { where: { userId: { not: userId } }, take: 1, include: { user: { select: personSelect } } },
                        messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: personSelect } } },
                    },
                },
            },
            orderBy: { conversation: { lastMessageAt: 'desc' } },
        }),
        unreadByConversation(userId),
    ]);

    return memberships.map(({ conversation: c }) => {
        const other = c.type === 'DIRECT' && c.members[0] ? toPerson(c.members[0].user) : null;
        const last = c.messages[0];
        return {
            id: c.id,
            type: c.type,
            title: other ? other.name : c.name ?? 'Conversation',
            subtitle: describe(c.type, { other, track: c.track, projectTitle: c.project?.title ?? null, memberCount: c._count.members }),
            track: c.track,
            unread: unread.get(c.id) ?? 0,
            lastMessage: last
                ? { content: last.content, senderName: toPerson(last.sender).name, mine: last.senderId === userId }
                : null,
            lastMessageAt: c.lastMessageAt.toISOString(),
            otherUser: other,
        };
    });
}

function describe(
    type: string,
    { other, track, projectTitle, memberCount }: { other: Person | null; track: string | null; projectTitle: string | null; memberCount: number },
) {
    if (type === 'DIRECT') return other ? ROLE_LABELS[other.role] : 'Message privé';
    const members = `${memberCount} membre${memberCount > 1 ? 's' : ''}`;
    if (type === 'CHANNEL') return `Canal ${track ? TRACK_LABELS[track as 'GL' | 'SR'] : ''} · ${members}`.replace('  ', ' ');
    return projectTitle ? `Groupe du projet ${projectTitle} · ${members}` : `Groupe · ${members}`;
}

export async function getConversationDetail(conversationId: string, userId: string): Promise<ConversationDetail | null> {
    const c = await prisma.conversation.findFirst({
        where: { id: conversationId, members: { some: { userId } } },
        include: {
            project: { select: { title: true } },
            members: { include: { user: { select: personSelect } }, orderBy: { joinedAt: 'asc' } },
        },
    });
    if (!c) return null;

    const members = c.members.map((m) => ({ ...toPerson(m.user), isAdmin: m.role === 'ADMIN' }));
    const other = c.type === 'DIRECT' ? members.find((m) => m.id !== userId) ?? null : null;
    return {
        id: c.id,
        type: c.type,
        title: other ? other.name : c.name ?? 'Conversation',
        subtitle: describe(c.type, { other, track: c.track, projectTitle: c.project?.title ?? null, memberCount: members.length }),
        description: c.description,
        track: c.track,
        projectTitle: c.project?.title ?? null,
        members,
        isAdmin: members.some((m) => m.id === userId && m.isAdmin),
    };
}

// Derniers messages (ordre chronologique), ou ceux postérieurs à `after` pour le rafraîchissement
export async function getMessages(conversationId: string, userId: string, after?: Date): Promise<ChatMessage[]> {
    const rows = await prisma.message.findMany({
        where: { conversationId, conversation: { members: { some: { userId } } }, ...(after ? { createdAt: { gt: after } } : {}) },
        include: { sender: { select: personSelect } },
        orderBy: { createdAt: after ? 'asc' : 'desc' },
        take: MESSAGES_PAGE_SIZE,
    });
    const ordered = after ? rows : rows.reverse();
    return ordered.map((m) => toMessage(m, userId));
}

export async function listChannels(userId: string): Promise<ChannelListing[]> {
    const channels = await prisma.conversation.findMany({
        where: { type: 'CHANNEL' },
        include: {
            createdBy: { select: personSelect },
            _count: { select: { members: true } },
            members: { where: { userId }, select: { id: true } },
        },
        orderBy: [{ track: 'asc' }, { name: 'asc' }],
    });
    return channels.map((c) => ({
        id: c.id,
        name: c.name ?? 'Canal',
        track: c.track ?? 'GL',
        description: c.description,
        memberCount: c._count.members,
        joined: c.members.length > 0,
        createdByName: toPerson(c.createdBy).name,
    }));
}
