// app/dashboard/messagerie/page.tsx
// MESSAGERIE ÉTUDIANT : messages privés, groupes de projet, canaux GL / SR

import { requireUser } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects";
import { getInbox, toPerson } from "@/lib/messagerie/queries";
import ChatApp from "@/components/messagerie/ChatApp";

export default async function MessageriePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await requireUser();
  const [{ c }, inbox, projects] = await Promise.all([searchParams, getInbox(user.id), listProjectsForUser(user.id)]);

  return (
    <ChatApp
      me={toPerson(user)}
      basePath="/dashboard/messagerie"
      initialInbox={inbox}
      // On n'ouvre que les conversations dont l'utilisateur est membre
      initialSelectedId={c && inbox.some((conv) => conv.id === c) ? c : null}
      projects={projects.map((p) => ({ id: p.id, title: p.title }))}
    />
  );
}
