// app/dashboard/parametres/page.tsx
// PARAMÈTRES DE L'ÉTUDIANT

import { requireUser } from "@/lib/auth";
import SettingsPage from "@/components/parametres/SettingsPage";

export const metadata = { title: "Paramètres" };

export default async function StudentSettingsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const [user, { section }] = await Promise.all([requireUser(), searchParams]);
  return (
    <div style={{ minHeight: "100vh", background: "#0A1628" }}>
      <SettingsPage user={user} basePath="/dashboard/parametres" section={section} />
    </div>
  );
}
