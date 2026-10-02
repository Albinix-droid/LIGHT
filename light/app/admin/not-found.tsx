// app/admin/not-found.tsx
// PAGE 404 DE L'ADMINISTRATION (dans le layout)

import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState, buttonClass } from "@/components/ui/kit";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-xl pt-16">
      <EmptyState
        icon={Compass}
        title="Page introuvable"
        description="Cette page n'existe pas dans l'espace d'administration."
        action={<Link href="/admin" className={buttonClass("primary")}>Retour à la vue d&apos;ensemble</Link>}
      />
    </div>
  );
}
