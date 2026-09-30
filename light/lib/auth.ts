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
const getProfile = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return null;

    // Le profil Prisma utilise le même id que Supabase Auth
    const existing = await prisma.user.findUnique({ where: { id: user.id } });
    if (existing) {
        // Email modifié dans les paramètres puis confirmé : on aligne le profil sur Supabase Auth
        if (existing.email !== user.email) {
            return prisma.user.update({ where: { id: user.id }, data: { email: user.email } }).catch(() => existing);
        }
        return existing;
    }

    const fullName: string = user.user_metadata?.full_name || user.email.split('@')[0];
    const [firstName, ...rest] = fullName.trim().split(/\s+/);

    // Rôle choisi à l'inscription : Encadrant et Administrateur ne sont jamais attribués directement.
    // Le compte démarre en étudiant avec un rôle « en attente », confirmé ensuite avec les
    // identifiants remis par l'école (page /confirmation, lib/staff.ts).
    const requested = user.user_metadata?.role;
    const pendingRole: Role | null = requested === 'ENCADRANT' || requested === 'ADMIN' ? requested : null;

    try {
        return await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                firstName: firstName || fullName,
                lastName: rest.join(' '),
                role: 'STUDENT',
                pendingRole,
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

// Utilisateur connecté, ou null. Un compte suspendu est traité comme déconnecté :
// les pages, les actions serveur et les routes API qui passent par ici lui sont fermées.
export const getCurrentUser = cache(async () => {
    const profile = await getProfile();
    return profile && !profile.suspendedAt ? profile : null;
});

export async function requireUser() {
    const profile = await getProfile();
    if (!profile) redirect('/login');
    if (profile.suspendedAt) redirect('/login?erreur=suspendu');
    return profile;
}

// Espace réservé à un rôle : les autres utilisateurs sont renvoyés vers leur espace.
// Un rôle encadrant / administrateur en attente de confirmation mène d'abord au formulaire.
export async function requireRole(role: Role) {
    const user = await requireUser();
    if (user.role !== role) redirect(homeFor(user));
    return user;
}

export function homeFor(user: { role: Role; pendingRole?: Role | null }) {
    if (user.pendingRole) return '/confirmation';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'ENCADRANT') return '/encadrant';
    return '/dashboard';
}
