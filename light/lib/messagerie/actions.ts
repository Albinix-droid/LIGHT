// lib/messagerie/actions.ts
// SERVER ACTIONS DE LA MESSAGERIE
// Chaque action vérifie l'utilisateur connecté et son appartenance à la conversation.
'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createNotifications } from '@/lib/notifications/queries';
import {
    attachmentSelect, getConversationDetail, getInbox, getMessages, listChannels, listSharedFiles, toMessage, toPerson,
} from './queries';
import { attachmentPrefix, createUploadTarget, getStoredFile, removeStoredFiles } from './storage';
import {
    ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_NAME, MAX_ATTACHMENT_SIZE, MAX_ATTACHMENTS_PER_MESSAGE, MAX_GROUP_MEMBERS, MAX_MESSAGE_LENGTH,
    formatFileSize, resolveMimeType,
    type ChannelListing, type ChannelTrack, type ChatMessage, type ConversationDetail,
    type ConversationSummary, type PersonWithEmail, type Result, type SharedFile, type UploadedAttachment,
} from './types';

const NOT_LOGGED = { ok: false as const, error: 'Session expirée. Veuillez vous reconnecter.' };
const NOT_FOUND = { ok: false as const, error: 'Conversation introuvable.' };

// Nom affiché d'une pièce jointe : sans séparateurs de chemin ni caractères de contrôle
const sanitizeFileName = (name: unknown) =>
    String(name ?? '').replace(/[\\/]/g, '_').replace(/\p{Cc}/gu, '').trim().slice(0, MAX_ATTACHMENT_NAME) || 'fichier';

async function membershipOf(conversationId: string, userId: string) {
    return prisma.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
        include: { conversation: { select: { type: true } } },
    });
}

async function markRead(conversationId: string, userId: string) {
    await prisma.conversationMember.updateMany({ where: { conversationId, userId }, data: { lastReadAt: new Date() } });
    // Ouvrir la conversation vaut lecture des notifications qui y mènent (ajout au groupe…)
    await prisma.notification.updateMany({
        where: { userId, readAt: null, type: 'MESSAGE', link: { endsWith: `?c=${conversationId}` } },
        data: { readAt: new Date() },
    });
}

// ============================================================
// LECTURE
// ============================================================

// Ouvre une conversation : détail, derniers messages, et marque tout comme lu
export async function openConversation(
    conversationId: string,
): Promise<Result<{ detail: ConversationDetail; messages: ChatMessage[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const detail = await getConversationDetail(conversationId, user.id);
    if (!detail) return NOT_FOUND;
    const messages = await getMessages(conversationId, user.id);
    await markRead(conversationId, user.id);
    return { ok: true, detail, messages };
}

// Rafraîchissement périodique : liste des conversations + nouveaux messages de la conversation ouverte
export async function pollChat(
    selectedId: string | null,
    afterIso: string | null,
): Promise<Result<{ inbox: ConversationSummary[]; messages: ChatMessage[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;

    let messages: ChatMessage[] = [];
    if (selectedId && (await membershipOf(selectedId, user.id))) {
        const after = afterIso ? new Date(afterIso) : undefined;
        messages = await getMessages(selectedId, user.id, after && !isNaN(after.getTime()) ? after : undefined);
        await markRead(selectedId, user.id);
    }
    return { ok: true, inbox: await getInbox(user.id), messages };
}

export async function fetchChannels(): Promise<Result<{ channels: ChannelListing[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    return { ok: true, channels: await listChannels(user.id) };
}

// Recherche d'utilisateurs pour démarrer une discussion ou composer un groupe
export async function searchUsers(query: string): Promise<Result<{ users: PersonWithEmail[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const q = query.trim();
    if (q.length < 2) return { ok: true, users: [] };

    const rows = await prisma.user.findMany({
        where: {
            id: { not: user.id },
            OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
            ],
        },
        select: { id: true, firstName: true, lastName: true, role: true, email: true },
        orderBy: [{ role: 'desc' }, { lastName: 'asc' }],
        take: 12,
    });
    return { ok: true, users: rows.map((u) => ({ ...toPerson(u), email: u.email })) };
}

// ============================================================
// ENVOI
// ============================================================
// Étape 1 : le serveur valide chaque fichier et fournit une URL de dépôt signée à usage unique
export async function prepareAttachmentUploads(
    conversationId: string,
    files: { name: string; size: number; type: string }[],
): Promise<Result<{ uploads: { path: string; token: string }[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (!(await membershipOf(conversationId, user.id))) return NOT_FOUND;
    if (!Array.isArray(files) || files.length === 0) return { ok: false, error: 'Aucun fichier sélectionné.' };
    if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) {
        return { ok: false, error: `Vous pouvez joindre au maximum ${MAX_ATTACHMENTS_PER_MESSAGE} fichiers par message.` };
    }
    for (const file of files) {
        if (!resolveMimeType(String(file.name ?? ''), String(file.type ?? ''))) {
            return { ok: false, error: `« ${file.name} » : type de fichier non autorisé (images, PDF, Word, Excel, PowerPoint, texte, CSV ou ZIP).` };
        }
        if (!(file.size > 0) || file.size > MAX_ATTACHMENT_SIZE) {
            return { ok: false, error: `« ${file.name} » dépasse la taille maximale de ${formatFileSize(MAX_ATTACHMENT_SIZE)}.` };
        }
    }
    try {
        const uploads = await Promise.all(
            files.map((file) => createUploadTarget(conversationId, user.id, resolveMimeType(file.name, file.type)!)),
        );
        return { ok: true, uploads };
    } catch (e) {
        console.error('[messagerie] préparation des pièces jointes', e);
        return { ok: false, error: "Le stockage des fichiers est momentanément indisponible. Réessayez dans un instant." };
    }
}

// Étape 2 : envoi du message ; chaque fichier est revérifié dans le stockage (emplacement, taille, type réels)
export async function sendMessage(
    conversationId: string,
    content: string,
    attachments: UploadedAttachment[] = [],
): Promise<Result<{ message: ChatMessage }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;

    const text = (content ?? '').trim();
    const files = Array.isArray(attachments) ? attachments : [];
    if (!text && files.length === 0) return { ok: false, error: 'Le message est vide.' };
    if (text.length > MAX_MESSAGE_LENGTH) {
        return { ok: false, error: `Le message dépasse ${MAX_MESSAGE_LENGTH} caractères.` };
    }
    if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) {
        return { ok: false, error: `Vous pouvez joindre au maximum ${MAX_ATTACHMENTS_PER_MESSAGE} fichiers par message.` };
    }
    if (!(await membershipOf(conversationId, user.id))) return NOT_FOUND;

    const prefix = attachmentPrefix(conversationId, user.id);
    const paths = files.map((f) => String(f.path ?? ''));
    if (paths.some((p) => !p.startsWith(prefix) || p.includes('..')) || new Set(paths).size !== paths.length) {
        return { ok: false, error: 'Pièce jointe invalide.' };
    }
    if (paths.length && (await prisma.messageAttachment.count({ where: { path: { in: paths } } })) > 0) {
        return { ok: false, error: 'Ces fichiers ont déjà été envoyés.' };
    }

    const verified = [];
    for (const file of files) {
        const stored = await getStoredFile(file.path);
        const mimeType = stored ? resolveMimeType(String(file.name ?? ''), stored.mimeType) : null;
        if (!stored || !mimeType || stored.size <= 0 || stored.size > MAX_ATTACHMENT_SIZE || !ALLOWED_ATTACHMENT_TYPES[stored.mimeType]) {
            await removeStoredFiles(paths);
            return { ok: false, error: `« ${file.name} » n'a pas pu être vérifié. Joignez-le à nouveau.` };
        }
        const dim = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 20000 ? Math.round(v) : null);
        verified.push({
            path: file.path,
            name: sanitizeFileName(file.name),
            mimeType,
            size: stored.size,
            width: dim(file.width),
            height: dim(file.height),
            conversationId,
            uploaderId: user.id,
        });
    }

    const now = new Date();
    const [message] = await prisma.$transaction([
        prisma.message.create({
            data: {
                conversationId, senderId: user.id, content: text, createdAt: now,
                attachments: { create: verified.map((a) => ({ ...a, createdAt: now })) },
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, role: true } },
                attachments: { select: attachmentSelect, orderBy: { createdAt: 'asc' } },
            },
        }),
        prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } }),
        prisma.conversationMember.updateMany({ where: { conversationId, userId: user.id }, data: { lastReadAt: now } }),
    ]);

    return { ok: true, message: toMessage(message, user.id) };
}

// Fichiers et images partagés dans la conversation
export async function fetchSharedFiles(conversationId: string): Promise<Result<{ files: SharedFile[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (!(await membershipOf(conversationId, user.id))) return NOT_FOUND;
    return { ok: true, files: await listSharedFiles(conversationId, user.id) };
}

// ============================================================
// CRÉATION DE CONVERSATIONS
// ============================================================

// Message privé : retrouve la conversation existante avec cette personne, ou la crée
export async function startDirectConversation(otherUserId: string): Promise<Result<{ id: string }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (otherUserId === user.id) return { ok: false, error: 'Vous ne pouvez pas vous écrire à vous-même.' };

    const other = await prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true } });
    if (!other) return { ok: false, error: 'Utilisateur introuvable.' };

    const directKey = [user.id, otherUserId].sort().join(':');
    const conversation = await prisma.conversation.upsert({
        where: { directKey },
        update: {},
        create: {
            type: 'DIRECT',
            directKey,
            createdById: user.id,
            members: { create: [{ userId: user.id }, { userId: otherUserId }] },
        },
    });
    return { ok: true, id: conversation.id };
}

// Groupe de projet : réservé aux étudiants
export async function createGroup(input: {
    name: string;
    description?: string;
    projectId?: string;
    memberIds: string[];
}): Promise<Result<{ id: string }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (user.role !== 'STUDENT') return { ok: false, error: 'La création de groupes est réservée aux étudiants.' };

    const name = input.name?.trim() ?? '';
    if (name.length < 2 || name.length > 80) return { ok: false, error: 'Le nom du groupe doit contenir entre 2 et 80 caractères.' };

    const memberIds = [...new Set(input.memberIds)].filter((id) => id !== user.id);
    if (memberIds.length === 0) return { ok: false, error: 'Ajoutez au moins un membre au groupe.' };
    if (memberIds.length + 1 > MAX_GROUP_MEMBERS) return { ok: false, error: `Un groupe compte au maximum ${MAX_GROUP_MEMBERS} membres.` };
    const found = await prisma.user.count({ where: { id: { in: memberIds } } });
    if (found !== memberIds.length) return { ok: false, error: 'Certains membres sont introuvables.' };

    // Le projet rattaché doit appartenir à l'étudiant (propriétaire ou membre)
    let projectId: string | null = null;
    if (input.projectId) {
        const project = await prisma.project.findFirst({
            where: { id: input.projectId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
            select: { id: true },
        });
        if (!project) return { ok: false, error: 'Projet introuvable.' };
        projectId = project.id;
    }

    const conversation = await prisma.conversation.create({
        data: {
            type: 'GROUP',
            name,
            description: input.description?.trim() || null,
            projectId,
            createdById: user.id,
            members: {
                create: [{ userId: user.id, role: 'ADMIN' }, ...memberIds.map((userId) => ({ userId }))],
            },
        },
    });
    await createNotifications(memberIds, {
        type: 'MESSAGE',
        message: `${user.firstName} ${user.lastName} vous a ajouté au groupe « ${name} »`,
        link: `/dashboard/messagerie?c=${conversation.id}`,
        projectId,
    });
    return { ok: true, id: conversation.id };
}

// Canal de filière GL / SR : réservé aux encadrants
export async function createChannel(input: {
    name: string;
    track: ChannelTrack;
    description?: string;
}): Promise<Result<{ id: string }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (user.role !== 'ENCADRANT') return { ok: false, error: 'La création de canaux est réservée aux encadrants.' };
    if (input.track !== 'GL' && input.track !== 'SR') return { ok: false, error: 'Choisissez la filière du canal (GL ou SR).' };

    const name = input.name?.trim() ?? '';
    if (name.length < 2 || name.length > 80) return { ok: false, error: 'Le nom du canal doit contenir entre 2 et 80 caractères.' };

    const conversation = await prisma.conversation.create({
        data: {
            type: 'CHANNEL',
            name,
            track: input.track,
            description: input.description?.trim() || null,
            createdById: user.id,
            members: { create: { userId: user.id, role: 'ADMIN' } },
        },
    });
    return { ok: true, id: conversation.id };
}

// ============================================================
// MEMBRES
// ============================================================
export async function joinChannel(conversationId: string): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const channel = await prisma.conversation.findFirst({ where: { id: conversationId, type: 'CHANNEL' }, select: { id: true } });
    if (!channel) return { ok: false, error: 'Canal introuvable.' };

    await prisma.conversationMember.upsert({
        where: { conversationId_userId: { conversationId, userId: user.id } },
        update: {},
        create: { conversationId, userId: user.id },
    });
    return { ok: true };
}

// Ajout de membres à un groupe : réservé aux administrateurs du groupe
export async function addMembers(conversationId: string, userIds: string[]): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const me = await membershipOf(conversationId, user.id);
    if (!me) return NOT_FOUND;
    if (me.conversation.type !== 'GROUP') return { ok: false, error: 'Seuls les groupes acceptent des ajouts de membres.' };
    if (me.role !== 'ADMIN') return { ok: false, error: "Seuls les administrateurs du groupe peuvent ajouter des membres." };

    const ids = [...new Set(userIds)];
    const current = await prisma.conversationMember.count({ where: { conversationId } });
    if (current + ids.length > MAX_GROUP_MEMBERS) return { ok: false, error: `Un groupe compte au maximum ${MAX_GROUP_MEMBERS} membres.` };
    const existing = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true } });

    const already = new Set((await prisma.conversationMember.findMany({ where: { conversationId, userId: { in: existing.map((u) => u.id) } }, select: { userId: true } })).map((m) => m.userId));
    await prisma.conversationMember.createMany({
        data: existing.map((u) => ({ conversationId, userId: u.id })),
        skipDuplicates: true,
    });
    const group = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { name: true, projectId: true } });
    await createNotifications(existing.map((u) => u.id).filter((id) => !already.has(id)), {
        type: 'MESSAGE',
        message: `${user.firstName} ${user.lastName} vous a ajouté au groupe « ${group?.name ?? 'Groupe'} »`,
        link: `/dashboard/messagerie?c=${conversationId}`,
        projectId: group?.projectId,
    }, { excludeUserId: user.id });
    return { ok: true };
}

// Quitter un groupe ou un canal (un message privé ne se quitte pas)
export async function leaveConversation(conversationId: string): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const me = await membershipOf(conversationId, user.id);
    if (!me) return NOT_FOUND;
    if (me.conversation.type === 'DIRECT') return { ok: false, error: 'Une conversation privée ne peut pas être quittée.' };

    await prisma.conversationMember.delete({ where: { id: me.id } });

    const remaining = await prisma.conversationMember.findMany({ where: { conversationId }, orderBy: { joinedAt: 'asc' } });
    if (remaining.length === 0) {
        // Plus personne : la conversation disparaît
        await prisma.conversation.delete({ where: { id: conversationId } });
    } else if (me.role === 'ADMIN' && !remaining.some((m) => m.role === 'ADMIN')) {
        // Le groupe garde toujours un administrateur : le membre le plus ancien prend le relais
        await prisma.conversationMember.update({ where: { id: remaining[0].id }, data: { role: 'ADMIN' } });
    }
    return { ok: true };
}
