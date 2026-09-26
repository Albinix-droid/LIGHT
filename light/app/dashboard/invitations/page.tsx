// app/dashboard/invitations/page.tsx
// DEMANDES & INVITATIONS DE L'ÉTUDIANT

import { requireUser } from "@/lib/auth";
import { markReadForPath } from "@/lib/notifications/queries";
import { listDiscoverableProjects, listRequestsForUser } from "@/lib/demandes/queries";
import RequestsCenter from "@/components/demandes/RequestsCenter";

export const metadata = { title: "Demandes & invitations" };

export default async function InvitationsPage() {
  const user = await requireUser();
  const [requests, discover] = await Promise.all([
    listRequestsForUser(user.id),
    listDiscoverableProjects(user.id),
    markReadForPath(user.id, user.role, "/dashboard/invitations"),
  ]);
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628" }}>
      <RequestsCenter requests={requests} variant="student" initialDiscover={discover} />
    </div>
  );
}
