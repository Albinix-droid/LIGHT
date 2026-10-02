// components/notifications/NotificationCenter.tsx
// CENTRE DE NOTIFICATIONS (étudiant et encadrant)
// « À traiter » calculé en direct + historique filtrable, groupé par période

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCheck, Trash2, Loader2, Circle, CheckCircle2, X, AlertTriangle, Clock, Info, ArrowRight, Sparkles,
} from "lucide-react";
import {
  deleteNotification, deleteReadNotifications, fetchNotifications, markAllNotificationsRead, setNotificationRead,
} from "@/lib/notifications/actions";
import {
  NOTIFICATION_FILTERS, NOTIFICATION_KIND_LABELS, dayGroup, relativeTime,
  type ActionItem, type NotificationFilter, type NotificationKind, type NotificationView,
} from "@/lib/notifications/types";
import { KIND_META } from "./kindMeta";
import { PageHeader, Segmented, buttonClass, cx } from "@/components/ui/kit";

const TONES: Record<ActionItem["tone"], { icon: typeof Info; tile: string; cta: string }> = {
  urgent: { icon: AlertTriangle, tile: "bg-danger-soft text-danger", cta: "text-danger" },
  warning: { icon: Clock, tile: "bg-warning-soft text-warning", cta: "text-warning" },
  info: { icon: Info, tile: "bg-brand-soft text-brand-ink", cta: "text-brand" },
};

function GroupTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: typeof Info }) {
  return (
    <h2 className="mt-8 mb-3 flex items-center gap-2 text-[11.5px] font-bold tracking-[0.14em] text-ink-subtle uppercase">
      {Icon && <Icon className="size-3.5 text-gold" strokeWidth={2} />}
      {children}
    </h2>
  );
}

export default function NotificationCenter({
  initialItems,
  initialCursor,
  initialUnread,
  unreadByKind,
  actionItems,
  serverNow,
}: {
  initialItems: NotificationView[];
  initialCursor: string | null;
  initialUnread: number;
  unreadByKind: Partial<Record<NotificationKind, number>>;
  actionItems: ActionItem[];
  serverNow: number;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [unread, setUnread] = useState(initialUnread);
  const [kindCounts, setKindCounts] = useState(unreadByKind);
  const [loading, setLoading] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(serverNow);
  const [, startTransition] = useTransition();

  // Données fraîches du serveur (router.refresh) : on repart de la première page du filtre « Toutes »
  const [seenItems, setSeenItems] = useState(initialItems);
  if (seenItems !== initialItems) {
    setSeenItems(initialItems);
    if (filter === "all") {
      setItems(initialItems);
      setCursor(initialCursor);
    }
    setUnread(initialUnread);
    setKindCounts(unreadByKind);
  }

  // Temps relatifs tenus à jour
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const load = async (nextFilter: NotificationFilter, nextCursor?: string) => {
    setLoading(true);
    setError("");
    const result = await fetchNotifications({ filter: nextFilter, cursor: nextCursor });
    setLoading(false);
    if (!result.ok) return setError(result.error);
    setItems((prev) => (nextCursor ? [...prev, ...result.items] : result.items));
    setCursor(result.nextCursor);
  };

  const changeFilter = (next: NotificationFilter) => {
    if (next === filter) return;
    setFilter(next);
    setItems([]);
    void load(next);
  };

  const adjustCounts = (n: NotificationView, delta: number) => {
    setUnread((u) => Math.max(0, u + delta));
    setKindCounts((c) => ({ ...c, [n.type]: Math.max(0, (c[n.type] ?? 0) + delta) }));
  };

  const toggleRead = (n: NotificationView) => {
    const read = !n.read;
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read } : i)).filter((i) => filter !== "unread" || !i.read));
    adjustCounts(n, read ? -1 : 1);
    startTransition(async () => {
      const result = await setNotificationRead(n.id, read);
      if (!result.ok) setError(result.error);
    });
  };

  const open = (n: NotificationView) => {
    if (!n.read) {
      adjustCounts(n, -1);
      void setNotificationRead(n.id, true);
    }
    if (n.link) router.push(n.link);
    else setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
  };

  const remove = (n: NotificationView) => {
    setItems((prev) => prev.filter((i) => i.id !== n.id));
    if (!n.read) adjustCounts(n, -1);
    startTransition(async () => {
      const result = await deleteNotification(n.id);
      if (!result.ok) setError(result.error);
    });
  };

  const markAll = () => {
    setItems((prev) => (filter === "unread" ? [] : prev.map((i) => ({ ...i, read: true }))));
    setUnread(0);
    setKindCounts({});
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  const purgeRead = () => {
    setConfirmPurge(false);
    setItems((prev) => prev.filter((i) => !i.read));
    startTransition(async () => {
      await deleteReadNotifications();
      router.refresh();
    });
  };

  // Regroupement par période, dans l'ordre chronologique inverse
  const groups = useMemo(() => {
    const map = new Map<string, NotificationView[]>();
    for (const n of items) {
      const g = dayGroup(n.createdAt, now);
      map.set(g, [...(map.get(g) ?? []), n]);
    }
    return [...map.entries()];
  }, [items, now]);

  const hasRead = items.some((i) => i.read);

  return (
    <div className="mx-auto max-w-[980px]">
      <PageHeader
        eyebrow="Centre d'activité"
        title="Notifications"
        description={
          <>
            {unread > 0 ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}.` : "Vous êtes à jour."}{" "}
            Ouvrir une notification, ou la page qu&apos;elle concerne, la marque comme lue.
          </>
        }
        actions={
          <>
            <button className={buttonClass("secondary")} onClick={markAll} disabled={unread === 0}><CheckCheck /> Tout marquer comme lu</button>
            {confirmPurge ? (
              <>
                <button className={buttonClass("danger")} onClick={purgeRead}><Trash2 /> Confirmer</button>
                <button className={buttonClass("ghost")} onClick={() => setConfirmPurge(false)}>Annuler</button>
              </>
            ) : (
              <button className={buttonClass("ghost")} onClick={() => setConfirmPurge(true)} disabled={!hasRead}><Trash2 /> Supprimer les lues</button>
            )}
          </>
        }
      />

      {/* ===== À TRAITER ===== */}
      <GroupTitle icon={Sparkles}>À traiter</GroupTitle>
      {actionItems.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-success-soft px-5 py-4 ring-1 ring-success/15 ring-inset">
          <CheckCircle2 className="size-5 shrink-0 text-success" strokeWidth={1.75} />
          <span className="text-[14px] text-ink">Rien ne vous attend pour le moment. Beau travail !</span>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {actionItems.map((a) => {
            const tone = TONES[a.tone];
            return (
              <Link
                key={a.key}
                href={a.href}
                className="group flex items-start gap-3.5 rounded-[20px] border border-line bg-surface p-4 shadow-card transition-all duration-150 hover:-translate-y-px hover:border-line-strong hover:shadow-raised"
              >
                <span className={cx("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
                  <tone.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-ink">{a.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-muted">{a.detail}</span>
                  <span className={cx("mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold", tone.cta)}>
                    {a.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ===== FILTRES ===== */}
      <Segmented
        className="mt-8 w-fit"
        label="Filtrer les notifications"
        value={filter}
        onChange={changeFilter}
        items={NOTIFICATION_FILTERS.map((f) => ({
          value: f.key,
          label: f.label,
          count: f.key === "all" ? 0 : f.key === "unread" ? unread : kindCounts[f.key] ?? 0,
        }))}
      />

      {error && <p role="alert" className="mt-3 text-[13px] text-danger">{error}</p>}

      {/* ===== HISTORIQUE ===== */}
      {items.length === 0 && loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="size-5 animate-spin text-brand" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-[22px] border border-dashed border-line-strong bg-surface/60 px-6 py-12 text-center">
          <Bell className="size-6 text-ink-subtle" strokeWidth={1.5} />
          <p className="mt-3 text-[14px] text-ink-muted">
            {filter === "all" ? "Aucune notification pour le moment."
              : filter === "unread" ? "Aucune notification non lue."
              : `Aucune notification « ${NOTIFICATION_KIND_LABELS[filter]} ».`}
          </p>
        </div>
      ) : (
        groups.map(([label, list]) => (
          <section key={label} aria-label={label}>
            <GroupTitle>{label}</GroupTitle>
            <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
              {list.map((n) => {
                const meta = KIND_META[n.type];
                return (
                  <div
                    key={n.id}
                    className={cx(
                      "group relative flex items-start gap-3.5 border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-surface-muted",
                      !n.read && "bg-brand-soft/35",
                    )}
                  >
                    {!n.read && <span aria-hidden="true" className="absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full bg-brand" />}
                    <span className={cx("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", meta.tone)}>
                      <meta.icon className="size-[18px]" strokeWidth={1.75} />
                    </span>
                    <button className="min-w-0 flex-1 text-left" onClick={() => open(n)} title={n.link ? "Ouvrir" : undefined}>
                      <span className={cx("block text-[14px] leading-relaxed", n.read ? "text-ink-muted" : "font-medium text-ink")}>{n.message}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-ink-subtle">
                        <span>{relativeTime(n.createdAt, now)}</span>
                        <span>· {NOTIFICATION_KIND_LABELS[n.type]}</span>
                        {n.project && <span className="font-medium text-gold">· {n.project.title}</span>}
                      </span>
                    </button>
                    <span className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-30 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                      <button
                        className={buttonClass("ghost", "icon-sm")}
                        onClick={() => toggleRead(n)}
                        aria-label={n.read ? "Marquer comme non lue" : "Marquer comme lue"}
                        title={n.read ? "Marquer comme non lue" : "Marquer comme lue"}
                      >
                        {n.read ? <Circle /> : <CheckCircle2 />}
                      </button>
                      <button className={buttonClass("ghost", "icon-sm")} onClick={() => remove(n)} aria-label="Supprimer" title="Supprimer">
                        <X />
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {cursor && items.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button className={buttonClass("secondary")} onClick={() => load(filter, cursor)} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Afficher plus
          </button>
        </div>
      )}
    </div>
  );
}
