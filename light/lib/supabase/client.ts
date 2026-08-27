// lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error(
            'Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
    }

    return createBrowserClient(url, anonKey);
}