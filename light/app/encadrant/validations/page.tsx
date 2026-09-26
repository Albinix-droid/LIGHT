// app/encadrant/validations/page.tsx
// FILE DE VALIDATION : étapes soumises par les étudiants, examen détaillé et décision

import Link from "next/link";
import { CheckSquare, Clock, MessageSquare, History, Inbox, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { listPendingSubmissions, listReviewedSubmissions, listStepRounds, fullName } from "@/lib/projects";
import { STAGES } from "@/lib/parcours";
import { Stars, formatDate } from "@/app/dashboard/projets/[id]/StepStatusBanner";
import StepDataView from "../StepDataView";
import ReviewForm from "./ReviewForm";

const stageOf = (key: string) => STAGES.find((s) => s.stage === key)!;

export default async function ValidationsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireRole("ENCADRANT");
  const { id } = await searchParams;
  const [pending, reviewed] = await Promise.all([listPendingSubmissions(user.id), listReviewedSubmissions(user.id, 10)]);

  // Soumission examinée : celle de l'URL, sinon la plus ancienne en attente
  const selectedId = id ?? pending[0]?.id;
  const selected = selectedId
    ? await prisma.stepSubmission.findFirst({
        where: { id: selectedId, step: { project: { supervisorId: user.id } } },
        include: {
          author: { select: { firstName: true, lastName: true, email: true } },
          reviewer: { select: { firstName: true, lastName: true } },
          step: { include: { project: { select: { id: true, title: true, progress: true } } } },
        },
      })
    : null;
  const previousRounds = selected
    ? (await listStepRounds(selected.stepId)).filter((r) => r.id !== selected.id && r.decision)
    : [];

  return (
    <div className="enc-page">
      <div style={{ marginBottom: "24px" }}>
        <h1 className="enc-h1">Validations</h1>
        <p className="enc-sub">
          {pending.length === 0
            ? "Aucune étape en attente : vos étudiants sont à jour."
            : `${pending.length} étape${pending.length > 1 ? "s" : ""} en attente de votre décision, les plus anciennes d'abord.`}
        </p>
      </div>

      <div className="enc-two-cols" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>
        {/* ===== FILE D'ATTENTE ===== */}
        <div className="enc-card" style={{ padding: "16px", position: "sticky", top: "90px" }}>
          <h2 className="enc-h2" style={{ marginBottom: "12px", padding: "0 4px" }}>
            <Inbox size={16} style={{ color: "#F5D76E" }} /> File d&apos;attente
          </h2>
          {pending.length === 0 ? (
            <p className="enc-empty">Rien à examiner pour le moment 🎉</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pending.map((s) => {
                const stage = stageOf(s.step.stage);
                return (
                  <Link
                    key={s.id}
                    href={`/encadrant/validations?id=${s.id}`}
                    className={`enc-row ${selected?.id === s.id ? "enc-row-active" : ""}`}
                    style={{ flexDirection: "column", alignItems: "stretch", gap: "6px" }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#E8EDF5" }}>{s.step.project.title}</span>
                    <span style={{ fontSize: "12px" }} className="enc-muted">{fullName(s.author)}</span>
                    <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="enc-badge" style={{ background: "rgba(212,175,55,0.12)", color: "#F5D76E" }}>{stage.label}</span>
                      <span style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }} className="enc-muted">
                        <Clock size={11} /> {formatDate(s.submittedAt.toISOString())}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== EXAMEN ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
          {!selected ? (
            <div className="enc-card enc-empty" style={{ padding: "60px 20px" }}>
              <CheckSquare size={36} style={{ color: "rgba(212,175,55,0.4)", marginBottom: "12px" }} />
              <p style={{ margin: 0 }}>Les étapes soumises par vos étudiants apparaîtront ici.</p>
            </div>
          ) : (
            <>
              {/* En-tête */}
              <div className="enc-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <span className="enc-badge" style={{ background: "rgba(212,175,55,0.12)", color: "#F5D76E", marginBottom: "8px" }}>
                      Étape {STAGES.findIndex((x) => x.stage === selected.step.stage) + 1}/5 · {stageOf(selected.step.stage).label}
                    </span>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#E8EDF5", margin: "6px 0 2px" }}>{selected.step.project.title}</h2>
                    <p className="enc-muted" style={{ fontSize: "13px", margin: 0 }}>
                      {fullName(selected.author)} · soumis le {formatDate(selected.submittedAt.toISOString())}
                    </p>
                  </div>
                  <Link href={`/encadrant/projets/${selected.step.project.id}`} className="enc-btn">
                    Voir le projet <ArrowRight size={14} />
                  </Link>
                </div>
                {selected.note && (
                  <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <p style={{ fontSize: "12px", color: "#A5B4FC", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                      <MessageSquare size={13} /> Message de l&apos;étudiant
                    </p>
                    <p style={{ fontSize: "14px", color: "#E8EDF5", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.note}</p>
                  </div>
                )}
                {selected.decision && (
                  <p style={{ marginTop: "14px", fontSize: "13px", color: selected.decision === "APPROVED" ? "#34D399" : "#F5B544" }}>
                    Décision déjà rendue : {selected.decision === "APPROVED" ? "étape validée" : "modifications demandées"}
                    {selected.reviewedAt && ` le ${formatDate(selected.reviewedAt.toISOString())}`}.
                  </p>
                )}
              </div>

              {/* Tours précédents */}
              {previousRounds.length > 0 && (
                <div className="enc-card">
                  <h3 className="enc-h2" style={{ marginBottom: "12px" }}>
                    <History size={16} style={{ color: "#F5D76E" }} /> Tours précédents sur cette étape
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {previousRounds.map((r) => (
                      <div key={r.id} style={{ padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${r.decision === "APPROVED" ? "#34D399" : "#F5B544"}` }}>
                        <p style={{ fontSize: "12px", margin: "0 0 4px", display: "flex", gap: "8px", alignItems: "center" }} className="enc-muted">
                          {formatDate((r.reviewedAt ?? r.submittedAt).toISOString())} · {r.decision === "APPROVED" ? "Validée" : "Modifications demandées"}
                          {r.rating ? <Stars rating={r.rating} size={11} /> : null}
                        </p>
                        <p style={{ fontSize: "13px", color: "rgba(232,237,245,0.85)", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{r.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contenu soumis */}
              <div className="enc-card">
                <h3 className="enc-h2" style={{ marginBottom: "16px" }}>Contenu soumis</h3>
                <StepDataView slug={stageOf(selected.step.stage).slug} data={selected.data} />
              </div>

              {/* Décision */}
              {!selected.decision && (
                <ReviewForm
                  key={selected.id}
                  submissionId={selected.id}
                  stageLabel={stageOf(selected.step.stage).label}
                  isLastStage={selected.step.stage === "CONCRETISATION"}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== HISTORIQUE ===== */}
      {reviewed.length > 0 && (
        <div className="enc-card" style={{ marginTop: "24px" }}>
          <h2 className="enc-h2" style={{ marginBottom: "12px" }}>
            <History size={16} style={{ color: "#F5D76E" }} /> Vos dernières décisions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {reviewed.map((r) => (
              <Link key={r.id} href={`/encadrant/projets/${r.step.project.id}`} className="enc-row">
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: r.decision === "APPROVED" ? "#34D399" : "#F5B544" }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "14px", color: "#E8EDF5", fontWeight: 500 }}>{r.step.project.title}</span>
                  <span className="enc-muted" style={{ fontSize: "12px", marginLeft: "8px" }}>
                    {stageOf(r.step.stage).label} · {fullName(r.author)}
                  </span>
                </span>
                {r.rating ? <Stars rating={r.rating} size={11} /> : null}
                <span className="enc-muted" style={{ fontSize: "12px" }}>{r.reviewedAt && formatDate(r.reviewedAt.toISOString())}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
