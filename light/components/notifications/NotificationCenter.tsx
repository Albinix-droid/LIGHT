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

const TONES: Record<ActionItem["tone"], { icon: typeof Info; color: string; bg: string; border: string }> = {
  urgent: { icon: AlertTriangle, color: "#F0928B", bg: "rgba(228,115,107,0.08)", border: "rgba(228,115,107,0.28)" },
  warning: { icon: Clock, color: "#F5B544", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.25)" },
  info: { icon: Info, color: "#A5B4FC", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.22)" },
};

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
    <div className="ntc-root">
      <style>{`
        @keyframes ntc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ntc-root { max-width: 920px; margin: 0 auto; padding: 24px 20px 48px; font-family: 'Inter', -apple-system, sans-serif; color: #E8EDF5; }
        .ntc-h1 { font-size: 28px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.5px; }
        .ntc-sub { color: rgba(200,215,235,0.55); font-size: 14px; margin: 0; line-height: 1.6; }
        .ntc-h2 { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: rgba(200,215,235,0.55); margin: 28px 0 10px; }
        .ntc-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 50px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid rgba(180,200,230,0.18); background: none; color: rgba(200,215,235,0.85); text-decoration: none; white-space: nowrap; }
        .ntc-btn:hover:not(:disabled) { border-color: rgba(180,200,230,0.35); color: #E8EDF5; }
        .ntc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ntc-btn-danger { border-color: rgba(228,115,107,0.35); color: #F0928B; }
        .ntc-chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin-top: 22px; scrollbar-width: none; }
        .ntc-chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 50px; border: 1px solid rgba(180,200,230,0.12); background: rgba(255,255,255,0.03); color: rgba(200,215,235,0.7); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .ntc-chip-active { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; border-color: transparent; }
        .ntc-chip-count { min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; font-size: 10px; display: inline-flex; align-items: center; justify-content: center; background: rgba(228,115,107,0.9); color: #fff; }
        .ntc-action { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 16px; text-decoration: none; transition: transform 0.2s ease; }
        .ntc-action:hover { transform: translateY(-1px); }
        .ntc-list { border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(180,200,230,0.08); overflow: hidden; }
        .ntc-item { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-bottom: 1px solid rgba(180,200,230,0.05); position: relative; }
        .ntc-item:last-child { border-bottom: none; }
        .ntc-item:hover { background: rgba(255,255,255,0.03); }
        .ntc-item-main { flex: 1; min-width: 0; border: none; background: none; padding: 0; text-align: left; font-family: inherit; cursor: pointer; color: inherit; }
        .ntc-tools { display: flex; gap: 2px; opacity: 0.35; transition: opacity 0.2s ease; }
        .ntc-item:hover .ntc-tools, .ntc-tools:focus-within { opacity: 1; }
        .ntc-tool { width: 30px; height: 30px; border-radius: 8px; border: none; background: none; color: rgba(200,215,235,0.7); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
        .ntc-tool:hover { background: rgba(255,255,255,0.06); color: #E8EDF5; }
        .ntc-empty { text-align: center; padding: 44px 20px; border-radius: 16px; border: 1px dashed rgba(180,200,230,0.15); color: rgba(200,215,235,0.5); font-size: 14px; }
        @media (max-width: 640px) { .ntc-h1 { font-size: 23px; } .ntc-root { padding: 16px 16px 40px; } .ntc-tools { opacity: 1; } }
      `}</style>

      {/* ===== EN-TÊTE ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="ntc-h1">Notifications</h1>
          <p className="ntc-sub">
            {unread > 0 ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}.` : "Vous êtes à jour."}
            {" "}Ouvrir une notification, ou la page qu&apos;elle concerne, la marque comme lue.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="ntc-btn" onClick={markAll} disabled={unread === 0}><CheckCheck size={14} /> Tout marquer comme lu</button>
          {confirmPurge ? (
            <>
              <button className="ntc-btn ntc-btn-danger" onClick={purgeRead}><Trash2 size={14} /> Confirmer</button>
              <button className="ntc-btn" onClick={() => setConfirmPurge(false)}>Annuler</button>
            </>
          ) : (
            <button className="ntc-btn" onClick={() => setConfirmPurge(true)} disabled={!hasRead}><Trash2 size={14} /> Supprimer les lues</button>
          )}
        </div>
      </div>

      {/* ===== À TRAITER ===== */}
      <h2 className="ntc-h2"><Sparkles size={14} style={{ color: "#F5D76E" }} /> À traiter</h2>
      {actionItems.length === 0 ? (
        <div className="ntc-action" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <CheckCircle2 size={18} style={{ color: "#34D399", flexShrink: 0 }} />
          <span style={{ fontSize: "14px", color: "rgba(232,237,245,0.85)" }}>Rien ne vous attend pour le moment. Beau travail !</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {actionItems.map((a) => {
            const tone = TONES[a.tone];
            return (
              <Link key={a.key} href={a.href} className="ntc-action" style={{ background: tone.bg, border: `1px solid ${tone.border}` }}>
                <tone.icon size={18} style={{ color: tone.color, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#E8EDF5" }}>{a.title}</span>
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.6)", lineHeight: 1.5 }}>{a.detail}</span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: tone.color, whiteSpace: "nowrap" }}>
                  {a.cta} <ArrowRight size={13} />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ===== FILTRES ===== */}
      <div className="ntc-chips" role="tablist" aria-label="Filtrer les notifications">
        {NOTIFICATION_FILTERS.map((f) => {
          const count = f.key === "all" ? 0 : f.key === "unread" ? unread : kindCounts[f.key] ?? 0;
          return (
            <button key={f.key} role="tab" aria-selected={filter === f.key} className={`ntc-chip ${filter === f.key ? "ntc-chip-active" : ""}`} onClick={() => changeFilter(f.key)}>
              {f.label}
              {count > 0 && <span className="ntc-chip-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {error && <p role="alert" style={{ color: "#F0928B", fontSize: "13px", margin: "12px 0 0" }}>{error}</p>}

      {/* ===== HISTORIQUE ===== */}
      {items.length === 0 && loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Loader2 size={20} style={{ color: "#F5D76E", animation: "ntc-spin 1s linear infinite" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="ntc-empty" style={{ marginTop: "16px" }}>
          <Bell size={22} style={{ color: "rgba(200,215,235,0.3)", marginBottom: "8px" }} />
          <p style={{ margin: 0 }}>
            {filter === "all" ? "Aucune notification pour le moment."
              : filter === "unread" ? "Aucune notification non lue."
              : `Aucune notification « ${NOTIFICATION_KIND_LABELS[filter]} ».`}
          </p>
        </div>
      ) : (
        groups.map(([label, list]) => (
          <section key={label} aria-label={label}>
            <h2 className="ntc-h2">{label}</h2>
            <div className="ntc-list">
              {list.map((n) => {
                const meta = KIND_META[n.type];
                return (
                  <div key={n.id} className="ntc-item" style={{ background: n.read ? undefined : "rgba(212,175,55,0.045)" }}>
                    {!n.read && <span aria-hidden style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, borderRadius: 3, background: "#F5D76E" }} />}
                    <span style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: meta.bg }}>
                      <meta.icon size={15} style={{ color: meta.color }} />
                    </span>
                    <button className="ntc-item-main" onClick={() => open(n)} title={n.link ? "Ouvrir" : undefined}>
                      <span style={{ display: "block", fontSize: "14px", lineHeight: 1.5, color: n.read ? "rgba(200,215,235,0.6)" : "#E8EDF5", fontWeight: n.read ? 400 : 500 }}>
                        {n.message}
                      </span>
                      <span style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginTop: "3px", fontSize: "11px", color: "rgba(200,215,235,0.42)" }}>
                        <span>{relativeTime(n.createdAt, now)}</span>
                        <span>· {NOTIFICATION_KIND_LABELS[n.type]}</span>
                        {n.project && <span style={{ color: "rgba(245,215,110,0.7)" }}>· {n.project.title}</span>}
                      </span>
                    </button>
                    <span className="ntc-tools">
                      <button className="ntc-tool" onClick={() => toggleRead(n)} aria-label={n.read ? "Marquer comme non lue" : "Marquer comme lue"} title={n.read ? "Marquer comme non lue" : "Marquer comme lue"}>
                        {n.read ? <Circle size={14} /> : <CheckCircle2 size={14} />}
                      </button>
                      <button className="ntc-tool" onClick={() => remove(n)} aria-label="Supprimer" title="Supprimer">
                        <X size={14} />
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
        <div style={{ display: "flex", justifyContent: "center", marginTop: "18px" }}>
          <button className="ntc-btn" onClick={() => load(filter, cursor)} disabled={loading}>
            {loading ? <Loader2 size={14} style={{ animation: "ntc-spin 1s linear infinite" }} /> : null} Afficher plus
          </button>
        </div>
      )}
    </div>
  );
}
