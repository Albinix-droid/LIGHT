// lib/auth.ts
// Utilisateur courant : session Supabase + profil Prisma synchronisé
import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { Prisma, type Role } from '@/lib/generated/prisma/client';

// cache() : un seul appel par requête, partagé entre layout, page et actions.
// Sans lui, layout et page créaient le profil en parallèle à la première connexion
// (erreur « Unique constraint failed on User_email_key »).
export const getCurrentUser = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return null;

    // Le profil Prisma utilise le même id que Supabase Auth
    const existing = await prisma.user.findUnique({ where: { id: user.id } });
    if (existing) return existing;

    const fullName: string = user.user_metadata?.full_name || user.email.split('@')[0];
    const [firstName, ...rest] = fullName.trim().split(/\s+/);

    // Rôle choisi à l'inscription : seuls Étudiant et Encadrant sont auto-déclarables (jamais ADMIN).
    // Appliqué uniquement à la création du profil ; ensuite le rôle se gère en base (npm run role).
    const role: Role = user.user_metadata?.role === 'ENCADRANT' ? 'ENCADRANT' : 'STUDENT';

    try {
        return await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                firstName: firstName || fullName,
                lastName: rest.join(' '),
                role,
            },
        });
    } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error;

        // Une requête concurrente vient de créer le profil : on le relit
        const created = await prisma.user.findUnique({ where: { id: user.id } });
        if (created) return created;

        // Même email sous un ancien identifiant (compte Supabase supprimé puis recréé) :
        // on rattache le profil existant ; ses projets suivent grâce aux clés ON UPDATE CASCADE.
        return prisma.user.update({ where: { email: user.email }, data: { id: user.id } });
    }
});

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');
    return user;
}

// Espace réservé à un rôle : les autres utilisateurs sont renvoyés vers leur espace
export async function requireRole(role: Role) {
    const user = await requireUser();
    if (user.role !== role) redirect(homeFor(user.role));
    return user;
}

export function homeFor(role: Role) {
    return role === 'ENCADRANT' ? '/encadrant' : '/dashboard';
}
