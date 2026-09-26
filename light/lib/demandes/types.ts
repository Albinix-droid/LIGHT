// lib/demandes/types.ts
// Types partagés serveur / client des demandes et invitations

export type RequestKind = "PROJECT_INVITATION" | "JOIN_REQUEST" | "SUPERVISION_REQUEST";
export type RequestState = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
export type TeamRole = "OWNER" | "CO_DIRECTOR" | "SECRETARY" | "MEMBER";
export type InvitableRole = Exclude<TeamRole, "OWNER">;

export const INVITABLE_ROLES: InvitableRole[] = ["MEMBER", "CO_DIRECTOR", "SECRETARY"];
export const MAX_REQUEST_MESSAGE = 500;

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  OWNER: "Porteur du projet",
  CO_DIRECTOR: "Co-directeur",
  SECRETARY: "Secrétaire / trésorier",
  MEMBER: "Membre",
};

export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
  PROJECT_INVITATION: "Invitation à rejoindre un projet",
  JOIN_REQUEST: "Demande pour rejoindre un projet",
  SUPERVISION_REQUEST: "Demande d'encadrement",
};

export const REQUEST_STATE_LABELS: Record<RequestState, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  DECLINED: "Refusée",
  CANCELLED: "Annulée",
};

export interface RequestPerson {
  id: string;
  name: string;
  initials: string;
  role: "STUDENT" | "ENCADRANT" | "ADMIN";
}

export interface RequestItem {
  id: string;
  type: RequestKind;
  status: RequestState;
  direction: "received" | "sent";
  project: { id: string; title: string; sector: string | null; stageLabel: string };
  // L'autre personne concernée (expéditeur si reçue, destinataire si envoyée)
  other: RequestPerson;
  role: InvitableRole | null;
  message: string | null;
  responseMessage: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface DiscoverProject {
  id: string;
  title: string;
  sector: string | null;
  stageLabel: string;
  description: string | null;
  ownerName: string;
  memberCount: number;
  teamSize: number;
  hasPendingRequest: boolean;
}

export interface TeamMemberInfo {
  userId: string;
  name: string;
  initials: string;
  role: TeamRole;
  isMe: boolean;
}

export interface PendingInvitationInfo {
  id: string;
  name: string;
  role: InvitableRole | null;
  createdAt: string;
}

export interface StudentOption {
  id: string;
  name: string;
  email: string;
}

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };
