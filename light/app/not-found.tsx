// app/not-found.tsx
// PAGE 404 GÉNÉRALE

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/kit";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-center">
      <LogoMark className="size-12" />
      <p className="mt-8 font-display text-[64px] leading-none font-bold tracking-tight text-brand">404</p>
      <h1 className="mt-3 font-display text-[22px] font-semibold text-ink">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-muted">
        Cette page n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil.
      </p>
      <Link href="/" className={buttonClass("primary", "lg", "mt-7")}><ArrowLeft /> Retour à l&apos;accueil</Link>
    </main>
  );
}
