// components/ui/ProjectCover.tsx
// Couverture générée d'un projet : un duo de couleurs et une icône propres à son secteur,
// avec une trame fine et un léger relief. Toujours nette, sans photo générique.

import { Briefcase, Cpu, GraduationCap, HeartPulse, Landmark, ShoppingBag, Sparkles, Sprout, type LucideIcon } from "lucide-react";

const SECTORS: Record<string, { from: string; to: string; icon: LucideIcon }> = {
  tech: { from: "#14244f", to: "#2f5bd3", icon: Cpu },
  agriculture: { from: "#123327", to: "#2c8a5a", icon: Sprout },
  commerce: { from: "#3b220f", to: "#b8742a", icon: ShoppingBag },
  services: { from: "#241d47", to: "#6553c9", icon: Briefcase },
  health: { from: "#3f1626", to: "#b8435f", icon: HeartPulse },
  education: { from: "#0f3340", to: "#2685a1", icon: GraduationCap },
  finance: { from: "#2e240b", to: "#a87c22", icon: Landmark },
  autre: { from: "#1b2233", to: "#4a556b", icon: Sparkles },
};

export function sectorStyle(sector: string | null | undefined) {
  return SECTORS[sector ?? ""] ?? SECTORS.autre;
}

export default function ProjectCover({
  sector,
  title,
  className = "",
}: {
  sector: string | null | undefined;
  title: string;
  className?: string;
}) {
  const { from, to, icon: Icon } = sectorStyle(sector);
  const initial = title.trim()[0]?.toUpperCase() ?? "•";

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      aria-hidden="true"
    >
      {/* Trame fine */}
      <svg className="absolute inset-0 size-full opacity-[0.12]" preserveAspectRatio="none">
        <defs>
          <pattern id="cover-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cover-grid)" />
      </svg>
      {/* Halo lumineux */}
      <div className="absolute -top-1/3 -right-1/4 size-[85%] rounded-full bg-white/15 blur-3xl" />
      {/* Grande initiale en filigrane */}
      <span className="absolute -bottom-6 left-4 font-display text-[110px] leading-none font-extrabold text-white/10 select-none">{initial}</span>
      {/* Icône du secteur */}
      <span className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20 backdrop-blur-sm">
        <Icon className="size-5 text-white" strokeWidth={1.75} />
      </span>
    </div>
  );
}
