// app/admin/format.tsx
// Petits utilitaires d'affichage partagés par les pages de l'administration

import { Badge, type Tone } from "@/components/ui/kit";

const ROLE_STYLES = {
  STUDENT: { label: "Étudiant", tone: "gold" },
  ENCADRANT: { label: "Encadrant", tone: "brand" },
  ADMIN: { label: "Administrateur", tone: "success" },
} as const satisfies Record<string, { label: string; tone: Tone }>;

export type RoleKey = keyof typeof ROLE_STYLES;

export function roleBadge(role: RoleKey, suffix?: string) {
  const s = ROLE_STYLES[role];
  return <Badge tone={s.tone}>{s.label}{suffix ? ` ${suffix}` : ""}</Badge>;
}

export function roleLabelOf(role: RoleKey) {
  return ROLE_STYLES[role].label;
}

export { formatDate, formatDateTime } from "@/lib/format";
