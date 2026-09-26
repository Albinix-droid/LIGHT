// app/encadrant/demandes/page.tsx
// DEMANDES D'ENCADREMENT REÇUES PAR L'ENCADRANT

import { requireRole } from "@/lib/auth";
import { markReadForPath } from "@/lib/notifications/queries";
import { listRequestsForUser } from "@/lib/demandes/queries";
import RequestsCenter from "@/components/demandes/RequestsCenter";

export const metadata = { title: "Demandes d'encadrement" };

export default async function EncadrantDemandesPage() {
  const user = await requireRole("ENCADRANT");
  const [requests] = await Promise.all([listRequestsForUser(user.id), markReadForPath(user.id, user.role, "/encadrant/demandes")]);
  return <RequestsCenter requests={requests} variant="encadrant" />;
}
