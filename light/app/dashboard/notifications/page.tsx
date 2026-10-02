// app/dashboard/notifications/page.tsx
// NOTIFICATIONS DE L'ÉTUDIANT

import { requireUser } from "@/lib/auth";
import NotificationsPage from "@/components/notifications/NotificationsPage";

export const metadata = { title: "Notifications" };

export default async function StudentNotificationsPage() {
  const user = await requireUser();
  return (
    <NotificationsPage user={user} />
  );
}
