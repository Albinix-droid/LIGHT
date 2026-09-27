// app/encadrant/parametres/page.tsx
// PARAMÈTRES DE L'ENCADRANT

import { requireRole } from "@/lib/auth";
import SettingsPage from "@/components/parametres/SettingsPage";

export const metadata = { title: "Paramètres" };

export default async function EncadrantSettingsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const [user, { section }] = await Promise.all([requireRole("ENCADRANT"), searchParams]);
  return <SettingsPage user={user} basePath="/encadrant/parametres" section={section} />;
}
