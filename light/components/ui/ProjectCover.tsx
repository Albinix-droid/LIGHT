// components/ui/ProjectCover.tsx
// Couverture d'un projet : photo douce propre à son secteur (public/images/couvertures),
// sous un voile bleu nuit commun pour garder l'unité de la charte, et l'icône du secteur.

import Image from "next/image";
import { Briefcase, Cpu, GraduationCap, HeartPulse, Landmark, ShoppingBag, Sparkles, Sprout, type LucideIcon } from "lucide-react";

const SECTORS: Record<string, { image: string; icon: LucideIcon }> = {
  tech: { image: "/images/couvertures/tech.jpg", icon: Cpu },
  agriculture: { image: "/images/couvertures/agriculture.jpg", icon: Sprout },
  commerce: { image: "/images/couvertures/commerce.jpg", icon: ShoppingBag },
  services: { image: "/images/couvertures/services.jpg", icon: Briefcase },
  health: { image: "/images/couvertures/health.jpg", icon: HeartPulse },
  education: { image: "/images/couvertures/education.jpg", icon: GraduationCap },
  finance: { image: "/images/couvertures/finance.jpg", icon: Landmark },
  autre: { image: "/images/couvertures/autre.jpg", icon: Sparkles },
};

export function sectorStyle(sector: string | null | undefined) {
  return SECTORS[sector ?? ""] ?? SECTORS.autre;
}

export default function ProjectCover({
  sector,
  className = "",
  variant = "cover",
}: {
  sector: string | null | undefined;
  title?: string;
  className?: string;
  // tile : petite vignette carrée (listes), icône du secteur centrée
  variant?: "cover" | "tile";
}) {
  const { image, icon: Icon } = sectorStyle(sector);

  if (variant === "tile") {
    return (
      <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-sidebar ${className}`} aria-hidden="true">
        <Image src={image} alt="" fill sizes="64px" className="object-cover" />
        <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,19,36,0.55),rgba(31,79,216,0.55))]" />
        <Icon className="relative size-[45%] text-white" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <div className={`relative isolate overflow-hidden bg-sidebar ${className}`} aria-hidden="true">
      <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="-z-10 object-cover" />
      {/* Voile : léger en haut, plus dense en bas pour les étiquettes posées dessus */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,19,36,0.05)_0%,rgba(11,19,36,0.25)_55%,rgba(11,19,36,0.7)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(31,79,216,0.18),transparent_60%)]" />
      {/* Icône du secteur */}
      <span className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-md">
        <Icon className="size-5 text-white" strokeWidth={1.75} />
      </span>
    </div>
  );
}
