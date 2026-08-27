// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware'; // 

export async function proxy(request: NextRequest) {
    //  Ne pas bloquer les routes API
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // ✅ Routes publiques
    const publicRoutes = ['/', '/login', '/register', '/auth'];
    if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        return NextResponse.next();
    }

    //  Appeler updateSession (exporté)
    return await updateSession(request);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};