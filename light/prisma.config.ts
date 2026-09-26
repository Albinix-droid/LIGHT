// prisma.config.ts
// Les commandes Prisma (migrate, studio…) utilisent DIRECT_URL quand elle existe :
// une connexion directe / pooler en mode session, nécessaire aux migrations.
// L'application, elle, se connecte via DATABASE_URL (pooler en mode transaction sur Vercel), voir lib/prisma.ts.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',

  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },

  migrations: {
    path: './prisma/migrations',
  },
});
