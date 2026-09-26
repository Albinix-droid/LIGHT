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

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: Person;
  mine: boolean;
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
