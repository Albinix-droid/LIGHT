// components/notifications/NotificationPreview.tsx
// Aperçu compact des dernières notifications (accueils étudiant et encadrant)

"use client";

import { useEffect, useOptimistic, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { setNotificationRead } from "@/lib/notifications/actions";
import { relativeTime, type NotificationView } from "@/lib/notifications/types";
import { KIND_META } from "./kindMeta";

export default function NotificationPreview({ items, serverNow }: { items: NotificationView[]; serverNow: number }) {
  const router = useRouter();
  const [now, setNow] = useState(serverNow);
  const [optimistic, markRead] = useOptimistic(items, (state, id: string) =>
    state.map((n) => (n.id === id ? { ...n, read: true } : n)),
  );

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (optimistic.length === 0) {
    return <p className="py-6 text-center text-[13px] text-ink-muted">Aucune notification pour le moment.</p>;
  }

  const open = (n: NotificationView) => {
    startTransition(async () => {
      if (!n.read) {
        markRead(n.id);
        await setNotificationRead(n.id, true);
      }
      if (n.link) router.push(n.link);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-1">
      {optimistic.map((n) => {
        const meta = KIND_META[n.type];
        return (
          <button
            key={n.id}
            onClick={() => open(n)}
            className={`flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-surface-muted ${n.read ? "" : "bg-brand-soft/40"}`}
          >
            <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
              <meta.icon className="size-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`line-clamp-2 block text-[13px] leading-snug ${n.read ? "text-ink-muted" : "font-medium text-ink"}`}>{n.message}</span>
              <span className="mt-0.5 block text-[11px] text-ink-subtle">{relativeTime(n.createdAt, now)}</span>
            </span>
            {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="Non lue" />}
          </button>
        );
      })}
    </div>
  );
}
