// lib/admin/queries.ts
// Lectures du tableau de bord administrateur (serveur uniquement)
import 'server-only';
import prisma from '@/lib/prisma';
import type { Prisma, Role } from '@/lib/generated/prisma/client';

const personSelect = { id: true, firstName: true, lastName: true, email: true } as const;
const DAY = 86_400_000;

// ============================================================
// VUE D'ENSEMBLE
// ============================================================
export async function getAdminOverview() {
    const now = new Date();
    const [roles, pendingStaff, suspended, newUsers, stages, unsupervised, pendingSubmissions, credentials, recentLogs] = await Promise.all([
        prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
        prisma.user.findMany({
            where: { pendingRole: { not: null } },
            select: { ...personSelect, pendingRole: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 6,
        }),
        prisma.user.count({ where: { suspendedAt: { not: null } } }),
        prisma.user.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * DAY) } } }),
        prisma.project.groupBy({ by: ['stage'], _count: { _all: true } }),
        prisma.project.count({ where: { supervisorId: null } }),
        prisma.stepSubmission.count({ where: { decision: null } }),
        prisma.staffCredential.findMany({ select: { usedAt: true, revokedAt: true, expiresAt: true } }),
        listAdminLogs({ take: 8 }),
    ]);

    const byRole = Object.fromEntries(roles.map((r) => [r.role, r._count._all])) as Partial<Record<Role, number>>;
    return {
        users: {
            total: roles.reduce((sum, r) => sum + r._count._all, 0),
            students: byRole.STUDENT ?? 0,
            encadrants: byRole.ENCADRANT ?? 0,
            admins: byRole.ADMIN ?? 0,
            newThisWeek: newUsers,
            suspended,
        },
        pendingStaff,
        pendingStaffCount: await prisma.user.count({ where: { pendingRole: { not: null } } }),
        projects: {
            total: stages.reduce((sum, s) => sum + s._count._all, 0),
            byStage: Object.fromEntries(stages.map((s) => [s.stage, s._count._all])) as Record<string, number>,
            unsupervised,
            pendingSubmissions,
        },
        credentials: {
            active: credentials.filter((c) => !c.usedAt && !c.revokedAt && (!c.expiresAt || c.expiresAt > now)).length,
            used: credentials.filter((c) => c.usedAt).length,
        },
        recentLogs,
    };
}

// Compteurs affichés dans le menu
export async function getAdminCounters() {
    const [pendingStaff, suspended] = await Promise.all([
        prisma.user.count({ where: { pendingRole: { not: null } } }),
        prisma.user.count({ where: { suspendedAt: { not: null } } }),
    ]);
    return { pendingStaff, suspended };
}

// ============================================================
// UTILISATEURS
// ============================================================
export type UserFilter = 'all' | 'STUDENT' | 'ENCADRANT' | 'ADMIN' | 'pending' | 'suspended';

export async function listUsers({ q, filter }: { q?: string; filter?: UserFilter }) {
    const search = q?.trim();
    const where: Prisma.UserWhereInput = {
        ...(search
            ? {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { matricule: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {}),
        ...(filter === 'STUDENT' || filter === 'ENCADRANT' || filter === 'ADMIN' ? { role: filter } : {}),
        ...(filter === 'pending' ? { pendingRole: { not: null } } : {}),
        ...(filter === 'suspended' ? { suspendedAt: { not: null } } : {}),
    };

    return prisma.user.findMany({
        where,
        select: {
            ...personSelect,
            role: true, pendingRole: true, matricule: true, grade: true, department: true,
            verifiedAt: true, suspendedAt: true, suspendedReason: true, createdAt: true, avatarUrl: true,
            _count: { select: { ownedProjects: true, supervisedProjects: true, memberships: true } },
        },
        orderBy: [{ pendingRole: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
        take: 200,
    });
}

// ============================================================
// IDENTIFIANTS DE L'ÉCOLE
// ============================================================
export function listCredentials() {
    return prisma.staffCredential.findMany({
        select: {
            id: true, role: true, matricule: true, firstName: true, lastName: true, email: true,
            specialty: true, department: true, failedAttempts: true, lockedUntil: true, expiresAt: true,
            revokedAt: true, usedAt: true, createdAt: true,
            usedBy: { select: personSelect },
            createdBy: { select: personSelect },
        },
        orderBy: { createdAt: 'desc' },
    });
}

// ============================================================
// PROJETS
// ============================================================
export function listAllProjects(q?: string) {
    const search = q?.trim();
    return prisma.project.findMany({
        where: search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { owner: { lastName: { contains: search, mode: 'insensitive' } } },
                    { owner: { firstName: { contains: search, mode: 'insensitive' } } },
                ],
            }
            : undefined,
        select: {
            id: true, title: true, sector: true, stage: true, progress: true, createdAt: true, updatedAt: true,
            owner: { select: personSelect },
            supervisor: { select: personSelect },
            steps: { select: { stage: true, status: true } },
            _count: { select: { members: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 300,
    });
}

// ============================================================
// JOURNAL
// ============================================================
export async function listAdminLogs({ take = 200, action }: { take?: number; action?: string } = {}) {
    const logs = await prisma.adminLog.findMany({
        where: action ? { action } : undefined,
        include: { admin: { select: personSelect } },
        orderBy: { createdAt: 'desc' },
        take,
    });
    return logs.map((l) => ({
        id: l.id,
        action: l.action,
        summary: l.summary,
        createdAt: l.createdAt,
        adminName: l.admin ? `${l.admin.firstName} ${l.admin.lastName}`.trim() : null,
    }));
}

export async function listLogActions() {
    const rows = await prisma.adminLog.findMany({ distinct: ['action'], select: { action: true }, orderBy: { action: 'asc' } });
    return rows.map((r) => r.action);
}
