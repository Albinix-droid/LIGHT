// app/dashboard/page.tsx
// ACCUEIL ÉTUDIANT : synthèse du projet, activité du parcours, équipe, actions, projets

import { requireUser } from "@/lib/auth";
import { getStudentHome, requestTime } from "@/lib/dashboard/queries";
import HomeView from "./_home/HomeView";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ projet?: string }> }) {
  const [user, { projet }] = await Promise.all([requireUser(), searchParams]);
  const home = await getStudentHome(user.id, projet);
  return <HomeView firstName={user.firstName} home={home} serverNow={requestTime()} />;
}
