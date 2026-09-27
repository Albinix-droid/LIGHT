// lib/messagerie/storage.ts
// Stockage des pièces jointes : bucket privé Supabase « messagerie » (serveur uniquement)
// Le navigateur dépose les fichiers via une URL signée à usage unique ; la lecture passe par des URL signées temporaires.
import 'server-only';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin as getAdmin } from '@/lib/supabase/admin';
import { ALLOWED_ATTACHMENT_TYPES, ATTACHMENTS_BUCKET, MAX_ATTACHMENT_SIZE } from './types';

let bucketReady: Promise<void> | null = null;

// Création du bucket au premier usage (privé, taille et types limités côté Supabase)
function ensureBucket() {
    bucketReady ??= (async () => {
        const storage = getAdmin().storage;
        const options = {
            public: false,
            fileSizeLimit: MAX_ATTACHMENT_SIZE,
            allowedMimeTypes: Object.keys(ALLOWED_ATTACHMENT_TYPES),
        };
        const { data } = await storage.getBucket(ATTACHMENTS_BUCKET);
        const { error } = data
            ? await storage.updateBucket(ATTACHMENTS_BUCKET, options)
            : await storage.createBucket(ATTACHMENTS_BUCKET, options);
        if (error) throw new Error(`Stockage indisponible : ${error.message}`);
    })().catch((e) => {
        bucketReady = null; // nouvel essai au prochain appel
        throw e;
    });
    return bucketReady;
}

// Chemin d'un fichier : le nom d'origine reste en base, jamais dans le chemin
export const attachmentPrefix = (conversationId: string, userId: string) => `c/${conversationId}/${userId}/`;

export async function createUploadTarget(conversationId: string, userId: string, mimeType: string) {
    await ensureBucket();
    const path = `${attachmentPrefix(conversationId, userId)}${randomUUID()}.${ALLOWED_ATTACHMENT_TYPES[mimeType]}`;
    const { data, error } = await getAdmin().storage.from(ATTACHMENTS_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error(error?.message ?? "Impossible de préparer l'envoi du fichier.");
    return { path, token: data.token };
}

// Taille et type réels du fichier déposé (on ne se fie pas au navigateur)
export async function getStoredFile(path: string): Promise<{ size: number; mimeType: string } | null> {
    const { data, error } = await getAdmin().storage.from(ATTACHMENTS_BUCKET).info(path);
    if (error || !data) return null;
    return { size: Number(data.size ?? 0), mimeType: String(data.contentType ?? '') };
}

export async function signedFileUrl(path: string, download: string | false) {
    const { data, error } = await getAdmin()
        .storage.from(ATTACHMENTS_BUCKET)
        .createSignedUrl(path, 600, download ? { download } : undefined);
    if (error || !data) return null;
    return data.signedUrl;
}

export async function removeStoredFiles(paths: string[]) {
    if (paths.length === 0) return;
    await getAdmin().storage.from(ATTACHMENTS_BUCKET).remove(paths);
}
