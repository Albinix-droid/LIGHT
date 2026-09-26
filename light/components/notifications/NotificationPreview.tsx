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
    return (
      <p style={{ margin: 0, padding: "18px 0", fontSize: "13px", color: "rgba(200,215,235,0.5)", textAlign: "center" }}>
        Aucune notification pour le moment.
      </p>
    );
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
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {optimistic.map((n) => {
        const meta = KIND_META[n.type];
        return (
          <button
            key={n.id}
            onClick={() => open(n)}
            style={{
              width: "100%", display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "12px",
              border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              background: n.read ? "rgba(255,255,255,0.02)" : "rgba(212,175,55,0.06)",
            }}
          >
            <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: meta.bg }}>
              <meta.icon size={13} style={{ color: meta.color }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "13px", lineHeight: 1.45, color: n.read ? "rgba(200,215,235,0.55)" : "#E8EDF5", fontWeight: n.read ? 400 : 500 }}>
                {n.message}
              </span>
              <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)" }}>{relativeTime(n.createdAt, now)}</span>
            </span>
            {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F5D76E", flexShrink: 0, marginTop: 6 }} />}
          </button>
        );
      })}
    </div>
  );
}
