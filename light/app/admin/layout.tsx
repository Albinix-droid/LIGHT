// app/admin/layout.tsx
// LAYOUT ADMINISTRATEUR : réservé au rôle ADMIN (confirmé avec les identifiants de l'école)

import { requireRole } from "@/lib/auth";
import { getAdminCounters } from "@/lib/admin/queries";
import { countUnreadNotifications } from "@/lib/notifications/queries";
import AdminShell from "./AdminShell";

export const metadata = { title: { default: "Administration", template: "%s · Administration" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const [{ pendingStaff }, unreadNotifications] = await Promise.all([getAdminCounters(), countUnreadNotifications(user.id)]);

  return (
    <AdminShell
      user={{ firstName: user.firstName, lastName: user.lastName, avatarUrl: user.avatarUrl, grade: user.grade }}
      pendingStaff={pendingStaff}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AdminShell>
  );
}
