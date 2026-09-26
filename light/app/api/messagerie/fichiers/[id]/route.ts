// app/api/messagerie/fichiers/[id]/route.ts
// Accès à une pièce jointe : réservé aux membres de la conversation, redirection vers une URL signée temporaire
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { signedFileUrl } from '@/lib/messagerie/storage';
import { IMAGE_MIME_TYPES } from '@/lib/messagerie/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });

    const { id } = await params;
    const attachment = await prisma.messageAttachment.findFirst({
        where: { id, conversation: { members: { some: { userId: user.id } } } },
        select: { path: true, name: true, mimeType: true },
    });
    if (!attachment) return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });

    // Seules les images s'affichent dans le navigateur ; les documents sont toujours téléchargés
    const download = new URL(request.url).searchParams.has('telecharger') || !IMAGE_MIME_TYPES.includes(attachment.mimeType);
    const url = await signedFileUrl(attachment.path, download ? attachment.name : false);
    if (!url) return NextResponse.json({ error: 'Fichier indisponible pour le moment.' }, { status: 502 });

    return NextResponse.redirect(url, {
        status: 302,
        headers: { 'Cache-Control': 'private, max-age=300', 'Referrer-Policy': 'no-referrer' },
    });
}
