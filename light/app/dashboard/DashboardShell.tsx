// app/dashboard/DashboardShell.tsx
// LAYOUT DASHBOARD (partie client : sidebar, topbar, thème)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "@/components/notifications/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Mail,
  Sparkles,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";

// ============================================================
// HOOK SCROLL
// ============================================================
function useScroll() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return scrollY;
}

// ============================================================
// HOOK THEME
// ============================================================
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, toggleTheme };
}

// ============================================================
// DONNÉES
// ============================================================
const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
  { icon: FolderKanban, label: "Mes projets", href: "/dashboard/projets" },
  { icon: MessageSquare, label: "Messagerie", href: "/dashboard/messagerie" },
  { icon: Mail, label: "Demandes & invitations", href: "/dashboard/invitations" },
  { icon: Sparkles, label: "Assistant IA", href: "/dashboard/assistant" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/parametres" },
];

export interface ShellUser {
  firstName: string;
  lastName: string;
}

export interface ShellProject {
  id: string;
  title: string;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
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
  // Pastilles du menu : messages non lus, demandes reçues en attente, notifications non lues
  const badges: Record<string, number> = {
    "/dashboard/messagerie": unreadMessages,
    "/dashboard/invitations": pendingRequests,
    "/dashboard/notifications": unreadNotifications,
  };
  const badgeFor = (href: string) => badges[href] ?? 0;
  const pathname = usePathname();
  const router = useRouter();
  const scrollY = useScroll();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Projet actif : celui de l'URL courante, sinon le plus récent
  const projectInUrl = pathname?.match(/^\/dashboard\/projets\/([^/]+)/)?.[1];
  const activeProject = projects.find(p => p.id === projectInUrl)?.id ?? projects[0]?.id ?? "";

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Auto-fermer le menu mobile sur les grands écrans
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // ESC pour fermer le menu mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        position: "relative",
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: "#0A1628",
        overflow: "hidden",
      }}
    >
      {/* ===== FOND AVEC IMAGE ET PARALLAX ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.08,
            transform: `translateY(${scrollY * 0.03}px) scale(1.1)`,
            transition: "transform 0.05s ease-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(10,22,40,0.6) 0%, rgba(10,22,40,0.85) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.04), transparent 70%)",
            top: "-200px",
            right: "-100px",
            animation: "floatBg 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.025), transparent 70%)",
            bottom: "-100px",
            left: "-80px",
            animation: "floatBg 10s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "linear-gradient(180deg, transparent, rgba(10,22,40,0.4))",
          }}
        />
      </div>

      <style>{`
        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .fade-in-slide {
          animation: fadeInSlide 0.3s ease forwards;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-decoration: none;
          cursor: pointer;
          position: relative;
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .sidebar-item-active {
          background: rgba(212, 175, 55, 0.12);
          border-left: 3px solid #D4AF37;
        }
        .sidebar-item-active:hover {
          background: rgba(212, 175, 55, 0.18);
        }

        .topbar-select {
          padding: 6px 14px 6px 12px;
          border-radius: 10px;
          border: 1px solid rgba(180, 200, 230, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: #E8EDF5;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(200,215,235,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 32px;
        }
        .topbar-select:hover {
          border-color: rgba(180, 200, 230, 0.2);
          background: rgba(255, 255, 255, 0.06);
        }
        .topbar-select:focus {
          border-color: rgba(212, 175, 55, 0.3);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.06);
        }
        .topbar-select option {
          background: #0A1628;
          color: #E8EDF5;
        }

        .search-input {
          width: 100%;
          padding: 8px 16px 8px 36px;
          border-radius: 20px;
          border: 1px solid rgba(180, 200, 230, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #E8EDF5;
          font-size: 13px;
          outline: none;
          transition: all 0.3s ease;
        }
        .search-input::placeholder {
          color: rgba(200, 215, 235, 0.25);
        }
        .search-input:focus {
          border-color: rgba(212, 175, 55, 0.2);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.04);
        }

        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(200, 215, 235, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .icon-btn:hover {
          background: rgba(212, 175, 55, 0.1);
          color: #F5D76E;
          transform: scale(1.05);
        }
        .icon-btn-active {
          background: rgba(212, 175, 55, 0.12);
          color: #F5D76E;
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #0A1628;
          flex-shrink: 0;
        }

        .scrollbar-custom::-webkit-scrollbar { width: 4px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 2px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.4); }

        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
          .topbar-search { display: none; }
        }
        @media (min-width: 769px) {
          .sidebar-mobile { display: none; }
          .topbar-mobile-search { display: none; }
        }
      `}</style>

      {/* ============================================================
          SIDEBAR DESKTOP
          ============================================================ */}
      <aside
        className="sidebar-desktop"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: sidebarOpen ? "268px" : "80px",
          background: "rgba(10, 22, 40, 0.85)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(180, 200, 230, 0.06)",
          transition: "width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          overflow: "hidden",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: sidebarOpen ? "20px 24px" : "20px 12px",
            borderBottom: "1px solid rgba(180, 200, 230, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            gap: "12px",
            minHeight: "72px",
            flexShrink: 0,
          }}
        >
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "11px",
                background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 700,
                color: "#0A1628",
                flexShrink: 0,
                boxShadow: "0 4px 20px rgba(212, 175, 55, 0.2)",
              }}
            >
              
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: "18px", fontWeight: 700, color: "#E8EDF5", letterSpacing: "-0.5px" }}
              >
                Entrepreneur
              </motion.span>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
          className="scrollbar-custom"
          aria-label="Navigation principale"
        >
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                style={{
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "10px 14px" : "10px 12px",
                }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon
                  size={19}
                  style={{
                    color: isActive ? "#F5D76E" : "rgba(200, 215, 235, 0.35)",
                    flexShrink: 0,
                    transition: "color 0.3s ease",
                  }}
                  aria-hidden="true"
                />
                {sidebarOpen && (
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#E8EDF5" : "rgba(200, 215, 235, 0.6)",
                      whiteSpace: "nowrap",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {item.label}
                  </span>
                )}
                {badgeFor(item.href) > 0 && (
                  <span
                    aria-label={`${badgeFor(item.href)} élément${badgeFor(item.href) > 1 ? "s" : ""} en attente`}
                    style={{
                      minWidth: "18px", height: "18px", padding: "0 5px", borderRadius: "9px", background: "#E4736B", color: "#fff",
                      fontSize: "10px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
                      ...(sidebarOpen ? { marginLeft: "auto" } : { position: "absolute", top: "4px", right: "6px" }),
                    }}
                  >
                    {badgeFor(item.href)}
                  </span>
                )}
                {isActive && sidebarOpen && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    style={{
                      marginLeft: "auto",
                      width: "4px",
                      height: "20px",
                      borderRadius: "2px",
                      background: "#D4AF37",
                      boxShadow: "0 0 12px rgba(212, 175, 55, 0.3)",
                    }}
                  />
                )}
                {isActive && !sidebarOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      width: "3px",
                      height: "24px",
                      borderRadius: "2px",
                      background: "#D4AF37",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div
          style={{
            padding: sidebarOpen ? "16px 20px" : "16px 12px",
            borderTop: "1px solid rgba(180, 200, 230, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div className="avatar-circle">{initials}</div>
            {sidebarOpen && (
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#E8EDF5", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {fullName}
                </p>
                <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.35)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Porteur de projet
                </p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexDirection: sidebarOpen ? "row" : "column" }}>
            <form action="/logout" method="post" style={{ display: "contents" }}>
              <button
                type="submit"
                className="icon-btn"
                aria-label="Se déconnecter"
                title="Se déconnecter"
                style={{ width: "28px", height: "28px", fontSize: "12px" }}
              >
                <LogOut size={14} />
              </button>
            </form>
            <button
              onClick={toggleTheme}
              className="icon-btn"
              aria-label="Changer le thème"
              style={{ width: "28px", height: "28px", fontSize: "12px" }}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="icon-btn"
              aria-label={sidebarOpen ? "Réduire le menu" : "Ouvrir le menu"}
              style={{ width: "28px", height: "28px", fontSize: "12px" }}
            >
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================
          SIDEBAR MOBILE (overlay)
          ============================================================ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 999,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                width: "280px",
                background: "rgba(10, 22, 40, 0.95)",
                backdropFilter: "blur(24px)",
                borderRight: "1px solid rgba(180, 200, 230, 0.06)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                padding: "20px 16px",
              }}
            >
              {/* Logo + fermeture */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "11px",
                      background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0A1628",
                      boxShadow: "0 4px 20px rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#E8EDF5" }}>Entrepreneur</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="icon-btn"
                  aria-label="Fermer le menu"
                  style={{ width: "32px", height: "32px" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu mobile */}
              <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                {MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ padding: "12px 14px" }}
                    >
                      <item.icon
                        size={19}
                        style={{ color: isActive ? "#F5D76E" : "rgba(200,215,235,0.35)" }}
                        aria-hidden="true"
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "#E8EDF5" : "rgba(200,215,235,0.6)",
                        }}
                      >
                        {item.label}
                      </span>
                      {badgeFor(item.href) > 0 && (
                        <span style={{ minWidth: "18px", height: "18px", padding: "0 5px", borderRadius: "9px", background: "#E4736B", color: "#fff", fontSize: "10px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: "auto" }}>
                          {badgeFor(item.href)}
                        </span>
                      )}
                      {isActive && (
                        <div
                          style={{
                            marginLeft: "auto",
                            width: "4px",
                            height: "20px",
                            borderRadius: "2px",
                            background: "#D4AF37",
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer mobile */}
              <div style={{ borderTop: "1px solid rgba(180,200,230,0.06)", paddingTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="avatar-circle">{initials}</div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>{fullName}</p>
                    <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.35)", margin: 0 }}>Porteur de projet</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <form action="/logout" method="post" style={{ display: "contents" }}>
                    <button type="submit" className="icon-btn" aria-label="Se déconnecter" title="Se déconnecter" style={{ width: "32px", height: "32px" }}>
                      <LogOut size={16} />
                    </button>
                  </form>
                  <button
                    onClick={toggleTheme}
                    className="icon-btn"
                    aria-label="Changer le thème"
                    style={{ width: "32px", height: "32px" }}
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "268px" : "80px",
          transition: "margin-left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ===== TOPBAR ===== */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(10, 22, 40, 0.6)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(180, 200, 230, 0.06)",
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          {/* Gauche : Menu mobile + sélecteur projet */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="icon-btn"
              aria-label="Ouvrir le menu"
              style={{ display: "inline-flex", width: "36px", height: "36px" }}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.35)", fontWeight: 500, letterSpacing: "0.3px" }}>
                Projet
              </span>
              {projects.length > 0 ? (
                <select
                  value={activeProject}
                  onChange={(e) => router.push(`/dashboard/projets/${e.target.value}`)}
                  className="topbar-select"
                  aria-label="Changer de projet"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              ) : (
                <Link href="/dashboard/projets/nouveau" className="topbar-select" style={{ textDecoration: "none", backgroundImage: "none", paddingRight: "14px" }}>
                  + Créer un projet
                </Link>
              )}
            </div>
          </div>

          {/* Centre : Recherche */}
          <div className="topbar-search" style={{ flex: 1, maxWidth: "400px", position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(200,215,235,0.25)",
              }}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Rechercher un projet, une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Droite : Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* Recherche mobile */}
            <button
              className="icon-btn topbar-mobile-search"
              aria-label="Rechercher"
              style={{ display: "inline-flex", width: "36px", height: "36px" }}
            >
              <Search size={16} />
            </button>

            {/* Notifications */}
            <NotificationBell initialCount={unreadNotifications} allHref="/dashboard/notifications" buttonClassName="icon-btn" />

            {/* Theme toggle (mobile) */}
            <button
              onClick={toggleTheme}
              className="icon-btn"
              aria-label="Changer le thème"
              style={{ display: "inline-flex", width: "36px", height: "36px" }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Profil */}
            <Link
              href="/dashboard/parametres"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                padding: "4px 10px 4px 4px",
                borderRadius: "20px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div className="avatar-circle">{initials}</div>
              {/* ✅ CORRECTION : utilisation de Tailwind pour le responsive */}
              <span className="hidden sm:inline" style={{ fontSize: "13px", color: "rgba(200,215,235,0.8)", fontWeight: 500 }}>
                {user.firstName}
              </span>
            </Link>
          </div>
        </header>

        {/* ===== CONTENU DE LA PAGE ===== */}
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}