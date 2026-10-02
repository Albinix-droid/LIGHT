// components/AuthShell.tsx
// CADRE DES PAGES D'AUTHENTIFICATION : panneau de marque bleu nuit à gauche, formulaire clair à droite.
// Les classes .auth-* (champ, bouton, message, lien) sont partagées par connexion, inscription,
// confirmation, mot de passe oublié et réinitialisation.

import Link from "next/link";
import { Code, Lightbulb, PenTool, Rocket, Shield } from "lucide-react";
import Logo, { LogoMark } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

const STEPS = [
  { icon: Lightbulb, label: "Idéalisation" },
  { icon: PenTool, label: "Conception" },
  { icon: Code, label: "Développement" },
  { icon: Shield, label: "Tests" },
  { icon: Rocket, label: "Concrétisation" },
];

export default function AuthShell({
  title,
  subtitle,
  children,
  maxWidth = 440,
  footer,
  eyebrow,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
  // Remplace le lien « Retour à la connexion » (ex. formulaire de confirmation, déjà connecté)
  footer?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="grid min-h-screen bg-canvas font-sans text-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-[560px_minmax(0,1fr)]">
      <style>{`
        .auth-label { display: block; color: var(--ink); font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        .auth-input {
          width: 100%; height: 48px; padding: 0 16px; border-radius: 12px; box-sizing: border-box; outline: none;
          background: var(--surface); color: var(--ink); border: 1px solid var(--line); font-size: 15px; font-family: inherit;
          box-shadow: inset 0 1px 1px rgba(16,24,40,0.03); transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        textarea.auth-input { height: auto; padding: 12px 16px; }
        .auth-input:hover { border-color: var(--line-strong); }
        .auth-input:focus { border-color: var(--brand); box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand) 12%, transparent); }
        .auth-input::placeholder { color: var(--ink-subtle); }
        .auth-button {
          width: 100%; height: 50px; border: none; border-radius: 12px; cursor: pointer; font-family: inherit;
          background: var(--brand); color: #fff; font-size: 15px; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: var(--shadow-brand); transition: background-color 0.15s ease, transform 0.15s ease;
        }
        .auth-button:hover:not(:disabled) { background: var(--brand-strong); transform: translateY(-1px); }
        .auth-button:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
        .auth-message { margin-bottom: 18px; padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.55; }
        .auth-error { background: var(--danger-soft); color: var(--danger); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--danger) 18%, transparent); }
        .auth-success { background: var(--success-soft); color: var(--success); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--success) 18%, transparent); }
        .auth-link { color: var(--brand); text-decoration: none; font-weight: 600; }
        .auth-link:hover { color: var(--brand-strong); text-decoration: underline; text-underline-offset: 3px; }
      `}</style>

      {/* ===== PANNEAU DE MARQUE ===== */}
      <aside className="relative isolate hidden overflow-hidden bg-sidebar px-12 py-12 text-white lg:flex lg:flex-col xl:px-14">
        <div aria-hidden="true" className="absolute -top-40 -left-24 -z-10 size-[520px] rounded-full bg-[#1f4fd8]/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-32 -bottom-40 -z-10 size-[420px] rounded-full bg-[#c9993a]/15 blur-3xl" />
        <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full opacity-[0.05]">
          <defs>
            <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="white" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
        <div aria-hidden="true" className="absolute inset-y-16 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(214,178,94,0.5),transparent)]" />

        <Link href="/" aria-label="Accueil LIGHT" className="w-fit">
          <Logo />
        </Link>

        <div className="my-auto max-w-md py-12">
          <p className="text-[12px] font-semibold tracking-[0.22em] text-gold-bright uppercase">Incubateur de l&apos;IAI Cameroun</p>
          <h2 className="mt-5 font-display text-[38px] leading-[1.12] font-bold tracking-tight">
            De l&apos;idée à l&apos;entreprise, un parcours d&apos;excellence.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/65">
            Chaque projet progresse en cinq étapes, validées par un encadrant de l&apos;école et éclairées par un mentor IA.
          </p>

          <ol className="mt-10 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.label} className="flex items-center gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                  <s.icon className="size-[18px] text-white/85" strokeWidth={1.75} />
                </span>
                <span className="text-[14px] text-white/80">
                  <span className="mr-2 font-semibold text-gold-bright tabular-nums">0{i + 1}</span>
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-[12px] text-white/40">© 2026 LIGHT · IAI Entrepreneur</p>
      </aside>

      {/* ===== FORMULAIRE ===== */}
      <main className="relative flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Accueil LIGHT" className="lg:hidden">
            <span className="inline-flex items-center gap-3">
              <LogoMark />
              <span className="font-display text-[16px] font-bold tracking-[0.18em] text-ink">LIGHT</span>
            </span>
          </Link>
          <ThemeToggle className="ml-auto" />
        </div>

        <div className="mx-auto flex w-full flex-1 flex-col justify-center py-10 animate-rise" style={{ maxWidth }}>
          {eyebrow && <p className="text-[12px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">{eyebrow}</p>}
          <h1 className="mt-2 font-display text-[30px] leading-tight font-bold tracking-tight text-ink sm:text-[34px]">{title}</h1>
          <div className="mt-3 mb-8 text-[14.5px] leading-relaxed text-ink-muted">{subtitle}</div>
          {children}
          {footer ?? (
            <p className="mt-8 text-center text-[14px] text-ink-muted">
              <Link href="/login" className="auth-link">← Retour à la connexion</Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
