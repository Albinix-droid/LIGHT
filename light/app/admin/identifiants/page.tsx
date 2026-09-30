// app/admin/identifiants/page.tsx
// IDENTIFIANTS DE L'ÉCOLE : matricule + code confidentiel remis aux encadrants et administrateurs

import { requireRole } from "@/lib/auth";
import { listCredentials } from "@/lib/admin/queries";
import { credentialState } from "@/lib/staff";
import CredentialsManager, { type CredentialRow } from "./CredentialsManager";

export const metadata = { title: "Identifiants école" };

export default async function AdminCredentialsPage({ searchParams }: { searchParams: Promise<{ nouveau?: string }> }) {
  const [, params, credentials] = await Promise.all([requireRole("ADMIN"), searchParams, listCredentials()]);
  const now = new Date();

  const rows: CredentialRow[] = credentials.map((c) => ({
    id: c.id,
    role: c.role === "ADMIN" ? "ADMIN" : "ENCADRANT",
    matricule: c.matricule,
    name: `${c.firstName} ${c.lastName}`.trim(),
    email: c.email,
    details: [c.specialty, c.department].filter(Boolean).join(" · "),
    state: credentialState(c, now),
    failedAttempts: c.failedAttempts,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    usedAt: c.usedAt?.toISOString() ?? null,
    usedBy: c.usedBy ? `${c.usedBy.firstName} ${c.usedBy.lastName}`.trim() : null,
    createdBy: c.createdBy ? `${c.createdBy.firstName} ${c.createdBy.lastName}`.trim() : null,
  }));

  return (
    <div className="enc-page">
      <div style={{ marginBottom: "20px" }}>
        <h1 className="enc-h1">Identifiants école</h1>
        <p className="enc-sub" style={{ maxWidth: "720px", lineHeight: 1.6 }}>
          Chaque encadrant ou administrateur reçoit un matricule et un code confidentiel à usage unique. Après son inscription,
          il les saisit dans le formulaire de confirmation : le rôle ne lui est attribué qu&apos;à ce moment-là.
        </p>
      </div>
      <CredentialsManager rows={rows} openCreate={params.nouveau === "1"} />
    </div>
  );
}
