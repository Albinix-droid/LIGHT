// app/admin/projets/page.tsx
// TOUS LES PROJETS DE L'ÉCOLE : avancement, porteur, encadrant

import Link from "next/link";
import { Search, FolderKanban } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listAllProjects } from "@/lib/admin/queries";
import { STAGES, SECTOR_LABELS, getStageIndex } from "@/lib/parcours";
import { STEP_STATUS_COLORS } from "@/app/encadrant/projectStatus";
import { formatDate } from "../format";

export const metadata = { title: "Projets" };

const SUPERVISION_FILTERS = [
  { id: "tous", label: "Tous" },
  { id: "aucun", label: "Sans encadrant" },
  { id: "avec", label: "Avec encadrant" },
] as const;

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; encadrant?: string }> }) {
  const [, params] = await Promise.all([requireRole("ADMIN"), searchParams]);
  const q = params.q?.trim() ?? "";
  const supervision = SUPERVISION_FILTERS.some((f) => f.id === params.encadrant) ? params.encadrant! : "tous";
  const all = await listAllProjects(q);
  const projects = all.filter((p) => supervision === "tous" || (supervision === "aucun" ? !p.supervisor : !!p.supervisor));

  const hrefFor = (id: string) => {
    const sp = new URLSearchParams();
    if (id !== "tous") sp.set("encadrant", id);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `/admin/projets?${s}` : "/admin/projets";
  };

  return (
    <div className="enc-page">
      <div style={{ marginBottom: "20px" }}>
        <h1 className="enc-h1">Projets</h1>
        <p className="enc-sub">{projects.length} projet{projects.length > 1 ? "s" : ""}{q ? ` pour « ${q} »` : ""}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "18px" }}>
        <form action="/admin/projets" style={{ flex: "1 1 260px", position: "relative" }}>
          {supervision !== "tous" && <input type="hidden" name="encadrant" value={supervision} />}
          <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(200,215,235,0.35)" }} />
          <input name="q" defaultValue={q} className="enc-input" placeholder="Titre du projet ou nom du porteur…" style={{ paddingLeft: "38px" }} />
        </form>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SUPERVISION_FILTERS.map((f) => (
            <Link key={f.id} href={hrefFor(f.id)} className={`adm-pill ${supervision === f.id ? "adm-pill-active" : ""}`}>{f.label}</Link>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="enc-card enc-empty" style={{ padding: "60px 20px" }}>
          <FolderKanban size={36} style={{ color: "rgba(212,175,55,0.4)", marginBottom: "12px" }} />
          <p style={{ margin: 0 }}>Aucun projet ne correspond à cette recherche.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Projet</th>
                <th>Porteur</th>
                <th>Encadrant</th>
                <th>Parcours</th>
                <th>Équipe</th>
                <th>Mis à jour</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const current = getStageIndex(p.stage);
                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ display: "block", fontWeight: 600, color: "#E8EDF5" }}>{p.title}</span>
                      <span className="enc-muted" style={{ fontSize: "12px" }}>{p.sector ? SECTOR_LABELS[p.sector] ?? p.sector : "Secteur non renseigné"}</span>
                    </td>
                    <td>
                      <span style={{ display: "block" }}>{`${p.owner.firstName} ${p.owner.lastName}`.trim()}</span>
                      <span className="enc-muted" style={{ fontSize: "12px" }}>{p.owner.email}</span>
                    </td>
                    <td>
                      {p.supervisor ? (
                        `${p.supervisor.firstName} ${p.supervisor.lastName}`.trim()
                      ) : (
                        <span className="enc-badge" style={{ background: "rgba(99,102,241,0.12)", color: "#A5B4FC" }}>Aucun</span>
                      )}
                    </td>
                    <td style={{ minWidth: "170px" }}>
                      <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }} aria-label={`Étape actuelle : ${STAGES[current].label}`}>
                        {STAGES.map((s, i) => {
                          const status = p.steps.find((x) => x.stage === s.stage)?.status;
                          const color = status ? STEP_STATUS_COLORS[status] : i <= current ? STEP_STATUS_COLORS.IN_PROGRESS : "rgba(255,255,255,0.08)";
                          return <span key={s.slug} title={s.label} style={{ flex: 1, height: "5px", borderRadius: "3px", background: color, opacity: i > current ? 0.5 : 1 }} />;
                        })}
                      </div>
                      <span className="enc-muted" style={{ fontSize: "12px" }}>{current + 1}/5 · {STAGES[current].label} · {p.progress}%</span>
                    </td>
                    <td className="enc-muted" style={{ fontSize: "12px" }}>{p._count.members} membre{p._count.members > 1 ? "s" : ""}</td>
                    <td className="enc-muted" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{formatDate(p.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
