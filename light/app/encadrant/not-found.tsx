// app/encadrant/not-found.tsx
// PAGE 404 DE L'ESPACE ENCADRANT (dans le layout)

import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState, buttonClass } from "@/components/ui/kit";

export default function EncadrantNotFound() {
  return (
    <div className="mx-auto max-w-xl pt-16">
      <EmptyState
        icon={Compass}
        title="Page introuvable"
        description="Cette page n'existe pas, ou ce projet n'est pas suivi par vous."
        action={<Link href="/encadrant" className={buttonClass("primary")}>Retour au tableau de bord</Link>}
      />
    </div>
  );
}
