// app/api/auth/create-profile/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, email, name } = body

    console.log('📝 Données reçues:', { userId, email, name })

    // 1. Vérifier que l'utilisateur est authentifié
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error(' Erreur auth:', userError)
      return NextResponse.json(
        { message: 'Erreur d\'authentification' },
        { status: 401 }
      )
    }

    if (!user || user.id !== userId) {
      console.error('Utilisateur non authentifié:', { user, userId })
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }

    console.log('✅ Utilisateur authentifié:', user.id)

    // 2. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('ℹ️ Utilisateur existe déjà:', existingUser.id)
      return NextResponse.json({
        message: 'Utilisateur déjà existant',
        user: existingUser
      })
    }

    // 3. Créer le profil dans la base de données
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        // Si tu as un champ authId
        // authId: userId,
        isActive: true,
        role: 'ETUDIANT',
      }
    })

    console.log('✅ Utilisateur créé dans la base:', newUser.id)

    return NextResponse.json(
      { message: 'Profil créé avec succès', user: newUser },
      { status: 201 }
    )

  } catch (error: any) {
    console.error(' Erreur création profil:', error)
    return NextResponse.json(
      { 
        message: error.message || 'Erreur lors de la création du profil',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}