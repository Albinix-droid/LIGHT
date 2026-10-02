// app/dashboard/not-found.tsx
// PAGE 404 DU DASHBOARD (affichée dans le layout, sidebar conservée)

import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { EmptyState, buttonClass } from "@/components/ui/kit";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto max-w-xl pt-16">
      <EmptyState
        icon={Compass}
        title="Page introuvable"
        description="Cette page n'existe pas, ou ce projet n'existe pas ou ne vous est pas accessible."
        action={
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/dashboard" className={buttonClass("secondary")}><ArrowLeft /> Tableau de bord</Link>
            <Link href="/dashboard/projets" className={buttonClass("primary")}>Mes projets</Link>
          </div>
        }
      />
    </div>
  );
}
