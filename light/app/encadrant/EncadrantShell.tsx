// app/encadrant/EncadrantShell.tsx
// LAYOUT ENCADRANT (partie client) : menu de l'espace encadrant dans le cadre commun

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckSquare, FolderKanban, Inbox, LayoutDashboard, MessageSquare, Settings } from "lucide-react";
import AppShell, { TopSelect } from "@/components/layout/AppShell";

export interface EncadrantShellProps {
  children: React.ReactNode;
  user: { firstName: string; lastName: string; avatarUrl?: string | null; grade?: string | null };
  projects: { id: string; title: string }[];
  pendingCount: number;
  unreadMessages?: number;
  pendingRequests?: number;
  unreadNotifications?: number;
}

export default function EncadrantShell({ children, user, projects, pendingCount, unreadMessages = 0, pendingRequests = 0, unreadNotifications = 0 }: EncadrantShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const projectInUrl = pathname?.match(/^\/encadrant\/projets\/([^/]+)/)?.[1];
  const activeProject = projects.find((p) => p.id === projectInUrl)?.id ?? "";

  return (
    <AppShell
      nav={[
        { icon: LayoutDashboard, label: "Tableau de bord", href: "/encadrant" },
        { icon: CheckSquare, label: "Validations", href: "/encadrant/validations", badge: pendingCount },
        { icon: FolderKanban, label: "Projets suivis", href: "/encadrant/projets" },
        { icon: Inbox, label: "Demandes", href: "/encadrant/demandes", badge: pendingRequests },
        { icon: MessageSquare, label: "Messagerie", href: "/encadrant/messagerie", badge: unreadMessages },
        { icon: Bell, label: "Notifications", href: "/encadrant/notifications", badge: unreadNotifications },
        { icon: Settings, label: "Paramètres", href: "/encadrant/parametres" },
      ]}
      homeHref="/encadrant"
      spaceLabel="Espace encadrant"
      roleLabel="Encadrant"
      userSubtitle={user.grade || "Encadrant académique"}
      settingsHref="/encadrant/parametres"
      notificationsHref="/encadrant/notifications"
      user={user}
      unreadNotifications={unreadNotifications}
      topLeft={
        projects.length > 0 ? (
          <TopSelect
            icon={FolderKanban}
            label="Accéder à un projet suivi"
            value={activeProject}
            placeholder="Accéder à un projet…"
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            onChange={(id) => router.push(`/encadrant/projets/${id}`)}
          />
        ) : null
      }
      topRight={
        pendingCount > 0 ? (
          <Link
            href="/encadrant/validations"
            className="mr-1 hidden h-9 items-center gap-1.5 rounded-full bg-warning-soft px-3.5 text-[12.5px] font-semibold text-warning ring-1 ring-warning/20 ring-inset transition-colors hover:ring-warning/40 md:inline-flex"
          >
            <CheckSquare className="size-3.5" strokeWidth={2} />
            {pendingCount} à examiner
          </Link>
        ) : null
      }
    >
      {children}
    </AppShell>
  );
}
