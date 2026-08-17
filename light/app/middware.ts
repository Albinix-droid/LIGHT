// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Pages publiques
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  // Si non authentifié et essaie d'accéder à une page protégée
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si authentifié et essaie d'accéder à login/register
  if (token && isPublicPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*'],
};