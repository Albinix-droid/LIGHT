// app/encadrant/page.tsx
// TABLEAU DE BORD ENCADRANT

import Link from "next/link";
import { GraduationCap, Clock, Award, TrendingUp, Inbox, Bell, FolderKanban, History, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  listSupervisedProjects, listPendingSubmissions, listReviewedSubmissions, listUnreadNotifications, fullName,
} from "@/lib/projects";
import { STAGES, getStageIndex } from "@/lib/parcours";
import { Stars, formatDate } from "@/app/dashboard/projets/[id]/StepStatusBanner";
import { countPendingReceived } from "@/lib/demandes/queries";
import NotificationList from "./NotificationList";
import { getFollowUpStatus } from "./projectStatus";

const stageLabel = (key: string) => STAGES.find((s) => s.stage === key)?.label ?? key;

export default async function EncadrantDashboardPage() {
  const user = await requireRole("ENCADRANT");
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [projects, pending, reviewed, notifications, approvedThisMonth, pendingRequests] = await Promise.all([
    listSupervisedProjects(user.id),
    listPendingSubmissions(user.id),
    listReviewedSubmissions(user.id, 5),
    listUnreadNotifications(user.id, 6),
    prisma.stepSubmission.count({ where: { reviewerId: user.id, decision: "APPROVED", reviewedAt: { gte: startOfMonth } } }),
    countPendingReceived(user.id),
  ]);

  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  const stats = [
    { icon: GraduationCap, label: "Projets suivis", value: projects.length, color: "#F5D76E" },
    { icon: Clock, label: "Étapes à examiner", value: pending.length, color: pending.length ? "#F5B544" : "#34D399" },
    { icon: Award, label: "Étapes validées ce mois", value: approvedThisMonth, color: "#34D399" },
    { icon: TrendingUp, label: "Progression moyenne", value: `${averageProgress}%`, color: "#A5B4FC" },
  ];

  return (
    <div className="enc-page">
      {/* ===== EN-TÊTE ===== */}
      <div style={{ marginBottom: "24px" }}>
        <h1 className="enc-h1">Bonjour, {user.firstName}</h1>
        <p className="enc-sub">
          {pending.length > 0
            ? `${pending.length} étape${pending.length > 1 ? "s attendent" : " attend"} votre décision. Vos étudiants comptent sur vos retours.`
            : "Aucune étape en attente. Voici l'avancement des projets que vous accompagnez."}
        </p>
      </div>

      {/* ===== DEMANDES D'ENCADREMENT ===== */}
      {pendingRequests > 0 && (
        <Link href="/encadrant/demandes" className="enc-row" style={{ marginBottom: "22px", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.08)" }}>
          <GraduationCap size={18} style={{ color: "#F5D76E", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: "14px", color: "#E8EDF5" }}>
            {pendingRequests} demande{pendingRequests > 1 ? "s" : ""} d&apos;encadrement en attente de votre réponse
          </span>
          <ArrowRight size={16} style={{ color: "#F5D76E" }} />
        </Link>
      )}

      {/* ===== CHIFFRES CLÉS ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "22px" }}>
        {stats.map((s) => (
          <div key={s.label} className="enc-card enc-stat">
            <s.icon size={18} style={{ color: s.color }} />
            <p className="enc-stat-value">{s.value}</p>
            <p className="enc-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="enc-two-cols" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* ===== À EXAMINER ===== */}
        <div className="enc-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 className="enc-h2"><Inbox size={16} style={{ color: "#F5B544" }} /> À examiner</h2>
            {pending.length > 0 && <Link href="/encadrant/validations" style={{ fontSize: "12px", color: "#F5D76E" }}>Tout voir</Link>}
          </div>
          {pending.length === 0 ? (
            <p className="enc-empty">Toutes les soumissions ont été traitées 🎉</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pending.slice(0, 5).map((s) => (
                <Link key={s.id} href={`/encadrant/validations?id=${s.id}`} className="enc-row">
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#E8EDF5" }}>{s.step.project.title}</span>
                    <span className="enc-muted" style={{ fontSize: "12px" }}>
                      {fullName(s.author)} · {stageLabel(s.step.stage)} · {formatDate(s.submittedAt.toISOString())}
                    </span>
                  </span>
                  <span className="enc-badge" style={{ background: "rgba(212,175,55,0.12)", color: "#F5D76E" }}>
                    Examiner <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ===== NOTIFICATIONS ===== */}
        <div className="enc-card">
          <h2 className="enc-h2" style={{ marginBottom: "14px" }}><Bell size={16} style={{ color: "#F5D76E" }} /> Notifications</h2>
          <NotificationList
            items={notifications.map((n) => ({
              id: n.id,
              type: n.type,
              message: n.message,
              link: n.link,
              read: n.readAt !== null,
              date: formatDate(n.createdAt.toISOString()),
            }))}
          />
        </div>
      </div>

      {/* ===== PROJETS ===== */}
      <div className="enc-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 className="enc-h2"><FolderKanban size={16} style={{ color: "#F5D76E" }} /> Projets suivis</h2>
          {projects.length > 0 && <Link href="/encadrant/projets" style={{ fontSize: "12px", color: "#F5D76E" }}>Tout voir</Link>}
        </div>
        {projects.length === 0 ? (
          <p className="enc-empty">
            Aucun étudiant ne vous a encore choisi. Les projets apparaîtront ici dès qu&apos;un étudiant vous désignera comme encadrant.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {projects.slice(0, 6).map((p) => {
              const status = getFollowUpStatus(p);
              return (
                <Link key={p.id} href={`/encadrant/projets/${p.id}`} className="enc-row" style={{ flexWrap: "wrap" }}>
                  <span style={{ flex: 2, minWidth: "180px" }}>
                    <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#E8EDF5" }}>{p.title}</span>
                    <span className="enc-muted" style={{ fontSize: "12px" }}>
                      {fullName(p.owner)} · {stageLabel(STAGES[getStageIndex(p.stage)].stage)}
                    </span>
                  </span>
                  <span style={{ flex: 1, minWidth: "120px" }}>
                    <span className="enc-progress" style={{ display: "block" }}><span style={{ display: "block", height: "100%", width: `${p.progress}%`, borderRadius: "3px", background: "linear-gradient(90deg, #D4AF37, #F5D76E)" }} /></span>
                    <span className="enc-muted" style={{ fontSize: "11px" }}>{p.progress}%</span>
                  </span>
                  <span className="enc-badge" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== DERNIÈRES DÉCISIONS ===== */}
      {reviewed.length > 0 && (
        <div className="enc-card">
          <h2 className="enc-h2" style={{ marginBottom: "14px" }}><History size={16} style={{ color: "#F5D76E" }} /> Vos dernières décisions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {reviewed.map((r) => (
              <Link key={r.id} href={`/encadrant/projets/${r.step.project.id}`} className="enc-row">
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: r.decision === "APPROVED" ? "#34D399" : "#F5B544" }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: "13px", color: "#E8EDF5" }}>
                  {r.decision === "APPROVED" ? "Validé" : "Modifications demandées"} · {stageLabel(r.step.stage)} de « {r.step.project.title} »
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
