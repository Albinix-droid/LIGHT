// app/encadrant/projets/[id]/page.tsx
// SUIVI D'UN PROJET PAR L'ENCADRANT : frise des étapes, contenu, historique des échanges

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Lock, Circle, MessageSquare, ArrowRight, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getSupervisedProject, fullName } from "@/lib/projects";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { Stars, formatDate } from "@/app/dashboard/projets/[id]/StepStatusBanner";
import StepDataView from "../../StepDataView";
import { getFollowUpStatus } from "../../projectStatus";

const STEP_DISPLAY = {
  COMPLETED: { label: "Validée", color: "#34D399", Icon: CheckCircle },
  SUBMITTED: { label: "Soumise · à examiner", color: "#F5B544", Icon: Clock },
  CHANGES_REQUESTED: { label: "Modifications demandées", color: "#F0928B", Icon: AlertTriangle },
  IN_PROGRESS: { label: "En cours de rédaction", color: "#F5D76E", Icon: Circle },
  UPCOMING: { label: "À venir · préparation en cours", color: "rgba(200,215,235,0.5)", Icon: Lock },
  NOT_STARTED: { label: "Pas encore commencée", color: "rgba(200,215,235,0.35)", Icon: Lock },
} as const;

export default async function EncadrantProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("ENCADRANT");
  const project = await getSupervisedProject(id, user.id);
  if (!project) notFound();

  const current = getStageIndex(project.stage);
  const status = getFollowUpStatus(project);
  const team = project.members.filter((m) => m.userId !== project.ownerId);

  return (
    <div className="enc-page" style={{ maxWidth: "960px" }}>
      <Link href="/encadrant/projets" className="enc-btn" style={{ marginBottom: "18px", padding: "7px 14px" }}>
        <ArrowLeft size={14} /> Projets suivis
      </Link>

      {/* ===== EN-TÊTE ===== */}
      <div className="enc-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <h1 className="enc-h1">{project.title}</h1>
            <p className="enc-sub">
              Porté par {fullName(project.owner)} ({project.owner.email})
              {project.sector ? ` · ${SECTOR_LABELS[project.sector] ?? project.sector}` : ""}
            </p>
            {team.length > 0 && (
              <p className="enc-muted" style={{ fontSize: "12px", margin: "6px 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                <Users size={13} /> Équipe : {team.map((m) => fullName(m.user)).join(", ")}
              </p>
            )}
          </div>
          <span className="enc-badge" style={{ background: status.bg, color: status.color }}>{status.label}</span>
        </div>
        {project.description && (
          <p style={{ fontSize: "14px", color: "rgba(232,237,245,0.75)", lineHeight: 1.6, margin: "14px 0 0" }}>{project.description}</p>
        )}
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
            <span className="enc-muted">Progression du parcours</span>
            <span style={{ color: "#F5D76E", fontWeight: 600 }}>{project.progress}%</span>
          </div>
          <div className="enc-progress"><div style={{ width: `${project.progress}%` }} /></div>
        </div>
      </div>

      {/* ===== FRISE DES ÉTAPES ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {STAGES.map((stage, index) => {
          const step = project.steps.find((s) => s.stage === stage.stage);
          // Les étapes à venir peuvent déjà contenir un brouillon de l'étudiant
          const key = index > current && step?.status !== "COMPLETED" ? (step ? "UPCOMING" : "NOT_STARTED") : step?.status ?? "IN_PROGRESS";
          const display = STEP_DISPLAY[key];
          const pending = step?.submissions.find((s) => !s.decision);
          const rounds = step?.submissions.filter((s) => s.decision) ?? [];

          return (
            <div key={stage.slug} className="enc-card" style={{ padding: "18px 20px", opacity: key === "NOT_STARTED" ? 0.55 : key === "UPCOMING" ? 0.8 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0, display: "flex",
                  alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)",
                }}>
                  <display.Icon size={18} style={{ color: display.color }} />
                </div>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>{index + 1}. {stage.label}</p>
                  <p style={{ fontSize: "12px", color: display.color, margin: "2px 0 0" }}>
                    {display.label}
                    {key === "COMPLETED" && step?.completedAt && ` le ${formatDate(step.completedAt.toISOString())}`}
                    {pending && ` depuis le ${formatDate(pending.submittedAt.toISOString())}`}
                  </p>
                </div>
                {pending && (
                  <Link href={`/encadrant/validations?id=${pending.id}`} className="enc-btn enc-btn-primary">
                    Examiner <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              {/* Historique des échanges sur l'étape */}
              {rounds.length > 0 && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {rounds.map((r) => (
                    <div key={r.id} style={{ padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${r.decision === "APPROVED" ? "#34D399" : "#F5B544"}` }}>
                      {r.note && (
                        <p style={{ fontSize: "12px", color: "#A5B4FC", margin: "0 0 6px", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                          <MessageSquare size={12} style={{ marginTop: "2px", flexShrink: 0 }} />
                          <span style={{ whiteSpace: "pre-wrap" }}>{fullName(r.author)} : {r.note}</span>
                        </p>
                      )}
                      <p className="enc-muted" style={{ fontSize: "12px", margin: "0 0 4px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        {r.reviewedAt && formatDate(r.reviewedAt.toISOString())} · {r.decision === "APPROVED" ? "Validée" : "Modifications demandées"} par {fullName(r.reviewer) || "l'encadrant"}
                        {r.rating ? <Stars rating={r.rating} size={11} /> : null}
                      </p>
                      <p style={{ fontSize: "13px", color: "rgba(232,237,245,0.85)", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{r.feedback}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Contenu actuel de l'étape (brouillon compris) */}
              {step && (
                <details style={{ marginTop: "14px" }}>
                  <summary style={{ cursor: "pointer", fontSize: "13px", color: "#F5D76E", fontWeight: 600 }}>
                    Voir le contenu actuel de l&apos;étape
                  </summary>
                  <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(180,200,230,0.08)" }}>
                    <StepDataView slug={stage.slug} data={step.data} />
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
