// app/admin/AdminShell.tsx
// LAYOUT ADMINISTRATEUR (partie client) : menu de l'administration dans le cadre commun

"use client";

import Link from "next/link";
import { Bell, FolderKanban, KeyRound, LayoutDashboard, ScrollText, Settings, ShieldCheck, UserCheck, Users } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

export interface AdminShellProps {
  children: React.ReactNode;
  user: { firstName: string; lastName: string; avatarUrl?: string | null; grade?: string | null };
  pendingStaff: number;
  unreadNotifications?: number;
}

export default function AdminShell({ children, user, pendingStaff, unreadNotifications = 0 }: AdminShellProps) {
  return (
    <AppShell
      nav={[
        { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/admin" },
        { icon: Users, label: "Utilisateurs", href: "/admin/utilisateurs", badge: pendingStaff },
        { icon: KeyRound, label: "Identifiants école", href: "/admin/identifiants" },
        { icon: FolderKanban, label: "Projets", href: "/admin/projets" },
        { icon: ScrollText, label: "Journal", href: "/admin/journal" },
        { icon: Bell, label: "Notifications", href: "/admin/notifications", badge: unreadNotifications },
        { icon: Settings, label: "Paramètres", href: "/admin/parametres" },
      ]}
      homeHref="/admin"
      spaceLabel="Administration"
      roleLabel="Administrateur"
      userSubtitle={user.grade || "Administrateur"}
      settingsHref="/admin/parametres"
      notificationsHref="/admin/notifications"
      user={user}
      unreadNotifications={unreadNotifications}
      topLeft={
        <span className="hidden h-9 items-center gap-1.5 rounded-full bg-gold-soft px-3.5 text-[12.5px] font-semibold text-gold ring-1 ring-gold/25 ring-inset sm:inline-flex">
          <ShieldCheck className="size-3.5" strokeWidth={2} /> Espace administrateur
        </span>
      }
      topRight={
        pendingStaff > 0 ? (
          <Link
            href="/admin/utilisateurs?filtre=pending"
            className="mr-1 hidden h-9 items-center gap-1.5 rounded-full bg-warning-soft px-3.5 text-[12.5px] font-semibold text-warning ring-1 ring-warning/20 ring-inset transition-colors hover:ring-warning/40 md:inline-flex"
          >
            <UserCheck className="size-3.5" strokeWidth={2} /> {pendingStaff} en attente
          </Link>
        ) : null
      }
    >
      {children}
    </AppShell>
  );
}
