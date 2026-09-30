// app/confirmation/actions.ts
// SERVER ACTIONS - CONFIRMATION D'UN COMPTE ENCADRANT OU ADMINISTRATEUR
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client';
import { getCurrentUser, homeFor } from '@/lib/auth';
import { STAFF_ROLE_LABELS, checkStaffCredential, isStaffRole, logAdminAction, normalizeMatricule } from '@/lib/staff';

type Result = { ok: true; redirectTo: string } | { ok: false; error: string };

const MAX_FIELD_LENGTH = 120;
const clean = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

export async function confirmStaffAccount(input: {
    matricule: string;
    code: string;
    grade: string;
    specialty: string;
    department: string;
    certify: boolean;
}): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    const role = user.pendingRole;
    if (!isStaffRole(role)) return { ok: false, error: "Aucune demande de rôle n'est en attente pour ce compte." };

    const grade = clean(input.grade);
    const specialty = clean(input.specialty);
    const department = clean(input.department);
    const isEncadrant = role === 'ENCADRANT';

    if (!clean(input.matricule) || !clean(input.code)) {
        return { ok: false, error: "Renseignez le matricule et le code confidentiel remis par l'école." };
    }
    if (!grade) return { ok: false, error: isEncadrant ? 'Indiquez votre grade.' : 'Indiquez votre fonction.' };
    if (isEncadrant && !specialty) return { ok: false, error: 'Indiquez votre spécialité.' };
    if (!department) return { ok: false, error: isEncadrant ? 'Indiquez votre département.' : 'Indiquez votre service.' };
    if ([grade, specialty, department].some((v) => v.length > MAX_FIELD_LENGTH)) {
        return { ok: false, error: `Chaque champ est limité à ${MAX_FIELD_LENGTH} caractères.` };
    }
    if (!input.certify) return { ok: false, error: "Cochez la case certifiant l'exactitude des informations." };

    const check = await checkStaffCredential({ role, matricule: input.matricule, code: input.code, email: user.email });
    if (!check.ok) return check;
    const { credential } = check;
    const matricule = normalizeMatricule(input.matricule);
    const now = new Date();

    try {
        const updated = await prisma.$transaction(async (tx) => {
            // Usage unique, même si deux confirmations arrivent en même temps
            const claimed = await tx.staffCredential.updateMany({
                where: { id: credential.id, usedAt: null, revokedAt: null },
                data: { usedAt: now, usedById: user.id, failedAttempts: 0, lockedUntil: null },
            });
            if (claimed.count !== 1) throw new Error('CREDENTIAL_ALREADY_USED');

            return tx.user.update({
                where: { id: user.id },
                data: {
                    role,
                    pendingRole: null,
                    verifiedAt: now,
                    matricule,
                    // Identité officielle : celle enregistrée par l'école
                    firstName: credential.firstName,
                    lastName: credential.lastName,
                    grade,
                    specialty: specialty || credential.specialty,
                    department: department || credential.department,
                },
            });
        });

        await logAdminAction({
            adminId: null,
            action: 'STAFF_VERIFIED',
            targetType: 'USER',
            targetId: user.id,
            summary: `${credential.firstName} ${credential.lastName} a confirmé son compte ${STAFF_ROLE_LABELS[role].toLowerCase()} (matricule ${matricule})`,
            details: { email: user.email, credentialId: credential.id },
        });

        revalidatePath('/', 'layout');
        return { ok: true, redirectTo: homeFor(updated) };
    } catch (error) {
        if (error instanceof Error && error.message === 'CREDENTIAL_ALREADY_USED') {
            return { ok: false, error: "Ces identifiants ont déjà servi à confirmer un compte. Contactez l'administration." };
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { ok: false, error: "Ce matricule est déjà associé à un autre compte. Contactez l'administration." };
        }
        throw error;
    }
}

// L'utilisateur renonce au rôle demandé et continue en tant qu'étudiant
export async function cancelStaffRequest(): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    await prisma.user.update({ where: { id: user.id }, data: { pendingRole: null } });
    revalidatePath('/', 'layout');
    return { ok: true, redirectTo: '/onboarding/welcome' };
}
