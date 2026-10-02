// components/ui/Logo.tsx
// Marque LIGHT : monogramme or (la touche de prestige) + nom

export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(140deg,#f1d48a_0%,#c9993a_55%,#9c7020_100%)] shadow-[0_6px_18px_-6px_rgba(201,153,58,0.65)] ${className}`}
      aria-hidden="true"
    >
      {/* Reflet discret */}
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
      <svg viewBox="0 0 24 24" className="relative size-[55%] text-[#2a1d05]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Rayon de lumière stylisé formant un L */}
        <path d="M8 4v14h9" />
        <path d="M13 4.5l1.2 2.4M17.5 7l-2.2 1.4M19 11.5h-2.5" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

export default function Logo({ compact = false, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-[17px] font-bold tracking-[0.18em] ${tone === "light" ? "text-white" : "text-ink"}`}>LIGHT</span>
          <span className="mt-1 text-[10px] font-medium tracking-[0.16em] text-gold-bright uppercase">IAI Entrepreneur</span>
        </span>
      )}
    </span>
  );
}
