// app/page.tsx
// PAGE D'ACCUEIL DU SITE (publique)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Award, Building2, Cloud, FileText, Languages, Lightbulb, Menu, Palette, Quote, Rocket, Settings, Sparkles,
  Star, Target, TrendingUp, Users, X, Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo, { LogoMark } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import ProgressRing from "@/components/ui/ProgressRing";

// ============================================================
// DONNÉES
// ============================================================
const STATS = [
  { value: "60%", label: "Des jeunes aspirent à entreprendre" },
  { value: "78%", label: "Échouent par manque d'accompagnement" },
  { value: "15%", label: "Passent à l'acte" },
  { value: "100%", label: "D'ambition à révéler" },
];

const STEPS = [
  { icon: Lightbulb, label: "Idéalisation", desc: "Déposez votre idée et recevez une première estimation IA" },
  { icon: Palette, label: "Conception", desc: "Structurez votre projet avec des outils collaboratifs" },
  { icon: Settings, label: "Développement", desc: "Construisez avec le suivi de votre encadrant" },
  { icon: Rocket, label: "Test", desc: "Validez chaque jalon et préparez le lancement" },
  { icon: Award, label: "Concrétisation", desc: "Lancez votre entreprise avec la communauté" },
];

const FEATURES = [
  { icon: Languages, title: "9 langues", desc: "Guide personnalisé dans votre langue maternelle" },
  { icon: TrendingUp, title: "Prévisions IA", desc: "Estimations budgétaires contextualisées au Cameroun" },
  { icon: FileText, title: "Modèles prêts", desc: "Templates adaptés à votre secteur d'activité" },
  { icon: Users, title: "Collaboration", desc: "Invitez des membres et gérez les rôles en temps réel" },
  { icon: Target, title: "Validation", desc: "Soumettez vos jalons et recevez des feedbacks" },
  { icon: Award, title: "Concrétisation", desc: "Transformez votre projet en entreprise prospère" },
];

const TESTIMONIALS = [
  {
    quote: "J'ai utilisé cette plateforme pour mon projet étudiant, et c'est une véritable révolution. L'estimation IA m'a permis de présenter un business plan solide.",
    author: "Atangana Jacques",
    role: "Étudiant IAI Cameroun",
    stars: 5,
  },
  {
    quote: "En tant qu'encadrant, j'ai enfin une vision claire de l'avancement de tous mes projets. La traçabilité est exemplaire.",
    author: "Kadje Jephte",
    role: "Encadrant académique",
    stars: 5,
  },
  {
    quote: "La plateforme m'a permis de structurer mon idée et de trouver des investisseurs. Je recommande vivement !",
    author: "Mbengue Sarah",
    role: "Porteuse de projet, GreenTech",
    stars: 5,
  },
];

const TRUSTED_BY = [
  { name: "IAI-Cameroun", icon: Building2 },
  { name: "BEONWEB", icon: Cloud },
  { name: "Ministère de l'Enseignement Supérieur", icon: Award },
];

function SectionHeading({ icon: Icon, eyebrow, title, subtitle }: { icon: typeof Zap; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-[12px] font-semibold text-brand-ink ring-1 ring-brand/15 ring-inset">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" /> {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-tight text-ink sm:text-[38px]">{title}</h2>
      {subtitle && <p className="mt-3 text-[16px] leading-relaxed text-ink-muted">{subtitle}</p>}
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Visiteur déjà connecté : on lui propose d'aller directement à son espace
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user)).catch(() => {});
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = (
    <>
      <Link href="#parcours" className="text-[14px] font-medium text-white/75 transition-colors hover:text-white" onClick={() => setIsMenuOpen(false)}>Le parcours</Link>
      <Link href="#fonctionnalites" className="text-[14px] font-medium text-white/75 transition-colors hover:text-white" onClick={() => setIsMenuOpen(false)}>Fonctionnalités</Link>
      <Link href="#temoignages" className="text-[14px] font-medium text-white/75 transition-colors hover:text-white" onClick={() => setIsMenuOpen(false)}>Témoignages</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      {/* ============================================================
          EN-TÊTE ET HERO (bleu nuit)
          ============================================================ */}
      <header className="relative isolate overflow-hidden bg-sidebar pb-24 text-white sm:pb-32">
        <div aria-hidden="true" className="absolute -top-48 left-1/2 -z-10 size-[760px] -translate-x-1/2 rounded-full bg-[#1f4fd8]/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-40 bottom-0 -z-10 size-[460px] rounded-full bg-[#c9993a]/12 blur-3xl" />
        <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full opacity-[0.05]">
          <defs>
            <pattern id="hero-grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M34 0H0V34" fill="none" stroke="white" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* Navigation */}
        <nav className="mx-auto flex h-20 max-w-[1200px] items-center gap-8 px-5 sm:px-8" aria-label="Navigation principale">
          <Link href="/" aria-label="Accueil LIGHT"><Logo /></Link>
          <div className="hidden items-center gap-7 md:flex">{navLinks}</div>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <ThemeToggle className="text-white/70 hover:bg-white/10 hover:text-white" />
            {isLoggedIn ? (
              <Link href="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[13.5px] font-semibold text-[#14244f] transition-transform hover:-translate-y-px">
                Mon espace <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="inline-flex h-10 items-center rounded-xl px-4 text-[13.5px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white">Connexion</Link>
                <Link href="/register" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[13.5px] font-semibold text-[#14244f] transition-transform hover:-translate-y-px">
                  S&apos;inscrire <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </div>
          <button type="button" className="ml-auto inline-flex size-10 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 md:hidden" onClick={() => setIsMenuOpen(true)} aria-label="Ouvrir le menu">
            <Menu className="size-5" />
          </button>
        </nav>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-sidebar px-6 py-5 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" className="inline-flex size-10 items-center justify-center rounded-xl text-white/80 hover:bg-white/10" onClick={() => setIsMenuOpen(false)} aria-label="Fermer le menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-12 flex flex-col gap-6 text-[18px]">{navLinks}</div>
            <div className="mt-auto flex flex-col gap-3">
              {isLoggedIn ? (
                <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-xl bg-white font-semibold text-[#14244f]">Mon espace</Link>
              ) : (
                <>
                  <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-xl bg-white font-semibold text-[#14244f]">S&apos;inscrire</Link>
                  <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-xl font-semibold text-white ring-1 ring-white/25">Connexion</Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 pt-12 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[12.5px] font-semibold text-gold-bright ring-1 ring-white/10">
              <Sparkles className="size-3.5 text-white" strokeWidth={2} aria-hidden="true" /> La plateforme entrepreneuriale pour étudiants
            </span>
            <h1 className="mt-6 font-display text-[40px] leading-[1.05] font-extrabold tracking-tight sm:text-[56px]">
              Un étudiant, un projet,
              <br />
              <span className="bg-[linear-gradient(120deg,#f1d48a,#c9993a)] bg-clip-text text-transparent">une entreprise.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70">
              L&apos;application intelligente qui guide les entrepreneurs de l&apos;idée à la réussite.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[14.5px] font-semibold text-[#14244f] shadow-lg transition-transform hover:-translate-y-px">
                Commençons ! <ArrowRight className="size-[18px]" aria-hidden="true" />
              </Link>
              <Link href="#fonctionnalites" className="inline-flex h-12 items-center rounded-xl px-6 text-[14.5px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10">
                En savoir plus
              </Link>
            </div>
          </div>

          {/* Aperçu de l'interface */}
          <div className="relative hidden animate-rise [animation-delay:120ms] lg:block" aria-hidden="true">
            <div className="absolute -inset-6 rounded-[36px] bg-white/[0.03] ring-1 ring-white/10" />
            <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(118deg,#162f86_0%,#1f4fd8_48%,#3a78f2_100%)] p-6 shadow-2xl">
              <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(236,208,138,0.8),transparent)]" />
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/65 uppercase">Synthèse du projet</p>
              <div className="mt-4 flex items-center gap-4">
                <ProgressRing value={60} size={70} stroke={6} trackClassName="stroke-white/15" barClassName="stroke-white">
                  <span className="font-display text-[15px] font-bold">60%</span>
                </ProgressRing>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-white/65 uppercase">Étape 4 sur 5</p>
                  <p className="font-display text-[19px] font-semibold">Tests</p>
                  <p className="text-[12px] text-white/70">Validée par l&apos;encadrant</p>
                </div>
              </div>
              <div className="mt-5 flex gap-1.5">
                {[1, 1, 1, 0.45, 0.15].map((o, i) => <span key={i} className="h-1.5 flex-1 rounded-full bg-white" style={{ opacity: o }} />)}
              </div>
            </div>
            <div className="relative mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-[20px] bg-white p-4 text-ink shadow-xl">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-subtle uppercase">Encadrant</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name="Marie Ngo" size="md" />
                  <div>
                    <p className="text-[13px] font-semibold">Marie Ngo</p>
                    <p className="flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-3 ${n <= 4 ? "fill-brand text-brand" : "text-line-strong"}`} />)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] bg-white p-4 text-ink shadow-xl">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-subtle uppercase">Mentor IA</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand text-white"><Sparkles className="size-5" /></span>
                  <p className="text-[12.5px] leading-snug text-ink-muted">Analyse de marché prête</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 sm:px-8">
        {/* ===== CHIFFRES ===== */}
        <section className="relative -mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Chiffres clés">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-[22px] border border-line bg-surface p-6 shadow-raised">
              <p className="font-display text-[34px] leading-none font-bold tracking-tight text-brand tabular-nums">{stat.value}</p>
              <p className="mt-2.5 text-[13.5px] leading-snug text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ===== CONFIANCE ===== */}
        <section className="py-14 text-center" aria-label="Ils nous font confiance">
          <p className="text-[11.5px] font-semibold tracking-[0.18em] text-ink-subtle uppercase">Ils nous font confiance</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
            {TRUSTED_BY.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-ink-muted">
                <item.icon className="size-5 text-brand" strokeWidth={1.75} aria-hidden="true" /> {item.name}
              </span>
            ))}
          </div>
        </section>

        {/* ===== PARCOURS ===== */}
        <section id="parcours" className="scroll-mt-8 py-16">
          <SectionHeading icon={Target} eyebrow="Feuille de route" title="Transforme ton idée en plan d'affaires" />
          <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:before:absolute lg:before:top-[44px] lg:before:right-[10%] lg:before:left-[10%] lg:before:h-px lg:before:bg-line">
            {STEPS.map((step, i) => (
              <li key={step.label} className="relative rounded-[22px] border border-line bg-surface p-5 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-raised">
                <span className={`relative mx-auto inline-flex size-14 items-center justify-center rounded-2xl ring-8 ring-canvas ${i === 0 ? "bg-brand text-white shadow-brand" : "bg-brand-soft text-brand-ink"}`}>
                  <step.icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">Étape {i + 1}</p>
                <p className="mt-1 font-display text-[16px] font-semibold text-ink">{step.label}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ===== FONCTIONNALITÉS ===== */}
        <section id="fonctionnalites" className="scroll-mt-8 py-16">
          <SectionHeading icon={Zap} eyebrow="Propulsé par l'IA" title="Construis ton plan plus rapidement" subtitle="L'IA au service de ton projet entrepreneurial" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="group rounded-[22px] border border-line bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-raised">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink transition-colors group-hover:bg-brand group-hover:text-white">
                  <feature.icon className="size-[22px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[17px] font-semibold text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== TÉMOIGNAGES ===== */}
        <section id="temoignages" className="scroll-mt-8 py-16">
          <SectionHeading icon={Users} eyebrow="Témoignages" title="Ce que nos utilisateurs disent" />
          <div className="grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.author} className="flex flex-col rounded-[22px] border border-line bg-surface p-7 shadow-card">
                <Quote className="size-7 text-brand" strokeWidth={1.5} aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-ink">« {t.quote} »</blockquote>
                <div className="mt-5 flex gap-0.5" aria-label={`Note : ${t.stars} sur 5`}>
                  {Array.from({ length: t.stars }, (_, i) => <Star key={i} className="size-4 fill-brand text-brand" aria-hidden="true" />)}
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                  <Avatar name={t.author} size="md" />
                  <span>
                    <span className="block text-[14px] font-semibold text-ink">{t.author}</span>
                    <span className="block text-[12.5px] text-ink-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ===== APPEL À L'ACTION ===== */}
        <section className="py-16">
          <div className="relative isolate overflow-hidden rounded-[30px] bg-[linear-gradient(118deg,#162f86_0%,#1f4fd8_48%,#3a78f2_100%)] px-6 py-14 text-center text-white shadow-[0_24px_60px_-24px_rgba(31,79,216,0.7)] sm:px-12">
            <div aria-hidden="true" className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-[#7fb0ff]/25 blur-3xl" />
            <div aria-hidden="true" className="absolute inset-x-16 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(236,208,138,0.8),transparent)]" />
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-gold-bright ring-1 ring-white/15">
              <Award className="size-3.5" strokeWidth={2} aria-hidden="true" /> Rejoins la communauté
            </span>
            <h2 className="mt-5 font-display text-[30px] font-bold tracking-tight sm:text-[38px]">Prêt à commencer ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-[16px] text-white/75">Rejoins la communauté IAI Entrepreneur et fais briller ton idée</p>
            <Link href="/register" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[14.5px] font-semibold text-[#14244f] shadow-lg transition-transform hover:-translate-y-px">
              S&apos;inscrire gratuitement <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* ===== PIED DE PAGE ===== */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
          <span className="inline-flex items-center gap-3">
            <LogoMark className="size-8" />
            <span className="font-display text-[14px] font-bold tracking-[0.16em] text-ink">LIGHT</span>
          </span>
          <p className="text-[13px] text-ink-subtle">© 2026 IAI Entrepreneur · Plateforme de gestion de projets étudiants</p>
        </div>
      </footer>
    </div>
  );
}
