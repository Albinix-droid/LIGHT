// lib/parametres/types.ts
// Types partagés serveur / client des paramètres du compte

import type { NotificationKind } from "@/lib/notifications/types";

export type Track = "GL" | "SR";

export const MAX_BIO_LENGTH = 300;
export const MAX_NAME_LENGTH = 60;
export const MIN_PASSWORD_LENGTH = 8;

// Photo de profil : redimensionnée dans le navigateur avant l'envoi
export const AVATARS_BUCKET = "avatars";
export const AVATAR_SIZE = 256;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/webp", "image/jpeg", "image/png"];

export const TRACK_OPTIONS: { value: Track; label: string }[] = [
  { value: "GL", label: "Génie Logiciel" },
  { value: "SR", label: "Systèmes et Réseaux" },
];

// Types de notifications que l'utilisateur peut couper
export const NOTIFICATION_SETTINGS: { kind: NotificationKind; label: string; detail: string }[] = [
  { kind: "VALIDATION", label: "Parcours", detail: "Étapes soumises, validées ou à corriger" },
  { kind: "INVITATION", label: "Demandes & invitations", detail: "Invitations d'équipe, candidatures, demandes d'encadrement et leurs réponses" },
  { kind: "MESSAGE", label: "Messagerie", detail: "Ajout à un groupe de discussion" },
  { kind: "SYSTEM", label: "Système", detail: "Annonces et informations de la plateforme" },
];

export interface SettingsProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "ENCADRANT" | "ADMIN";
  avatarUrl: string | null;
  bio: string;
  track: Track | null;
  mutedNotifications: NotificationKind[];
  createdAt: string;
  lastSignInAt: string | null;
}

export interface AccountStats {
  ownedProjects: { id: string; title: string; memberCount: number }[];
  memberProjects: number;
  supervisedProjects: number;
  messages: number;
  files: number;
  createdConversations: { name: string; type: "GROUP" | "CHANNEL" }[];
}

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

// Lecture tolérante des préférences stockées en JSON
export function readMutedKinds(prefs: unknown): NotificationKind[] {
  const muted = (prefs as { muted?: unknown } | null)?.muted;
  const valid: NotificationKind[] = ["VALIDATION", "INVITATION", "MESSAGE", "SYSTEM"];
  return Array.isArray(muted) ? valid.filter((k) => muted.includes(k)) : [];
}

// Robustesse indicative d'un mot de passe (0 à 4)
export function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Trop court", "Faible", "Correct", "Bon", "Excellent"];
  const colors = ["#E4736B", "#E4736B", "#F5B544", "#A3E635", "#34D399"];
  return { score, label: labels[score], color: colors[score] };
}
