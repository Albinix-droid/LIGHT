// app/dashboard/DashboardShell.tsx
// LAYOUT DASHBOARD (partie client) : menu de l'espace étudiant dans le cadre commun

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, FolderKanban, LayoutDashboard, Mail, MessageSquare, Settings, Sparkles } from "lucide-react";
import AppShell, { TopSelect } from "@/components/layout/AppShell";

export interface ShellUser {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface ShellProject {
  id: string;
  title: string;
}

export default function DashboardShell({
  children,
  user,
  projects,
  unreadMessages = 0,
  pendingRequests = 0,
  unreadNotifications = 0,
}: {
  children: React.ReactNode;
  user: ShellUser;
  projects: ShellProject[];
  unreadMessages?: number;
  pendingRequests?: number;
  unreadNotifications?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Projet du sélecteur : celui de l'URL, sinon le plus récent
  const projectInUrl = pathname?.match(/^\/dashboard\/projets\/([^/]+)/)?.[1];
  const activeProject = projects.find((p) => p.id === projectInUrl)?.id ?? projects[0]?.id ?? "";

  return (
    <AppShell
      nav={[
        { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
        { icon: FolderKanban, label: "Mes projets", href: "/dashboard/projets" },
        { icon: MessageSquare, label: "Messagerie", href: "/dashboard/messagerie", badge: unreadMessages },
        { icon: Mail, label: "Invitations", href: "/dashboard/invitations", badge: pendingRequests },
        { icon: Sparkles, label: "Mentor IA", href: "/dashboard/assistant" },
        { icon: Bell, label: "Notifications", href: "/dashboard/notifications", badge: unreadNotifications },
        { icon: Settings, label: "Paramètres", href: "/dashboard/parametres" },
      ]}
      homeHref="/dashboard"
      spaceLabel="Espace étudiant"
      roleLabel="Étudiant"
      userSubtitle="Porteur de projet"
      settingsHref="/dashboard/parametres"
      notificationsHref="/dashboard/notifications"
      user={user}
      unreadNotifications={unreadNotifications}
      topLeft={
        projects.length > 0 ? (
          <TopSelect
            icon={FolderKanban}
            label="Changer de projet"
            value={activeProject}
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            onChange={(id) => router.push(`/dashboard/projets/${id}`)}
          />
        ) : (
          <Link
            href="/dashboard/projets/nouveau"
            className="hidden h-10 items-center rounded-xl border border-dashed border-line-strong px-4 text-[13px] font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand sm:inline-flex"
          >
            + Créer un projet
          </Link>
        )
      }
    >
      {children}
    </AppShell>
  );
}
