// middleware.ts (version avancée)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // Pages publiques
  const publicPages = ['/', '/login', '/register', '/forgot-password']
  const isPublicPage = publicPages.includes(pathname)
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname)

  // Routes admin (protégées)
  const isAdminRoute = pathname.startsWith('/dashboard/admin')
  const isEncadrantRoute = pathname.startsWith('/dashboard/encadrant')
  const isEtudiantRoute = pathname.startsWith('/dashboard/etudiant')

  // Si non authentifié
  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si authentifié sur login/register
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si route admin, vérifier le rôle (optionnel)
  if (session && isAdminRoute) {
    // Récupérer le rôle de l'utilisateur depuis la base
    // Si pas admin, rediriger vers /dashboard
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/profile/:path*',
  ],
}