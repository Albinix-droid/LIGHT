// lib/supabase/admin.ts
// Client Supabase administrateur (clé secrète) : stockage et gestion des comptes, serveur uniquement
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
    if (admin) return admin;
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error('Supabase indisponible : SUPABASE_URL ou SUPABASE_SECRET_KEY manquant.');
    admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return admin;
}
