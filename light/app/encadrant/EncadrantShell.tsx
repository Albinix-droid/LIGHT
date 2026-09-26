// app/encadrant/EncadrantShell.tsx
// LAYOUT ENCADRANT (partie client) - même langage visuel que l'espace étudiant
// Les classes .enc-* définies ici sont partagées par toutes les pages de l'espace encadrant.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/notifications/NotificationBell";
import {
  LayoutDashboard, FolderKanban, CheckSquare, ChevronLeft, ChevronRight, Menu, X, GraduationCap, LogOut, MessageSquare, Inbox, Bell,
} from "lucide-react";

export interface EncadrantShellProps {
  children: React.ReactNode;
  user: { firstName: string; lastName: string };
  projects: { id: string; title: string }[];
  pendingCount: number;
  unreadMessages?: number;
  pendingRequests?: number;
  unreadNotifications?: number;
}

export default function EncadrantShell({ children, user, projects, pendingCount, unreadMessages = 0, pendingRequests = 0, unreadNotifications = 0 }: EncadrantShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menu = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/encadrant", badge: 0 },
    { icon: CheckSquare, label: "Validations", href: "/encadrant/validations", badge: pendingCount },
    { icon: Inbox, label: "Demandes", href: "/encadrant/demandes", badge: pendingRequests },
    { icon: MessageSquare, label: "Messagerie", href: "/encadrant/messagerie", badge: unreadMessages },
    { icon: FolderKanban, label: "Projets suivis", href: "/encadrant/projets", badge: 0 },
    { icon: Bell, label: "Notifications", href: "/encadrant/notifications", badge: unreadNotifications },
  ];

  const projectInUrl = pathname?.match(/^\/encadrant\/projets\/([^/]+)/)?.[1];
  const activeProject = projects.find((p) => p.id === projectInUrl)?.id ?? "";
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = [user.firstName, user.lastName].filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const isActive = (href: string) => (href === "/encadrant" ? pathname === href : pathname?.startsWith(href));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMobileMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navLinks = (compact: boolean, onNavigate?: () => void) =>
    menu.map((item) => {
      const active = isActive(item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`enc-nav-item ${active ? "enc-nav-item-active" : ""}`}
          style={{ justifyContent: compact ? "center" : "flex-start" }}
          title={compact ? item.label : undefined}
        >
          <item.icon size={19} style={{ color: active ? "#F5D76E" : "rgba(200,215,235,0.4)", flexShrink: 0 }} aria-hidden="true" />
          {!compact && <span style={{ flex: 1 }}>{item.label}</span>}
          {item.badge > 0 && (
            <span className="enc-count" style={compact ? { position: "absolute", top: "4px", right: "6px" } : undefined}>
              {item.badge}
            </span>
          )}
        </Link>
      );
    });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A1628", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes encFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        /* ===== NAVIGATION ===== */
        .enc-nav-item {
          position: relative; display: flex; align-items: center; gap: 12px; padding: 10px 14px;
          border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 500;
          color: rgba(200,215,235,0.65); transition: all 0.25s ease; border-left: 3px solid transparent;
        }
        .enc-nav-item:hover { background: rgba(255,255,255,0.05); color: #E8EDF5; }
        .enc-nav-item-active { background: rgba(212,175,55,0.12); border-left-color: #D4AF37; color: #E8EDF5; font-weight: 600; }
        .enc-count {
          min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: #E4736B; color: #fff;
          font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;
        }
        .enc-icon-btn {
          display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;
          border-radius: 50%; border: none; background: rgba(255,255,255,0.05); color: rgba(200,215,235,0.6);
          cursor: pointer; transition: all 0.25s ease;
        }
        .enc-icon-btn:hover { background: rgba(212,175,55,0.12); color: #F5D76E; }
        .enc-avatar {
          width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #D4AF37, #F5D76E);
          display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
          color: #0A1628; flex-shrink: 0;
        }
        .enc-select {
          padding: 7px 32px 7px 12px; border-radius: 10px; border: 1px solid rgba(180,200,230,0.12);
          background: rgba(255,255,255,0.04); color: #E8EDF5; font-size: 13px; outline: none; cursor: pointer;
          appearance: none; max-width: 260px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(200,215,235,0.5)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
        }
        .enc-select option { background: #0A1628; }

        /* ===== BRIQUES PARTAGÉES DES PAGES ===== */
        .enc-page { max-width: 1150px; margin: 0 auto; animation: encFadeIn 0.5s ease both; }
        .enc-h1 { font-size: 26px; font-weight: 700; color: #E8EDF5; letter-spacing: -0.5px; margin: 0; }
        .enc-sub { font-size: 14px; color: rgba(200,215,235,0.5); margin: 4px 0 0; }
        .enc-h2 { font-size: 15px; font-weight: 600; color: #E8EDF5; margin: 0; display: flex; align-items: center; gap: 8px; }
        .enc-muted { color: rgba(200,215,235,0.45); }
        .enc-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(180,200,230,0.08); border-radius: 18px;
          padding: 22px; backdrop-filter: blur(12px);
        }
        .enc-stat { padding: 18px 20px; }
        .enc-stat-value { font-size: 26px; font-weight: 700; color: #E8EDF5; margin: 8px 0 0; }
        .enc-stat-label { font-size: 12px; color: rgba(200,215,235,0.45); margin: 2px 0 0; }
        .enc-row {
          display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px;
          background: rgba(255,255,255,0.025); border: 1px solid rgba(180,200,230,0.06);
          text-decoration: none; transition: all 0.25s ease;
        }
        a.enc-row:hover { background: rgba(255,255,255,0.06); border-color: rgba(212,175,55,0.2); transform: translateX(3px); }
        .enc-row-active { background: rgba(212,175,55,0.08) !important; border-color: rgba(212,175,55,0.3) !important; }
        .enc-badge {
          display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 50px;
          font-size: 11px; font-weight: 600; white-space: nowrap;
        }
        .enc-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px;
          border-radius: 50px; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer;
          transition: all 0.25s ease; border: 1px solid rgba(180,200,230,0.15);
          background: rgba(255,255,255,0.03); color: rgba(200,215,235,0.75);
        }
        .enc-btn:hover:not(:disabled) { color: #E8EDF5; border-color: rgba(180,200,230,0.3); transform: translateY(-1px); }
        .enc-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .enc-btn-primary { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; border: none; font-weight: 700; }
        .enc-btn-primary:hover:not(:disabled) { color: #0A1628; box-shadow: 0 8px 30px rgba(212,175,55,0.25); }
        .enc-progress { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .enc-progress > div { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #D4AF37, #F5D76E); }
        .enc-input {
          width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(180,200,230,0.12);
          background: rgba(255,255,255,0.04); color: #E8EDF5; font-size: 14px; outline: none;
          font-family: inherit; box-sizing: border-box; transition: border-color 0.25s ease;
        }
        .enc-input:focus { border-color: rgba(212,175,55,0.4); }
        .enc-input::placeholder { color: rgba(200,215,235,0.3); }
        .enc-empty { text-align: center; padding: 36px 16px; color: rgba(200,215,235,0.4); font-size: 14px; }

        @media (max-width: 860px) {
          .enc-sidebar { display: none; }
          .enc-main { margin-left: 0 !important; }
        }
        @media (min-width: 861px) { .enc-mobile-toggle { display: none !important; } }
        @media (max-width: 960px) { .enc-two-cols { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ===== SIDEBAR ===== */}
      <aside
        className="enc-sidebar"
        style={{
          position: "fixed", top: 0, left: 0, height: "100vh", width: sidebarOpen ? "260px" : "78px",
          background: "rgba(10,22,40,0.92)", borderRight: "1px solid rgba(180,200,230,0.06)",
          transition: "width 0.3s ease", zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <Link href="/encadrant" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px", textDecoration: "none", minHeight: "76px", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
          <div className="enc-avatar" style={{ borderRadius: "11px", width: "38px", height: "38px" }}>
            <GraduationCap size={19} />
          </div>
          {sidebarOpen && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#E8EDF5", lineHeight: 1.1 }}>Entrepreneur</span>
              <span style={{ fontSize: "10px", color: "#F5D76E", fontWeight: 700, letterSpacing: "0.8px" }}>ESPACE ENCADRANT</span>
            </div>
          )}
        </Link>
        <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: "4px" }} aria-label="Navigation encadrant">
          {navLinks(!sidebarOpen)}
        </nav>
        <div style={{ padding: "16px", borderTop: "1px solid rgba(180,200,230,0.06)", display: "flex", alignItems: "center", gap: "10px", justifyContent: sidebarOpen ? "space-between" : "center" }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              <div className="enc-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#E8EDF5", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fullName}</p>
                <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)", margin: 0 }}>Encadrant académique</p>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "4px", flexDirection: sidebarOpen ? "row" : "column" }}>
            <form action="/logout" method="post" style={{ display: "contents" }}>
              <button type="submit" className="enc-icon-btn" aria-label="Se déconnecter" title="Se déconnecter">
                <LogOut size={15} />
              </button>
            </form>
            <button className="enc-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? "Réduire le menu" : "Ouvrir le menu"}>
              {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MENU MOBILE ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 60 }}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "270px", background: "#0A1628", zIndex: 61, padding: "20px 14px", display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#E8EDF5" }}>Espace encadrant</span>
                <button className="enc-icon-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fermer le menu"><X size={16} /></button>
              </div>
              {navLinks(false, () => setIsMobileMenuOpen(false))}
              <form action="/logout" method="post" style={{ marginTop: "auto" }}>
                <button type="submit" className="enc-nav-item" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", color: "#F0928B" }}>
                  <LogOut size={19} /> Se déconnecter
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== CONTENU ===== */}
      <div className="enc-main" style={{ flex: 1, marginLeft: sidebarOpen ? "260px" : "78px", transition: "margin-left 0.3s ease", minWidth: 0 }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "12px", padding: "12px 24px", background: "rgba(10,22,40,0.8)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(180,200,230,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <button className="enc-icon-btn enc-mobile-toggle" onClick={() => setIsMobileMenuOpen(true)} aria-label="Ouvrir le menu">
              <Menu size={16} />
            </button>
            {projects.length > 0 && (
              <select
                className="enc-select"
                value={activeProject}
                onChange={(e) => e.target.value && router.push(`/encadrant/projets/${e.target.value}`)}
                aria-label="Accéder à un projet suivi"
              >
                <option value="">Accéder à un projet…</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {pendingCount > 0 && (
              <Link href="/encadrant/validations" className="enc-badge" style={{ background: "rgba(245,158,11,0.12)", color: "#F5B544", textDecoration: "none" }}>
                <CheckSquare size={12} />
                {pendingCount} à examiner
              </Link>
            )}
            <NotificationBell initialCount={unreadNotifications} allHref="/encadrant/notifications" buttonClassName="enc-icon-btn" />
            <div className="enc-avatar" title={fullName}>{initials}</div>
          </div>
        </header>
        <main style={{ padding: "28px 24px 40px" }}>{children}</main>
      </div>
    </div>
  );
}
