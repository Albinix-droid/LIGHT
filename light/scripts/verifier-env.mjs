// scripts/verifier-env.mjs
// Vérifie les variables d'environnement avant le build (npm run build).
// Sur Vercel, une variable obligatoire manquante arrête le déploiement avec un message clair,
// au lieu de produire un site qui plante à la première connexion.
// En local, les variables sont lues dans .env puis .env.local ; les manques ne sont que signalés.
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const onVercel = !!process.env.VERCEL;
const production = process.env.VERCEL_ENV === 'production';

const REQUIRED = {
    NEXT_PUBLIC_SUPABASE_URL: 'URL du projet Supabase',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'clé publique Supabase (anon / publishable)',
    SUPABASE_SECRET_KEY: 'clé secrète Supabase (pièces jointes, photos de profil, suspension de comptes)',
    DATABASE_URL: 'connexion PostgreSQL (pooler en mode transaction, port 6543)',
};
const OPTIONAL = {
    GEMINI_API_KEY: "le mentor IA affichera « non configuré »",
    DIRECT_URL: 'uniquement nécessaire pour lancer les migrations (npm run db:migrate)',
};

const errors = [];
const warnings = [];

for (const [name, description] of Object.entries(REQUIRED)) {
    if (!process.env[name]?.trim()) errors.push(`${name} est manquante : ${description}`);
}
for (const [name, consequence] of Object.entries(OPTIONAL)) {
    if (!process.env[name]?.trim()) warnings.push(`${name} est absente : ${consequence}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
if (url && !/^https:\/\/.+/.test(url)) errors.push('NEXT_PUBLIC_SUPABASE_URL doit commencer par https://');

const database = process.env.DATABASE_URL?.trim();
if (database) {
    try {
        const parsed = new URL(database);
        if (!/^postgres(ql)?:$/.test(parsed.protocol)) errors.push('DATABASE_URL doit commencer par postgresql://');
        // En serverless, le mode session (5432) ouvre une connexion par instance et sature vite le pooler Supabase
        if (onVercel && parsed.hostname.includes('pooler.supabase.com') && parsed.port !== '6543') {
            (production ? errors : warnings).push(
                `DATABASE_URL utilise le port ${parsed.port || '5432'} : sur Vercel, utilisez le pooler en mode transaction (port 6543, avec ?pgbouncer=true)`,
            );
        }
    } catch {
        errors.push("DATABASE_URL n'est pas une URL valide (caractères spéciaux du mot de passe à encoder ?)");
    }
}

const secret = process.env.SUPABASE_SECRET_KEY?.trim();
if (secret && secret === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    errors.push('SUPABASE_SECRET_KEY contient la clé publique : utilisez la clé secrète (service_role)');
}

for (const w of warnings) console.warn(`⚠ ${w}`);

if (errors.length) {
    for (const e of errors) console.error(`✖ ${e}`);
    if (onVercel) {
        console.error('\nAjoutez ces variables dans Vercel → Project Settings → Environment Variables, puis redéployez.');
        process.exit(1);
    }
    console.warn('\nBuild local poursuivi malgré tout : complétez .env.local (voir .env.example).');
} else {
    console.log('✔ Variables d’environnement vérifiées');
}
