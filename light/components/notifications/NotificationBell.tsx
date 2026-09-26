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
    <div ref={rootRef} style={{ position: "relative" }}>
      <style>{`
        @keyframes ntf-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ntf-ring { 0%,100% { transform: rotate(0); } 20% { transform: rotate(14deg); } 40% { transform: rotate(-12deg); } 60% { transform: rotate(8deg); } 80% { transform: rotate(-4deg); } }
        .ntf-ring { animation: ntf-ring 0.9s ease; transform-origin: 50% 10%; }
        .ntf-panel { position: absolute; right: 0; top: calc(100% + 10px); width: 380px; max-width: calc(100vw - 24px); z-index: 300;
          background: #0F1E35; border: 1px solid rgba(180,200,230,0.12); border-radius: 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.45);
          overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; }
        .ntf-item { width: 100%; display: flex; gap: 12px; align-items: flex-start; padding: 12px 16px; border: none; background: none;
          text-align: left; cursor: pointer; font-family: inherit; border-bottom: 1px solid rgba(180,200,230,0.05); }
        .ntf-item:hover { background: rgba(255,255,255,0.04); }
        .ntf-link-btn { border: none; background: none; color: #F5D76E; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-family: inherit; padding: 4px; }
        .ntf-link-btn:disabled { opacity: 0.4; cursor: default; }
        @media (max-width: 520px) { .ntf-panel { position: fixed; left: 12px; right: 12px; top: 64px; width: auto; } }
      `}</style>

      <button
        onClick={toggle}
        className={buttonClassName}
        aria-label={count > 0 ? `Notifications : ${count} non lue${count > 1 ? "s" : ""}` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", cursor: "pointer" }}
      >
        <Bell size={16} className={pulse ? "ntf-ring" : undefined} />
        {count > 0 && (
          <span style={{
            position: "absolute", top: "2px", right: "2px", minWidth: "16px", height: "16px", padding: "0 4px", borderRadius: "8px",
            background: "#E4736B", color: "#fff", fontSize: "9px", fontWeight: 700, display: "inline-flex", alignItems: "center",
            justifyContent: "center", border: "2px solid #0A1628", lineHeight: 1,
          }}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="ntf-panel" role="dialog" aria-label="Dernières notifications">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(180,200,230,0.08)" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#E8EDF5" }}>
              Notifications {count > 0 && <span style={{ color: "#F5D76E", fontWeight: 600 }}>· {count} non lue{count > 1 ? "s" : ""}</span>}
            </span>
            <button className="ntf-link-btn" onClick={markAll} disabled={count === 0}>
              <CheckCheck size={14} /> Tout lire
            </button>
          </div>

          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            {items === null ? (
              <div style={{ padding: "28px", display: "flex", justifyContent: "center" }}>
                <Loader2 size={18} style={{ color: "#F5D76E", animation: "ntf-spin 1s linear infinite" }} />
              </div>
            ) : items.length === 0 ? (
              <p style={{ padding: "32px 20px", margin: 0, textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.5)" }}>
                Vous êtes à jour. Les validations, demandes et ajouts à des groupes apparaîtront ici.
              </p>
            ) : (
              items.map((n) => {
                const meta = KIND_META[n.type];
                return (
                  <button key={n.id} className="ntf-item" onClick={() => openItem(n)} style={{ background: n.read ? undefined : "rgba(212,175,55,0.05)" }}>
                    <span style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: meta.bg }}>
                      <meta.icon size={14} style={{ color: meta.color }} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: "13px", lineHeight: 1.45, color: n.read ? "rgba(200,215,235,0.6)" : "#E8EDF5", fontWeight: n.read ? 400 : 500 }}>
                        {n.message}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)" }}>{relativeTime(n.createdAt, now)}</span>
                    </span>
                    {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F5D76E", flexShrink: 0, marginTop: 6 }} />}
                  </button>
                );
              })
            )}
            {isPending && items !== null && (
              <div style={{ padding: "6px", display: "flex", justifyContent: "center" }}>
                <Loader2 size={14} style={{ color: "#F5D76E", animation: "ntf-spin 1s linear infinite" }} />
              </div>
            )}
          </div>

          <Link href={allHref} onClick={() => setOpen(false)} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", fontSize: "13px", fontWeight: 600,
            color: "#F5D76E", textDecoration: "none", borderTop: "1px solid rgba(180,200,230,0.08)", background: "rgba(255,255,255,0.02)",
          }}>
            Voir toutes les notifications <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
