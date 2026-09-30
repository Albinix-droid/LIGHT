// app/admin/identifiants/CredentialsManager.tsx
// Liste, création et gestion des identifiants école (le code n'est montré qu'une fois)

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound, Plus, Loader2, Copy, Check, RefreshCw, Ban, Unlock, Trash2, Search, X, GraduationCap, ShieldCheck,
} from "lucide-react";
import { createCredential, deleteCredential, regenerateCredentialCode, revokeCredential, unlockCredential } from "@/lib/admin/actions";

type StaffRole = "ENCADRANT" | "ADMIN";
type State = "ACTIVE" | "USED" | "REVOKED" | "EXPIRED" | "LOCKED";

export interface CredentialRow {
  id: string;
  role: StaffRole;
  matricule: string;
  name: string;
  email: string | null;
  details: string;
  state: State;
  failedAttempts: number;
  expiresAt: string | null;
  createdAt: string;
  usedAt: string | null;
  usedBy: string | null;
  createdBy: string | null;
}

const STATE_STYLES: Record<State, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: "Actif", color: "#34D399", bg: "rgba(16,185,129,0.12)" },
  USED: { label: "Utilisé", color: "#A5B4FC", bg: "rgba(99,102,241,0.12)" },
  LOCKED: { label: "Bloqué", color: "#F5B544", bg: "rgba(245,158,11,0.12)" },
  EXPIRED: { label: "Expiré", color: "rgba(200,215,235,0.55)", bg: "rgba(255,255,255,0.06)" },
  REVOKED: { label: "Révoqué", color: "#F0928B", bg: "rgba(228,115,107,0.12)" },
};

const FILTERS: { id: "all" | State; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "ACTIVE", label: "Actifs" },
  { id: "USED", label: "Utilisés" },
  { id: "LOCKED", label: "Bloqués" },
  { id: "EXPIRED", label: "Expirés" },
  { id: "REVOKED", label: "Révoqués" },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Africa/Douala" }).format(new Date(iso));

type ActionResult = { ok: true } | { ok: false; error: string };

export default function CredentialsManager({ rows, openCreate }: { rows: CredentialRow[]; openCreate: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | State>("all");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(openCreate);
  const [issued, setIssued] = useState<{ name: string; matricule: string; code: string; role: StaffRole } | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) =>
      (filter === "all" || r.state === filter) &&
      (!q || [r.name, r.matricule, r.email ?? ""].some((v) => v.toLowerCase().includes(q))),
    );
  }, [rows, filter, query]);

  const run = (action: () => Promise<ActionResult>) => {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const regenerate = (row: CredentialRow) => {
    if (!window.confirm(`Émettre un nouveau code pour ${row.name} ? L'ancien code cessera immédiatement de fonctionner.`)) return;
    setError("");
    startTransition(async () => {
      const result = await regenerateCredentialCode(row.id);
      if (!result.ok) return setError(result.error);
      setIssued({ name: row.name, matricule: result.matricule, code: result.code, role: row.role });
      router.refresh();
    });
  };

  return (
    <>
      {/* ===== BARRE D'OUTILS ===== */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "18px" }}>
        <div style={{ flex: "1 1 240px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(200,215,235,0.35)" }} />
          <input className="enc-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, matricule ou email…" style={{ paddingLeft: "38px" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`adm-pill ${filter === f.id ? "adm-pill-active" : ""}`}>
              {f.label}
              <span style={{ opacity: 0.6 }}>{f.id === "all" ? rows.length : rows.filter((r) => r.state === f.id).length}</span>
            </button>
          ))}
        </div>
        <button type="button" className="enc-btn enc-btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Nouveaux identifiants
        </button>
      </div>

      {error && <div role="alert" className="enc-card" style={{ padding: "12px 16px", marginBottom: "14px", color: "#F0928B", borderColor: "rgba(228,115,107,0.25)", fontSize: "13px" }}>{error}</div>}

      {/* ===== LISTE ===== */}
      {visible.length === 0 ? (
        <div className="enc-card enc-empty" style={{ padding: "60px 20px" }}>
          <KeyRound size={36} style={{ color: "rgba(212,175,55,0.4)", marginBottom: "12px" }} />
          <p style={{ margin: 0 }}>
            {rows.length === 0 ? "Aucun identifiant pour le moment. Créez-en pour chaque encadrant ou administrateur de l'école." : "Aucun identifiant ne correspond à ces filtres."}
          </p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Personne</th>
                <th>Matricule</th>
                <th>Rôle</th>
                <th>État</th>
                <th>Validité / utilisation</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const st = STATE_STYLES[r.state];
                return (
                  <tr key={r.id}>
                    <td>
                      <span style={{ display: "block", fontWeight: 600, color: "#E8EDF5" }}>{r.name}</span>
                      <span className="enc-muted" style={{ fontSize: "12px" }}>{[r.email, r.details].filter(Boolean).join(" · ") || "—"}</span>
                    </td>
                    <td style={{ fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "#E8EDF5" }}>{r.matricule}</td>
                    <td>
                      <span className="enc-badge" style={r.role === "ADMIN" ? { background: "rgba(16,185,129,0.12)", color: "#34D399" } : { background: "rgba(99,102,241,0.12)", color: "#A5B4FC" }}>
                        {r.role === "ADMIN" ? "Administrateur" : "Encadrant"}
                      </span>
                    </td>
                    <td>
                      <span className="enc-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      {r.state === "ACTIVE" && r.failedAttempts > 0 && (
                        <span className="enc-muted" style={{ display: "block", fontSize: "11px", marginTop: "3px" }}>
                          {r.failedAttempts} essai{r.failedAttempts > 1 ? "s" : ""} incorrect{r.failedAttempts > 1 ? "s" : ""}
                        </span>
                      )}
                    </td>
                    <td className="enc-muted" style={{ fontSize: "12px" }}>
                      {r.usedAt
                        ? `Par ${r.usedBy ?? "un compte supprimé"} le ${formatDate(r.usedAt)}`
                        : r.expiresAt
                          ? `${r.state === "EXPIRED" ? "Expiré le" : "Jusqu'au"} ${formatDate(r.expiresAt)}`
                          : "Sans limite"}
                      <span style={{ display: "block", fontSize: "11px", opacity: 0.8 }}>
                        Créé le {formatDate(r.createdAt)}{r.createdBy ? ` par ${r.createdBy}` : ""}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {r.state !== "USED" && (
                        <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {r.state === "LOCKED" && (
                            <button className="enc-btn adm-btn-sm" disabled={pending} onClick={() => run(() => unlockCredential(r.id))} title="Débloquer">
                              <Unlock size={13} /> Débloquer
                            </button>
                          )}
                          <button className="enc-btn adm-btn-sm" disabled={pending} onClick={() => regenerate(r)} title="Émettre un nouveau code">
                            <RefreshCw size={13} /> Nouveau code
                          </button>
                          {r.state !== "REVOKED" && (
                            <button
                              className="enc-btn adm-btn-sm adm-btn-danger"
                              disabled={pending}
                              title="Révoquer"
                              onClick={() => window.confirm(`Révoquer les identifiants de ${r.name} ? Ils ne pourront plus servir.`) && run(() => revokeCredential(r.id))}
                            >
                              <Ban size={13} />
                            </button>
                          )}
                          <button
                            className="enc-btn adm-btn-sm adm-btn-danger"
                            disabled={pending}
                            title="Supprimer"
                            aria-label={`Supprimer les identifiants de ${r.name}`}
                            onClick={() => window.confirm(`Supprimer définitivement les identifiants de ${r.name} (matricule ${r.matricule}) ?`) && run(() => deleteCredential(r.id))}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <CreateDialog
          onClose={() => setCreateOpen(false)}
          onCreated={(result) => {
            setCreateOpen(false);
            setIssued(result);
            router.refresh();
          }}
        />
      )}
      {issued && <IssuedDialog issued={issued} onClose={() => setIssued(null)} />}
    </>
  );
}

// ============================================================
// CRÉATION
// ============================================================
function CreateDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (issued: { name: string; matricule: string; code: string; role: StaffRole }) => void;
}) {
  const [role, setRole] = useState<StaffRole>("ENCADRANT");
  const [matricule, setMatricule] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [department, setDepartment] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createCredential({ role, matricule, firstName, lastName, email, specialty, department, validityDays });
      if (!result.ok) return setError(result.error);
      onCreated({ name: `${firstName} ${lastName}`.trim(), matricule: result.matricule, code: result.code, role });
    });
  };

  return (
    <div className="adm-overlay" onClick={() => !pending && onClose()}>
      <form className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 id="create-title" className="enc-h2" style={{ fontSize: "17px" }}><KeyRound size={17} style={{ color: "#F5D76E" }} /> Nouveaux identifiants</h2>
          <button type="button" className="enc-icon-btn" onClick={onClose} aria-label="Fermer"><X size={15} /></button>
        </div>

        <span className="adm-label">Rôle</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
          {([["ENCADRANT", "Encadrant", GraduationCap], ["ADMIN", "Administrateur", ShieldCheck]] as const).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`adm-pill ${role === value ? "adm-pill-active" : ""}`}
              style={{ justifyContent: "center", padding: "10px", borderRadius: "12px" }}
              aria-pressed={role === value}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="adm-label" htmlFor="cr-matricule">Matricule</label>
            <input id="cr-matricule" className="enc-input" value={matricule} onChange={(e) => setMatricule(e.target.value.toUpperCase())} placeholder="Ex. ENS-2026-014" required maxLength={40} />
          </div>
          <div>
            <label className="adm-label" htmlFor="cr-first">Prénom</label>
            <input id="cr-first" className="enc-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={120} />
          </div>
          <div>
            <label className="adm-label" htmlFor="cr-last">Nom</label>
            <input id="cr-last" className="enc-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={120} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="adm-label" htmlFor="cr-email">Email réservé <span style={{ fontWeight: 400, opacity: 0.7 }}>(facultatif : le compte devra utiliser cette adresse)</span></label>
            <input id="cr-email" type="email" className="enc-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@iai.cm" maxLength={120} />
          </div>
          <div>
            <label className="adm-label" htmlFor="cr-specialty">Spécialité</label>
            <input id="cr-specialty" className="enc-input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Facultatif" maxLength={120} />
          </div>
          <div>
            <label className="adm-label" htmlFor="cr-dept">{role === "ADMIN" ? "Service" : "Département"}</label>
            <input id="cr-dept" className="enc-input" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Facultatif" maxLength={120} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="adm-label" htmlFor="cr-validity">Validité du code</label>
            <select id="cr-validity" className="enc-select" value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))} style={{ maxWidth: "none", width: "100%" }}>
              <option value={7}>7 jours</option>
              <option value={30}>30 jours</option>
              <option value={90}>3 mois</option>
              <option value={365}>1 an</option>
            </select>
          </div>
        </div>

        {error && <p role="alert" style={{ fontSize: "13px", color: "#F0928B", margin: "14px 0 0" }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
          <button type="button" className="enc-btn" onClick={onClose} disabled={pending}>Annuler</button>
          <button type="submit" className="enc-btn enc-btn-primary" disabled={pending}>
            {pending ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={15} />}
            Générer le code
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// CODE ÉMIS (affiché une seule fois)
// ============================================================
function IssuedDialog({
  issued,
  onClose,
}: {
  issued: { name: string; matricule: string; code: string; role: StaffRole };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const text = `Identifiants LIGHT (${issued.role === "ADMIN" ? "administrateur" : "encadrant"}) de ${issued.name}\nMatricule : ${issued.matricule}\nCode confidentiel : ${issued.code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="adm-overlay">
      <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="issued-title">
        <h2 id="issued-title" className="enc-h2" style={{ fontSize: "17px", marginBottom: "8px" }}>
          <Check size={17} style={{ color: "#34D399" }} /> Identifiants prêts pour {issued.name}
        </h2>
        <p className="enc-muted" style={{ fontSize: "13px", lineHeight: 1.6, margin: "0 0 16px" }}>
          Notez ce code maintenant et remettez-le à la personne de façon confidentielle : <strong style={{ color: "#F5D76E" }}>il ne sera plus jamais affiché</strong>.
          En cas de perte, émettez-en un nouveau.
        </p>
        <span className="adm-label">Matricule</span>
        <p style={{ fontFamily: "ui-monospace, monospace", fontSize: "15px", color: "#E8EDF5", margin: "0 0 14px" }}>{issued.matricule}</p>
        <span className="adm-label">Code confidentiel</span>
        <div className="adm-code">{issued.code}</div>
        <p className="enc-muted" style={{ fontSize: "12px", lineHeight: 1.6, margin: "14px 0 0" }}>
          La personne s&apos;inscrit en choisissant « {issued.role === "ADMIN" ? "Administration" : "Encadrant"} », puis saisit ces informations dans le formulaire de confirmation.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
          <button type="button" className="enc-btn" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copié" : "Copier"}
          </button>
          <button type="button" className="enc-btn enc-btn-primary" onClick={onClose}>J&apos;ai noté le code</button>
        </div>
      </div>
    </div>
  );
}
