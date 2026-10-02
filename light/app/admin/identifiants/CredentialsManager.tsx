// app/admin/identifiants/CredentialsManager.tsx
// Liste, création et gestion des identifiants école (le code n'est montré qu'une fois)

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Copy, GraduationCap, KeyRound, Loader2, Plus, RefreshCw, Search, ShieldCheck, Trash2, Unlock } from "lucide-react";
import { createCredential, deleteCredential, regenerateCredentialCode, revokeCredential, unlockCredential } from "@/lib/admin/actions";
import { formatDate } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import { Alert, Badge, EmptyState, Field, Modal, Segmented, buttonClass, cx, inputClass, selectClass, type Tone } from "@/components/ui/kit";
import { Table, Td, Th, Tr } from "@/components/ui/Table";

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

const STATE_STYLES: Record<State, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Actif", tone: "success" },
  USED: { label: "Utilisé", tone: "brand" },
  LOCKED: { label: "Bloqué", tone: "warning" },
  EXPIRED: { label: "Expiré", tone: "neutral" },
  REVOKED: { label: "Révoqué", tone: "danger" },
};

const FILTERS: ("all" | State)[] = ["all", "ACTIVE", "USED", "LOCKED", "EXPIRED", "REVOKED"];
const FILTER_LABELS: Record<"all" | State, string> = { all: "Tous", ACTIVE: "Actifs", USED: "Utilisés", LOCKED: "Bloqués", EXPIRED: "Expirés", REVOKED: "Révoqués" };

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
    return rows.filter(
      (r) => (filter === "all" || r.state === filter) && (!q || [r.name, r.matricule, r.email ?? ""].some((v) => v.toLowerCase().includes(q))),
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
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink" />
          <input
            className={cx(inputClass, "h-10 py-0 pl-10 shadow-card")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, matricule ou email…"
            aria-label="Rechercher des identifiants"
          />
        </div>
        <Segmented
          label="Filtrer par état"
          value={filter}
          onChange={setFilter}
          items={FILTERS.map((f) => ({ value: f, label: FILTER_LABELS[f], count: f === "all" ? rows.length : rows.filter((r) => r.state === f).length }))}
        />
        <button type="button" className={buttonClass("primary")} onClick={() => setCreateOpen(true)}>
          <Plus /> Nouveaux identifiants
        </button>
      </div>

      {error && <Alert tone="danger" className="mb-4">{error}</Alert>}

      {/* ===== LISTE ===== */}
      {visible.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title={rows.length === 0 ? "Aucun identifiant pour le moment" : "Aucun résultat"}
          description={rows.length === 0 ? "Créez des identifiants pour chaque encadrant ou administrateur de l'école." : "Aucun identifiant ne correspond à ces filtres."}
          action={rows.length === 0 ? <button className={buttonClass("primary")} onClick={() => setCreateOpen(true)}><Plus /> Créer des identifiants</button> : undefined}
        />
      ) : (
        <Table minWidth={900}>
          <thead>
            <tr>
              <Th>Personne</Th>
              <Th>Matricule</Th>
              <Th>Rôle</Th>
              <Th>État</Th>
              <Th>Validité / utilisation</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const st = STATE_STYLES[r.state];
              return (
                <Tr key={r.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{r.name}</p>
                        <p className="truncate text-[12px] text-ink-muted">{[r.email, r.details].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="font-mono text-[12.5px]">{r.matricule}</Td>
                  <Td>
                    <Badge tone={r.role === "ADMIN" ? "success" : "brand"} icon={r.role === "ADMIN" ? ShieldCheck : GraduationCap}>
                      {r.role === "ADMIN" ? "Administrateur" : "Encadrant"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {r.state === "ACTIVE" && r.failedAttempts > 0 && (
                      <span className="mt-1 block text-[11px] text-warning">
                        {r.failedAttempts} essai{r.failedAttempts > 1 ? "s" : ""} incorrect{r.failedAttempts > 1 ? "s" : ""}
                      </span>
                    )}
                  </Td>
                  <Td className="text-[12.5px] text-ink-muted">
                    {r.usedAt
                      ? `Par ${r.usedBy ?? "un compte supprimé"} le ${formatDate(r.usedAt)}`
                      : r.expiresAt
                        ? `${r.state === "EXPIRED" ? "Expiré le" : "Jusqu'au"} ${formatDate(r.expiresAt)}`
                        : "Sans limite"}
                    <span className="block text-[11.5px] text-ink-subtle">
                      Créé le {formatDate(r.createdAt)}{r.createdBy ? ` par ${r.createdBy}` : ""}
                    </span>
                  </Td>
                  <Td align="right">
                    {r.state !== "USED" && (
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        {r.state === "LOCKED" && (
                          <button className={buttonClass("secondary", "sm")} disabled={pending} onClick={() => run(() => unlockCredential(r.id))}>
                            <Unlock /> Débloquer
                          </button>
                        )}
                        <button className={buttonClass("secondary", "sm")} disabled={pending} onClick={() => regenerate(r)}>
                          <RefreshCw /> Nouveau code
                        </button>
                        {r.state !== "REVOKED" && (
                          <button
                            className={buttonClass("danger", "icon-sm")}
                            disabled={pending}
                            title="Révoquer"
                            aria-label={`Révoquer les identifiants de ${r.name}`}
                            onClick={() => window.confirm(`Révoquer les identifiants de ${r.name} ? Ils ne pourront plus servir.`) && run(() => revokeCredential(r.id))}
                          >
                            <Ban />
                          </button>
                        )}
                        <button
                          className={buttonClass("danger", "icon-sm")}
                          disabled={pending}
                          title="Supprimer"
                          aria-label={`Supprimer les identifiants de ${r.name}`}
                          onClick={() => window.confirm(`Supprimer définitivement les identifiants de ${r.name} (matricule ${r.matricule}) ?`) && run(() => deleteCredential(r.id))}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
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
      <IssuedDialog issued={issued} onClose={() => setIssued(null)} />
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

  const submit = () => {
    setError("");
    startTransition(async () => {
      const result = await createCredential({ role, matricule, firstName, lastName, email, specialty, department, validityDays });
      if (!result.ok) return setError(result.error);
      onCreated({ name: `${firstName} ${lastName}`.trim(), matricule: result.matricule, code: result.code, role });
    });
  };

  return (
    <Modal
      open
      onClose={() => !pending && onClose()}
      icon={KeyRound}
      title="Nouveaux identifiants"
      description="Un code confidentiel à usage unique sera généré. Vous le remettrez à la personne."
      footer={
        <>
          <button type="button" className={buttonClass("secondary")} onClick={onClose} disabled={pending}>Annuler</button>
          <button type="button" className={buttonClass("primary")} onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <KeyRound />} Générer le code
          </button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Rôle</span>
          <div className="grid grid-cols-2 gap-2">
            {([["ENCADRANT", "Encadrant", GraduationCap], ["ADMIN", "Administrateur", ShieldCheck]] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={role === value}
                className={cx(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border-[1.5px] text-[13px] font-semibold transition-colors",
                  role === value ? "border-brand bg-brand-soft text-brand-ink" : "border-line text-ink-muted hover:border-line-strong",
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        </div>
        <Field label="Matricule" htmlFor="cr-matricule" required>
          <input id="cr-matricule" className={cx(inputClass, "font-mono")} value={matricule} onChange={(e) => setMatricule(e.target.value.toUpperCase())} placeholder="Ex. ENS-2026-014" maxLength={40} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" htmlFor="cr-first" required>
            <input id="cr-first" className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={120} />
          </Field>
          <Field label="Nom" htmlFor="cr-last" required>
            <input id="cr-last" className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={120} />
          </Field>
        </div>
        <Field label="Email réservé" htmlFor="cr-email" optional hint="Si renseigné, seul un compte utilisant cette adresse pourra se servir des identifiants.">
          <input id="cr-email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@iai.cm" maxLength={120} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Spécialité" htmlFor="cr-specialty" optional>
            <input id="cr-specialty" className={inputClass} value={specialty} onChange={(e) => setSpecialty(e.target.value)} maxLength={120} />
          </Field>
          <Field label={role === "ADMIN" ? "Service" : "Département"} htmlFor="cr-dept" optional>
            <input id="cr-dept" className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)} maxLength={120} />
          </Field>
        </div>
        <Field label="Validité du code" htmlFor="cr-validity">
          <select id="cr-validity" className={selectClass} value={validityDays} onChange={(e) => setValidityDays(Number(e.target.value))}>
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>3 mois</option>
            <option value={365}>1 an</option>
          </select>
        </Field>
        {error && <Alert tone="danger">{error}</Alert>}
        <button type="submit" className="sr-only">Générer le code</button>
      </form>
    </Modal>
  );
}

// ============================================================
// CODE ÉMIS (affiché une seule fois)
// ============================================================
function IssuedDialog({
  issued,
  onClose,
}: {
  issued: { name: string; matricule: string; code: string; role: StaffRole } | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!issued) return null;
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
    <Modal
      open
      onClose={() => undefined}
      icon={Check}
      title={`Identifiants prêts pour ${issued.name}`}
      description="Notez ce code maintenant et remettez-le à la personne de façon confidentielle : il ne sera plus jamais affiché. En cas de perte, émettez-en un nouveau."
      footer={
        <>
          <button type="button" className={buttonClass("secondary")} onClick={copy}>
            {copied ? <Check /> : <Copy />} {copied ? "Copié" : "Copier"}
          </button>
          <button type="button" className={buttonClass("primary")} onClick={onClose}>J&apos;ai noté le code</button>
        </>
      }
    >
      <dl className="space-y-4">
        <div>
          <dt className="text-[12px] font-medium text-ink-subtle">Matricule</dt>
          <dd className="mt-1 font-mono text-[15px] text-ink">{issued.matricule}</dd>
        </div>
        <div>
          <dt className="text-[12px] font-medium text-ink-subtle">Code confidentiel</dt>
          <dd className="mt-1.5 rounded-2xl border border-dashed border-gold/50 bg-gold-soft px-4 py-4 text-center font-mono text-[22px] font-bold tracking-[0.18em] text-gold select-all">
            {issued.code}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
        La personne s&apos;inscrit en choisissant « {issued.role === "ADMIN" ? "Administration" : "Encadrant"} », puis saisit ces informations dans le formulaire de confirmation.
      </p>
    </Modal>
  );
}
