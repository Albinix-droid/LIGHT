// lib/notifications/actions.ts
// SERVER ACTIONS DES NOTIFICATIONS (cloche, centre de notifications)
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { countUnreadNotifications, listNotifications } from './queries';
import type { NotificationFilter, NotificationView, Result } from './types';

const NOT_LOGGED = { ok: false as const, error: 'Session expirée. Veuillez vous reconnecter.' };
const FILTERS: NotificationFilter[] = ['all', 'unread', 'INVITATION', 'VALIDATION', 'MESSAGE', 'SYSTEM'];

function refresh() {
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/encadrant', 'layout');
}

// Compteur léger interrogé périodiquement par la cloche
export async function getUnreadCount(): Promise<Result<{ count: number }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    return { ok: true, count: await countUnreadNotifications(user.id) };
}

// Dernières notifications pour le panneau de la cloche
export async function fetchLatestNotifications(): Promise<Result<{ items: NotificationView[]; unread: number }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const [{ items }, unread] = await Promise.all([
        listNotifications(user.id, user.role, { take: 8 }),
        countUnreadNotifications(user.id),
    ]);
    return { ok: true, items, unread };
}

// Pagination et filtres du centre de notifications
export async function fetchNotifications(input: { filter?: NotificationFilter; cursor?: string }): Promise<Result<{ items: NotificationView[]; nextCursor: string | null }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const filter = FILTERS.includes(input.filter ?? 'all') ? input.filter ?? 'all' : 'all';
    return { ok: true, ...(await listNotifications(user.id, user.role, { filter, cursor: input.cursor })) };
}

export async function setNotificationRead(notificationId: string, read = true): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const { count } = await prisma.notification.updateMany({
        where: { id: notificationId, userId: user.id },
        data: { readAt: read ? new Date() : null },
    });
    if (count === 0) return { ok: false, error: 'Notification introuvable.' };
    refresh();
    return { ok: true };
}

export async function markAllNotificationsRead(): Promise<Result<{ count: number }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const { count } = await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
    refresh();
    return { ok: true, count };
}

export async function deleteNotification(notificationId: string): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const { count } = await prisma.notification.deleteMany({ where: { id: notificationId, userId: user.id } });
    if (count === 0) return { ok: false, error: 'Notification introuvable.' };
    refresh();
    return { ok: true };
}

export async function deleteReadNotifications(): Promise<Result<{ count: number }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const { count } = await prisma.notification.deleteMany({ where: { userId: user.id, readAt: { not: null } } });
    refresh();
    return { ok: true, count };
}
