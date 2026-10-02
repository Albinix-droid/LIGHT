// app/dashboard/_home/HomeView.tsx
// Vue de l'accueil étudiant (sans accès aux données) : utilisée par app/dashboard/page.tsx

import Link from "next/link";
import { ArrowRight, Compass, Lightbulb, PenTool, Code, Shield, Rocket, Plus, Sparkles } from "lucide-react";
import { STAGES } from "@/lib/parcours";
import type { StudentHome } from "@/lib/dashboard/queries";
import SummaryBanner from "./SummaryBanner";
import ActivityCalendar from "./ActivityCalendar";
import TeamCard from "./TeamCard";
import ActionsCard from "./ActionsCard";
import ProjectsGrid from "./ProjectsGrid";

const STAGE_ICONS = [Lightbulb, PenTool, Code, Shield, Rocket];

// Heure de Douala sur 24 h (« fr-FR » renverrait « 10 h », illisible comme nombre)
function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Africa/Douala" }).format(now));
  return hour >= 5 && hour < 18 ? "Bonjour" : "Bonsoir";
}

export default function HomeView({ firstName, home, serverNow }: { firstName: string; home: StudentHome | null; serverNow: number }) {
  const now = new Date(serverNow);
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" }).format(now);

  // ===== PREMIER PROJET =====
  if (!home) {
    return (
      <div className="mx-auto max-w-[1180px] animate-rise">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-sidebar px-6 py-14 text-center text-white shadow-raised sm:px-12 sm:py-20">
          <div aria-hidden="true" className="absolute -top-32 left-1/2 -z-10 size-[520px] -translate-x-1/2 rounded-full bg-[#1f4fd8]/35 blur-3xl" />
          <div aria-hidden="true" className="absolute inset-x-16 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(236,208,138,0.8),transparent)]" />
          <p className="text-[12px] font-semibold tracking-[0.2em] text-gold-bright uppercase">{today}</p>
          <h1 className="mt-4 font-display text-[32px] leading-tight font-bold tracking-tight sm:text-[40px]">
            Bienvenue, {firstName}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">
            Donnez vie à votre idée. LIGHT vous accompagne en cinq étapes, avec votre encadrant et un mentor IA, jusqu&apos;à la création de votre entreprise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/projets/nouveau" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-brand-strong shadow-lg transition-transform hover:-translate-y-px">
              <Plus className="size-4" strokeWidth={2.25} /> Créer mon projet
            </Link>
            <Link href="/dashboard/invitations" className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10">
              <Compass className="size-4" /> Rejoindre une équipe
            </Link>
          </div>
        </section>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s, i) => {
            const Icon = STAGE_ICONS[i];
            return (
              <li key={s.slug} className="rounded-[20px] border border-line bg-surface p-5 shadow-card">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase">Étape {i + 1}</p>
                <p className="mt-1 font-display text-[16px] font-semibold text-ink">{s.label}</p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const { featured } = home;

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* ===== EN-TÊTE ===== */}
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">{today}</p>
          <h1 className="mt-1.5 font-display text-[28px] leading-tight font-bold tracking-tight text-ink sm:text-[32px]">
            {greeting(now)}, {firstName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/dashboard/assistant?projet=${featured.id}`}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-[13px] font-semibold text-ink shadow-card transition-colors hover:border-gold/60"
          >
            <Sparkles className="size-4 text-brand" strokeWidth={1.75} /> Mentor IA
          </Link>
          <Link
            href="/dashboard/projets/nouveau"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white shadow-brand transition-colors hover:bg-brand-strong"
          >
            <Plus className="size-4" strokeWidth={2.25} /> Nouveau projet
          </Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ===== COLONNE PRINCIPALE ===== */}
        <div className="min-w-0 space-y-8">
          <div className="animate-rise [animation-delay:60ms]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-[20px] font-semibold tracking-tight text-ink">Synthèse du projet</h2>
              {home.projects.length > 1 && (
                <nav aria-label="Projet affiché" className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 shadow-card">
                  {home.projects.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/dashboard?projet=${p.id}`}
                      aria-current={p.id === featured.id ? "true" : undefined}
                      className={`max-w-[180px] truncate rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                        p.id === featured.id ? "bg-brand text-white" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                      }`}
                    >
                      {p.title}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
            <SummaryBanner project={featured} />
          </div>

          <div className="animate-rise [animation-delay:120ms]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[20px] font-semibold tracking-tight text-ink">Activité du parcours</h2>
              <Link href={`/dashboard/projets/${featured.id}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-strong">
                Voir le projet <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="rounded-[22px] border border-line bg-surface p-5 shadow-card sm:p-6">
              <ActivityCalendar events={home.activity} serverNow={serverNow} />
            </div>
          </div>
        </div>

        {/* ===== COLONNE LATÉRALE ===== */}
        <aside className="space-y-6 animate-rise [animation-delay:180ms]">
          <TeamCard contacts={home.contacts} projectId={featured.id} />
          <ActionsCard items={home.actionItems} notifications={home.notifications} serverNow={serverNow} />
        </aside>
      </div>

      <div className="animate-rise [animation-delay:240ms]">
        <ProjectsGrid projects={home.projects} />
      </div>
    </div>
  );
}
