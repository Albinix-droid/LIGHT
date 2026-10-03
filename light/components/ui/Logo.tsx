// components/ui/Logo.tsx
// Marque LIGHT : l'ampoule dorée (l'idée), l'Afrique et la route qui monte vers la réussite
"use client";

import { useId } from "react";

const AFRICA = "M22.42 11.45 L28.47 11.00 L28.77 12.32 L32.17 12.81 L34.06 13.04 L35.95 13.19 L36.93 13.27 L37.54 14.21 L38.03 15.91 L38.71 17.80 L39.54 19.09 L40.90 20.60 L44.00 20.52 L43.32 22.34 L41.73 24.23 L40.30 25.55 L39.62 26.49 L39.47 27.55 L39.92 28.95 L39.92 30.65 L38.03 31.97 L37.76 32.47 L37.99 33.67 L36.93 34.81 L36.33 36.24 L35.19 37.30 L34.29 37.83 L32.17 38.13 L31.57 37.83 L30.81 35.79 L30.09 33.30 L29.07 31.41 L29.60 28.31 L29.22 27.21 L28.17 24.83 L28.28 23.47 L27.83 23.24 L26.88 23.36 L25.90 22.56 L24.54 22.90 L23.10 22.98 L21.78 23.32 L20.53 22.60 L19.62 21.77 L18.94 20.83 L18.04 19.43 L18.57 18.18 L18.38 17.05 L19.13 15.12 L20.99 13.49 L21.74 12.28 Z";
const ROAD = "M26.5 45.5 C 27 39, 31 34.5, 33.4 28 L 35 22.5";
const HEAD = "M29.8 23.4 L 36 12.8 L 41 24.6 Z";

export function LogoMark({ className = "size-10", glow = true }: { className?: string; glow?: boolean }) {
  // Identifiants propres à chaque logo : plusieurs logos cohabitent sur une même page
  const id = useId().replace(/:/g, "");
  const gold = `url(#${id}g)`;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${glow ? "drop-shadow-[0_0_10px_rgba(230,190,90,0.45)]" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}g`} x1="14" y1="6" x2="50" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6dd8f" />
          <stop offset="0.5" stopColor="#d9a93c" />
          <stop offset="1" stopColor="#a87422" />
        </linearGradient>
        {/* L'Afrique est percée par la route et la flèche */}
        <mask id={`${id}a`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <path d={ROAD} stroke="#000" strokeWidth="6.4" strokeLinecap="round" />
          <path d={HEAD} fill="#000" stroke="#000" strokeWidth="2.4" strokeLinejoin="round" />
        </mask>
        {/* La route n'est dessinée que par ses deux bords */}
        <mask id={`${id}r`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <path d={ROAD} stroke="#000" strokeWidth="3" />
        </mask>
      </defs>
      <path
        d="M24.5 46.5 C24.5 40.5 13.5 36.5 13.5 24.5 A18.5 18.5 0 0 1 50.5 24.5 C50.5 36.5 39.5 40.5 39.5 46.5"
        stroke={gold}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d={AFRICA} fill={gold} mask={`url(#${id}a)`} />
      <path d={ROAD} stroke={gold} strokeWidth="5" mask={`url(#${id}r)`} />
      <path d={ROAD} stroke={gold} strokeWidth="0.9" strokeDasharray="1.8 1.8" />
      <path d={HEAD} fill={gold} />
      <rect x="23.5" y="49" width="17" height="3" rx="1.5" fill={gold} />
      <rect x="24.5" y="53.5" width="15" height="3" rx="1.5" fill={gold} />
      <path d="M27 58 H37 A5 5 0 0 1 27 58 Z" fill={gold} />
    </svg>
  );
}

export default function Logo({ compact = false, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="size-12" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-[17px] font-bold tracking-[0.18em] ${tone === "light" ? "text-white" : "text-ink"}`}>LIGHT</span>
          <span className={`mt-1 text-[10px] font-medium tracking-[0.16em] uppercase ${tone === "light" ? "text-gold-bright" : "text-gold"}`}>IAI Entrepreneur</span>
        </span>
      )}
    </span>
  );
}
