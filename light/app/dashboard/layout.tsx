// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, MessageSquare, Mail, Sparkles, Bell, Settings,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";

const PROJETS = ["Projet Innov'Afrique", "Projet EcoGreen", "Projet Digital Hub"];

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
  { icon: FolderKanban, label: "Mes projets", href: "/dashboard/projets" },
  { icon: MessageSquare, label: "Messagerie", href: "/dashboard/messagerie" },
  { icon: Mail, label: "Demandes & invitations", href: "/dashboard/invitations" },
  { icon: Sparkles, label: "Assistant IA", href: "/dashboard/assistant" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/parametres" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProject, setActiveProject] = useState(PROJETS[0]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", fontFamily: "'Inter', sans-serif" }}>
      {/* ===== FOND : halos dorés discrets, cohérents avec l'accueil ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", backgroundColor: "#F8F9FA" }}>
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.05), transparent 70%)",
            top: "-350px",
            right: "-250px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.04), transparent 70%)",
            bottom: "-250px",
            left: "-200px",
          }}
        />
      </div>

      <style jsx global>{`
        ::selection { background: rgba(201, 162, 0, 0.2); }
        a:focus-visible, button:focus-visible, select:focus-visible {
          outline: 2px solid #C9A200;
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>

      {/* ===== SIDEBAR ===== */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: sidebarOpen ? "268px" : "84px",
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(0,0,0,0.04)",
          transition: "width 0.3s ease",
          overflow: "hidden",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: sidebarOpen ? "22px 24px" : "22px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            gap: "12px",
            minHeight: "72px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "11px",
              background: "linear-gradient(135deg, #C9A200, #F4D03F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 700,
              color: "#1A1A2E",
              flexShrink: 0,
            }}
          >
            L
          </div>
          {sidebarOpen && (
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A2E" }}>
              LIGHT
            </span>
          )}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }} aria-label="Navigation principale">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  background: isActive ? "linear-gradient(135deg, rgba(201,162,0,0.14), rgba(244,208,63,0.1))" : "transparent",
                  borderLeft: isActive ? "3px solid #C9A200" : "3px solid transparent",
                  color: isActive ? "#1A1A2E" : "#6B6B7B",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  marginBottom: "4px",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <item.icon size={19} style={{ color: isActive ? "#C9A200" : "#9A9A9A", flexShrink: 0 }} aria-hidden="true" />
                {sidebarOpen && (
                  <span style={{ fontSize: "14px", fontWeight: isActive ? 600 : 500, whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar - Profil + toggle */}
        <div
          style={{
            padding: sidebarOpen ? "16px 20px" : "16px 12px",
            borderTop: "1px solid rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A200, #F4D03F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#1A1A2E",
                flexShrink: 0,
              }}
            >
              JD
            </div>
            {sidebarOpen && (
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A2E", margin: 0 }}>Jean Dupont</p>
                <p style={{ fontSize: "11px", color: "#9A9A9A", margin: 0 }}>Étudiant</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Réduire le menu" : "Ouvrir le menu"}
            style={{
              background: "rgba(0,0,0,0.03)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B6B7B",
              flexShrink: 0,
            }}
          >
            {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
      </aside>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "268px" : "84px",
          transition: "margin-left 0.3s ease",
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
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            gap: "16px",
          }}
        >
          {/* Sélecteur de projet */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ fontSize: "13px", color: "#9A9A9A" }}>Projet actif :</span>
            <select
              value={activeProject}
              onChange={(e) => setActiveProject(e.target.value)}
              style={{
                padding: "7px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                fontWeight: 500,
                color: "#1A1A2E",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {PROJETS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Barre de recherche */}
          <div style={{ flex: 1, maxWidth: "380px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#B0B0B0" }} aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 16px 9px 38px",
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "rgba(255,255,255,0.6)",
                fontSize: "13px",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#C9A200";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201, 162, 0, 0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Droite : Notifications + Profil */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
            <Link
              href="/dashboard/notifications"
              aria-label="Voir les notifications"
              style={{
                position: "relative",
                display: "inline-flex",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.03)",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,162,0,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
            >
              <Bell size={17} style={{ color: "#6B6B7B" }} aria-hidden="true" />
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#F28B82",
                  border: "2px solid #FFFFFF",
                }}
              />
            </Link>

            <Link
              href="/dashboard/profil"
              style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", padding: "4px 10px 4px 4px", borderRadius: "20px", transition: "background 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9A200, #F4D03F)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#1A1A2E",
                }}
              >
                JD
              </div>
              <span style={{ fontSize: "13px", color: "#1A1A2E", fontWeight: 500 }}>Jean</span>
            </Link>
          </div>
        </header>

        {/* ===== CONTENU DE LA PAGE ===== */}
        <main style={{ flex: 1, padding: "24px" }}>{children}</main>
      </div>
    </div>
  );
}