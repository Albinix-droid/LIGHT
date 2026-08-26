// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Créer le pool de connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Créer l'adapter
const adapter = new PrismaPg(pool)

// Créer le client Prisma avec l'adapter
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma