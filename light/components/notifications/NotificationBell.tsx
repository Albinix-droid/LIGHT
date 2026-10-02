// components/notifications/NotificationBell.tsx
// CLOCHE DE LA BARRE SUPÉRIEURE : compteur en direct + panneau des dernières notifications

"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, ArrowRight } from "lucide-react";
import { fetchLatestNotifications, getUnreadCount, markAllNotificationsRead, setNotificationRead } from "@/lib/notifications/actions";
import { relativeTime, type NotificationView } from "@/lib/notifications/types";
import { KIND_META } from "./kindMeta";

const POLL_MS = 30_000;

export default function NotificationBell({
  initialCount,
  allHref,
  buttonClassName,
}: {
  initialCount: number;
  allHref: string;
  buttonClassName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationView[] | null>(null);
  const [pulse, setPulse] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(initialCount);
  // Valeurs serveur ou navigation modifiées : on ajuste l'état pendant le rendu (pas d'effet en cascade)
  const [seenInitial, setSeenInitial] = useState(initialCount);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenInitial !== initialCount) {
    setSeenInitial(initialCount);
    setCount(initialCount);
  }
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  const applyCount = useCallback((next: number) => {
    // Petite animation quand une nouvelle notification arrive
    if (next > lastCount.current) {
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    }
    lastCount.current = next;
    setCount(next);
  }, []);

  const refreshCount = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    const result = await getUnreadCount();
    if (result.ok) applyCount(result.count);
  }, [applyCount]);

  // Rafraîchissement périodique, au retour sur l'onglet et à chaque navigation
  useEffect(() => {
    const timer = setInterval(refreshCount, POLL_MS);
    window.addEventListener("focus", refreshCount);
    document.addEventListener("visibilitychange", refreshCount);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refreshCount);
      document.removeEventListener("visibilitychange", refreshCount);
    };
  }, [refreshCount]);

  useEffect(() => {
    const t = setTimeout(refreshCount, 800);
    return () => clearTimeout(t);
  }, [pathname, refreshCount]);

  // Fermeture au clic extérieur et à Échap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      startTransition(async () => {
        const result = await fetchLatestNotifications();
        if (result.ok) {
          setNow(Date.now());
          setItems(result.items);
          applyCount(result.unread);
        }
      });
    }
  };

  const openItem = (n: NotificationView) => {
    setOpen(false);
    if (!n.read) {
      setItems((prev) => prev?.map((i) => (i.id === n.id ? { ...i, read: true } : i)) ?? null);
      applyCount(Math.max(0, count - 1));
      void setNotificationRead(n.id);
    }
    if (n.link) router.push(n.link);
  };

  const markAll = () => {
    setItems((prev) => prev?.map((i) => ({ ...i, read: true })) ?? null);
    applyCount(0);
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  return (
    <div ref={rootRef} className="relative font-sans">
      <style>{`
        @keyframes ntf-ring { 0%,100% { transform: rotate(0); } 20% { transform: rotate(14deg); } 40% { transform: rotate(-12deg); } 60% { transform: rotate(8deg); } 80% { transform: rotate(-4deg); } }
        .ntf-ring { animation: ntf-ring 0.9s ease; transform-origin: 50% 10%; }
      `}</style>

      <button
        onClick={toggle}
        className={`relative inline-flex size-9 cursor-pointer items-center justify-center ${buttonClassName}`}
        aria-label={count > 0 ? `Notifications : ${count} non lue${count > 1 ? "s" : ""}` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className={`size-[18px] ${pulse ? "ntf-ring" : ""}`} strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] leading-none font-bold text-white tabular-nums ring-2 ring-canvas">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Dernières notifications"
          className="fixed inset-x-3 top-16 z-[300] overflow-hidden rounded-2xl border border-line bg-surface text-ink shadow-raised sm:absolute sm:inset-x-auto sm:top-[calc(100%+10px)] sm:right-0 sm:w-[380px] animate-rise"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <span className="font-display text-[14px] font-semibold">
              Notifications
              {count > 0 && <span className="ml-1.5 font-sans text-[12px] font-medium text-brand">· {count} non lue{count > 1 ? "s" : ""}</span>}
            </span>
            <button
              onClick={markAll}
              disabled={count === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-semibold text-brand transition-colors hover:bg-brand-soft disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <CheckCheck className="size-3.5" /> Tout lire
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items === null ? (
              <div className="flex justify-center p-7">
                <Loader2 className="size-[18px] animate-spin text-brand" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] leading-relaxed text-ink-muted">
                Vous êtes à jour. Les validations, demandes et ajouts à des groupes apparaîtront ici.
              </p>
            ) : (
              items.map((n) => {
                const meta = KIND_META[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => openItem(n)}
                    className={`flex w-full items-start gap-3 border-b border-line/70 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-muted ${n.read ? "" : "bg-brand-soft/40"}`}
                  >
                    <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                      <meta.icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13px] leading-snug ${n.read ? "text-ink-muted" : "font-medium text-ink"}`}>{n.message}</span>
                      <span className="mt-0.5 block text-[11px] text-ink-subtle">{relativeTime(n.createdAt, now)}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="Non lue" />}
                  </button>
                );
              })
            )}
            {isPending && items !== null && (
              <div className="flex justify-center p-1.5">
                <Loader2 className="size-3.5 animate-spin text-brand" />
              </div>
            )}
          </div>

          <Link
            href={allHref}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 border-t border-line bg-surface-muted p-3 text-[13px] font-semibold text-brand transition-colors hover:text-brand-strong"
          >
            Voir toutes les notifications <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
