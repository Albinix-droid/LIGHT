// app/layout.tsx
// LAYOUT RACINE : polices, thème clair / sombre, métadonnées

import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/components/ui/theme";
import "./globals.css";

// Texte courant
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Titres et chiffres clés : géométrique, élégante, très lisible
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: { default: "LIGHT · IAI Entrepreneur", template: "%s · LIGHT" },
  description: "La plateforme qui accompagne les étudiants entrepreneurs de l'IAI, de l'idée jusqu'à l'entreprise.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5fa" },
    { media: "(prefers-color-scheme: dark)", color: "#090e19" },
  ],
};

// Appliqué avant le premier affichage : pas de flash de thème clair en mode sombre
const themeScript = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
