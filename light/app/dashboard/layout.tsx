// app/dashboard/layout.tsx
// LAYOUT DASHBOARD : charge l'utilisateur connecté et ses projets

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects";
import { countUnreadMessages } from "@/lib/messagerie/queries";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Les encadrants ont leur propre espace
  if (user.role === "ENCADRANT") redirect("/encadrant");

  const [projects, unreadMessages] = await Promise.all([listProjectsForUser(user.id), countUnreadMessages(user.id)]);

  return (
    <DashboardShell
      user={{ firstName: user.firstName, lastName: user.lastName }}
      projects={projects.map((p) => ({ id: p.id, title: p.title }))}
      unreadMessages={unreadMessages}
    >
      {children}
    </DashboardShell>
  );
}
