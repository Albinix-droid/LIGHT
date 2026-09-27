// lib/parametres/actions.ts
// SERVER ACTIONS DES PARAMÈTRES : profil, photo, préférences de notifications, suppression du compte
// Le changement d'email et de mot de passe passe directement par Supabase Auth côté navigateur.
'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ATTACHMENTS_BUCKET } from '@/lib/messagerie/types';
import type { NotificationKind } from '@/lib/notifications/types';
import {
    AVATAR_MIME_TYPES, AVATARS_BUCKET, MAX_AVATAR_BYTES, MAX_BIO_LENGTH, MAX_NAME_LENGTH,
    type Result, type Track,
} from './types';

const NOT_LOGGED = { ok: false as const, error: 'Session expirée. Veuillez vous reconnecter.' };
const KINDS: NotificationKind[] = ['VALIDATION', 'INVITATION', 'MESSAGE', 'SYSTEM'];

function refresh() {
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/encadrant', 'layout');
}

// ============================================================
// PROFIL
// ============================================================
export async function updateProfile(input: {
    firstName: string;
    lastName: string;
    bio: string;
    track: Track | null;
}): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;

    const firstName = String(input.firstName ?? '').replace(/\s+/g, ' ').trim();
    const lastName = String(input.lastName ?? '').replace(/\s+/g, ' ').trim();
    const bio = String(input.bio ?? '').trim();
    if (firstName.length < 1 || firstName.length > MAX_NAME_LENGTH) return { ok: false, error: `Le prénom doit contenir entre 1 et ${MAX_NAME_LENGTH} caractères.` };
    if (lastName.length > MAX_NAME_LENGTH) return { ok: false, error: `Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères.` };
    if (bio.length > MAX_BIO_LENGTH) return { ok: false, error: `La présentation ne doit pas dépasser ${MAX_BIO_LENGTH} caractères.` };
    const track = input.track === 'GL' || input.track === 'SR' ? input.track : null;

    await prisma.user.update({ where: { id: user.id }, data: { firstName, lastName, bio: bio || null, track } });
    refresh();
    return { ok: true };
}

// ============================================================
// PHOTO DE PROFIL (bucket public « avatars », dépôt par URL signée)
// ============================================================
let avatarBucketReady: Promise<void> | null = null;

function ensureAvatarBucket() {
    avatarBucketReady ??= (async () => {
        const storage = getSupabaseAdmin().storage;
        const options = { public: true, fileSizeLimit: MAX_AVATAR_BYTES, allowedMimeTypes: AVATAR_MIME_TYPES };
        const { data } = await storage.getBucket(AVATARS_BUCKET);
        const { error } = data
            ? await storage.updateBucket(AVATARS_BUCKET, options)
            : await storage.createBucket(AVATARS_BUCKET, options);
        if (error) throw new Error(error.message);
    })().catch((e) => {
        avatarBucketReady = null;
        throw e;
    });
    return avatarBucketReady;
}

const avatarPrefix = (userId: string) => `u/${userId}/`;

// Chemin d'un fichier du bucket à partir de son URL publique (pour supprimer l'ancienne photo)
function avatarPathFromUrl(url: string | null) {
    const marker = `/storage/v1/object/public/${AVATARS_BUCKET}/`;
    const i = url?.indexOf(marker) ?? -1;
    return url && i >= 0 ? decodeURIComponent(url.slice(i + marker.length).split('?')[0]) : null;
}

export async function prepareAvatarUpload(mimeType: string): Promise<Result<{ path: string; token: string }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (!AVATAR_MIME_TYPES.includes(mimeType)) return { ok: false, error: 'Format de photo non pris en charge.' };
    try {
        await ensureAvatarBucket();
        const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/jpeg' ? 'jpg' : 'webp';
        const path = `${avatarPrefix(user.id)}${randomUUID()}.${ext}`;
        const { data, error } = await getSupabaseAdmin().storage.from(AVATARS_BUCKET).createSignedUploadUrl(path);
        if (error || !data) throw new Error(error?.message);
        return { ok: true, path, token: data.token };
    } catch (e) {
        console.error('[paramètres] préparation de la photo', e);
        return { ok: false, error: 'Le stockage des photos est momentanément indisponible.' };
    }
}

export async function saveAvatar(path: string): Promise<Result<{ avatarUrl: string }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (typeof path !== 'string' || !path.startsWith(avatarPrefix(user.id)) || path.includes('..')) {
        return { ok: false, error: 'Photo invalide.' };
    }
    const storage = getSupabaseAdmin().storage.from(AVATARS_BUCKET);
    const { data: info } = await storage.info(path);
    if (!info || !AVATAR_MIME_TYPES.includes(String(info.contentType)) || Number(info.size) > MAX_AVATAR_BYTES) {
        await storage.remove([path]);
        return { ok: false, error: "La photo n'a pas pu être vérifiée. Réessayez." };
    }
    const avatarUrl = storage.getPublicUrl(path).data.publicUrl;
    const previous = avatarPathFromUrl(user.avatarUrl);
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
    if (previous && previous !== path) await storage.remove([previous]);
    refresh();
    return { ok: true, avatarUrl };
}

export async function removeAvatar(): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const previous = avatarPathFromUrl(user.avatarUrl);
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: null } });
    if (previous) await getSupabaseAdmin().storage.from(AVATARS_BUCKET).remove([previous]);
    refresh();
    return { ok: true };
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export async function updateNotificationPrefs(muted: NotificationKind[]): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const clean = KINDS.filter((k) => Array.isArray(muted) && muted.includes(k));
    await prisma.user.update({ where: { id: user.id }, data: { notificationPrefs: { muted: clean } } });
    return { ok: true };
}

// ============================================================
// SUPPRESSION DU COMPTE
// ============================================================
export async function deleteAccount(confirmEmail: string): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (String(confirmEmail ?? '').trim().toLowerCase() !== user.email.toLowerCase()) {
        return { ok: false, error: "L'adresse saisie ne correspond pas à celle du compte." };
    }

    // Fichiers à retirer du stockage une fois les données supprimées
    const attachments = await prisma.messageAttachment.findMany({
        // Ses propres fichiers, et ceux des conversations qu'il a créées (supprimées en cascade)
        where: { OR: [{ uploaderId: user.id }, { conversation: { createdById: user.id } }] },
        select: { path: true },
    });
    const avatar = avatarPathFromUrl(user.avatarUrl);

    // Les projets portés par l'utilisateur disparaissent avec lui (leurs étapes, équipes et demandes suivent en cascade)
    await prisma.$transaction([
        prisma.project.deleteMany({ where: { ownerId: user.id } }),
        prisma.user.delete({ where: { id: user.id } }),
    ]);

    const admin = getSupabaseAdmin();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) console.error('[paramètres] suppression du compte Supabase', error.message);
    const paths = attachments.map((a) => a.path);
    for (let i = 0; i < paths.length; i += 100) await admin.storage.from(ATTACHMENTS_BUCKET).remove(paths.slice(i, i + 100));
    if (avatar) await admin.storage.from(AVATARS_BUCKET).remove([avatar]);

    return { ok: true };
}
