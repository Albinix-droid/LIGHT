// app/dashboard/[...introuvable]/page.tsx
// Toute URL inconnue sous /dashboard affiche la 404 du dashboard (dans le layout)

import { notFound } from "next/navigation";

export default function DashboardCatchAll() {
  notFound();
}
