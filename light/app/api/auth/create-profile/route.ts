// app/api/auth/create-profile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
    try {
        const { userId, email, fullName } = await request.json();

        //  Vérifier que userId existe
        if (!userId || !email) {
            return NextResponse.json(
                { error: 'userId et email sont requis' },
                { status: 400 }
            );
        }

        // ✅ Vérifier que l'utilisateur existe dans Supabase Auth
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Utilisateur non authentifié' },
                { status: 401 }
            );
        }

        // ✅ Vérifier que l'userId correspond à l'utilisateur connecté
        if (user.id !== userId) {
            return NextResponse.json(
                { error: 'Utilisateur non autorisé' },
                { status: 403 }
            );
        }

        // ✅ Créer le profil dans Prisma
        const profile = await prisma.user.create({
            data: {
                id: userId,
                email: email,
                name: fullName || email.split('@')[0],
            },
        });

        return NextResponse.json(
            { 
                message: 'Profil créé avec succès',
                profile 
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Erreur création profil:', error);
        
        //  Gérer les erreurs de duplication
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { error: 'Un profil existe déjà pour cet utilisateur' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Erreur lors de la création du profil' },
            { status: 500 }
        );
    }
    
}