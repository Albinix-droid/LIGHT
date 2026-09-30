// app/admin/notifications/page.tsx
// NOTIFICATIONS DE L'ADMINISTRATEUR

import { requireRole } from "@/lib/auth";
import NotificationsPage from "@/components/notifications/NotificationsPage";

export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const user = await requireRole("ADMIN");
  return <NotificationsPage user={user} />;
}
