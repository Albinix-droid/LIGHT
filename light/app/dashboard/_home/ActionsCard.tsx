// app/dashboard/_home/ActionsCard.tsx
// « À faire » : actions prioritaires calculées à partir de l'état réel, sinon dernières notifications

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CircleCheck, Info, Zap, type LucideIcon } from "lucide-react";
import { KIND_META } from "@/components/notifications/kindMeta";
import { relativeTime, type ActionItem, type NotificationView } from "@/lib/notifications/types";

const TONES: Record<ActionItem["tone"], { icon: LucideIcon; tile: string; label: string }> = {
  urgent: { icon: AlertTriangle, tile: "bg-danger-soft text-danger", label: "Urgent" },
  warning: { icon: Zap, tile: "bg-warning-soft text-warning", label: "À traiter" },
  info: { icon: Info, tile: "bg-brand-soft text-brand-ink", label: "Conseil" },
};

export default function ActionsCard({
  items,
  notifications,
  serverNow,
}: {
  items: ActionItem[];
  notifications: NotificationView[];
  serverNow: number;
}) {
  return (
    <section className="rounded-[22px] border border-line bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[16px] font-semibold text-ink">{items.length ? "À faire" : "Dernières nouvelles"}</h2>
        <Link href="/dashboard/notifications" className="text-[12px] font-semibold text-brand hover:text-brand-strong">
          Tout voir
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {items.slice(0, 4).map((item) => {
            const tone = TONES[item.tone];
            return (
              <li key={item.key}>
                <Link href={item.href} className="group flex gap-3 rounded-2xl border border-line p-3 transition-all duration-150 hover:border-line-strong hover:shadow-card">
                  <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${tone.tile}`}>
                    <tone.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] leading-snug font-semibold text-ink">{item.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[12px] leading-relaxed text-ink-muted">{item.detail}</span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-brand">
                      {item.cta} <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : notifications.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {notifications.map((n) => {
            const meta = KIND_META[n.type];
            const content = (
              <>
                <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                  <meta.icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`line-clamp-2 block text-[13px] leading-snug ${n.read ? "text-ink-muted" : "font-medium text-ink"}`}>{n.message}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-subtle">{relativeTime(n.createdAt, serverNow)}</span>
                </span>
              </>
            );
            return (
              <li key={n.id}>
                {n.link ? (
                  <Link href={n.link} className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-surface-muted">{content}</Link>
                ) : (
                  <div className="flex gap-3 p-2">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-2xl bg-success-soft/60 px-5 py-8 text-center">
          <CircleCheck className="size-7 text-brand" strokeWidth={1.5} />
          <p className="mt-2 text-[14px] font-semibold text-ink">Vous êtes à jour</p>
          <p className="mt-1 text-[12px] text-ink-muted">Aucune action en attente sur vos projets.</p>
        </div>
      )}
    </section>
  );
}
