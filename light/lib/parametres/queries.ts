// lib/parametres/queries.ts
// Lectures des paramètres du compte (serveur uniquement)
import 'server-only';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { readMutedKinds, type AccountStats, type SettingsProfile } from './types';

type ProfileRow = {
    id: string; firstName: string; lastName: string; email: string; role: 'STUDENT' | 'ENCADRANT' | 'ADMIN';
    avatarUrl: string | null; bio: string | null; track: 'GL' | 'SR' | null; notificationPrefs: unknown; createdAt: Date;
};

export async function getSettingsProfile(user: ProfileRow): Promise<SettingsProfile> {
    // Dernière connexion : connue de Supabase Auth uniquement
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio ?? '',
        track: user.track,
        mutedNotifications: readMutedKinds(user.notificationPrefs),
        createdAt: user.createdAt.toISOString(),
        lastSignInAt: data.user?.last_sign_in_at ?? null,
    };
}

export async function getAccountStats(userId: string): Promise<AccountStats> {
    const [owned, memberProjects, supervisedProjects, messages, files, conversations] = await Promise.all([
        prisma.project.findMany({
            where: { ownerId: userId },
            select: { id: true, title: true, _count: { select: { members: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.projectMember.count({ where: { userId, role: { not: 'OWNER' } } }),
        prisma.project.count({ where: { supervisorId: userId } }),
        prisma.message.count({ where: { senderId: userId } }),
        prisma.messageAttachment.count({ where: { uploaderId: userId } }),
        prisma.conversation.findMany({
            where: { createdById: userId, type: { in: ['GROUP', 'CHANNEL'] } },
            select: { name: true, type: true },
        }),
    ]);
    return {
        ownedProjects: owned.map((p) => ({ id: p.id, title: p.title, memberCount: p._count.members })),
        memberProjects,
        supervisedProjects,
        messages,
        files,
        createdConversations: conversations.map((c) => ({ name: c.name ?? 'Sans nom', type: c.type as 'GROUP' | 'CHANNEL' })),
    };
}
