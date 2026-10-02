// lib/format.ts
// Formatage des dates à l'heure de Douala : identique sur le serveur (UTC) et dans le navigateur

const TZ = "Africa/Douala";

type DateInput = Date | string | number;

// « 2 oct. 2026 »
export function formatDate(value: DateInput) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }).format(new Date(value));
}

// « 2 oct. 2026 à 14:05 »
export function formatDateTime(value: DateInput) {
  const date = new Date(value);
  const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(date);
  return `${formatDate(date)} à ${time}`;
}

// « 2 oct. » cette année, « 2 oct. 2025 » sinon
export function formatShortDate(value: DateInput, now: number = Date.now()) {
  const date = new Date(value);
  const year = (d: Date) => new Intl.DateTimeFormat("en", { year: "numeric", timeZone: TZ }).format(d);
  const sameYear = year(date) === year(new Date(now));
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }), timeZone: TZ }).format(date);
}
