// app/admin/parametres/page.tsx
// PARAMÈTRES DE L'ADMINISTRATEUR

import { requireRole } from "@/lib/auth";
import SettingsPage from "@/components/parametres/SettingsPage";

export const metadata = { title: "Paramètres" };

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const [user, { section }] = await Promise.all([requireRole("ADMIN"), searchParams]);
  return <SettingsPage user={user} basePath="/admin/parametres" section={section} />;
}
