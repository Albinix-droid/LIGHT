// app/encadrant/NotificationList.tsx
// Notifications réelles de l'encadrant (soumissions, nouveaux projets), marquées lues au clic

"use client";

import { useOptimistic, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckSquare, UserPlus } from "lucide-react";
import { markNotificationRead } from "./actions";

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  date: string;
}

export default function NotificationList({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [optimistic, markRead] = useOptimistic(items, (state, id: string) =>
    state.map((n) => (n.id === id ? { ...n, read: true } : n)),
  );

  if (optimistic.length === 0) {
    return <p className="enc-empty" style={{ padding: "20px 0" }}>Aucune notification.</p>;
  }

  const open = (n: NotificationItem) => {
    startTransition(async () => {
      if (!n.read) {
        markRead(n.id);
        await markNotificationRead(n.id);
      }
      if (n.link) router.push(n.link);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {optimistic.map((n) => {
        const Icon = n.type === "VALIDATION" ? CheckSquare : n.type === "INVITATION" ? UserPlus : Bell;
        return (
          <button
            key={n.id}
            onClick={() => open(n)}
            className="enc-row"
            style={{
              width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              background: n.read ? undefined : "rgba(212,175,55,0.06)",
            }}
          >
            <Icon size={15} style={{ color: n.read ? "rgba(200,215,235,0.35)" : "#F5D76E", flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "13px", lineHeight: 1.45, color: n.read ? "rgba(200,215,235,0.55)" : "#E8EDF5", fontWeight: n.read ? 400 : 500 }}>
                {n.message}
              </span>
              <span className="enc-muted" style={{ fontSize: "11px" }}>{n.date}</span>
            </span>
            {!n.read && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#F5D76E", flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>
  );
}
