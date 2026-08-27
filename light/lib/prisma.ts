// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

// L'adaptateur traduit les requêtes Prisma vers le driver "pg" (node-postgres)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// ✅ Export par défaut (optionnel mais recommandé)
export default prisma;