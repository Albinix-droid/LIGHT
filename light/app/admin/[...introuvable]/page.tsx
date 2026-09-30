// app/admin/[...introuvable]/page.tsx
// Toute URL inconnue sous /admin affiche la 404 de l'administration

import { notFound } from "next/navigation";

export default function AdminCatchAll() {
  notFound();
}
