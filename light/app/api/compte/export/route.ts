// app/api/compte/export/route.ts
// EXPORT DES DONNÉES PERSONNELLES : tout ce que la plateforme conserve sur l'utilisateur, en JSON
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });

    const [projects, requests, notifications, messages, assistant] = await Promise.all([
        prisma.project.findMany({
            where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }, { supervisorId: user.id }] },
            select: {
                id: true, title: true, description: true, sector: true, teamSize: true, stage: true, progress: true, createdAt: true,
                ownerId: true, supervisorId: true,
                members: { select: { role: true, joinedAt: true, user: { select: { firstName: true, lastName: true } } } },
                steps: {
                    select: {
                        stage: true, status: true, data: true, completedAt: true,
                        submissions: { select: { note: true, submittedAt: true, decision: true, feedback: true, rating: true, reviewedAt: true } },
                    },
                },
            },
        }),
        prisma.projectRequest.findMany({
            where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
            select: { type: true, status: true, role: true, message: true, responseMessage: true, createdAt: true, respondedAt: true, project: { select: { title: true } } },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.notification.findMany({
            where: { userId: user.id },
            select: { type: true, message: true, link: true, readAt: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.message.findMany({
            where: { senderId: user.id },
            select: {
                content: true, createdAt: true,
                conversation: { select: { type: true, name: true } },
                attachments: { select: { name: true, mimeType: true, size: true } },
            },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.assistantThread.findMany({
            where: { userId: user.id },
            select: { title: true, createdAt: true, messages: { select: { role: true, content: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
            orderBy: { createdAt: 'asc' },
        }),
    ]);

    const data = {
        exportéLe: new Date().toISOString(),
        profil: {
            prénom: user.firstName, nom: user.lastName, email: user.email, rôle: user.role,
            présentation: user.bio, filière: user.track, photo: user.avatarUrl, inscritLe: user.createdAt,
        },
        projets: projects.map((p) => ({
            ...p,
            maRelation: p.ownerId === user.id ? 'porteur' : p.supervisorId === user.id ? 'encadrant' : 'membre',
        })),
        demandesEtInvitations: requests,
        messagesEnvoyés: messages,
        assistantIA: assistant,
        notifications,
    };

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="light-mes-donnees-${date}.json"`,
            'Cache-Control': 'no-store',
        },
    });
}
