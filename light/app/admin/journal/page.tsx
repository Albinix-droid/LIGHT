// app/admin/journal/page.tsx
// JOURNAL D'ADMINISTRATION : qui a fait quoi, et quand

import Link from "next/link";
import { ScrollText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listAdminLogs, listLogActions } from "@/lib/admin/queries";
import { formatDateTime } from "../format";

export const metadata = { title: "Journal" };

const ACTION_LABELS: Record<string, string> = {
  STAFF_VERIFIED: "Compte confirmé",
  CREDENTIAL_CREATED: "Identifiants créés",
  CREDENTIAL_REGENERATED: "Nouveau code",
  CREDENTIAL_REVOKED: "Identifiants révoqués",
  CREDENTIAL_UNLOCKED: "Identifiants débloqués",
  CREDENTIAL_DELETED: "Identifiants supprimés",
  USER_SUSPENDED: "Suspension",
  USER_REACTIVATED: "Réactivation",
  USER_ROLE_CHANGED: "Changement de rôle",
  PENDING_ROLE_REJECTED: "Demande refusée",
};

const ACTION_COLORS: Record<string, string> = {
  STAFF_VERIFIED: "#34D399",
  USER_SUSPENDED: "#F0928B",
  CREDENTIAL_REVOKED: "#F0928B",
  CREDENTIAL_DELETED: "#F0928B",
  PENDING_ROLE_REJECTED: "#F0928B",
  USER_ROLE_CHANGED: "#A5B4FC",
};

export default async function AdminJournalPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const [, params, actions] = await Promise.all([requireRole("ADMIN"), searchParams, listLogActions()]);
  const action = params.action && actions.includes(params.action) ? params.action : undefined;
  const logs = await listAdminLogs({ action });

  return (
    <div className="enc-page">
      <div style={{ marginBottom: "20px" }}>
        <h1 className="enc-h1">Journal</h1>
        <p className="enc-sub">Les 200 dernières actions sensibles : confirmations d&apos;identité, identifiants, rôles et suspensions.</p>
      </div>

      {actions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
          <Link href="/admin/journal" className={`adm-pill ${!action ? "adm-pill-active" : ""}`}>Toutes</Link>
          {actions.map((a) => (
            <Link key={a} href={`/admin/journal?action=${a}`} className={`adm-pill ${action === a ? "adm-pill-active" : ""}`}>
              {ACTION_LABELS[a] ?? a}
            </Link>
          ))}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="enc-card enc-empty" style={{ padding: "60px 20px" }}>
          <ScrollText size={36} style={{ color: "rgba(212,175,55,0.4)", marginBottom: "12px" }} />
          <p style={{ margin: 0 }}>Aucune action enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Détail</th>
                <th>Par</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="enc-muted" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{formatDateTime(l.createdAt)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span className="enc-badge" style={{ background: "rgba(255,255,255,0.05)", color: ACTION_COLORS[l.action] ?? "#F5D76E" }}>
                      {ACTION_LABELS[l.action] ?? l.action}
                    </span>
                  </td>
                  <td>{l.summary}</td>
                  <td className="enc-muted" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{l.adminName ?? "Système"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
