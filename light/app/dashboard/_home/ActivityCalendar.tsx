// app/dashboard/_home/ActivityCalendar.tsx
// Calendrier de l'activité du parcours (soumissions, validations) + liste du jour sélectionné

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, FilePlus2, RotateCcw, Send, type LucideIcon } from "lucide-react";
import type { ActivityEvent, ActivityKind } from "@/lib/dashboard/queries";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const KIND_STYLE: Record<ActivityKind, { icon: LucideIcon; dot: string; tone: string; label: string }> = {
  submitted: { icon: Send, dot: "bg-brand", tone: "bg-brand-soft text-brand-ink", label: "Soumission" },
  approved: { icon: CheckCircle2, dot: "bg-success", tone: "bg-success-soft text-success", label: "Validation" },
  changes: { icon: RotateCcw, dot: "bg-warning", tone: "bg-warning-soft text-warning", label: "À reprendre" },
  created: { icon: FilePlus2, dot: "bg-gold", tone: "bg-gold-soft text-gold", label: "Création" },
};

// Tous les jours sont calculés à l'heure de Douala : même résultat sur le serveur (UTC) et dans le navigateur
const TZ = "Africa/Douala";
const keyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const dayKey = (d: Date) => keyFormat.format(d);
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
// Jour du calendrier : midi UTC, toujours le même jour à Douala
const calendarDay = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d, 12));
const fmt = (d: Date, options: Intl.DateTimeFormatOptions) => d.toLocaleDateString("fr-FR", { timeZone: TZ, ...options });

export default function ActivityCalendar({ events, serverNow }: { events: ActivityEvent[]; serverNow: number }) {
  const today = useMemo(() => new Date(serverNow), [serverNow]);
  const [month, setMonth] = useState(() => {
    const [y, m] = dayKey(today).split("-").map(Number);
    return calendarDay(y, m - 1, 1);
  });
  const [selected, setSelected] = useState<Date | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, ActivityEvent[]>();
    for (const e of events) {
      const key = dayKey(new Date(e.date));
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [events]);

  // Grille du mois, semaines commençant le lundi
  const cells = useMemo(() => {
    const y = month.getUTCFullYear();
    const m = month.getUTCMonth();
    const offset = (calendarDay(y, m, 1).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const weeks = Math.ceil((offset + daysInMonth) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => calendarDay(y, m, 1 - offset + i));
  }, [month]);

  const list = selected ? byDay.get(dayKey(selected)) ?? [] : events.slice(0, 4);
  const monthLabel = fmt(month, { month: "long", year: "numeric" });
  const shift = (delta: number) => setMonth(calendarDay(month.getUTCFullYear(), month.getUTCMonth() + delta, 1));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ===== CALENDRIER ===== */}
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-[15px] font-semibold capitalize text-ink">{monthLabel}</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => shift(-1)} className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink" aria-label="Mois précédent">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => shift(1)} className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink" aria-label="Mois suivant">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center" role="grid" aria-label={`Activité de ${monthLabel}`}>
          {WEEKDAYS.map((d) => (
            <span key={d} className="pb-2 text-[11px] font-medium tracking-wide text-ink-subtle uppercase">{d}</span>
          ))}
          {cells.map((d) => {
            const inMonth = d.getUTCMonth() === month.getUTCMonth();
            const dayEvents = byDay.get(dayKey(d)) ?? [];
            const isToday = sameDay(d, today);
            const isSelected = selected ? sameDay(d, selected) : false;
            const kinds = [...new Set(dayEvents.map((e) => e.kind))].slice(0, 3);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setSelected(isSelected ? null : d)}
                aria-pressed={isSelected}
                aria-label={`${fmt(d, { weekday: "long", day: "numeric", month: "long" })}${dayEvents.length ? `, ${dayEvents.length} activité${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                className="group flex flex-col items-center gap-1 py-0.5"
              >
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-full text-[13px] font-medium tabular-nums transition-colors duration-150 ${
                    isSelected
                      ? "bg-brand text-white shadow-brand"
                      : isToday
                        ? "text-brand ring-[1.5px] ring-brand ring-inset"
                        : inMonth
                          ? "text-ink group-hover:bg-surface-muted"
                          : "text-ink-subtle/50"
                  }`}
                >
                  {d.getUTCDate()}
                </span>
                <span className="flex h-1.5 gap-0.5" aria-hidden="true">
                  {kinds.map((k) => <span key={k} className={`size-1.5 rounded-full ${KIND_STYLE[k].dot} ${inMonth ? "" : "opacity-40"}`} />)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3.5">
          {(Object.keys(KIND_STYLE) as ActivityKind[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
              <span className={`size-1.5 rounded-full ${KIND_STYLE[k].dot}`} /> {KIND_STYLE[k].label}
            </span>
          ))}
        </div>
      </div>

      {/* ===== LISTE ===== */}
      <div className="flex min-w-0 flex-col">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-ink-muted">
            {selected ? fmt(selected, { weekday: "long", day: "numeric", month: "long" }) : "Activité récente"}
          </p>
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="text-[12px] font-semibold text-brand hover:text-brand-strong">
              Tout afficher
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-10 text-center">
            <CalendarDays className="size-6 text-ink" strokeWidth={1.5} />
            <p className="mt-3 text-[13px] text-ink-muted">
              {selected ? "Aucune activité ce jour-là." : "Vos soumissions et les décisions de votre encadrant apparaîtront ici."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {list.map((e, i) => {
              const style = KIND_STYLE[e.kind];
              const date = new Date(e.date);
              const highlight = i === 0 && !selected;
              return (
                <li key={e.id}>
                  <Link
                    href={e.href}
                    className={`group flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-150 ${
                      highlight
                        ? "border-transparent bg-[linear-gradient(120deg,#1f4fd8,#3a78f2)] text-white shadow-brand hover:-translate-y-px"
                        : "border-line bg-surface hover:border-line-strong hover:shadow-card"
                    }`}
                  >
                    <span className="flex w-10 shrink-0 flex-col items-center">
                      <span className={`font-display text-[22px] leading-none font-bold tabular-nums ${highlight ? "text-white" : "text-brand"}`}>{fmt(date, { day: "numeric" })}</span>
                      <span className={`mt-1 text-[10px] font-semibold tracking-wide uppercase ${highlight ? "text-white/70" : "text-ink-subtle"}`}>
                        {fmt(date, { month: "short" }).replace(".", "")}
                      </span>
                    </span>
                    <span className={`h-9 w-px shrink-0 ${highlight ? "bg-white/30" : "bg-line"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14px] font-semibold ${highlight ? "text-white" : "text-ink"}`}>{e.title}</span>
                      <span className={`block truncate text-[12px] ${highlight ? "text-white/75" : "text-ink-muted"}`}>{e.detail}</span>
                    </span>
                    <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${highlight ? "bg-white/15 text-white" : style.tone}`}>
                      <style.icon className="size-4" strokeWidth={1.75} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
