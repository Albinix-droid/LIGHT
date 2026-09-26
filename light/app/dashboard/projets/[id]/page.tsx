// app/dashboard/projets/[id]/page.tsx
// VUE D'ENSEMBLE D'UN PROJET - PARCOURS EN 5 ÉTAPES ET SUIVI PAR L'ENCADRANT

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, CheckCircle, ArrowRight, Lightbulb, PenTool, Code, Shield, Rocket,
  Clock, AlertTriangle, GraduationCap, Compass, Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAccessibleProject, listEncadrants, fullName } from "@/lib/projects";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { getProjectTeam } from "@/lib/demandes/queries";
import { markReadForPath } from "@/lib/notifications/queries";
import SupervisorPicker from "./SupervisorPicker";
import TeamPanel from "./TeamPanel";
import { Stars, formatDate } from "./StepStatusBanner";

const STAGE_ICONS = [Lightbulb, PenTool, Code, Shield, Rocket];

const STATUS_DISPLAY = {
  COMPLETED: { label: "Validée par l'encadrant", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  SUBMITTED: { label: "Soumise · en attente de l'encadrant", color: "#F5B544", bg: "rgba(245,158,11,0.12)" },
  CHANGES_REQUESTED: { label: "Modifications demandées", color: "#F0928B", bg: "rgba(228,115,107,0.12)" },
  IN_PROGRESS: { label: "En cours", color: "#F5D76E", bg: "rgba(212,175,55,0.1)" },
  UPCOMING: { label: "À venir · vous pouvez déjà la préparer", color: "rgba(200,215,235,0.55)", bg: "rgba(255,255,255,0.05)" },
} as const;

export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [project, encadrants] = await Promise.all([getAccessibleProject(id, user.id), listEncadrants()]);
  if (!project) notFound();

  const [{ team, pendingInvitations, pendingSupervision }] = await Promise.all([
    getProjectTeam(project.id, user.id),
    markReadForPath(user.id, user.role, `/dashboard/projets/${project.id}`),
  ]);
  const isOwner = project.ownerId === user.id;
  const currentIndex = getStageIndex(project.stage);

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", fontFamily: "'Inter', -apple-system, sans-serif", padding: "0 0 24px 0" }}>
      <style>{`
        .step-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(180, 200, 230, 0.08);
          text-decoration: none;
          transition: all 0.3s ease;
        }
        a.step-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(212, 175, 55, 0.2);
          transform: translateY(-2px);
        }
        .step-card-upcoming { opacity: 0.75; }
        .step-card-upcoming:hover { opacity: 1; }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid rgba(180, 200, 230, 0.15);
          border-radius: 50px;
          color: rgba(200, 215, 235, 0.6);
          text-decoration: none;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.03);
        }
        .btn-back:hover { color: #E8EDF5; border-color: rgba(180, 200, 230, 0.25); }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        {/* ===== EN-TÊTE ===== */}
        <Link href="/dashboard/projets" className="btn-back" style={{ marginBottom: "16px" }}>
          <ArrowLeft size={16} />
          Mes projets
        </Link>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#E8EDF5", margin: "12px 0 4px", letterSpacing: "-0.5px" }}>
          {project.title}
        </h1>
        <p style={{ color: "rgba(200,215,235,0.5)", fontSize: "14px", margin: "0 0 20px" }}>
          {project.sector ? SECTOR_LABELS[project.sector] ?? project.sector : "Secteur non renseigné"}
          {" · "}
          {project.teamSize} personne{project.teamSize > 1 ? "s" : ""}
        </p>
        {project.description && (
          <p style={{ color: "rgba(200,215,235,0.7)", fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px" }}>
            {project.description}
          </p>
        )}

        {/* ===== MENTOR IA ===== */}
        <Link
          href={`/dashboard/assistant?projet=${project.id}`}
          style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "16px", marginBottom: "16px",
            background: "linear-gradient(135deg, rgba(212,175,55,0.14), rgba(212,175,55,0.04))", border: "1px solid rgba(212,175,55,0.25)",
            textDecoration: "none",
          }}
        >
          <Sparkles size={18} style={{ color: "#F5D76E", flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#E8EDF5" }}>Analyser ce projet avec le mentor IA</span>
            <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.55)" }}>Forces, risques, marché, modèle économique, plan de lancement…</span>
          </span>
          <ArrowRight size={16} style={{ color: "#F5D76E" }} />
        </Link>

        {/* ===== ENCADRANT ===== */}
        <div style={{
          padding: "18px 20px", borderRadius: "16px", marginBottom: "24px",
          background: project.supervisor ? "rgba(16,185,129,0.05)" : "rgba(99,102,241,0.07)",
          border: `1px solid ${project.supervisor ? "rgba(16,185,129,0.18)" : "rgba(99,102,241,0.22)"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <GraduationCap size={18} style={{ color: project.supervisor ? "#34D399" : "#A5B4FC" }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                {project.supervisor ? `Encadrant : ${fullName(project.supervisor)}` : "Demandez un encadrant"}
              </p>
              <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.5)", margin: "2px 0 0" }}>
                {project.supervisor
                  ? "Il examine chaque étape que vous soumettez et vous accompagne jusqu'à la concrétisation."
                  : "L'encadrant choisi reçoit votre demande et l'accepte ; il validera ensuite chaque étape avant de débloquer la suivante."}
              </p>
            </div>
          </div>
          <SupervisorPicker
            projectId={project.id}
            currentId={project.supervisorId}
            canEdit={isOwner}
            encadrants={encadrants.map((e) => ({ id: e.id, name: fullName(e), email: e.email }))}
            pendingRequest={pendingSupervision}
          />
        </div>

        {/* ===== ÉQUIPE ===== */}
        <TeamPanel
          projectId={project.id}
          isOwner={isOwner}
          team={team}
          pendingInvitations={pendingInvitations}
          teamSize={project.teamSize}
        />

        {/* ===== PROGRESSION ===== */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)" }}>Progression du parcours</span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#F5D76E" }}>{project.progress}%</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${project.progress}%`, background: "linear-gradient(90deg, #D4AF37, #F5D76E)", borderRadius: "3px" }} />
          </div>
        </div>

        {/* ===== ÉTAPES ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {STAGES.map((stage, index) => {
            const Icon = STAGE_ICONS[index];
            const step = project.steps.find((s) => s.stage === stage.stage);
            const last = step?.submissions[0];
            // Étape à venir : consultable et modifiable, soumise après validation de la précédente
            const isUpcoming = index > currentIndex && step?.status !== "COMPLETED";
            const statusKey = isUpcoming ? "UPCOMING" : step?.status ?? "IN_PROGRESS";
            const display = STATUS_DISPLAY[statusKey];
            const StatusIcon = statusKey === "COMPLETED" ? CheckCircle
              : statusKey === "UPCOMING" ? Compass
              : statusKey === "SUBMITTED" ? Clock
              : statusKey === "CHANGES_REQUESTED" ? AlertTriangle
              : Icon;

            const content = (
              <>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", background: display.bg,
                }}>
                  <StatusIcon size={18} style={{ color: display.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                    {index + 1}. {stage.label}
                  </p>
                  <p style={{ fontSize: "12px", color: display.color, margin: "2px 0 0" }}>
                    {display.label}
                    {statusKey === "COMPLETED" && step?.completedAt && ` le ${formatDate(step.completedAt.toISOString())}`}
                    {statusKey === "SUBMITTED" && last && ` depuis le ${formatDate(last.submittedAt.toISOString())}`}
                  </p>
                  {/* Dernier retour de l'encadrant */}
                  {last?.feedback && last.decision && (
                    <div style={{
                      marginTop: "8px", padding: "8px 12px", borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${display.color}`,
                    }}>
                      <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.45)", margin: "0 0 2px", display: "flex", alignItems: "center", gap: "6px" }}>
                        {fullName(last.reviewer) || "Encadrant"}
                        {last.rating ? <Stars rating={last.rating} size={11} /> : null}
                      </p>
                      <p style={{
                        fontSize: "13px", color: "rgba(232,237,245,0.8)", margin: 0, lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {last.feedback}
                      </p>
                    </div>
                  )}
                </div>
                <ArrowRight size={16} style={{ color: "rgba(200,215,235,0.4)", marginTop: "12px" }} />
              </>
            );

            return (
              <Link
                key={stage.slug}
                href={`/dashboard/projets/${project.id}/${stage.slug}`}
                className={`step-card ${isUpcoming ? "step-card-upcoming" : ""}`}
                title={isUpcoming ? "Soumission possible après validation de l'étape précédente par votre encadrant" : undefined}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
