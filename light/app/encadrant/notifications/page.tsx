// app/encadrant/notifications/page.tsx
// NOTIFICATIONS DE L'ENCADRANT

import { requireRole } from "@/lib/auth";
import NotificationsPage from "@/components/notifications/NotificationsPage";

export const metadata = { title: "Notifications" };

export default async function EncadrantNotificationsPage() {
  const user = await requireRole("ENCADRANT");
  return <NotificationsPage user={user} />;
}
