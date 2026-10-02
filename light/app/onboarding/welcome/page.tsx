// app/onboarding/welcome/page.tsx
// ACCUEIL DU NOUVEL ÉTUDIANT : présentation du questionnaire de démarrage

import Link from "next/link";
import { ArrowRight, BarChart3, Brain, ChevronRight, Clock, Rocket, Shield, Sparkles, Star, Target, Users } from "lucide-react";
import { Badge, buttonClass, Card, IconTile } from "@/components/ui/kit";

export const metadata = { title: "Bienvenue" };

const STEPS = [
  { icon: Brain, label: "Ton profil", desc: "Qui es-tu ? Étudiant, entrepreneur, porteur de projet ?" },
  { icon: Target, label: "Ton projet", desc: "Quelle est ton idée ? Dans quel secteur ?" },
  { icon: BarChart3, label: "Tes objectifs", desc: "Quels sont tes buts ? Court, moyen, long terme ?" },
  { icon: Users, label: "Ton équipe", desc: "Es-tu seul ou accompagné ?" },
];

const BENEFITS = [
  { icon: Rocket, label: "Accélération", desc: "Gagne du temps avec un plan personnalisé" },
  { icon: Clock, label: "Gain de temps", desc: "Ne pars pas de zéro, utilise nos modèles" },
  { icon: Star, label: "Pertinence", desc: "Des recommandations adaptées à ton profil" },
  { icon: Shield, label: "Confidentialité", desc: "Tes données sont sécurisées" },
];

export default function WelcomePage() {
  return (
    <div className="animate-rise">
      {/* ===== EN-TÊTE ===== */}
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="gold" icon={Sparkles}>Bienvenue dans LIGHT</Badge>
        <h1 className="mt-5 font-display text-[34px] leading-[1.1] font-bold tracking-tight text-ink sm:text-[46px]">
          Prêt à faire briller ton idée ?
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-muted sm:text-[17px]">
          Pour te proposer un environnement parfaitement adapté à tes besoins, nous avons besoin de mieux te connaître.
        </p>
      </div>

      {/* ===== ÉTAPES DU QUESTIONNAIRE ===== */}
      <section aria-labelledby="steps-title" className="mt-12">
        <h2 id="steps-title" className="mb-4 text-center font-display text-[18px] font-semibold text-ink">Voici ce qui t&apos;attend</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Card as="li" key={step.label} className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised">
              <div className="flex items-center justify-between">
                <IconTile icon={step.icon} />
                <span className="font-display text-[13px] font-semibold text-ink-subtle tabular-nums">0{index + 1}</span>
              </div>
              <p className="mt-4 text-[15px] font-semibold text-ink">{step.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{step.desc}</p>
            </Card>
          ))}
        </ol>
      </section>

      {/* ===== BÉNÉFICES ===== */}
      <section aria-labelledby="benefits-title" className="mt-10">
        <Card className="bg-[linear-gradient(135deg,#0b1324_0%,#14244f_60%,#1f4fd8_130%)] !border-transparent text-white">
          <h2 id="benefits-title" className="font-display text-[17px] font-semibold">Pourquoi ce questionnaire ?</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.label} className="flex gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-bright ring-1 ring-white/10">
                  <b.icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold">{b.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-white/65">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ===== ACTIONS ===== */}
      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <p className="max-w-md text-[14px] text-ink-muted">
          Cela prendra environ <strong className="font-semibold text-ink">5 minutes</strong> et permettra de personnaliser ton expérience.
        </p>
        <div className="flex flex-col-reverse items-center gap-3 sm:flex-row">
          <Link href="/dashboard" className={buttonClass("ghost", "lg")}>
            Passer pour l&apos;instant <ArrowRight />
          </Link>
          <Link href="/onboarding/questionnaire" className={buttonClass("primary", "lg", "px-7")}>
            Commencer le questionnaire <ChevronRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
