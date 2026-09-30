// lib/admin/actions.ts
// SERVER ACTIONS DE L'ADMINISTRATION
// Chaque action vérifie que l'utilisateur connecté est administrateur, puis journalise l'opération.
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { Prisma, type Role } from '@/lib/generated/prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { notify } from '@/lib/accompagnement';
import {
    STAFF_ROLE_LABELS, generateStaffCode, hashStaffCode, isStaffRole, logAdminAction, normalizeMatricule, roleLabel,
} from '@/lib/staff';

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const FORBIDDEN = { ok: false as const, error: 'Action réservée aux administrateurs.' };
const MAX_FIELD_LENGTH = 120;
const VALIDITY_DAYS = [7, 30, 90, 365] as const;
const clean = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');
const nameOf = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`.trim();

async function requireAdmin() {
    const user = await getCurrentUser();
    return user?.role === 'ADMIN' ? user : null;
}

function refresh() {
    revalidatePath('/admin', 'layout');
}

// ============================================================
// IDENTIFIANTS DE L'ÉCOLE
// ============================================================
export async function createCredential(input: {
    role: string;
    matricule: string;
    firstName: string;
    lastName: string;
    email?: string;
    specialty?: string;
    department?: string;
    validityDays: number;
}): Promise<Result<{ code: string; matricule: string }>> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;

    if (!isStaffRole(input.role)) return { ok: false, error: 'Choisissez le rôle : encadrant ou administrateur.' };
    const matricule = normalizeMatricule(clean(input.matricule));
    const firstName = clean(input.firstName);
    const lastName = clean(input.lastName);
    const email = clean(input.email).toLowerCase();
    const specialty = clean(input.specialty);
    const department = clean(input.department);

    if (!/^[A-Z0-9][A-Z0-9._/-]{2,39}$/.test(matricule)) {
        return { ok: false, error: 'Matricule invalide : 3 à 40 caractères (lettres, chiffres, tirets, points).' };
    }
    if (!firstName || !lastName) return { ok: false, error: 'Renseignez le prénom et le nom.' };
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Adresse email invalide.' };
    if ([firstName, lastName, email, specialty, department].some((v) => v.length > MAX_FIELD_LENGTH)) {
        return { ok: false, error: `Chaque champ est limité à ${MAX_FIELD_LENGTH} caractères.` };
    }
    const days = VALIDITY_DAYS.includes(input.validityDays as (typeof VALIDITY_DAYS)[number]) ? input.validityDays : 30;

    const code = generateStaffCode();
    try {
        const credential = await prisma.staffCredential.create({
            data: {
                role: input.role,
                matricule,
                firstName,
                lastName,
                email: email || null,
                specialty: specialty || null,
                department: department || null,
                codeHash: await hashStaffCode(code),
                expiresAt: new Date(Date.now() + days * 86_400_000),
                createdById: admin.id,
            },
        });
        await logAdminAction({
            adminId: admin.id,
            action: 'CREDENTIAL_CREATED',
            targetType: 'CREDENTIAL',
            targetId: credential.id,
            summary: `Identifiants ${STAFF_ROLE_LABELS[input.role].toLowerCase()} créés pour ${firstName} ${lastName} (matricule ${matricule})`,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { ok: false, error: `Le matricule ${matricule} existe déjà.` };
        }
        throw error;
    }
    refresh();
    return { ok: true, code, matricule };
}

// Nouveau code (perdu ou expiré) : l'ancien cesse aussitôt de fonctionner
export async function regenerateCredentialCode(id: string): Promise<Result<{ code: string; matricule: string }>> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;
    const credential = await prisma.staffCredential.findUnique({ where: { id } });
    if (!credential) return { ok: false, error: 'Identifiants introuvables.' };
    if (credential.usedAt) return { ok: false, error: 'Ces identifiants ont déjà servi : impossible de les réémettre.' };

    const code = generateStaffCode();
    await prisma.staffCredential.update({
        where: { id },
        data: {
            codeHash: await hashStaffCode(code),
            failedAttempts: 0,
            lockedUntil: null,
            revokedAt: null,
            expiresAt: new Date(Date.now() + 30 * 86_400_000),
        },
    });
    await logAdminAction({
        adminId: admin.id,
        action: 'CREDENTIAL_REGENERATED',
        targetType: 'CREDENTIAL',
        targetId: id,
        summary: `Nouveau code émis pour ${nameOf(credential)} (matricule ${credential.matricule})`,
    });
    refresh();
    return { ok: true, code, matricule: credential.matricule };
}

export async function revokeCredential(id: string): Promise<Result> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;
    const credential = await prisma.staffCredential.findUnique({ where: { id } });
    if (!credential) return { ok: false, error: 'Identifiants introuvables.' };
    if (credential.usedAt) return { ok: false, error: 'Ces identifiants ont déjà servi. Pour retirer le rôle, passez par la page Utilisateurs.' };

    await prisma.staffCredential.update({ where: { id }, data: { revokedAt: new Date() } });
    await logAdminAction({
        adminId: admin.id,
        action: 'CREDENTIAL_REVOKED',
        targetType: 'CREDENTIAL',
        targetId: id,
        summary: `Identifiants révoqués : ${nameOf(credential)} (matricule ${credential.matricule})`,
    });
    refresh();
    return { ok: true };
}

export async function unlockCredential(id: string): Promise<Result> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;
    const credential = await prisma.staffCredential.update({ where: { id }, data: { lockedUntil: null, failedAttempts: 0 } }).catch(() => null);
    if (!credential) return { ok: false, error: 'Identifiants introuvables.' };
    await logAdminAction({
        adminId: admin.id,
        action: 'CREDENTIAL_UNLOCKED',
        targetType: 'CREDENTIAL',
        targetId: id,
        summary: `Identifiants débloqués : ${nameOf(credential)} (matricule ${credential.matricule})`,
    });
    refresh();
    return { ok: true };
}

// Supprime des identifiants jamais utilisés (erreur de saisie)
export async function deleteCredential(id: string): Promise<Result> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;
    const credential = await prisma.staffCredential.findUnique({ where: { id } });
    if (!credential) return { ok: false, error: 'Identifiants introuvables.' };
    if (credential.usedAt) return { ok: false, error: 'Des identifiants déjà utilisés sont conservés pour la traçabilité.' };
    await prisma.staffCredential.delete({ where: { id } });
    await logAdminAction({
        adminId: admin.id,
        action: 'CREDENTIAL_DELETED',
        targetType: 'CREDENTIAL',
        targetId: id,
        summary: `Identifiants supprimés : ${nameOf(credential)} (matricule ${credential.matricule})`,
    });
    refresh();
    return { ok: true };
}

// ============================================================
// UTILISATEURS
// ============================================================

// Suspension : fermeture immédiate de l'accès (lib/auth.ts) et blocage de la connexion côté Supabase
export async function setUserSuspension(userId: string, suspend: boolean, reason?: string): Promise<Result> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;
    if (userId === admin.id) return { ok: false, error: 'Vous ne pouvez pas suspendre votre propre compte.' };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    const cleanReason = clean(reason).slice(0, 300);
    if (suspend && !cleanReason) return { ok: false, error: 'Indiquez le motif de la suspension.' };
    if (suspend && target.role === 'ADMIN' && (await countActiveAdmins()) <= 1) {
        return { ok: false, error: 'Impossible de suspendre le dernier administrateur actif.' };
    }

    await prisma.user.update({
        where: { id: userId },
        data: suspend ? { suspendedAt: new Date(), suspendedReason: cleanReason } : { suspendedAt: null, suspendedReason: null },
    });

    try {
        await getSupabaseAdmin().auth.admin.updateUserById(userId, { ban_duration: suspend ? '876000h' : 'none' });
    } catch (error) {
        // La suspension reste effective via la base : seule la connexion n'est pas bloquée en amont
        console.error('Suspension Supabase :', error);
    }

    await logAdminAction({
        adminId: admin.id,
        action: suspend ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
        targetType: 'USER',
        targetId: userId,
        summary: suspend
            ? `${nameOf(target)} (${target.email}) suspendu : ${cleanReason}`
            : `${nameOf(target)} (${target.email}) réactivé`,
    });
    refresh();
    return { ok: true };
}

// Changement de rôle direct (autorité de l'administrateur, sans identifiants école)
export async function setUserRole(userId: string, role: string): Promise<Result> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;
    if (role !== 'STUDENT' && role !== 'ENCADRANT' && role !== 'ADMIN') return { ok: false, error: 'Rôle invalide.' };
    if (userId === admin.id) return { ok: false, error: 'Vous ne pouvez pas modifier votre propre rôle.' };

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { ok: false, error: 'Utilisateur introuvable.' };
    if (target.role === role && !target.pendingRole) return { ok: true };

    await prisma.user.update({
        where: { id: userId },
        data: { role: role as Role, pendingRole: null, ...(role !== 'STUDENT' && !target.verifiedAt ? { verifiedAt: new Date() } : {}) },
    });
    await logAdminAction({
        adminId: admin.id,
        action: 'USER_ROLE_CHANGED',
        targetType: 'USER',
        targetId: userId,
        summary: `${nameOf(target)} (${target.email}) : ${roleLabel(target.role)} → ${roleLabel(role as Role)}`,
    });
    await notify([userId], {
        type: 'SYSTEM',
        message: `Votre rôle sur la plateforme est désormais : ${roleLabel(role as Role)}.`,
        link: role === 'ADMIN' ? '/admin' : role === 'ENCADRANT' ? '/encadrant' : '/dashboard',
    });
    refresh();
    return { ok: true };
}

// Refus d'une demande de rôle en attente : le compte redevient un compte étudiant
export async function rejectPendingRole(userId: string): Promise<Result> {
    const admin = await requireAdmin();
    if (!admin) return FORBIDDEN;
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target?.pendingRole) return { ok: false, error: "Aucune demande de rôle n'est en attente pour ce compte." };

    await prisma.user.update({ where: { id: userId }, data: { pendingRole: null } });
    await logAdminAction({
        adminId: admin.id,
        action: 'PENDING_ROLE_REJECTED',
        targetType: 'USER',
        targetId: userId,
        summary: `Demande de rôle ${roleLabel(target.pendingRole).toLowerCase()} refusée pour ${nameOf(target)} (${target.email})`,
    });
    refresh();
    return { ok: true };
}

async function countActiveAdmins() {
    return prisma.user.count({ where: { role: 'ADMIN', suspendedAt: null } });
}
