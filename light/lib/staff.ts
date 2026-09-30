// lib/staff.ts
// Identifiants remis par l'école aux encadrants et administrateurs (serveur uniquement)
// Le code confidentiel est haché avec scrypt : même format que scripts/creer-identifiant.mjs.
import 'server-only';
import { randomBytes, randomInt, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import prisma from '@/lib/prisma';
import type { Prisma, Role } from '@/lib/generated/prisma/client';

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const STAFF_ROLES = ['ENCADRANT', 'ADMIN'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
    ENCADRANT: 'Encadrant',
    ADMIN: 'Administrateur',
};

export function isStaffRole(role: unknown): role is StaffRole {
    return role === 'ENCADRANT' || role === 'ADMIN';
}

// Essais ratés avant verrouillage, et durée du verrouillage
export const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

// Sans caractères ambigus (0/O, 1/I/L) : le code est souvent recopié depuis un courrier
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 12;

// Code lisible, par blocs de 4 : « ABCD-EFGH-JKMN »
export function generateStaffCode() {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    return code.match(/.{4}/g)!.join('-');
}

// Majuscules, sans espaces ni tirets : « abcd efgh-jkmn » et « ABCD-EFGH-JKMN » sont équivalents
export function normalizeCode(code: string) {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function normalizeMatricule(matricule: string) {
    return matricule.trim().toUpperCase().replace(/\s+/g, '');
}

export async function hashStaffCode(code: string) {
    const salt = randomBytes(16);
    const hash = await scryptAsync(normalizeCode(code), salt, 32);
    return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function verifyStaffCode(code: string, stored: string) {
    const [scheme, salt, hash] = stored.split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const expected = Buffer.from(hash, 'base64');
    const actual = await scryptAsync(normalizeCode(code), Buffer.from(salt, 'base64'), expected.length);
    return timingSafeEqual(actual, expected);
}

// État lisible d'un identifiant (tableau de bord administrateur)
export type CredentialState = 'USED' | 'REVOKED' | 'EXPIRED' | 'LOCKED' | 'ACTIVE';

export function credentialState(c: { usedAt: Date | null; revokedAt: Date | null; expiresAt: Date | null; lockedUntil: Date | null }, now = new Date()): CredentialState {
    if (c.usedAt) return 'USED';
    if (c.revokedAt) return 'REVOKED';
    if (c.expiresAt && c.expiresAt <= now) return 'EXPIRED';
    if (c.lockedUntil && c.lockedUntil > now) return 'LOCKED';
    return 'ACTIVE';
}

export async function logAdminAction(entry: {
    adminId: string | null;
    action: string;
    summary: string;
    targetType?: string;
    targetId?: string;
    details?: Prisma.InputJsonValue;
}) {
    await prisma.adminLog.create({ data: entry });
}

// ============================================================
// VÉRIFICATION DES IDENTIFIANTS SAISIS PAR L'UTILISATEUR
// ============================================================
// Message volontairement identique quel que soit le motif : on ne révèle pas quels matricules existent.
const INVALID = "Matricule ou code confidentiel incorrect. Vérifiez les informations remises par l'école.";

export type CredentialCheck =
    | { ok: true; credential: { id: string; firstName: string; lastName: string; specialty: string | null; department: string | null } }
    | { ok: false; error: string };

export async function checkStaffCredential(input: {
    role: StaffRole;
    matricule: string;
    code: string;
    email: string;
}): Promise<CredentialCheck> {
    const matricule = normalizeMatricule(input.matricule);
    if (!matricule || normalizeCode(input.code).length !== CODE_LENGTH) return { ok: false, error: INVALID };

    const credential = await prisma.staffCredential.findUnique({ where: { matricule } });
    if (!credential || credential.role !== input.role) return { ok: false, error: INVALID };

    const now = new Date();
    const state = credentialState(credential, now);
    if (state === 'LOCKED') {
        return { ok: false, error: "Trop d'essais incorrects. Réessayez dans 30 minutes ou contactez l'administration." };
    }
    if (state === 'USED') return { ok: false, error: "Ces identifiants ont déjà servi à confirmer un compte. Contactez l'administration." };
    if (state === 'REVOKED' || state === 'EXPIRED') {
        return { ok: false, error: "Ces identifiants ne sont plus valides. Demandez-en de nouveaux à l'administration." };
    }

    const codeOk = await verifyStaffCode(input.code, credential.codeHash);
    // Adresse imposée par l'école : les identifiants ne servent qu'au compte prévu
    const emailOk = !credential.email || credential.email.toLowerCase() === input.email.toLowerCase();

    if (!codeOk || !emailOk) {
        const failedAttempts = credential.failedAttempts + 1;
        await prisma.staffCredential.update({
            where: { id: credential.id },
            data: failedAttempts >= MAX_FAILED_ATTEMPTS
                ? { failedAttempts: 0, lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS) }
                : { failedAttempts },
        });
        if (codeOk && !emailOk) {
            return { ok: false, error: "Ces identifiants sont réservés à une autre adresse email. Connectez-vous avec l'adresse communiquée à l'école." };
        }
        return { ok: false, error: INVALID };
    }

    return {
        ok: true,
        credential: {
            id: credential.id,
            firstName: credential.firstName,
            lastName: credential.lastName,
            specialty: credential.specialty,
            department: credential.department,
        },
    };
}

export function roleLabel(role: Role) {
    return role === 'ADMIN' ? 'Administrateur' : role === 'ENCADRANT' ? 'Encadrant' : 'Étudiant';
}
