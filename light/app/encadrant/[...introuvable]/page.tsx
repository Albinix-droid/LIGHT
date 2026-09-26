// app/encadrant/[...introuvable]/page.tsx
// Toute URL inconnue sous /encadrant affiche la 404 de l'espace encadrant

import { notFound } from "next/navigation";

export default function EncadrantCatchAll() {
  notFound();
}
