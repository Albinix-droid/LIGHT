// components/notifications/NotificationsPage.tsx
// Chargement serveur commun aux pages de notifications étudiant et encadrant

import { countByKind, countUnreadNotifications, getActionItems, listNotifications } from "@/lib/notifications/queries";
import NotificationCenter from "./NotificationCenter";

export default async function NotificationsPage({ user }: { user: { id: string; role: "STUDENT" | "ENCADRANT" | "ADMIN" } }) {
  const [{ items, nextCursor }, unread, byKind, actionItems] = await Promise.all([
    listNotifications(user.id, user.role),
    countUnreadNotifications(user.id),
    countByKind(user.id),
    getActionItems(user.id, user.role),
  ]);
  return (
    <NotificationCenter
      initialItems={items}
      initialCursor={nextCursor}
      initialUnread={unread}
      unreadByKind={byKind}
      actionItems={actionItems}
      serverNow={Date.now()}
    />
  );
}
