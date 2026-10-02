// components/layout/AppShell.tsx
// CADRE COMMUN DES ESPACES CONNECTÉS (étudiant, encadrant, administration)
// Barre latérale flottante bleu nuit, barre supérieure claire, menu mobile. Chaque espace fournit son menu.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Avatar from "@/components/ui/Avatar";
import Logo, { LogoMark } from "@/components/ui/Logo";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

export interface AppShellProps {
  children: React.ReactNode;
  nav: NavItem[];
  homeHref: string;
  spaceLabel: string; // « Espace étudiant »…
  roleLabel: string; // sous le prénom, en haut à droite
  userSubtitle: string; // sous le nom, dans la barre latérale
  settingsHref: string;
  notificationsHref: string;
  user: { firstName: string; lastName: string; avatarUrl?: string | null };
  unreadNotifications?: number;
  topLeft?: React.ReactNode; // ex. sélecteur de projet
  topRight?: React.ReactNode; // ex. raccourci « 3 à examiner »
}

export default function AppShell({
  children,
  nav,
  homeHref,
  spaceLabel,
  roleLabel,
  userSubtitle,
  settingsHref,
  notificationsHref,
  user,
  unreadNotifications = 0,
  topLeft,
  topRight,
}: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Le menu mobile se referme à chaque navigation (ajustement pendant le rendu, sans effet en cascade)
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setMobileOpen(false);
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const isActive = (href: string) => (href === homeHref ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`));

  // Menu mobile : Échap pour fermer, page figée derrière
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks = (compact: boolean) =>
    nav.map((item) => {
      const active = isActive(item.href);
      const badge = item.badge ?? 0;
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          title={compact ? item.label : undefined}
          className={`group relative flex h-11 items-center gap-3 rounded-xl text-[14px] font-medium transition-colors duration-150 ${
            compact ? "justify-center px-0" : "px-3.5"
          } ${
            active
              ? "bg-[linear-gradient(135deg,#3a6cf5_0%,#1f4fd8_100%)] text-white shadow-brand"
              : "text-sidebar-ink hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <item.icon className={`size-[19px] shrink-0 ${active ? "text-white" : "text-sidebar-ink/80 group-hover:text-white"}`} strokeWidth={1.75} aria-hidden="true" />
          {!compact && <span className="truncate">{item.label}</span>}
          {badge > 0 && (
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                active ? "bg-white text-brand" : "bg-gold-bright text-[#2a1d05]"
              } ${compact ? "absolute top-1 right-1.5 h-4 min-w-4 px-1 text-[9px]" : "ml-auto"}`}
              aria-label={`${badge} en attente`}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </Link>
      );
    });

  const userCard = (compact: boolean) => (
    <div className={`flex items-center gap-3 rounded-2xl bg-sidebar-raised p-2.5 ${compact ? "flex-col" : ""}`}>
      <Link href={settingsHref} title="Mon profil" className="shrink-0">
        <Avatar name={fullName} url={user.avatarUrl} size="md" />
      </Link>
      {!compact && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">{fullName}</p>
          <p className="truncate text-[11px] text-sidebar-ink">{userSubtitle}</p>
        </div>
      )}
      <form action="/logout" method="post">
        <button
          type="submit"
          className="inline-flex size-9 items-center justify-center rounded-lg text-sidebar-ink transition-colors hover:bg-white/[0.08] hover:text-white"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut className="size-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      {/* ===== BARRE LATÉRALE (ordinateur) ===== */}
      <aside
        className={`fixed inset-y-3 left-3 z-40 hidden flex-col rounded-[26px] bg-sidebar shadow-raised transition-[width] duration-300 ease-out dark:ring-1 dark:ring-white/[0.06] lg:flex ${
          collapsed ? "w-[84px]" : "w-[264px]"
        }`}
      >
        {/* Filet doré très discret en haut */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(214,178,94,0.55),transparent)]" />

        <div className={`flex h-[84px] items-center ${collapsed ? "justify-center" : "px-6"}`}>
          <Link href={homeHref} aria-label="Accueil LIGHT">
            {collapsed ? <LogoMark /> : <Logo />}
          </Link>
        </div>

        <nav aria-label="Navigation principale" className={`flex flex-1 flex-col gap-1 overflow-y-auto ${collapsed ? "px-3" : "px-4"} py-2`}>
          {!collapsed && <p className="px-3.5 pb-2 text-[10px] font-semibold tracking-[0.18em] text-sidebar-ink/60 uppercase">{spaceLabel}</p>}
          {navLinks(collapsed)}
        </nav>

        <div className={`space-y-3 ${collapsed ? "px-3" : "px-4"} pb-4`}>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`flex h-9 w-full items-center gap-2 rounded-lg text-[12px] font-medium text-sidebar-ink/80 transition-colors hover:bg-white/[0.06] hover:text-white ${
              collapsed ? "justify-center" : "px-3.5"
            }`}
            aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Réduire</>}
          </button>
          {userCard(collapsed)}
        </div>
      </aside>

      {/* ===== MENU MOBILE ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-[#050912]/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-3 left-3 z-50 flex w-[284px] flex-col rounded-[26px] bg-sidebar shadow-raised dark:ring-1 dark:ring-white/[0.06] lg:hidden"
              aria-label="Menu"
            >
              <div className="flex h-[76px] items-center justify-between px-6">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-sidebar-ink hover:bg-white/[0.08] hover:text-white"
                  aria-label="Fermer le menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <p className="px-[38px] pb-2 text-[10px] font-semibold tracking-[0.18em] text-sidebar-ink/60 uppercase">{spaceLabel}</p>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-2">{navLinks(false)}</nav>
              <div className="px-4 pb-4">{userCard(false)}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== CONTENU ===== */}
      <div className={`transition-[padding] duration-300 ease-out ${collapsed ? "lg:pl-[108px]" : "lg:pl-[288px]"}`}>
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-xl text-ink-muted hover:bg-surface hover:text-ink lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" strokeWidth={1.75} />
          </button>

          {topLeft}

          <div className="ml-auto flex items-center gap-1.5">
            {topRight}
            <ThemeToggle />
            <NotificationBell
              initialCount={unreadNotifications}
              allHref={notificationsHref}
              buttonClassName="!size-10 rounded-xl text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            />
            <span className="mx-2 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
            <Link href={settingsHref} className="flex items-center gap-3 rounded-xl py-1 pr-2 pl-1 transition-colors hover:bg-surface">
              <Avatar name={fullName} url={user.avatarUrl} size="sm" />
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-[13px] font-semibold text-ink">{user.firstName}</span>
                <span className="text-[11px] text-ink-subtle">{roleLabel}</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="px-4 pt-2 pb-12 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

// Sélecteur compact de la barre supérieure (projet en cours, projet suivi…)
export function TopSelect({
  icon: Icon,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative hidden items-center sm:flex">
      <span className="sr-only">{label}</span>
      <Icon className="pointer-events-none absolute left-3.5 size-4 text-ink-subtle" strokeWidth={1.75} />
      <select
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="select-chevron h-10 max-w-[280px] cursor-pointer appearance-none truncate rounded-xl border border-line bg-surface pr-10 pl-10 text-[13px] font-medium text-ink shadow-card transition-colors hover:border-line-strong focus:border-brand focus:outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
