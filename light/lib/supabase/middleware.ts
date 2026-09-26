// lib/supabase/middleware.ts
// Rafraîchit la session Supabase à chaque requête et protège les espaces privés
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PRIVATE_PREFIXES = ['/dashboard', '/encadrant'];
// Pages réservées aux visiteurs non connectés
const GUEST_ONLY = ['/login', '/register'];

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // ✅ Rafraîchir la session
    const { data: { user } } = await supabase.auth.getUser();
    const { pathname, search } = request.nextUrl;

    // Une redirection doit conserver les cookies de session rafraîchis
    const redirectTo = (target: string) => {
        const url = new URL(target, request.url);
        const response = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
        return response;
    };

    // 🔒 Espaces privés : connexion requise, en gardant la page demandée
    if (!user && PRIVATE_PREFIXES.some((p) => pathname.startsWith(p))) {
        return redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`);
    }

    // ✅ Déjà connecté : pas besoin des pages de connexion / inscription
    // (le layout du dashboard renvoie ensuite les encadrants vers /encadrant)
    if (user && GUEST_ONLY.includes(pathname)) {
        return redirectTo('/dashboard');
    }

    return supabaseResponse;
}

export default updateSession;
