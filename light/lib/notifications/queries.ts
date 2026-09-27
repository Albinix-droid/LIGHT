// lib/notifications/queries.ts
// Lectures et écritures des notifications (serveur uniquement)
import 'server-only';
import prisma from '@/lib/prisma';
import { STAGES } from '@/lib/parcours';
import type { Prisma } from '@/lib/generated/prisma/client';
import { readMutedKinds } from '@/lib/parametres/types';
import {
    NOTIFICATIONS_PAGE_SIZE,
    type ActionItem, type NotificationFilter, type NotificationKind, type NotificationView,
} from './types';

type Role = 'STUDENT' | 'ENCADRANT' | 'ADMIN';

// Les notifications lues de plus de 90 jours sont purgées
const RETENTION_DAYS = 90;
// Une notification identique non lue récente est « remontée » au lieu d'être dupliquée
const DEDUPE_WINDOW_MS = 24 * 3600_000;

// ============================================================
// CRÉATION
// ============================================================
export async function createNotifications(
    userIds: string[],
    n: { type: NotificationKind; message: string; link?: string | null; projectId?: string | null },
    options: { excludeUserId?: string } = {},
) {
    const candidates = [...new Set(userIds)].filter((id) => id && id !== options.excludeUserId);
    if (candidates.length === 0) return;
    // Préférences : les types coupés dans les paramètres ne sont pas créés
    const prefs = await prisma.user.findMany({ where: { id: { in: candidates } }, select: { id: true, notificationPrefs: true } });
    const recipients = prefs.filter((u) => !readMutedKinds(u.notificationPrefs).includes(n.type)).map((u) => u.id);
    if (recipients.length === 0) return;
    const link = n.link ?? null;
    const projectId = n.projectId ?? null;

    // Anti-doublon : même type, même message, même lien, pas encore lue
    const duplicates = await prisma.notification.findMany({
        where: {
            userId: { in: recipients }, type: n.type, message: n.message, link, readAt: null,
            createdAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
        },
        select: { id: true, userId: true },
    });
    const bumped = new Set(duplicates.map((d) => d.userId));

    await prisma.$transaction([
        ...(duplicates.length
            ? [prisma.notification.updateMany({ where: { id: { in: duplicates.map((d) => d.id) } }, data: { createdAt: new Date() } })]
            : []),
        prisma.notification.createMany({
            data: recipients.filter((id) => !bumped.has(id)).map((userId) => ({ userId, type: n.type, message: n.message, link, projectId })),
        }),
        prisma.notification.deleteMany({
            where: { userId: { in: recipients }, readAt: { lt: new Date(Date.now() - RETENTION_DAYS * 86_400_000) } },
        }),
    ]);
}

// ============================================================
// LIENS : un même événement peut concerner étudiants et encadrants
// ============================================================
export function resolveLink(link: string | null, role: Role): string | null {
    if (!link) return null;
    if (role !== 'ENCADRANT') return link.startsWith('/encadrant') ? '/dashboard' : link;
    if (link.startsWith('/dashboard/invitations')) return '/encadrant/demandes';
    if (link.startsWith('/dashboard/messagerie')) return link.replace('/dashboard/messagerie', '/encadrant/messagerie');
    const project = link.match(/^\/dashboard\/projets\/([^/?#]+)/);
    if (project && project[1] !== 'nouveau') return `/encadrant/projets/${project[1]}`;
    if (link.startsWith('/dashboard')) return '/encadrant';
    return link;
}

// Liens bruts pouvant désigner une page de l'espace encadrant (lecture automatique)
function rawLinksFor(path: string, role: Role): string[] {
    if (role !== 'ENCADRANT') return [path];
    if (path === '/encadrant/demandes') return [path, '/dashboard/invitations'];
    if (path.startsWith('/encadrant/messagerie')) return [path, path.replace('/encadrant/messagerie', '/dashboard/messagerie')];
    if (path.startsWith('/encadrant/projets/')) return [path, path.replace('/encadrant/projets/', '/dashboard/projets/')];
    return [path];
}

// ============================================================
// LECTURE
// ============================================================
function filterWhere(userId: string, filter: NotificationFilter): Prisma.NotificationWhereInput {
    if (filter === 'unread') return { userId, readAt: null };
    if (filter === 'all') return { userId };
    return { userId, type: filter };
}

export async function listNotifications(
    userId: string,
    role: Role,
    { filter = 'all', cursor, take = NOTIFICATIONS_PAGE_SIZE }: { filter?: NotificationFilter; cursor?: string; take?: number } = {},
): Promise<{ items: NotificationView[]; nextCursor: string | null }> {
    const rows = await prisma.notification.findMany({
        where: filterWhere(userId, filter),
        include: { project: { select: { id: true, title: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, take).map((n) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        link: resolveLink(n.link, role),
        read: n.readAt !== null,
        createdAt: n.createdAt.toISOString(),
        project: n.project,
    }));
    return { items, nextCursor: rows.length > take ? rows[take - 1].id : null };
}

export function countUnreadNotifications(userId: string) {
    return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function countByKind(userId: string) {
    const rows = await prisma.notification.groupBy({ by: ['type'], where: { userId, readAt: null }, _count: { _all: true } });
    return Object.fromEntries(rows.map((r) => [r.type, r._count._all])) as Partial<Record<NotificationKind, number>>;
}

// Lecture automatique : visiter la page visée par une notification la marque comme lue
export async function markReadForPath(userId: string, role: Role, path: string) {
    await prisma.notification.updateMany({
        where: { userId, readAt: null, link: { in: rawLinksFor(path, role) } },
        data: { readAt: new Date() },
    });
}

// ============================================================
// « À TRAITER » : calculé en direct à partir de l'état des projets
// ============================================================
const stageOf = (stage: string) => STAGES.find((s) => s.stage === stage);
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;
const daysSince = (d: Date) => Math.floor((Date.now() - d.getTime()) / 86_400_000);

export async function getActionItems(userId: string, role: Role): Promise<ActionItem[]> {
    const items: ActionItem[] = [];
    const pendingRequests = prisma.projectRequest.count({ where: { recipientId: userId, status: 'PENDING' } });

    if (role === 'ENCADRANT') {
        const [submissions, requests] = await Promise.all([
            prisma.stepSubmission.findMany({
                where: { decision: null, step: { project: { supervisorId: userId } } },
                select: { submittedAt: true },
                orderBy: { submittedAt: 'asc' },
            }),
            pendingRequests,
        ]);
        if (submissions.length) {
            const oldest = daysSince(submissions[0].submittedAt);
            items.push({
                key: 'reviews',
                tone: oldest >= 3 ? 'urgent' : 'warning',
                title: `${plural(submissions.length, 'étape')} à examiner`,
                detail: oldest >= 1
                    ? `La plus ancienne attend depuis ${plural(oldest, 'jour')}. Vos étudiants sont bloqués jusqu'à votre décision.`
                    : 'Soumise aujourd\'hui : un retour rapide garde vos étudiants motivés.',
                href: '/encadrant/validations',
                cta: 'Examiner',
            });
        }
        if (requests) {
            items.push({
                key: 'supervision',
                tone: 'warning',
                title: `${plural(requests, "demande")} d'encadrement`,
                detail: 'Des étudiants attendent votre réponse pour démarrer leur accompagnement.',
                href: '/encadrant/demandes',
                cta: 'Répondre',
            });
        }
        return items;
    }

    const mine = { OR: [{ ownerId: userId }, { members: { some: { userId } } }] };
    const [requests, changes, orphanProjects] = await Promise.all([
        pendingRequests,
        prisma.projectStep.findMany({
            where: { status: 'CHANGES_REQUESTED', project: mine },
            select: { stage: true, updatedAt: true, project: { select: { id: true, title: true } } },
            orderBy: { updatedAt: 'asc' },
            take: 5,
        }),
        prisma.project.findMany({
            where: { ownerId: userId, supervisorId: null, requests: { none: { type: 'SUPERVISION_REQUEST', status: 'PENDING' } } },
            select: { id: true, title: true },
            take: 3,
        }),
    ]);

    for (const step of changes) {
        const stage = stageOf(step.stage);
        if (!stage) continue;
        items.push({
            key: `changes-${step.project.id}-${stage.slug}`,
            tone: 'urgent',
            title: `Modifications demandées · ${stage.label}`,
            detail: `« ${step.project.title} » : corrigez selon le retour de l'encadrant puis soumettez à nouveau.`,
            href: `/dashboard/projets/${step.project.id}/${stage.slug}`,
            cta: 'Corriger',
        });
    }
    if (requests) {
        items.push({
            key: 'requests',
            tone: 'warning',
            title: `${plural(requests, 'demande')} en attente de votre réponse`,
            detail: 'Invitations à rejoindre une équipe ou candidatures pour votre projet.',
            href: '/dashboard/invitations',
            cta: 'Répondre',
        });
    }
    for (const project of orphanProjects) {
        items.push({
            key: `supervisor-${project.id}`,
            tone: 'info',
            title: 'Projet sans encadrant',
            detail: `« ${project.title} » : demandez un encadrant pour pouvoir soumettre vos étapes.`,
            href: `/dashboard/projets/${project.id}`,
            cta: 'Choisir',
        });
    }
    return items;
}
