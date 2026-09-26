// lib/messagerie/types.ts
// Types partagés serveur / client de la messagerie

export type ConversationKind = "DIRECT" | "GROUP" | "CHANNEL";
export type ChannelTrack = "GL" | "SR";
export type UserRole = "STUDENT" | "ENCADRANT" | "ADMIN";

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_GROUP_MEMBERS = 50;

export const TRACK_LABELS: Record<ChannelTrack, string> = {
  GL: "Génie Logiciel",
  SR: "Systèmes et Réseaux",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Étudiant",
  ENCADRANT: "Encadrant",
  ADMIN: "Administrateur",
};

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
}

export interface PersonWithEmail extends Person {
  email: string;
}

export interface ConversationSummary {
  id: string;
  type: ConversationKind;
  title: string;
  subtitle: string;
  track: ChannelTrack | null;
  unread: number;
  lastMessage: { content: string; senderName: string; mine: boolean } | null;
  lastMessageAt: string;
  // Messages privés : l'interlocuteur
  otherUser: Person | null;
}

export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  isImage: boolean;
  width: number | null;
  height: number | null;
  // Route protégée : vérifie l'appartenance à la conversation puis redirige vers une URL signée
  url: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: Person;
  mine: boolean;
  attachments: ChatAttachment[];
}

// Fichier déjà déposé dans le stockage, joint au message au moment de l'envoi
export interface UploadedAttachment {
  path: string;
  name: string;
  width?: number | null;
  height?: number | null;
}

export interface SharedFile extends ChatAttachment {
  createdAt: string;
  senderName: string;
}

// ============================================================
// PIÈCES JOINTES : types et tailles autorisés
// ============================================================
export const ATTACHMENTS_BUCKET = "messagerie";
export const MAX_ATTACHMENTS_PER_MESSAGE = 6;
export const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20 Mo
export const MAX_ATTACHMENT_NAME = 180;

// Images affichées dans la conversation (SVG exclu : il peut contenir du code)
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Type MIME → extension
export const ALLOWED_ATTACHMENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.oasis.opendocument.spreadsheet": "ods",
  "application/vnd.oasis.opendocument.presentation": "odp",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

// Certains navigateurs ne fournissent pas de type MIME fiable : on le déduit de l'extension
const EXTENSION_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_ATTACHMENT_TYPES)
    .filter(([mime]) => mime !== "application/x-zip-compressed")
    .map(([mime, ext]) => [ext, mime]),
);
EXTENSION_TYPES.jpeg = "image/jpeg";

export function resolveMimeType(name: string, type: string): string | null {
  if (type && ALLOWED_ATTACHMENT_TYPES[type]) return type === "application/x-zip-compressed" ? "application/zip" : type;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TYPES[ext] ?? null;
}

export const ACCEPT_ATTACHMENTS = [
  ...Object.keys(ALLOWED_ATTACHMENT_TYPES),
  ...Object.keys(EXTENSION_TYPES).map((ext) => `.${ext}`),
].join(",");

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0).replace(".", ",")} Mo`;
}

// Aperçu d'un message dans la liste des conversations
export function messagePreview(content: string, attachments: { mimeType: string }[]) {
  if (content.trim()) return content;
  if (attachments.length === 0) return "";
  const images = attachments.filter((a) => IMAGE_MIME_TYPES.includes(a.mimeType)).length;
  if (attachments.length === 1) return images ? "📷 Photo" : "📎 Document";
  if (images === attachments.length) return `📷 ${images} photos`;
  return `📎 ${attachments.length} fichiers`;
}

export interface ConversationMemberInfo extends Person {
  isAdmin: boolean;
}

export interface ConversationDetail {
  id: string;
  type: ConversationKind;
  title: string;
  subtitle: string;
  description: string | null;
  track: ChannelTrack | null;
  projectTitle: string | null;
  members: ConversationMemberInfo[];
  isAdmin: boolean;
}

export interface ChannelListing {
  id: string;
  name: string;
  track: ChannelTrack;
  description: string | null;
  memberCount: number;
  joined: boolean;
  createdByName: string;
}

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };
