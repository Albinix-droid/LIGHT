import { PrismaClient, ProjectStage, TaskStatus, TaskPriority, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Test1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "etudiant@iai.cm" },
    update: {},
    create: {
      email: "etudiant@iai.cm",
      passwordHash,
      firstName: "Jean",
      lastName: "Dupont",
    },
  });

  const project = await prisma.project.create({
    data: {
      title: "Projet Innov'Afrique",
      stage: ProjectStage.DEVELOPPEMENT,
      progress: 65,
      budgetEstimated: 4_500_000,
      budgetSpent: 2_150_000,
      ownerId: user.id,
      members: {
        create: [
          { userId: user.id, role: "OWNER", status: "ONLINE" },
        ],
      },
      tasks: {
        create: [
          { title: "Étude de marché", status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH },
          { title: "Prototype MVP", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
          { title: "Test utilisateurs", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
          { title: "Présentation investisseurs", status: TaskStatus.TODO, priority: TaskPriority.LOW },
        ],
      },
      notifications: {
        create: [
          { userId: user.id, type: NotificationType.INVITATION, message: "Paul Tchou a accepté votre invitation" },
          { userId: user.id, type: NotificationType.VALIDATION, message: "Jalon « Conception » validé par l'encadrant" },
          { userId: user.id, type: NotificationType.MESSAGE, message: "Nouveau message de Marie Claire", readAt: new Date() },
          { userId: user.id, type: NotificationType.SYSTEM, message: "Rappel : Soutenance dans 15 jours", readAt: new Date() },
        ],
      },
    },
  });

  console.log({ user: user.email, project: project.title });
}

main().finally(() => prisma.$disconnect());