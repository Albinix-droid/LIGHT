// app/encadrant/layout.tsx
// LAYOUT ENCADRANT : réservé au rôle ENCADRANT, charge les projets suivis et la file de validation

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { listSupervisedProjects } from "@/lib/projects";
import { countUnreadMessages } from "@/lib/messagerie/queries";
import EncadrantShell from "./EncadrantShell";

export default async function EncadrantLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ENCADRANT");
  const [projects, pendingCount, unreadMessages] = await Promise.all([
    listSupervisedProjects(user.id),
    prisma.stepSubmission.count({ where: { decision: null, step: { project: { supervisorId: user.id } } } }),
    countUnreadMessages(user.id),
  ]);

  return (
    <EncadrantShell
      user={{ firstName: user.firstName, lastName: user.lastName }}
      projects={projects.map((p) => ({ id: p.id, title: p.title }))}
      pendingCount={pendingCount}
      unreadMessages={unreadMessages}
    >
      {children}
    </EncadrantShell>
  );
}
