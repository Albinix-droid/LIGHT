// app/encadrant/projets/page.tsx
// PROJETS SUIVIS PAR L'ENCADRANT

import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listSupervisedProjects, fullName } from "@/lib/projects";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { getFollowUpStatus, STEP_STATUS_COLORS } from "../projectStatus";

export default async function EncadrantProjectsPage() {
  const user = await requireRole("ENCADRANT");
  const projects = await listSupervisedProjects(user.id);

  return (
    <div className="enc-page">
      <div style={{ marginBottom: "24px" }}>
        <h1 className="enc-h1">Projets suivis</h1>
        <p className="enc-sub">
          {projects.length === 0
            ? "Aucun étudiant ne vous a encore choisi comme encadrant."
            : `Vous accompagnez ${projects.length} projet${projects.length > 1 ? "s" : ""}.`}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="enc-card enc-empty" style={{ padding: "60px 20px" }}>
          <FolderKanban size={36} style={{ color: "rgba(212,175,55,0.4)", marginBottom: "12px" }} />
          <p style={{ margin: 0 }}>Les étudiants vous choisissent depuis la page de leur projet. Leurs projets apparaîtront ici.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {projects.map((p) => {
            const status = getFollowUpStatus(p);
            const current = getStageIndex(p.stage);
            return (
              <Link key={p.id} href={`/encadrant/projets/${p.id}`} className="enc-card enc-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "12px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>{p.title}</p>
                    <p className="enc-muted" style={{ fontSize: "12px", margin: "3px 0 0" }}>
                      {fullName(p.owner)}{p.sector ? ` · ${SECTOR_LABELS[p.sector] ?? p.sector}` : ""}
                    </p>
                  </div>
                  <span className="enc-badge" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                </div>

                {/* Frise des 5 étapes */}
                <div style={{ display: "flex", gap: "4px" }} aria-label={`Étape actuelle : ${STAGES[current].label}`}>
                  {STAGES.map((s, i) => {
                    const stepStatus = p.steps.find((x) => x.stage === s.stage)?.status;
                    const color = stepStatus ? STEP_STATUS_COLORS[stepStatus] : i <= current ? STEP_STATUS_COLORS.IN_PROGRESS : "rgba(255,255,255,0.08)";
                    return <span key={s.slug} title={s.label} style={{ flex: 1, height: "5px", borderRadius: "3px", background: color, opacity: i > current ? 0.5 : 1 }} />;
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <span className="enc-muted">
                    Étape {current + 1}/5 · {STAGES[current].label} · {p.progress}%
                  </span>
                  <ArrowRight size={14} style={{ color: "#F5D76E" }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
