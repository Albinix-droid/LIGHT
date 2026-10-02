// app/admin/journal/page.tsx
// JOURNAL D'ADMINISTRATION : qui a fait quoi, et quand

import { ScrollText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listAdminLogs, listLogActions } from "@/lib/admin/queries";
import { Badge, EmptyState, LinkTabs, PageHeader, type Tone } from "@/components/ui/kit";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
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

const ACTION_TONES: Record<string, Tone> = {
  STAFF_VERIFIED: "success",
  USER_REACTIVATED: "success",
  USER_SUSPENDED: "danger",
  CREDENTIAL_REVOKED: "danger",
  CREDENTIAL_DELETED: "danger",
  PENDING_ROLE_REJECTED: "danger",
  USER_ROLE_CHANGED: "brand",
  CREDENTIAL_CREATED: "gold",
  CREDENTIAL_REGENERATED: "gold",
};

export default async function AdminJournalPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const [, params, actions] = await Promise.all([requireRole("ADMIN"), searchParams, listLogActions()]);
  const action = params.action && actions.includes(params.action) ? params.action : undefined;
  const logs = await listAdminLogs({ action });

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        eyebrow="Administration"
        title="Journal"
        description="Les 200 dernières actions sensibles : confirmations d'identité, identifiants, rôles et suspensions."
      />

      {actions.length > 0 && (
        <LinkTabs
          className="mb-5 w-fit"
          label="Filtrer par action"
          activeHref={action ? `/admin/journal?action=${action}` : "/admin/journal"}
          items={[{ href: "/admin/journal", label: "Toutes" }, ...actions.map((a) => ({ href: `/admin/journal?action=${a}`, label: ACTION_LABELS[a] ?? a }))]}
        />
      )}

      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="Journal vide" description="Aucune action enregistrée pour le moment." />
      ) : (
        <Table minWidth={760}>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Action</Th>
              <Th>Détail</Th>
              <Th>Par</Th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <Tr key={l.id}>
                <Td className="text-[12.5px] whitespace-nowrap text-ink-muted">{formatDateTime(l.createdAt)}</Td>
                <Td className="whitespace-nowrap">
                  <Badge tone={ACTION_TONES[l.action] ?? "neutral"}>{ACTION_LABELS[l.action] ?? l.action}</Badge>
                </Td>
                <Td>{l.summary}</Td>
                <Td className="text-[12.5px] whitespace-nowrap text-ink-muted">{l.adminName ?? "Système"}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
