// lib/demandes/actions.ts
// SERVER ACTIONS - DEMANDES ET INVITATIONS
// Invitation dans une équipe, demande pour rejoindre un projet, demande d'encadrement.
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notify } from '@/lib/accompagnement';
import { listDiscoverableProjects } from './queries';
import {
    INVITABLE_ROLES, MAX_REQUEST_MESSAGE, TEAM_ROLE_LABELS,
    type DiscoverProject, type InvitableRole, type Result, type StudentOption,
} from './types';

const NOT_LOGGED = { ok: false as const, error: 'Session expirée. Veuillez vous reconnecter.' };

const cleanMessage = (m?: string) => m?.trim().slice(0, MAX_REQUEST_MESSAGE) || null;
const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`.trim();

function refresh() {
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/encadrant', 'layout');
}

async function ownedProject(projectId: string, userId: string) {
    return prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
}

// ============================================================
// INVITER UN ÉTUDIANT DANS SON ÉQUIPE (porteur du projet)
// ============================================================
export async function sendProjectInvitation(input: {
    projectId: string;
    userId: string;
    role: InvitableRole;
    message?: string;
}): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;

    const project = await ownedProject(input.projectId, user.id);
    if (!project) return { ok: false, error: "Seul le porteur du projet peut inviter des membres." };
    if (!INVITABLE_ROLES.includes(input.role)) return { ok: false, error: 'Rôle invalide.' };

    const invitee = await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true, role: true } });
    if (!invitee || invitee.id === user.id) return { ok: false, error: 'Utilisateur introuvable.' };
    if (invitee.role !== 'STUDENT') return { ok: false, error: "Seuls les étudiants peuvent être invités dans une équipe. Pour un encadrant, envoyez une demande d'encadrement." };

    const [member, pending] = await Promise.all([
        prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: project.id, userId: invitee.id } } }),
        prisma.projectRequest.findFirst({
            where: {
                projectId: project.id, status: 'PENDING',
                OR: [
                    { type: 'PROJECT_INVITATION', recipientId: invitee.id },
                    { type: 'JOIN_REQUEST', senderId: invitee.id },
                ],
            },
        }),
    ]);
    if (member) return { ok: false, error: 'Cette personne fait déjà partie de l’équipe.' };
    if (pending?.type === 'PROJECT_INVITATION') return { ok: false, error: 'Une invitation est déjà en attente pour cette personne.' };
    if (pending?.type === 'JOIN_REQUEST') {
        return { ok: false, error: 'Cette personne a déjà demandé à rejoindre le projet : acceptez sa demande dans « Demandes & invitations ».' };
    }

    await prisma.projectRequest.create({
        data: {
            type: 'PROJECT_INVITATION', projectId: project.id, senderId: user.id, recipientId: invitee.id,
            role: input.role, message: cleanMessage(input.message),
        },
    });
    await notify([invitee.id], {
        projectId: project.id,
        type: 'INVITATION',
        message: `${fullName(user)} vous invite à rejoindre le projet « ${project.title} » (${TEAM_ROLE_LABELS[input.role]})`,
        link: '/dashboard/invitations',
    });
    refresh();
    return { ok: true };
}

// ============================================================
// DEMANDER À REJOINDRE UN PROJET (étudiant)
// ============================================================
export async function requestToJoinProject(input: { projectId: string; message?: string }): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (user.role !== 'STUDENT') return { ok: false, error: 'Seuls les étudiants peuvent rejoindre une équipe projet.' };

    const project = await prisma.project.findUnique({ where: { id: input.projectId } });
    if (!project) return { ok: false, error: 'Projet introuvable.' };
    if (project.ownerId === user.id) return { ok: false, error: 'Vous êtes déjà le porteur de ce projet.' };

    const [member, pending] = await Promise.all([
        prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: project.id, userId: user.id } } }),
        prisma.projectRequest.findFirst({
            where: {
                projectId: project.id, status: 'PENDING',
                OR: [
                    { type: 'JOIN_REQUEST', senderId: user.id },
                    { type: 'PROJECT_INVITATION', recipientId: user.id },
                ],
            },
        }),
    ]);
    if (member) return { ok: false, error: 'Vous faites déjà partie de cette équipe.' };
    if (pending?.type === 'JOIN_REQUEST') return { ok: false, error: 'Votre demande est déjà en attente.' };
    if (pending?.type === 'PROJECT_INVITATION') return { ok: false, error: 'Le porteur vous a déjà invité : acceptez son invitation dans « Reçues ».' };

    await prisma.projectRequest.create({
        data: {
            type: 'JOIN_REQUEST', projectId: project.id, senderId: user.id, recipientId: project.ownerId,
            role: 'MEMBER', message: cleanMessage(input.message),
        },
    });
    await notify([project.ownerId], {
        projectId: project.id,
        type: 'INVITATION',
        message: `${fullName(user)} demande à rejoindre votre projet « ${project.title} »`,
        link: '/dashboard/invitations',
    });
    refresh();
    return { ok: true };
}

// ============================================================
// DEMANDER UN ENCADRANT (porteur du projet)
// ============================================================
export async function requestSupervision(input: { projectId: string; encadrantId: string; message?: string }): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;

    const project = await ownedProject(input.projectId, user.id);
    if (!project) return { ok: false, error: "Seul le porteur du projet peut demander un encadrant." };
    if (project.supervisorId === input.encadrantId) return { ok: false, error: 'Cet encadrant suit déjà votre projet.' };

    const encadrant = await prisma.user.findUnique({ where: { id: input.encadrantId }, select: { id: true, role: true } });
    if (!encadrant || encadrant.role !== 'ENCADRANT') return { ok: false, error: 'Encadrant invalide.' };

    // Une seule demande d'encadrement à la fois : la nouvelle remplace la précédente
    await prisma.projectRequest.updateMany({
        where: { projectId: project.id, type: 'SUPERVISION_REQUEST', status: 'PENDING' },
        data: { status: 'CANCELLED', respondedAt: new Date() },
    });
    await prisma.projectRequest.create({
        data: {
            type: 'SUPERVISION_REQUEST', projectId: project.id, senderId: user.id, recipientId: encadrant.id,
            message: cleanMessage(input.message),
        },
    });
    await notify([encadrant.id], {
        projectId: project.id,
        type: 'INVITATION',
        message: `${fullName(user)} vous demande d'encadrer le projet « ${project.title} »`,
        link: '/encadrant/demandes',
    });
    refresh();
    return { ok: true };
}

// ============================================================
// RÉPONDRE À UNE DEMANDE (destinataire)
// ============================================================
export async function respondToRequest(input: {
    requestId: string;
    accept: boolean;
    responseMessage?: string;
    role?: InvitableRole; // demande pour rejoindre : rôle attribué par le porteur
}): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;

    const request = await prisma.projectRequest.findUnique({ where: { id: input.requestId }, include: { project: true } });
    if (!request || request.recipientId !== user.id) return { ok: false, error: 'Demande introuvable.' };
    if (request.status !== 'PENDING') return { ok: false, error: 'Cette demande a déjà reçu une réponse ou a été annulée.' };

    const responseMessage = cleanMessage(input.responseMessage);
    const { project } = request;

    if (input.accept) {
        if (request.type === 'PROJECT_INVITATION' || request.type === 'JOIN_REQUEST') {
            // Le nouveau membre est l'invité (invitation) ou le demandeur (demande pour rejoindre)
            const newMemberId = request.type === 'PROJECT_INVITATION' ? request.recipientId : request.senderId;
            const role = request.type === 'JOIN_REQUEST' && input.role && INVITABLE_ROLES.includes(input.role)
                ? input.role
                : (request.role && request.role !== 'OWNER' ? request.role : 'MEMBER');
            if (request.type === 'JOIN_REQUEST' && project.ownerId !== user.id) {
                return { ok: false, error: "Seul le porteur du projet peut accepter cette demande." };
            }
            await prisma.$transaction([
                prisma.projectMember.upsert({
                    where: { projectId_userId: { projectId: project.id, userId: newMemberId } },
                    update: {},
                    create: { projectId: project.id, userId: newMemberId, role },
                }),
                prisma.projectRequest.update({
                    where: { id: request.id },
                    data: { status: 'ACCEPTED', responseMessage, respondedAt: new Date(), role },
                }),
                // Les autres demandes en attente entre ces deux personnes pour ce projet n'ont plus d'objet
                prisma.projectRequest.updateMany({
                    where: {
                        id: { not: request.id }, projectId: project.id, status: 'PENDING',
                        OR: [
                            { type: 'PROJECT_INVITATION', recipientId: newMemberId },
                            { type: 'JOIN_REQUEST', senderId: newMemberId },
                        ],
                    },
                    data: { status: 'CANCELLED', respondedAt: new Date() },
                }),
            ]);
        } else {
            // Demande d'encadrement : pas de changement d'encadrant pendant qu'une étape attend sa décision
            const underReview = await prisma.projectStep.count({ where: { projectId: project.id, status: 'SUBMITTED' } });
            if (underReview > 0 && project.supervisorId && project.supervisorId !== user.id) {
                return { ok: false, error: "Une étape de ce projet est en cours d'examen par son encadrant actuel. Réessayez après sa décision." };
            }
            await prisma.$transaction([
                prisma.project.update({ where: { id: project.id }, data: { supervisorId: user.id } }),
                prisma.projectRequest.update({
                    where: { id: request.id },
                    data: { status: 'ACCEPTED', responseMessage, respondedAt: new Date() },
                }),
            ]);
        }
    } else {
        await prisma.projectRequest.update({
            where: { id: request.id },
            data: { status: 'DECLINED', responseMessage, respondedAt: new Date() },
        });
    }

    const verdict = input.accept ? 'accepté' : 'décliné';
    const what = request.type === 'PROJECT_INVITATION'
        ? `votre invitation à rejoindre « ${project.title} »`
        : request.type === 'JOIN_REQUEST'
            ? `votre demande pour rejoindre « ${project.title} »`
            : `d'encadrer votre projet « ${project.title} »`;
    await notify([request.senderId], {
        projectId: project.id,
        type: 'INVITATION',
        message: `${fullName(user)} a ${verdict} ${what}`,
        link: input.accept ? `/dashboard/projets/${project.id}` : '/dashboard/invitations',
    });

    refresh();
    return { ok: true };
}

// ============================================================
// ANNULER UNE DEMANDE ENVOYÉE (expéditeur)
// ============================================================
export async function cancelRequest(requestId: string): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    const { count } = await prisma.projectRequest.updateMany({
        where: { id: requestId, senderId: user.id, status: 'PENDING' },
        data: { status: 'CANCELLED', respondedAt: new Date() },
    });
    if (!count) return { ok: false, error: 'Cette demande ne peut plus être annulée.' };
    refresh();
    return { ok: true };
}

// ============================================================
// ÉQUIPE : retirer un membre (porteur) ou quitter le projet (membre)
// ============================================================
export async function removeTeamMember(projectId: string, memberId: string): Promise<Result> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return { ok: false, error: 'Projet introuvable.' };
    const leaving = memberId === user.id;
    if (!leaving && project.ownerId !== user.id) return { ok: false, error: "Seul le porteur du projet peut retirer un membre." };
    if (memberId === project.ownerId) return { ok: false, error: "Le porteur du projet ne peut pas quitter son propre projet." };

    const { count } = await prisma.projectMember.deleteMany({ where: { projectId, userId: memberId } });
    if (!count) return { ok: false, error: "Cette personne ne fait pas partie de l'équipe." };

    await notify([leaving ? project.ownerId : memberId], {
        projectId,
        type: 'SYSTEM',
        message: leaving
            ? `${fullName(user)} a quitté votre projet « ${project.title} »`
            : `${fullName(user)} vous a retiré de l'équipe du projet « ${project.title} »`,
        link: leaving ? `/dashboard/projets/${projectId}` : '/dashboard/projets',
    });
    refresh();
    return { ok: true };
}

// ============================================================
// RECHERCHES
// ============================================================

// Étudiants invitables dans un projet (ni membres, ni déjà invités)
export async function searchStudentsForProject(projectId: string, query: string): Promise<Result<{ students: StudentOption[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    if (!(await ownedProject(projectId, user.id))) return { ok: false, error: 'Projet introuvable.' };
    const q = query.trim();
    if (q.length < 2) return { ok: true, students: [] };

    const rows = await prisma.user.findMany({
        where: {
            role: 'STUDENT',
            id: { not: user.id },
            memberships: { none: { projectId } },
            requestsReceived: { none: { projectId, type: 'PROJECT_INVITATION', status: 'PENDING' } },
            OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
            ],
        },
        select: { id: true, firstName: true, lastName: true, email: true },
        orderBy: { lastName: 'asc' },
        take: 10,
    });
    return { ok: true, students: rows.map((u) => ({ id: u.id, name: fullName(u), email: u.email })) };
}

export async function searchDiscoverableProjects(query: string): Promise<Result<{ projects: DiscoverProject[] }>> {
    const user = await getCurrentUser();
    if (!user) return NOT_LOGGED;
    return { ok: true, projects: await listDiscoverableProjects(user.id, query) };
}
