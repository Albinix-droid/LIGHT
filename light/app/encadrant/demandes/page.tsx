// app/encadrant/demandes/page.tsx
// DEMANDES D'ENCADREMENT REÇUES PAR L'ENCADRANT

import { requireRole } from "@/lib/auth";
import { listRequestsForUser } from "@/lib/demandes/queries";
import RequestsCenter from "@/components/demandes/RequestsCenter";

export const metadata = { title: "Demandes d'encadrement" };

export default async function EncadrantDemandesPage() {
  const user = await requireRole("ENCADRANT");
  const requests = await listRequestsForUser(user.id);
  return <RequestsCenter requests={requests} variant="encadrant" />;
}
