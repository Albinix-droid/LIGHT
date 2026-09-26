// app/dashboard/not-found.tsx
// PAGE 404 DU DASHBOARD (affichée dans le layout, sidebar conservée)

import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div style={{ maxWidth: "520px", margin: "80px auto", textAlign: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{
        width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 20px",
        background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Compass size={28} style={{ color: "#F5D76E" }} />
      </div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#E8EDF5", margin: "0 0 8px" }}>
        Page introuvable
      </h1>
      <p style={{ fontSize: "15px", color: "rgba(200,215,235,0.55)", lineHeight: 1.6, margin: "0 0 28px" }}>
        Cette page n&apos;existe pas, ou ce projet n&apos;existe pas ou ne vous est pas accessible.
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px",
            border: "1px solid rgba(180,200,230,0.15)", borderRadius: "50px",
            color: "rgba(200,215,235,0.7)", fontSize: "14px", textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} />
          Tableau de bord
        </Link>
        <Link
          href="/dashboard/projets"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px",
            background: "linear-gradient(135deg, #D4AF37, #F5D76E)", color: "#0A1628",
            borderRadius: "50px", fontSize: "14px", fontWeight: 700, textDecoration: "none",
          }}
        >
          Mes projets
        </Link>
      </div>
    </div>
  );
}
