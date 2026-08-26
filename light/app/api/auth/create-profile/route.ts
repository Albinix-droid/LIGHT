// app/api/auth/create-profile/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'  
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { userId, email, name } = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }

    const profile = await prisma.user.create({
      data: {
        email,
        name,
        // authId: userId,
      }
    })

    return NextResponse.json(
      { message: 'Profil créé avec succès', profile },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}