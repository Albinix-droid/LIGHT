// app/admin/page.tsx
// VUE D'ENSEMBLE DE L'ADMINISTRATION : utilisateurs, confirmations en attente, projets, activité récente

import Link from "next/link";
import {
  Users, GraduationCap, ShieldCheck, FolderKanban, UserCheck, KeyRound, ArrowRight, ScrollText, AlertTriangle, CheckSquare, UserX,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin/queries";
import { STAGES } from "@/lib/parcours";
import { formatDateTime, roleBadge } from "./format";

export default async function AdminHomePage() {
  const user = await requireRole("ADMIN");
  const o = await getAdminOverview();

  const stats = [
    { icon: Users, label: "Étudiants", value: o.users.students, color: "#F5D76E", href: "/admin/utilisateurs?filtre=STUDENT" },
    { icon: GraduationCap, label: "Encadrants", value: o.users.encadrants, color: "#A5B4FC", href: "/admin/utilisateurs?filtre=ENCADRANT" },
    { icon: ShieldCheck, label: "Administrateurs", value: o.users.admins, color: "#34D399", href: "/admin/utilisateurs?filtre=ADMIN" },
    { icon: FolderKanban, label: "Projets", value: o.projects.total, color: "#F5B544", href: "/admin/projets" },
  ];
  const maxStage = Math.max(1, ...STAGES.map((s) => o.projects.byStage[s.stage] ?? 0));

  return (
    <div className="enc-page">
      {/* ===== EN-TÊTE ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 className="enc-h1">Bonjour {user.firstName} 👋</h1>
          <p className="enc-sub">
            {o.users.total} compte{o.users.total > 1 ? "s" : ""} sur la plateforme · {o.users.newThisWeek} nouveau{o.users.newThisWeek > 1 ? "x" : ""} cette semaine
          </p>
        </div>
        <Link href="/admin/identifiants?nouveau=1" className="enc-btn enc-btn-primary">
          <KeyRound size={16} />
          Créer des identifiants
        </Link>
      </div>

      {/* ===== CHIFFRES CLÉS ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="enc-card enc-stat enc-row" style={{ display: "block", padding: "18px 20px" }}>
            <s.icon size={20} style={{ color: s.color }} />
            <p className="enc-stat-value">{s.value}</p>
            <p className="enc-stat-label">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* ===== ALERTES ===== */}
      {(o.pendingStaffCount > 0 || o.users.suspended > 0 || o.projects.unsupervised > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {o.pendingStaffCount > 0 && (
            <Link href="/admin/utilisateurs?filtre=pending" className="enc-badge" style={{ background: "rgba(245,158,11,0.12)", color: "#F5B544", textDecoration: "none", padding: "8px 14px", fontSize: "12px" }}>
              <UserCheck size={14} /> {o.pendingStaffCount} compte{o.pendingStaffCount > 1 ? "s" : ""} en attente de confirmation
            </Link>
          )}
          {o.projects.unsupervised > 0 && (
            <Link href="/admin/projets?encadrant=aucun" className="enc-badge" style={{ background: "rgba(99,102,241,0.12)", color: "#A5B4FC", textDecoration: "none", padding: "8px 14px", fontSize: "12px" }}>
              <AlertTriangle size={14} /> {o.projects.unsupervised} projet{o.projects.unsupervised > 1 ? "s" : ""} sans encadrant
            </Link>
          )}
          {o.users.suspended > 0 && (
            <Link href="/admin/utilisateurs?filtre=suspended" className="enc-badge" style={{ background: "rgba(228,115,107,0.12)", color: "#F0928B", textDecoration: "none", padding: "8px 14px", fontSize: "12px" }}>
              <UserX size={14} /> {o.users.suspended} compte{o.users.suspended > 1 ? "s" : ""} suspendu{o.users.suspended > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      <div className="enc-two-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* ===== CONFIRMATIONS EN ATTENTE ===== */}
        <section className="enc-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 className="enc-h2"><UserCheck size={16} style={{ color: "#F5D76E" }} /> Confirmations en attente</h2>
            <Link href="/admin/utilisateurs?filtre=pending" className="enc-muted" style={{ fontSize: "12px", textDecoration: "none" }}>Tout voir</Link>
          </div>
          {o.pendingStaff.length === 0 ? (
            <p className="enc-empty" style={{ padding: "20px 0" }}>Aucun compte encadrant ou administrateur en attente.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {o.pendingStaff.map((u) => (
                <Link key={u.id} href={`/admin/utilisateurs?q=${encodeURIComponent(u.email)}`} className="enc-row">
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#E8EDF5" }}>{`${u.firstName} ${u.lastName}`.trim()}</span>
                    <span className="enc-muted" style={{ fontSize: "12px" }}>{u.email} · inscrit le {formatDateTime(u.createdAt)}</span>
                  </span>
                  {u.pendingRole && roleBadge(u.pendingRole, "demandé")}
                </Link>
              ))}
            </div>
          )}
          <p className="enc-muted" style={{ fontSize: "12px", margin: "14px 0 0", lineHeight: 1.5 }}>
            Ces personnes doivent saisir le matricule et le code remis par l&apos;école. {o.credentials.active} identifiant{o.credentials.active > 1 ? "s" : ""} actif{o.credentials.active > 1 ? "s" : ""}, {o.credentials.used} déjà utilisé{o.credentials.used > 1 ? "s" : ""}.
          </p>
        </section>

        {/* ===== PROJETS PAR ÉTAPE ===== */}
        <section className="enc-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 className="enc-h2"><FolderKanban size={16} style={{ color: "#F5D76E" }} /> Projets par étape</h2>
            <Link href="/admin/projets" className="enc-muted" style={{ fontSize: "12px", textDecoration: "none" }}>Tout voir</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {STAGES.map((s, i) => {
              const count = o.projects.byStage[s.stage] ?? 0;
              return (
                <div key={s.slug}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                    <span style={{ color: "rgba(232,237,245,0.8)" }}>{i + 1}. {s.label}</span>
                    <span className="enc-muted">{count}</span>
                  </div>
                  <div className="enc-progress"><div style={{ width: `${(count / maxStage) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
          <p className="enc-muted" style={{ fontSize: "12px", margin: "16px 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckSquare size={13} /> {o.projects.pendingSubmissions} étape{o.projects.pendingSubmissions > 1 ? "s" : ""} en attente de décision d&apos;un encadrant
          </p>
        </section>
      </div>

      {/* ===== ACTIVITÉ RÉCENTE ===== */}
      <section className="enc-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 className="enc-h2"><ScrollText size={16} style={{ color: "#F5D76E" }} /> Activité récente</h2>
          <Link href="/admin/journal" className="enc-muted" style={{ fontSize: "12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            Journal complet <ArrowRight size={12} />
          </Link>
        </div>
        {o.recentLogs.length === 0 ? (
          <p className="enc-empty" style={{ padding: "20px 0" }}>Aucune action enregistrée pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {o.recentLogs.map((l) => (
              <div key={l.id} className="enc-row" style={{ padding: "10px 14px" }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: "13px", color: "rgba(232,237,245,0.85)" }}>{l.summary}</span>
                <span className="enc-muted" style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
                  {l.adminName ?? "Système"} · {formatDateTime(l.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
