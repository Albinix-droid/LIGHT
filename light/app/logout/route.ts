// app/logout/route.ts
// DÉCONNEXION : ferme la session Supabase puis renvoie vers la page de connexion.
// En POST uniquement : un simple lien ou un préchargement ne peut pas déconnecter l'utilisateur.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    // 303 : le navigateur suit la redirection en GET
    return NextResponse.redirect(new URL('/login?deconnecte=1', request.url), { status: 303 });
}
