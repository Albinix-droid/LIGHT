// components/parametres/SettingsPage.tsx
// Chargement serveur commun aux pages Paramètres étudiant et encadrant

import { getAccountStats, getSettingsProfile } from "@/lib/parametres/queries";
import SettingsApp from "./SettingsApp";

const SECTIONS = ["profil", "securite", "notifications", "donnees"] as const;
type Section = (typeof SECTIONS)[number];

export default async function SettingsPage({
  user,
  basePath,
  section,
}: {
  user: Parameters<typeof getSettingsProfile>[0];
  basePath: string;
  section?: string;
}) {
  const [profile, stats] = await Promise.all([getSettingsProfile(user), getAccountStats(user.id)]);
  const initialSection: Section = SECTIONS.includes(section as Section) ? (section as Section) : "profil";
  return <SettingsApp profile={profile} stats={stats} basePath={basePath} initialSection={initialSection} />;
}
