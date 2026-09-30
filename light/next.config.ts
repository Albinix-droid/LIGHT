// next.config.ts
import type { NextConfig } from "next";

// Sous Windows, le terminal de VS Code démarre parfois dans « c:\… » (lecteur en minuscule) :
// Turbopack ne retrouve alors plus le paquet next (« Next.js package not found »).
const projectRoot = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());

const nextConfig: NextConfig = {
  // En local, un package-lock.json dans un dossier parent tromperait Next.js sur la racine du projet.
  // Sur Vercel, la racine est déjà fixée (outputFileTracingRoot) : les deux réglages entreraient en conflit.
  ...(process.env.VERCEL ? {} : { turbopack: { root: projectRoot } }),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Anciennes URLs du dashboard, renommées
  async redirects() {
    return [
      { source: "/dashboard/Assistant_IA", destination: "/dashboard/assistant", permanent: false },
      { source: "/dashboard/amis_invit", destination: "/dashboard/invitations", permanent: false },
      { source: "/dashboard/notification", destination: "/dashboard/notifications", permanent: false },
      { source: "/dashboard/profil", destination: "/dashboard/parametres", permanent: false },
    ];
  },
  experimental: {
    serverActions: {
      // Les maquettes de l'étape Conception sont envoyées en data URL.
      // Vercel refuse toute requête de plus de 4,5 Mo : inutile d'autoriser davantage.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;