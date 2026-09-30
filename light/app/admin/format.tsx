// app/admin/format.tsx
// Petits utilitaires d'affichage partagés par les pages de l'administration

const ROLE_STYLES = {
  STUDENT: { label: "Étudiant", color: "#F5D76E", bg: "rgba(212,175,55,0.1)" },
  ENCADRANT: { label: "Encadrant", color: "#A5B4FC", bg: "rgba(99,102,241,0.12)" },
  ADMIN: { label: "Administrateur", color: "#34D399", bg: "rgba(16,185,129,0.12)" },
} as const;

export type RoleKey = keyof typeof ROLE_STYLES;

export function roleBadge(role: RoleKey, suffix?: string) {
  const s = ROLE_STYLES[role];
  return (
    <span className="enc-badge" style={{ background: s.bg, color: s.color }}>
      {s.label}{suffix ? ` ${suffix}` : ""}
    </span>
  );
}

export function roleLabelOf(role: RoleKey) {
  return ROLE_STYLES[role].label;
}

// Dates affichées dans le fuseau du Cameroun, quel que soit le serveur
export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Africa/Douala" }).format(new Date(d));
}

export function formatDateTime(d: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Douala" }).format(new Date(d));
}
