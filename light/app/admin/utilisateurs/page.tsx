// app/admin/utilisateurs/page.tsx
// GESTION DES UTILISATEURS : recherche, rôles, confirmations en attente, suspensions

import { BadgeCheck, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listUsers, type UserFilter } from "@/lib/admin/queries";
import Avatar from "@/components/ui/Avatar";
import { Badge, EmptyState, LinkTabs, PageHeader, SearchForm } from "@/components/ui/kit";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
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
    <div className="mx-auto max-w-[1440px]">
      <PageHeader
        eyebrow="Administration"
        title="Utilisateurs"
        description={`${users.length === 200 ? "200 premiers résultats" : `${users.length} compte${users.length > 1 ? "s" : ""}`}${q ? ` pour « ${q} »` : ""}`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchForm action="/admin/utilisateurs" defaultValue={q} placeholder="Nom, email ou matricule…" hidden={{ filtre: filter !== "all" ? filter : undefined }} className="min-w-[240px] flex-1" />
        <LinkTabs label="Filtrer les comptes" activeHref={hrefFor(filter)} items={FILTERS.map((f) => ({ href: hrefFor(f.id), label: f.label }))} />
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="Aucun compte trouvé" description="Aucun compte ne correspond à cette recherche." />
      ) : (
        <Table minWidth={920}>
          <thead>
            <tr>
              <Th>Utilisateur</Th>
              <Th>Rôle</Th>
              <Th>Profil école</Th>
              <Th>Activité</Th>
              <Th>Inscription</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const name = `${u.firstName} ${u.lastName}`.trim();
              const teams = Math.max(0, u._count.memberships - u._count.ownedProjects);
              return (
                <Tr key={u.id} className={u.suspendedAt ? "opacity-70" : ""}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={name} url={u.avatarUrl} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{name}</p>
                        <p className="truncate text-[12px] text-ink-muted">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      {roleBadge(u.role)}
                      {u.pendingRole && <Badge tone="warning">{u.pendingRole === "ADMIN" ? "Admin" : "Encadrant"} en attente</Badge>}
                      {u.suspendedAt && (
                        <span title={u.suspendedReason ?? undefined}>
                          <Badge tone="danger">Suspendu</Badge>
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    {u.matricule ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-ink">
                          {u.verifiedAt && <BadgeCheck className="size-3.5 text-success" aria-label="Identité confirmée" />}
                          {u.matricule}
                        </span>
                        <span className="block text-[12px] text-ink-muted">{[u.grade, u.department].filter(Boolean).join(" · ") || "—"}</span>
                      </>
                    ) : (
                      <span className="text-ink-subtle">—</span>
                    )}
                  </Td>
                  <Td className="text-[12.5px] text-ink-muted">
                    {u.role === "ENCADRANT"
                      ? `${u._count.supervisedProjects} projet${u._count.supervisedProjects > 1 ? "s" : ""} encadré${u._count.supervisedProjects > 1 ? "s" : ""}`
                      : u.role === "STUDENT"
                        ? `${u._count.ownedProjects} porté${u._count.ownedProjects > 1 ? "s" : ""} · ${teams} équipe${teams > 1 ? "s" : ""}`
                        : "—"}
                  </Td>
                  <Td className="text-[12.5px] whitespace-nowrap text-ink-muted">{formatDate(u.createdAt)}</Td>
                  <Td align="right">
                    <UserActions
                      user={{ id: u.id, name, role: u.role, pendingRole: u.pendingRole, suspended: !!u.suspendedAt }}
                      isSelf={u.id === admin.id}
                    />
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
