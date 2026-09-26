// app/dashboard/page.tsx
// ACCUEIL DU DASHBOARD : projet le plus récent de l'utilisateur

import Link from "next/link";
import { Rocket, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects";
import { getStageIndex } from "@/lib/parcours";
import DashboardHome from "./DashboardHome";

export default async function DashboardPage() {
  const user = await requireUser();
  const [project] = await listProjectsForUser(user.id);

  if (!project) {
    return (
      <div style={{ maxWidth: "560px", margin: "80px auto", textAlign: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 20px",
          background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Rocket size={28} style={{ color: "#F5D76E" }} />
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#E8EDF5", margin: "0 0 8px" }}>
          Bienvenue, {user.firstName} !
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(200,215,235,0.55)", lineHeight: 1.6, margin: "0 0 28px" }}>
          Tu n&apos;as pas encore de projet. Crée ton premier projet pour démarrer le parcours
          en 5 étapes, de l&apos;idéalisation à la concrétisation.
        </p>
        <Link
          href="/dashboard/projets/nouveau"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px",
            background: "linear-gradient(135deg, #D4AF37, #F5D76E)", color: "#0A1628",
            borderRadius: "50px", fontSize: "15px", fontWeight: 700, textDecoration: "none",
          }}
        >
          <Plus size={18} />
          Créer mon projet
        </Link>
      </div>
    );
  }

  return (
    <DashboardHome
      project={{
        id: project.id,
        name: project.title,
        progress: project.progress,
        stageIndex: getStageIndex(project.stage),
        budget: { estimated: project.budgetEstimated, spent: project.budgetSpent },
      }}
    />
  );
}
