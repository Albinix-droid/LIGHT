// lib/prisma.ts
import { PrismaClient, Prisma } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Empreinte du schéma : liste des modèles et de leurs champs, telle que générée par `prisma generate`
const schemaFingerprint = JSON.stringify(
    Object.entries(Prisma).filter(([key]) => key === 'ModelName' || key.endsWith('ScalarFieldEnum')),
);

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
    prismaFingerprint: string | undefined;
};

function createClient() {
    // L'adaptateur traduit les requêtes Prisma vers le driver "pg" (node-postgres)
    // Sur Vercel, chaque instance de fonction a son propre pool : on le garde petit pour ne pas saturer
    // le pooler Supabase (DATABASE_URL doit pointer vers le mode transaction, port 6543).
    const serverless = !!process.env.VERCEL;
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: Number(process.env.DATABASE_POOL_MAX) || (serverless ? 3 : 10),
        idleTimeoutMillis: serverless ? 5_000 : 30_000,
        connectionTimeoutMillis: 10_000,
    });
    return new PrismaClient({ adapter });
}

// En développement, le client est gardé entre deux rechargements pour ne pas multiplier les connexions.
// S'il a été créé avec un ancien schéma (après une migration + `prisma generate`), on le remplace :
// sinon les nouveaux modèles seraient `undefined` tant que `npm run dev` n'est pas relancé.
const cached = globalForPrisma.prismaFingerprint === schemaFingerprint ? globalForPrisma.prisma : undefined;
if (!cached && globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => {});
}

export const prisma = cached ?? createClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.prismaFingerprint = schemaFingerprint;
}

export default prisma;
