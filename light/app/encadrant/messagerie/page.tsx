// app/encadrant/messagerie/page.tsx
// MESSAGERIE ENCADRANT : messages privés avec les étudiants, canaux de filière GL / SR

import { requireRole } from "@/lib/auth";
import { getInbox, toPerson } from "@/lib/messagerie/queries";
import ChatApp from "@/components/messagerie/ChatApp";

export default async function EncadrantMessageriePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await requireRole("ENCADRANT");
  const [{ c }, inbox] = await Promise.all([searchParams, getInbox(user.id)]);

  return (
    <ChatApp
      me={toPerson(user)}
      basePath="/encadrant/messagerie"
      initialInbox={inbox}
      initialSelectedId={c && inbox.some((conv) => conv.id === c) ? c : null}
      projects={[]}
    />
  );
}
