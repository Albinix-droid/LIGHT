// app/page.tsx
// PAGE D'ACCUEIL DU SITE (publique)

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Award, Bell, BookOpen, Building2, Check, ChevronDown, CircleHelp, ClipboardCheck, Cloud, FileText, GraduationCap, Inbox,
  KeyRound, Languages, Lightbulb, Menu, MessageCircle, Palette, Quote, Rocket, Send, Settings, ShieldCheck, Sparkles, Star, Target,
  TrendingUp, Users, X, Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo, { LogoMark } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import ProgressRing from "@/components/ui/ProgressRing";
import ProjectCover from "@/components/ui/ProjectCover";
import { SECTOR_LABELS } from "@/lib/parcours";
import HeroBackground from "./_accueil/HeroBackground";
import Reveal from "./_accueil/Reveal";

// ============================================================
// DONNÉES
// ============================================================
const STATS = [
  { value: "60%", label: "Des jeunes aspirent à entreprendre" },
  { value: "78%", label: "Échouent par manque d'accompagnement" },
  { value: "15%", label: "Passent à l'acte" },
  { value: "100%", label: "D'ambition à révéler" },
];

const PILLARS = [
  { icon: Target, title: "Une méthode claire", desc: "Cinq étapes, de l'idée au lancement, avec des critères de validation explicites à chaque palier." },
  { icon: GraduationCap, title: "Un encadrant de l'école", desc: "Chaque étape est soumise à un enseignant qui l'évalue, la note et vous conseille." },
  { icon: Sparkles, title: "Un mentor IA", desc: "Disponible à tout moment pour challenger votre idée, structurer vos réponses et préparer votre pitch." },
];

// Le parcours : contenu fidèle aux formulaires et aux critères de validation de chaque étape
const STEPS = [
  {
    icon: Lightbulb, label: "Idéalisation", image: "/images/accueil/etape-idealisation.jpg", tagline: "Donner forme à l'idée",
    desc: "Posez les fondations : le problème que vous résolvez, votre solution, vos clients et la valeur que vous leur apportez. Le mentor IA vous aide à affûter chaque réponse.",
    items: ["Problème et solution", "Clients cibles et valeur ajoutée", "Modèle de revenus", "Brainstorming en équipe"],
    criteria: ["Un nom de projet", "Une description d'au moins 50 caractères"],
  },
  {
    icon: Palette, label: "Conception", image: "/images/accueil/etape-conception.jpg", tagline: "Concevoir avant de construire",
    desc: "Décrivez ce que fera votre produit, dessinez ses écrans et planifiez le travail. Votre encadrant voit exactement où vous allez.",
    items: ["Spécifications fonctionnelles", "Maquettes et parcours utilisateur", "Architecture technique", "Planification"],
    criteria: ["Les objectifs du projet", "Une fonctionnalité principale", "Une maquette importée"],
  },
  {
    icon: Settings, label: "Développement", image: "/images/accueil/etape-developpement.jpg", tagline: "Construire, pas à pas",
    desc: "Organisez les tâches techniques, reliez votre dépôt de code et documentez au fil de l'eau, jusqu'au déploiement.",
    items: ["Tâches techniques", "Suivi du code", "Documentation", "Déploiement"],
    criteria: ["L'URL du dépôt de code", "Au moins une tâche technique"],
  },
  {
    icon: Rocket, label: "Tests", image: "/images/accueil/etape-tests.jpg", tagline: "Vérifier avec de vrais utilisateurs",
    desc: "Cas de test, retours d'utilisateurs et suivi des bugs : vous arrivez au lancement avec un produit fiable et éprouvé.",
    items: ["Tests fonctionnels", "Tests utilisateurs", "Suivi des bugs", "Qualité"],
    criteria: ["Un cas de test", "Un test réussi", "Tous les bugs résolus"],
  },
  {
    icon: Award, label: "Concrétisation", image: "/images/accueil/etape-concretisation.jpg", tagline: "Lancer l'entreprise",
    desc: "Date de lancement, stratégie de mise sur le marché, indicateurs clés et partenaires : votre projet devient une entreprise.",
    items: ["Lancement officiel", "Stratégie go-to-market", "Partenaires et investisseurs", "Suivi post-lancement"],
    criteria: ["La date de lancement", "L'URL du projet", "Un indicateur clé (KPI)", "Un partenaire ou investisseur"],
  },
];

const MENTOR_POINTS = [
  { icon: Zap, title: "Conseils en temps réel", desc: "Des suggestions dans chaque étape, selon ce que vous avez déjà rempli." },
  { icon: TrendingUp, title: "Prévisions IA", desc: "Estimations budgétaires contextualisées au Cameroun." },
  { icon: Languages, title: "9 langues", desc: "Un guide personnalisé dans votre langue maternelle." },
];

const REVIEW_FLOW = [
  { icon: Send, title: "Vous soumettez", desc: "L'étape terminée part chez votre encadrant, avec un message si vous le souhaitez." },
  { icon: ClipboardCheck, title: "Il examine", desc: "Il relit votre travail, le note sur 5 et rédige un avis argumenté." },
  { icon: Check, title: "Vous avancez", desc: "Étape validée : la suivante s'ouvre. À reprendre : vous savez précisément quoi corriger." },
];

const FEATURES = [
  { icon: Languages, title: "9 langues", desc: "Guide personnalisé dans votre langue maternelle" },
  { icon: TrendingUp, title: "Prévisions IA", desc: "Estimations budgétaires contextualisées au Cameroun" },
  { icon: FileText, title: "Modèles prêts", desc: "Templates adaptés à votre secteur d'activité" },
  { icon: Users, title: "Collaboration", desc: "Invitez des membres et gérez les rôles en temps réel" },
  { icon: Target, title: "Validation", desc: "Soumettez vos jalons et recevez des feedbacks" },
  { icon: Award, title: "Concrétisation", desc: "Transformez votre projet en entreprise prospère" },
  { icon: MessageCircle, title: "Messagerie intégrée", desc: "Échangez avec votre équipe et votre encadrant sans quitter la plateforme" },
  { icon: Bell, title: "Notifications", desc: "Soumissions, avis et invitations : vous êtes prévenu au bon moment" },
  { icon: Inbox, title: "Demandes", desc: "Rejoindre une équipe ou choisir son encadrant, en quelques clics" },
];

const AUDIENCES = [
  {
    image: "/images/accueil/public-etudiants.jpg", icon: Rocket, title: "Étudiants", subtitle: "Porteurs de projet",
    points: ["Créez votre projet et invitez votre équipe", "Avancez étape par étape avec le mentor IA", "Suivez votre progression et vos validations"],
  },
  {
    image: "/images/accueil/public-encadrants.jpg", icon: GraduationCap, title: "Encadrants", subtitle: "Enseignants de l'IAI",
    points: ["Tous vos projets suivis sur un seul tableau", "Une file claire des étapes à valider", "Des avis notés, tracés et partagés"],
  },
  {
    image: "/images/accueil/public-ecole.jpg", icon: ShieldCheck, title: "Administration", subtitle: "Direction de l'école",
    points: ["Identifiants confidentiels pour les encadrants", "Gestion des comptes et des rôles", "Journal d'activité et vue d'ensemble"],
  },
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

const FAQ = [
  {
    q: "Qui peut utiliser LIGHT ?",
    a: "Les étudiants de l'IAI qui portent un projet, seuls ou en équipe, ainsi que les enseignants qui les encadrent et l'administration de l'école.",
  },
  {
    q: "Comment devient-on encadrant ou administrateur ?",
    a: "Après l'inscription, vous confirmez votre rôle avec le matricule et le code confidentiel remis par l'école. Le rôle n'est attribué qu'à ce moment-là.",
  },
  {
    q: "Comment une étape est-elle validée ?",
    a: "Quand les critères de l'étape sont remplis, vous la soumettez à votre encadrant. Il la valide, ou vous demande de la reprendre avec un avis détaillé et une note sur 5.",
  },
  {
    q: "Peut-on préparer une étape à l'avance ?",
    a: "Oui. Toutes les étapes sont consultables et modifiables à tout moment ; seule la soumission suit l'ordre du parcours.",
  },
  {
    q: "Peut-on travailler en équipe ?",
    a: "Oui. Le porteur du projet invite ses coéquipiers, qui contribuent aux étapes et échangent dans la messagerie du projet.",
  },
  {
    q: "Le mentor IA remplace-t-il l'encadrant ?",
    a: "Non. Le mentor IA vous aide à réfléchir et à formuler ; la validation de chaque étape reste celle de votre encadrant.",
  },
];

const NAV = [
  { href: "#mission", label: "Mission" },
  { href: "#parcours", label: "Le parcours" },
  { href: "#mentor", label: "Mentor IA" },
  { href: "#encadrement", label: "Encadrement" },
  { href: "#faq", label: "FAQ" },
];

// ============================================================
// ÉLÉMENTS RÉUTILISÉS
// ============================================================
function Eyebrow({ icon: Icon, children, dark = false }: { icon: typeof Zap; children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold ring-1 ring-inset ${
        dark ? "bg-white/[0.08] text-white ring-white/15" : "bg-brand-soft text-brand-ink ring-brand/15"
      }`}
    >
      <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" /> {children}
    </span>
  );
}

function SectionHeading({ icon, eyebrow, title, subtitle }: { icon: typeof Zap; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <Eyebrow icon={icon}>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-tight text-ink sm:text-[40px]">{title}</h2>
      {subtitle && <p className="mt-4 text-[16.5px] leading-relaxed text-ink-muted">{subtitle}</p>}
    </Reveal>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Visiteur déjà connecté : on lui propose d'aller directement à son espace
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Barre de navigation opaque dès que l'on quitte le haut de page
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const navLinks = NAV.map((link) => (
    <Link key={link.href} href={link.href} className="text-[14px] font-medium text-white/75 transition-colors hover:text-white" onClick={() => setIsMenuOpen(false)}>
      {link.label}
    </Link>
  ));

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas font-sans text-ink">
      {/* ============================================================
          NAVIGATION (fixe, opaque au défilement)
          ============================================================ */}
      <div className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? "bg-sidebar/85 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl" : ""}`}>
        <nav className="mx-auto flex h-20 max-w-[1200px] items-center gap-8 px-5 sm:px-8" aria-label="Navigation principale">
          <Link href="/" aria-label="Accueil LIGHT"><Logo /></Link>
          <div className="hidden items-center gap-7 lg:flex">{navLinks}</div>
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
      </div>

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

      {/* ============================================================
          HERO : slogan sur photos défilantes
          ============================================================ */}
      <header className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-sidebar pt-28 pb-40 text-white sm:pb-48">
        <HeroBackground />

        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="animate-rise">
            <Eyebrow icon={Sparkles} dark>La plateforme entrepreneuriale pour étudiants</Eyebrow>
            <h1 className="mt-6 font-display text-[44px] leading-[1.03] font-extrabold tracking-tight sm:text-[64px]">
              Un étudiant, un projet,
              <br />
              <span className="bg-[linear-gradient(120deg,#f1d48a,#c9993a)] bg-clip-text text-transparent">une entreprise.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[17.5px] leading-relaxed text-white/75">
              L&apos;application intelligente qui guide les entrepreneurs de l&apos;idée à la réussite.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[14.5px] font-semibold text-[#14244f] shadow-lg transition-transform hover:-translate-y-px">
                Commençons ! <ArrowRight className="size-[18px]" aria-hidden="true" />
              </Link>
              <Link href="#parcours" className="inline-flex h-12 items-center rounded-xl px-6 text-[14.5px] font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-white/10">
                Découvrir le parcours
              </Link>
            </div>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6">
              {[["5", "étapes guidées"], ["1", "encadrant de l'école"], ["24 h/24", "mentor IA"]].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-[24px] font-bold">{value}</dd>
                  <dd className="text-[13px] text-white/60">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Aperçu de l'interface */}
          <div className="relative hidden animate-rise [animation-delay:150ms] lg:block" aria-hidden="true">
            <div className="absolute -inset-6 rounded-[36px] bg-white/[0.05] ring-1 ring-white/15 backdrop-blur-md" />
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
              <div className="rounded-[20px] bg-white p-4 text-[#0e1726] shadow-xl">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#8a94a6] uppercase">Encadrant</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name="Marie Ngo" size="md" />
                  <div>
                    <p className="text-[13px] font-semibold">Marie Ngo</p>
                    <p className="flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-3 ${n <= 4 ? "fill-[#1f4fd8] text-[#1f4fd8]" : "text-[#d5dce8]"}`} />)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] bg-white p-4 text-[#0e1726] shadow-xl">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-[#8a94a6] uppercase">Mentor IA</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#1f4fd8] text-white"><Sparkles className="size-5" /></span>
                  <p className="text-[12.5px] leading-snug text-[#556074]">Analyse de marché prête</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          {/* ===== CHIFFRES ===== */}
          <section className="relative z-10 -mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Chiffres clés">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06} className="rounded-[22px] border border-line bg-surface p-6 shadow-raised">
                <p className="font-display text-[36px] leading-none font-bold tracking-tight text-brand tabular-nums">{stat.value}</p>
                <p className="mt-2.5 text-[13.5px] leading-snug text-ink-muted">{stat.label}</p>
              </Reveal>
            ))}
          </section>

          {/* ===== CONFIANCE ===== */}
          <section className="py-16 text-center" aria-label="Ils nous font confiance">
            <p className="text-[11.5px] font-semibold tracking-[0.18em] text-ink-subtle uppercase">Ils nous font confiance</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-14 gap-y-5">
              {TRUSTED_BY.map((item) => (
                <span key={item.name} className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-ink-muted">
                  <item.icon className="size-5 text-brand" strokeWidth={1.75} aria-hidden="true" /> {item.name}
                </span>
              ))}
            </div>
          </section>

          {/* ============================================================
              MISSION
              ============================================================ */}
          <section id="mission" className="scroll-mt-24 py-16 sm:py-24">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
              <Reveal className="relative">
                <div className="relative aspect-[5/6] overflow-hidden rounded-[30px] shadow-raised">
                  <Image src="/images/accueil/ambition.jpg" alt="Une étudiante contemple la ville au crépuscule" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,19,36,0.55))]" />
                </div>
                <div className="absolute -right-3 bottom-10 w-60 rounded-[22px] border border-line bg-surface p-5 shadow-raised sm:-right-8">
                  <p className="font-display text-[34px] leading-none font-bold text-brand">78%</p>
                  <p className="mt-2 text-[13px] leading-snug text-ink-muted">des jeunes porteurs de projet échouent par manque d&apos;accompagnement</p>
                </div>
                <div className="absolute top-8 -left-3 inline-flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 shadow-raised sm:-left-8">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand"><Lightbulb className="size-[18px]" strokeWidth={1.75} /></span>
                  <span className="text-[13px] font-semibold text-ink">L&apos;idée est là.</span>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <Eyebrow icon={Target}>Notre mission</Eyebrow>
                <h2 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-tight text-ink sm:text-[40px]">
                  L&apos;ambition est là. Il manquait le cadre.
                </h2>
                <p className="mt-5 text-[16.5px] leading-relaxed text-ink-muted">
                  60 % des jeunes aspirent à entreprendre, mais seuls 15 % passent à l&apos;acte. LIGHT donne aux étudiants de l&apos;IAI la méthode,
                  l&apos;accompagnement et les outils pour transformer une idée en entreprise, sans rester seuls face aux doutes.
                </p>
                <ul className="mt-8 space-y-5">
                  {PILLARS.map((p) => (
                    <li key={p.title} className="flex gap-4">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                        <p.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-display text-[16px] font-semibold text-ink">{p.title}</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{p.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>

          {/* ============================================================
              PARCOURS DÉTAILLÉ
              ============================================================ */}
          <section id="parcours" className="scroll-mt-24 py-16 sm:py-24">
            <SectionHeading
              icon={Target}
              eyebrow="Feuille de route"
              title="Transforme ton idée en plan d'affaires"
              subtitle="Cinq étapes, chacune validée par votre encadrant. Vous savez toujours où vous en êtes, et ce qu'il reste à faire."
            />

            {/* Sommaire des étapes */}
            <Reveal className="mb-16 flex flex-wrap justify-center gap-2">
              {STEPS.map((step, i) => (
                <a key={step.label} href={`#etape-${i + 1}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-semibold text-ink shadow-card transition-colors hover:border-brand/40 hover:text-brand">
                  <span className="font-display text-[12px] text-brand tabular-nums">0{i + 1}</span> {step.label}
                </a>
              ))}
            </Reveal>

            <ol className="space-y-20 sm:space-y-28">
              {STEPS.map((step, i) => {
                const flip = i % 2 === 1;
                return (
                  <li key={step.label} id={`etape-${i + 1}`} className="scroll-mt-28 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <Reveal className={`relative ${flip ? "lg:order-2" : ""}`}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] shadow-raised">
                        <Image src={step.image} alt="" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(11,19,36,0.15)_0%,rgba(11,19,36,0.65)_100%)]" />
                        <span className="absolute bottom-5 left-6 font-display text-[88px] leading-none font-extrabold text-white/90">0{i + 1}</span>
                        <span className="absolute top-5 right-5 inline-flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md">
                          <step.icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                        </span>
                      </div>
                    </Reveal>

                    <Reveal delay={0.1} className={flip ? "lg:order-1" : ""}>
                      <p className="text-[12px] font-semibold tracking-[0.16em] text-gold uppercase">Étape {i + 1} · {step.label}</p>
                      <h3 className="mt-3 font-display text-[28px] leading-tight font-bold tracking-tight text-ink sm:text-[34px]">{step.tagline}</h3>
                      <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">{step.desc}</p>

                      <p className="mt-7 text-[12px] font-semibold tracking-[0.12em] text-ink-subtle uppercase">Ce que vous préparez</p>
                      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {step.items.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-[14.5px] text-ink">
                            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                              <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-7 rounded-2xl border border-line bg-surface p-4 shadow-card">
                        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                          <ClipboardCheck className="size-4 text-brand" strokeWidth={1.75} aria-hidden="true" /> Pour soumettre l&apos;étape
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.criteria.map((c) => (
                            <span key={c} className="rounded-full bg-surface-muted px-3 py-1 text-[12.5px] font-medium text-ink-muted ring-1 ring-line ring-inset">{c}</span>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* ============================================================
            MENTOR IA (bande bleu nuit)
            ============================================================ */}
        <section id="mentor" className="relative isolate scroll-mt-20 overflow-hidden bg-sidebar py-20 text-white sm:py-28">
          <div aria-hidden="true" className="absolute -top-40 -left-40 -z-10 size-[620px] rounded-full bg-[#1f4fd8]/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-40 -bottom-40 -z-10 size-[460px] rounded-full bg-[#3a78f2]/20 blur-3xl" />
          <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Eyebrow icon={Sparkles} dark>Propulsé par l&apos;IA</Eyebrow>
              <h2 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-tight sm:text-[40px]">Un mentor IA, à vos côtés à chaque étape</h2>
              <p className="mt-5 text-[16.5px] leading-relaxed text-white/70">
                Posez vos questions comme à un coach : le mentor IA analyse votre projet, vous suggère des pistes et vous aide à formuler
                clairement vos idées, à toute heure.
              </p>
              <ul className="mt-9 space-y-6">
                {MENTOR_POINTS.map((point) => (
                  <li key={point.title} className="flex gap-4">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                      <point.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-display text-[16px] font-semibold">{point.title}</p>
                      <p className="mt-1 text-[14px] leading-relaxed text-white/65">{point.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.12} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] ring-1 ring-white/10">
                <Image src="/images/accueil/mentor.jpg" alt="Une étudiante travaille sur sa tablette" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,19,36,0.1),rgba(11,19,36,0.55))]" />
              </div>
              {/* Conversation d'exemple */}
              <div className="relative -mt-24 ml-auto w-[92%] space-y-3 rounded-[24px] border border-white/10 bg-[#0f1a30]/90 p-5 shadow-2xl backdrop-blur-xl sm:-mt-32 sm:w-[82%]" aria-label="Exemple d'échange avec le mentor IA">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#1f4fd8] px-4 py-3 text-[13.5px] leading-relaxed">
                  Mon idée : une appli qui relie les agriculteurs aux acheteurs de Douala. Par où commencer ?
                </div>
                <div className="flex gap-3">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(140deg,#4d7cff,#1f4fd8)] text-white">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                  <div className="rounded-2xl rounded-tl-md bg-white/[0.07] px-4 py-3 text-[13.5px] leading-relaxed text-white/85">
                    Précisez d&apos;abord le problème : quelles pertes subissent aujourd&apos;hui les agriculteurs ? Puis identifions vos premiers clients et
                    ce qu&apos;ils paieraient pour ce service.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-11">
                  {["Analyse de marché", "Reformuler", "Estimer un budget"].map((chip) => (
                    <span key={chip} className="rounded-full bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/75 ring-1 ring-white/10">{chip}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          {/* ============================================================
              ENCADREMENT
              ============================================================ */}
          <section id="encadrement" className="scroll-mt-24 py-20 sm:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
              <Reveal className="relative lg:order-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[30px] shadow-raised">
                  <Image src="/images/accueil/validation.jpg" alt="Un encadrant félicite une porteuse de projet" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
                </div>
                {/* Avis d'exemple */}
                <div className="absolute -bottom-10 -left-3 w-[300px] rounded-[22px] border border-line bg-surface p-5 shadow-raised sm:-left-10">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[11.5px] font-semibold text-success ring-1 ring-success/15 ring-inset">
                      <Check className="size-3" strokeWidth={2.5} aria-hidden="true" /> Étape validée
                    </span>
                    <span className="flex gap-0.5" aria-label="4 sur 5">
                      {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-3.5 ${n <= 4 ? "fill-brand text-brand" : "text-line-strong"}`} aria-hidden="true" />)}
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink">« Maquettes claires et objectifs bien posés. Pensez à prioriser les fonctionnalités pour la suite. »</p>
                  <div className="mt-3 flex items-center gap-2.5 border-t border-line pt-3">
                    <Avatar name="Marie Ngo" size="sm" />
                    <span className="text-[12.5px] font-semibold text-ink">Marie Ngo</span>
                    <span className="text-[12px] text-ink-subtle">· Encadrante</span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1} className="lg:order-1">
                <Eyebrow icon={GraduationCap}>Encadrement</Eyebrow>
                <h2 className="mt-4 font-display text-[30px] leading-tight font-bold tracking-tight text-ink sm:text-[40px]">Un encadrant de l&apos;école à chaque étape</h2>
                <p className="mt-5 text-[16.5px] leading-relaxed text-ink-muted">
                  Votre projet n&apos;avance jamais à l&apos;aveugle. Un enseignant de l&apos;IAI suit votre progression et valide chaque palier : un regard expert,
                  et une trace de tout le chemin parcouru.
                </p>
                <ol className="mt-9 space-y-0">
                  {REVIEW_FLOW.map((step, i) => (
                    <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
                      {i < REVIEW_FLOW.length - 1 && <span aria-hidden="true" className="absolute top-12 bottom-1 left-[21px] w-px bg-line-strong" />}
                      <span className={`relative inline-flex size-11 shrink-0 items-center justify-center rounded-2xl ${i === 2 ? "bg-brand text-white shadow-brand" : "bg-brand-soft text-brand"}`}>
                        <step.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div className="pt-1">
                        <p className="font-display text-[16px] font-semibold text-ink">{step.title}</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </section>

          {/* ============================================================
              FONCTIONNALITÉS
              ============================================================ */}
          <section id="fonctionnalites" className="scroll-mt-24 py-16 sm:py-24">
            <SectionHeading icon={Zap} eyebrow="Fonctionnalités" title="Construis ton plan plus rapidement" subtitle="L'IA au service de ton projet entrepreneurial, et tous les outils pour avancer en équipe." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <Reveal key={feature.title} delay={(i % 3) * 0.06} className="group rounded-[22px] border border-line bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:shadow-raised">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <feature.icon className="size-[22px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-[17px] font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{feature.desc}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============================================================
              POUR QUI
              ============================================================ */}
          <section id="publics" className="scroll-mt-24 py-16 sm:py-24">
            <SectionHeading icon={Users} eyebrow="Pour qui ?" title="Un espace pensé pour chacun" subtitle="Étudiants, encadrants et administration travaillent sur la même plateforme, chacun avec ses outils." />
            <div className="grid gap-6 lg:grid-cols-3">
              {AUDIENCES.map((a, i) => (
                <Reveal key={a.title} delay={i * 0.08} as="article" className="group flex flex-col overflow-hidden rounded-[26px] border border-line bg-surface shadow-card transition-shadow hover:shadow-raised">
                  <div className="relative h-52 overflow-hidden">
                    <Image src={a.image} alt="" fill sizes="(max-width: 1024px) 100vw, 380px" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(11,19,36,0.75))]" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-3 text-white">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-md">
                        <a.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-display text-[18px] font-semibold">{a.title}</span>
                        <span className="block text-[12.5px] text-white/75">{a.subtitle}</span>
                      </span>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-3 p-6">
                    {a.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-[14px] leading-relaxed text-ink">
                        <Check className="mt-1 size-4 shrink-0 text-brand" strokeWidth={2.25} aria-hidden="true" /> {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-[13.5px] leading-relaxed text-ink-muted shadow-card">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden="true" />
              Les rôles d&apos;encadrant et d&apos;administrateur sont confirmés avec les identifiants confidentiels remis par l&apos;école : personne ne peut s&apos;attribuer ces accès seul.
            </Reveal>
          </section>

          {/* ============================================================
              SECTEURS
              ============================================================ */}
          <section className="py-16 sm:py-24" aria-labelledby="secteurs-titre">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <Eyebrow icon={BookOpen}>Tous les secteurs</Eyebrow>
                <h2 id="secteurs-titre" className="mt-4 font-display text-[30px] leading-tight font-bold tracking-tight text-ink sm:text-[36px]">Chaque idée a sa place</h2>
                <p className="mt-3 text-[16px] leading-relaxed text-ink-muted">Technologie, agriculture, santé, éducation… LIGHT accompagne les projets de tous les domaines.</p>
              </div>
              <Link href="/register" className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand hover:text-brand-strong">
                Lancer mon projet <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Object.entries(SECTOR_LABELS).map(([key, label], i) => (
                <Reveal key={key} delay={(i % 4) * 0.05} className="group relative h-40 overflow-hidden rounded-[22px] shadow-card sm:h-48">
                  <ProjectCover sector={key} className="h-full transition-transform duration-700 group-hover:scale-[1.05]" />
                  <span className="absolute bottom-4 left-4 font-display text-[16px] font-semibold text-white">{label}</span>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ============================================================
              TÉMOIGNAGES
              ============================================================ */}
          <section id="temoignages" className="scroll-mt-24 py-16 sm:py-24">
            <SectionHeading icon={MessageCircle} eyebrow="Témoignages" title="Ce que nos utilisateurs disent" />
            <div className="grid gap-5 lg:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.author} delay={i * 0.08} as="figure" className="flex flex-col rounded-[22px] border border-line bg-surface p-7 shadow-card">
                  <Quote className="size-7 text-brand" strokeWidth={1.5} aria-hidden="true" />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">« {t.quote} »</blockquote>
                  <div className="mt-5 flex gap-0.5" aria-label={`Note : ${t.stars} sur 5`}>
                    {Array.from({ length: t.stars }, (_, k) => <Star key={k} className="size-4 fill-brand text-brand" aria-hidden="true" />)}
                  </div>
                  <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                    <Avatar name={t.author} size="md" />
                    <span>
                      <span className="block text-[14px] font-semibold text-ink">{t.author}</span>
                      <span className="block text-[12.5px] text-ink-muted">{t.role}</span>
                    </span>
                  </figcaption>
                </Reveal>
              ))}
            </div>
          </section>
        </div>

        {/* ============================================================
            COMMUNAUTÉ (photo pleine largeur)
            ============================================================ */}
        <section className="relative isolate overflow-hidden py-28 text-white sm:py-36">
          <Image src="/images/accueil/communaute.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(11,19,36,0.92)_0%,rgba(22,47,134,0.78)_55%,rgba(31,79,216,0.55)_100%)]" />
          <Reveal className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-2xl">
              <Eyebrow icon={Award} dark>Rejoins la communauté</Eyebrow>
              <h2 className="mt-5 font-display text-[34px] leading-tight font-bold tracking-tight sm:text-[48px]">Prêt à faire briller ton idée ?</h2>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/80">Rejoins la communauté IAI Entrepreneur et fais briller ton idée</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[14.5px] font-semibold text-[#14244f] shadow-lg transition-transform hover:-translate-y-px">
                  S&apos;inscrire gratuitement <ArrowRight className="size-[18px]" aria-hidden="true" />
                </Link>
                <Link href="/login" className="inline-flex h-12 items-center rounded-xl px-6 text-[14.5px] font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10">
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ============================================================
            FAQ
            ============================================================ */}
        <section id="faq" className="mx-auto max-w-[860px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeading icon={CircleHelp} eyebrow="Questions fréquentes" title="Tout ce qu'il faut savoir" />
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.04}>
                <details className="group rounded-[20px] border border-line bg-surface shadow-card open:shadow-raised">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[15.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="size-5 shrink-0 text-ink transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="-mt-1 px-6 pb-5 text-[14.5px] leading-relaxed text-ink-muted">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      {/* ============================================================
          PIED DE PAGE
          ============================================================ */}
      <footer className="bg-sidebar text-white">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/60">
              La plateforme de l&apos;incubateur de l&apos;IAI Cameroun : de l&apos;idée à l&apos;entreprise, avec un encadrant de l&apos;école et un mentor IA.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold tracking-[0.14em] text-white/45 uppercase">Découvrir</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-[14px] text-white/75 transition-colors hover:text-white">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold tracking-[0.14em] text-white/45 uppercase">Votre compte</p>
            <ul className="mt-4 space-y-2.5">
              {[["/register", "Créer un compte"], ["/login", "Se connecter"], ["/mot-de-passe-oublie", "Mot de passe oublié"]].map(([href, label]) => (
                <li key={href}><Link href={href} className="text-[14px] text-white/75 transition-colors hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
            <span className="inline-flex items-center gap-3">
              <LogoMark className="size-7" />
              <span className="font-display text-[13px] font-bold tracking-[0.16em]">LIGHT</span>
            </span>
            <p className="text-[12.5px] text-white/50">© 2026 IAI Entrepreneur · Plateforme de gestion de projets étudiants · Photos : Unsplash</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
