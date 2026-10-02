// app/admin/page.tsx
// VUE D'ENSEMBLE DE L'ADMINISTRATION : utilisateurs, confirmations en attente, projets, activité récente

import Link from "next/link";
import {
  AlertTriangle, ArrowRight, CheckSquare, FolderKanban, GraduationCap, KeyRound, ScrollText, ShieldCheck, UserCheck, UserX, Users,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin/queries";
import { requestTime } from "@/lib/dashboard/queries";
import { STAGES } from "@/lib/parcours";
import Avatar from "@/components/ui/Avatar";
import { Card, CardHeader, ProgressBar, StatCard, buttonClass } from "@/components/ui/kit";
import { formatDateTime, roleBadge } from "./format";

export default async function AdminHomePage() {
  const user = await requireRole("ADMIN");
  const o = await getAdminOverview();
  const now = new Date(requestTime());
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" }).format(now);
  const maxStage = Math.max(1, ...STAGES.map((s) => o.projects.byStage[s.stage] ?? 0));

  const alerts = [
    o.pendingStaffCount > 0 && {
      href: "/admin/utilisateurs?filtre=pending", icon: UserCheck, cls: "bg-warning-soft text-warning ring-warning/20",
      text: `${o.pendingStaffCount} compte${o.pendingStaffCount > 1 ? "s" : ""} en attente de confirmation`,
    },
    o.projects.unsupervised > 0 && {
      href: "/admin/projets?encadrant=aucun", icon: AlertTriangle, cls: "bg-brand-soft text-brand-ink ring-brand/20",
      text: `${o.projects.unsupervised} projet${o.projects.unsupervised > 1 ? "s" : ""} sans encadrant`,
    },
    o.users.suspended > 0 && {
      href: "/admin/utilisateurs?filtre=suspended", icon: UserX, cls: "bg-danger-soft text-danger ring-danger/20",
      text: `${o.users.suspended} compte${o.users.suspended > 1 ? "s" : ""} suspendu${o.users.suspended > 1 ? "s" : ""}`,
    },
  ].filter(Boolean) as { href: string; icon: typeof UserCheck; cls: string; text: string }[];

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">{today}</p>
          <h1 className="mt-1.5 font-display text-[28px] leading-tight font-bold tracking-tight text-ink sm:text-[32px]">Bonjour, {user.firstName}</h1>
          <p className="mt-2 text-[14px] text-ink-muted">
            {o.users.total} compte{o.users.total > 1 ? "s" : ""} sur la plateforme · {o.users.newThisWeek} nouveau{o.users.newThisWeek > 1 ? "x" : ""} cette semaine
          </p>
        </div>
        <Link href="/admin/identifiants?nouveau=1" className={buttonClass("primary", "lg")}>
          <KeyRound /> Créer des identifiants
        </Link>
      </header>

      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2.5 animate-rise">
          {alerts.map((a) => (
            <Link key={a.href} href={a.href} className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold ring-1 ring-inset transition-shadow hover:shadow-card ${a.cls}`}>
              <a.icon className="size-4" strokeWidth={2} /> {a.text}
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-rise [animation-delay:60ms]">
        <StatCard icon={Users} tone="gold" label="Étudiants" value={o.users.students} href="/admin/utilisateurs?filtre=STUDENT" />
        <StatCard icon={GraduationCap} tone="brand" label="Encadrants" value={o.users.encadrants} href="/admin/utilisateurs?filtre=ENCADRANT" />
        <StatCard icon={ShieldCheck} tone="success" label="Administrateurs" value={o.users.admins} href="/admin/utilisateurs?filtre=ADMIN" />
        <StatCard icon={FolderKanban} tone="warning" label="Projets" value={o.projects.total} href="/admin/projets" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2 animate-rise [animation-delay:120ms]">
        {/* ===== CONFIRMATIONS EN ATTENTE ===== */}
        <Card>
          <CardHeader
            title="Confirmations en attente"
            icon={UserCheck}
            description="Ces personnes doivent saisir le matricule et le code remis par l'école."
            action={<Link href="/admin/utilisateurs?filtre=pending" className="text-[12.5px] font-semibold text-brand hover:text-brand-strong">Tout voir</Link>}
          />
          {o.pendingStaff.length === 0 ? (
            <p className="rounded-2xl bg-surface-muted py-8 text-center text-[13px] text-ink-muted">Aucun compte encadrant ou administrateur en attente.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {o.pendingStaff.map((u) => {
                const name = `${u.firstName} ${u.lastName}`.trim();
                return (
                  <li key={u.id}>
                    <Link href={`/admin/utilisateurs?q=${encodeURIComponent(u.email)}`} className="flex items-center gap-3 rounded-2xl border border-line p-3 transition-all hover:border-line-strong hover:shadow-card">
                      <Avatar name={name} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">{name}</span>
                        <span className="block truncate text-[12px] text-ink-muted">{u.email} · inscrit le {formatDateTime(u.createdAt)}</span>
                      </span>
                      {u.pendingRole && roleBadge(u.pendingRole, "demandé")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-[12.5px] text-ink-muted">
            <KeyRound className="size-4 text-gold" strokeWidth={1.75} />
            {o.credentials.active} identifiant{o.credentials.active > 1 ? "s" : ""} actif{o.credentials.active > 1 ? "s" : ""} · {o.credentials.used} déjà utilisé{o.credentials.used > 1 ? "s" : ""}
          </p>
        </Card>

        {/* ===== PROJETS PAR ÉTAPE ===== */}
        <Card>
          <CardHeader
            title="Projets par étape"
            icon={FolderKanban}
            action={<Link href="/admin/projets" className="text-[12.5px] font-semibold text-brand hover:text-brand-strong">Tout voir</Link>}
          />
          <div className="space-y-4">
            {STAGES.map((s, i) => {
              const count = o.projects.byStage[s.stage] ?? 0;
              return (
                <div key={s.slug}>
                  <div className="mb-1.5 flex justify-between text-[13px]">
                    <span className="text-ink"><span className="text-ink-subtle">{i + 1}.</span> {s.label}</span>
                    <span className="font-semibold text-ink tabular-nums">{count}</span>
                  </div>
                  <ProgressBar value={(count / maxStage) * 100} />
                </div>
              );
            })}
          </div>
          <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[12.5px] text-ink-muted">
            <CheckSquare className="size-4 text-brand" strokeWidth={1.75} />
            {o.projects.pendingSubmissions} étape{o.projects.pendingSubmissions > 1 ? "s" : ""} en attente de décision d&apos;un encadrant
          </p>
        </Card>
      </div>

      {/* ===== ACTIVITÉ RÉCENTE ===== */}
      <Card className="animate-rise [animation-delay:180ms]">
        <CardHeader
          title="Activité récente"
          icon={ScrollText}
          action={
            <Link href="/admin/journal" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:text-brand-strong">
              Journal complet <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        {o.recentLogs.length === 0 ? (
          <p className="rounded-2xl bg-surface-muted py-8 text-center text-[13px] text-ink-muted">Aucune action enregistrée pour le moment.</p>
        ) : (
          <ul className="divide-y divide-line">
            {o.recentLogs.map((l) => (
              <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 text-[13.5px] text-ink">{l.summary}</span>
                <span className="text-[12px] text-ink-subtle">{l.adminName ?? "Système"} · {formatDateTime(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
