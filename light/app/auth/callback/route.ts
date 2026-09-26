// app/auth/callback/route.ts
// RETOUR DES LIENS ENVOYÉS PAR EMAIL (réinitialisation du mot de passe, confirmation d'adresse)
// Supabase renvoie un `code` à échanger contre une session, puis on redirige vers `next`.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';
    // Redirection interne uniquement (pas de « //site-externe »)
    const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(new URL(safeNext, request.url));
    }

    return NextResponse.redirect(new URL('/login?erreur=lien', request.url));
}
