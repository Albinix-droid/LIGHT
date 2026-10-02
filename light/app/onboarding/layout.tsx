// app/onboarding/layout.tsx
// Cadre de l'accueil des nouveaux étudiants : barre supérieure sobre et toile claire

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-canvas">
      {/* Halo discret en tête de page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--brand)_12%,transparent),transparent)]" />
      <header className="relative mx-auto flex max-w-[1100px] items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/dashboard" aria-label="LIGHT, tableau de bord">
          <Logo tone="dark" />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative mx-auto max-w-[1100px] px-4 pt-6 pb-16 sm:px-6">{children}</main>
    </div>
  );
}
