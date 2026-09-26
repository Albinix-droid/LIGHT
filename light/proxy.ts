// proxy.ts (ex-middleware.ts, renommé en Next.js 16)
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Anciennes adresses et variantes courantes des pages d'authentification
// (comparaison exacte, sensible à la casse : pas de boucle de redirection)
const ALIASES: Record<string, string> = {
    '/Login': '/login',
    '/connexion': '/login',
    '/Register': '/register',
    '/inscription': '/register',
};

export async function proxy(request: NextRequest) {
    //  Ne pas bloquer les routes API
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const alias = ALIASES[request.nextUrl.pathname];
    if (alias) {
        const url = request.nextUrl.clone();
        url.pathname = alias;
        return NextResponse.redirect(url);
    }

    // Rafraîchit la session Supabase sur toutes les pages et protège les espaces privés
    return await updateSession(request);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
