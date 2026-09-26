// lib/demandes/queries.ts
// Lectures des demandes et invitations (serveur uniquement)
import 'server-only';
import prisma from '@/lib/prisma';
import { STAGES } from '@/lib/parcours';
import type { DiscoverProject, PendingInvitationInfo, RequestItem, RequestPerson, TeamMemberInfo } from './types';

type PersonRow = { id: string; firstName: string; lastName: string; role: 'STUDENT' | 'ENCADRANT' | 'ADMIN' };
const personSelect = { id: true, firstName: true, lastName: true, role: true } as const;

export function toRequestPerson(u: PersonRow): RequestPerson {
    const name = `${u.firstName} ${u.lastName}`.trim();
    const initials = [u.firstName, u.lastName].filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    return { id: u.id, name, initials, role: u.role };
}

const stageLabel = (stage: string) => STAGES.find((s) => s.stage === stage)?.label ?? stage;

// Toutes les demandes de l'utilisateur, reçues et envoyées, les plus récentes d'abord
export async function listRequestsForUser(userId: string): Promise<RequestItem[]> {
    const rows = await prisma.projectRequest.findMany({
        where: { OR: [{ recipientId: userId }, { senderId: userId }] },
        include: {
            project: { select: { id: true, title: true, sector: true, stage: true } },
            sender: { select: personSelect },
            recipient: { select: personSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: 150,
    });

    return rows.map((r) => {
        const received = r.recipientId === userId;
        return {
            id: r.id,
            type: r.type,
            status: r.status,
            direction: received ? 'received' : 'sent',
            project: { id: r.project.id, title: r.project.title, sector: r.project.sector, stageLabel: stageLabel(r.project.stage) },
            other: toRequestPerson(received ? r.sender : r.recipient),
            role: r.role === 'OWNER' ? null : r.role,
            message: r.message,
            responseMessage: r.responseMessage,
            createdAt: r.createdAt.toISOString(),
            respondedAt: r.respondedAt?.toISOString() ?? null,
        };
    });
}

export function countPendingReceived(userId: string) {
    return prisma.projectRequest.count({ where: { recipientId: userId, status: 'PENDING' } });
}

// Projets que l'étudiant peut demander à rejoindre (ni porteur, ni membre)
export async function listDiscoverableProjects(userId: string, query = ''): Promise<DiscoverProject[]> {
    const q = query.trim();
    const projects = await prisma.project.findMany({
        where: {
            ownerId: { not: userId },
            members: { none: { userId } },
            ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
        },
        include: {
            owner: { select: personSelect },
            _count: { select: { members: true } },
            requests: { where: { type: 'JOIN_REQUEST', status: 'PENDING', senderId: userId }, select: { id: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 30,
    });

    return projects.map((p) => ({
        id: p.id,
        title: p.title,
        sector: p.sector,
        stageLabel: stageLabel(p.stage),
        description: p.description ? (p.description.length > 220 ? `${p.description.slice(0, 217)}…` : p.description) : null,
        ownerName: toRequestPerson(p.owner).name,
        memberCount: p._count.members,
        teamSize: p.teamSize,
        hasPendingRequest: p.requests.length > 0,
    }));
}

// Équipe d'un projet + invitations en attente + demande d'encadrement en cours
export async function getProjectTeam(projectId: string, userId: string) {
    const [members, invitations, supervision] = await Promise.all([
        prisma.projectMember.findMany({
            where: { projectId },
            include: { user: { select: personSelect } },
            orderBy: { joinedAt: 'asc' },
        }),
        prisma.projectRequest.findMany({
            where: { projectId, type: 'PROJECT_INVITATION', status: 'PENDING' },
            include: { recipient: { select: personSelect } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.projectRequest.findFirst({
            where: { projectId, type: 'SUPERVISION_REQUEST', status: 'PENDING' },
            include: { recipient: { select: personSelect } },
        }),
    ]);

    const team: TeamMemberInfo[] = members
        .map((m) => ({ ...toRequestPerson(m.user), role: m.role }))
        .sort((a, b) => (a.role === 'OWNER' ? -1 : b.role === 'OWNER' ? 1 : 0))
        .map((m) => ({ userId: m.id, name: m.name, initials: m.initials, role: m.role, isMe: m.id === userId }));

    const pendingInvitations: PendingInvitationInfo[] = invitations.map((i) => ({
        id: i.id,
        name: toRequestPerson(i.recipient).name,
        role: i.role === 'OWNER' ? null : i.role,
        createdAt: i.createdAt.toISOString(),
    }));

    return {
        team,
        pendingInvitations,
        pendingSupervision: supervision
            ? { id: supervision.id, encadrantId: supervision.recipientId, encadrantName: toRequestPerson(supervision.recipient).name, createdAt: supervision.createdAt.toISOString() }
            : null,
    };
}
