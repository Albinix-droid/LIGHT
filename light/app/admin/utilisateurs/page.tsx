// app/admin/utilisateurs/page.tsx
// GESTION DES UTILISATEURS : recherche, rôles, confirmations en attente, suspensions

import Link from "next/link";
import { Search, Users, BadgeCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listUsers, type UserFilter } from "@/lib/admin/queries";
import { formatDate, roleBadge } from "../format";
import UserActions from "./UserActions";

export const metadata = { title: "Utilisateurs" };

const FILTERS: { id: UserFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "STUDENT", label: "Étudiants" },
  { id: "ENCADRANT", label: "Encadrants" },
  { id: "ADMIN", label: "Administrateurs" },
  { id: "pending", label: "En attente" },
  { id: "suspended", label: "Suspendus" },
];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; filtre?: string }> }) {
  const [admin, params] = await Promise.all([requireRole("ADMIN"), searchParams]);
  const filter = FILTERS.some((f) => f.id === params.filtre) ? (params.filtre as UserFilter) : "all";
  const q = params.q?.trim() ?? "";
  const users = await listUsers({ q, filter });

  const hrefFor = (f: UserFilter) => {
    const sp = new URLSearchParams();
    if (f !== "all") sp.set("filtre", f);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `/admin/utilisateurs?${s}` : "/admin/utilisateurs";
  };

  return (
    <div className="enc-page">
      <div style={{ marginBottom: "20px" }}>
        <h1 className="enc-h1">Utilisateurs</h1>
        <p className="enc-sub">
          {users.length === 200 ? "200 premiers résultats" : `${users.length} compte${users.length > 1 ? "s" : ""}`}
          {q ? ` pour « ${q} »` : ""}
        </p>
      </div>

      {/* ===== RECHERCHE & FILTRES ===== */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "18px" }}>
        <form action="/admin/utilisateurs" style={{ flex: "1 1 260px", position: "relative" }}>
          {filter !== "all" && <input type="hidden" name="filtre" value={filter} />}
          <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(200,215,235,0.35)" }} />
          <input name="q" defaultValue={q} className="enc-input" placeholder="Nom, email ou matricule…" style={{ paddingLeft: "38px" }} />
        </form>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {FILTERS.map((f) => (
            <Link key={f.id} href={hrefFor(f.id)} className={`adm-pill ${filter === f.id ? "adm-pill-active" : ""}`}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="enc-card enc-empty" style={{ padding: "60px 20px" }}>
          <Users size={36} style={{ color: "rgba(212,175,55,0.4)", marginBottom: "12px" }} />
          <p style={{ margin: 0 }}>Aucun compte ne correspond à cette recherche.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Profil école</th>
                <th>Activité</th>
                <th>Inscription</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={u.suspendedAt ? { opacity: 0.7 } : undefined}>
                  <td>
                    <span style={{ display: "block", fontWeight: 600, color: "#E8EDF5" }}>{`${u.firstName} ${u.lastName}`.trim()}</span>
                    <span className="enc-muted" style={{ fontSize: "12px" }}>{u.email}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {roleBadge(u.role)}
                      {u.pendingRole && (
                        <span className="enc-badge" style={{ background: "rgba(245,158,11,0.12)", color: "#F5B544" }}>
                          {u.pendingRole === "ADMIN" ? "Admin" : "Encadrant"} en attente
                        </span>
                      )}
                      {u.suspendedAt && (
                        <span className="enc-badge" style={{ background: "rgba(228,115,107,0.12)", color: "#F0928B" }} title={u.suspendedReason ?? undefined}>
                          Suspendu
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {u.matricule ? (
                      <>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "#E8EDF5" }}>
                          {u.verifiedAt && <BadgeCheck size={13} style={{ color: "#34D399" }} aria-label="Identité confirmée" />}
                          {u.matricule}
                        </span>
                        <span className="enc-muted" style={{ display: "block", fontSize: "12px" }}>
                          {[u.grade, u.department].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </>
                    ) : (
                      <span className="enc-muted">—</span>
                    )}
                  </td>
                  <td className="enc-muted" style={{ fontSize: "12px" }}>
                    {u.role === "ENCADRANT"
                      ? `${u._count.supervisedProjects} projet${u._count.supervisedProjects > 1 ? "s" : ""} encadré${u._count.supervisedProjects > 1 ? "s" : ""}`
                      : u.role === "STUDENT"
                        ? `${u._count.ownedProjects} porté${u._count.ownedProjects > 1 ? "s" : ""} · ${Math.max(0, u._count.memberships - u._count.ownedProjects)} équipe${u._count.memberships - u._count.ownedProjects > 1 ? "s" : ""}`
                        : "—"}
                  </td>
                  <td className="enc-muted" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{formatDate(u.createdAt)}</td>
                  <td style={{ textAlign: "right" }}>
                    <UserActions
                      user={{ id: u.id, name: `${u.firstName} ${u.lastName}`.trim(), role: u.role, pendingRole: u.pendingRole, suspended: !!u.suspendedAt }}
                      isSelf={u.id === admin.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
