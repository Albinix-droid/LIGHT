// components/notifications/kindMeta.ts
// Icône et couleurs de chaque type de notification

import { Bell, CheckCircle2, MessageCircle, UserPlus } from "lucide-react";
import type { NotificationKind } from "@/lib/notifications/types";

export const KIND_META: Record<NotificationKind, { icon: typeof Bell; color: string; bg: string }> = {
  VALIDATION: { icon: CheckCircle2, color: "#34D399", bg: "rgba(16,185,129,0.12)" },
  INVITATION: { icon: UserPlus, color: "#F5D76E", bg: "rgba(212,175,55,0.12)" },
  MESSAGE: { icon: MessageCircle, color: "#93C5FD", bg: "rgba(59,130,246,0.12)" },
  SYSTEM: { icon: Bell, color: "#C4B5FD", bg: "rgba(139,92,246,0.12)" },
};
