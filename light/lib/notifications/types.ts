// lib/notifications/types.ts
// Types partagés serveur / client des notifications

export type NotificationKind = "INVITATION" | "VALIDATION" | "MESSAGE" | "SYSTEM";
export type NotificationFilter = "all" | "unread" | NotificationKind;

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  VALIDATION: "Parcours",
  INVITATION: "Demandes",
  MESSAGE: "Messagerie",
  SYSTEM: "Système",
};

export const NOTIFICATION_FILTERS: { key: NotificationFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "unread", label: "Non lues" },
  { key: "VALIDATION", label: "Parcours" },
  { key: "INVITATION", label: "Demandes" },
  { key: "MESSAGE", label: "Messagerie" },
  { key: "SYSTEM", label: "Système" },
];

export const NOTIFICATIONS_PAGE_SIZE = 30;

export interface NotificationView {
  id: string;
  type: NotificationKind;
  message: string;
  // Lien déjà adapté à l'espace de l'utilisateur (étudiant ou encadrant)
  link: string | null;
  read: boolean;
  createdAt: string;
  project: { id: string; title: string } | null;
}

// Élément « À traiter » calculé à partir de l'état réel (jamais périmé)
export interface ActionItem {
  key: string;
  tone: "urgent" | "warning" | "info";
  title: string;
  detail: string;
  href: string;
  cta: string;
}

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

// Temps relatif lisible : « à l'instant », « il y a 5 min », « hier à 14:02 », « 3 sept. »
export function relativeTime(iso: string, now = Date.now()) {
  const date = new Date(iso);
  const diff = Math.max(0, now - date.getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24 && new Date(now).toDateString() === date.toDateString()) return `il y a ${hours} h`;
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" });
  const yesterday = new Date(now - 86_400_000);
  if (yesterday.toDateString() === date.toDateString()) return `hier à ${time}`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${date.toLocaleDateString("fr-FR", { weekday: "long", timeZone: "Africa/Douala" })} à ${time}`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: days > 300 ? "numeric" : undefined, timeZone: "Africa/Douala" });
}

// Regroupement par période pour la liste complète
export function dayGroup(iso: string, now = Date.now()) {
  const date = new Date(iso);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const t = date.getTime();
  if (t >= today.getTime()) return "Aujourd'hui";
  if (t >= today.getTime() - 86_400_000) return "Hier";
  if (t >= today.getTime() - 6 * 86_400_000) return "Cette semaine";
  if (t >= today.getTime() - 29 * 86_400_000) return "Ce mois-ci";
  return "Plus ancien";
}
