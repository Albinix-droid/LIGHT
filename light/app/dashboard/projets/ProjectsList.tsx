// app/dashboard/projets/ProjectsList.tsx
// LISTE DES PROJETS - ICÔNES PROFESSIONNELLES

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, Plus, ArrowRight, Users, Clock, Wallet,
  Sparkles, Target, Rocket, Award, Star, Zap, Shield,
  Search, Filter, Grid3x3, List, ChevronDown, X,
  Lightbulb, Leaf, Heart, BookOpen, Sprout, Landmark, GraduationCap,
  Briefcase, Globe, Cpu, Cloud, ShoppingBag, Coffee, Building2
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
// VISUELS PAR SECTEUR
// ============================================================
const SECTOR_VISUALS: Record<string, { icon: typeof Rocket; image: string }> = {
  tech: { icon: Rocket, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" },
  agriculture: { icon: Sprout, image: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?q=80&w=2070&auto=format&fit=crop" },
  commerce: { icon: ShoppingBag, image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop" },
  services: { icon: Briefcase, image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2070&auto=format&fit=crop" },
  health: { icon: Heart, image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" },
  education: { icon: GraduationCap, image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop" },
  finance: { icon: Building2, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" },
};
const DEFAULT_VISUAL = { icon: Lightbulb, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" };

export interface ProjectSummary {
  id: string;
  title: string;
  stage: string;
  progress: number;
  members: number;
  budget: number | null;
  spent: number;
  sector: string | null;
  tags: string[];
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function ProjectsList({ projects }: { projects: ProjectSummary[] }) {
  const scrollY = useScroll();
  const allProjects = projects.map(p => ({ ...p, ...(SECTOR_VISUALS[p.sector ?? ""] ?? DEFAULT_VISUAL) }));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtrage
  const filteredProjects = allProjects.filter(project => {
    const matchSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStage = filterStage === "all" || project.stage === filterStage;
    return matchSearch && matchStage;
  });

  // Statistiques
  const totalProjects = allProjects.length;
  const completed = allProjects.filter(p => p.progress === 100).length;
  const inProgress = allProjects.filter(p => p.progress > 0 && p.progress < 100).length;
  const notStarted = allProjects.filter(p => p.progress === 0).length;

  // Liste des étapes pour le filtre
  const stages = ["all", ...new Set(allProjects.map(p => p.stage))];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "0 0 24px 0",
      }}
    >
      {/* ===== FOND AVEC PARALLAX ===== */}
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
            background: "radial-gradient(ellipse at 30% 20%, rgba(26,10,46,0.5) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.04), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(201,162,0,0.025), transparent 70%)",
            bottom: "-100px",
            left: "-80px",
            animation: "floatBg 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      <style>{`
        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fade-in-up {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          animation: fadeInUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.15s; }
        .delay-3 { animation-delay: 0.25s; }

        .stat-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(201, 162, 0, 0.15);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
        }

        .project-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .project-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(201, 162, 0, 0.2);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 12px 60px rgba(0, 0, 0, 0.3);
        }

        .project-image {
          height: 120px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .project-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%);
        }

        .progress-bar-bg {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #C9A200, #F4D03F);
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .tag {
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 9px;
          font-weight: 600;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .filter-btn {
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .filter-btn:hover {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
        }
        .filter-btn-active {
          background: linear-gradient(135deg, #C9A200, #F4D03F);
          border-color: transparent;
          color: #1A1A2E;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #C9A200, #F4D03F);
          color: #1A1A2E;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(201, 162, 0, 0.15);
          cursor: pointer;
        }
        .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 40px rgba(201, 162, 0, 0.25);
        }

        .input-search {
          width: 100%;
          padding: 10px 16px 10px 36px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.04);
          color: #FFFFFF;
          font-size: 13px;
          outline: none;
          transition: all 0.3s ease;
        }
        .input-search:focus {
          border-color: rgba(201, 162, 0, 0.2);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(201, 162, 0, 0.04);
        }
        .input-search::placeholder {
          color: rgba(255,255,255,0.25);
        }

        .view-btn {
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          background: transparent;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .view-btn-active {
          background: rgba(255,255,255,0.08);
          color: #FFFFFF;
        }
        .view-btn:hover {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
        }

        .list-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .list-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
        }
      `}</style>

      {/* ============================================================
          CONTENU
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "24px 20px" }}>

        {/* ===== EN-TÊTE ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px", margin: 0 }}>
              Mes projets
            </h1>
            <span className="badge-dash" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", background: "rgba(201,162,0,0.12)", border: "1px solid rgba(201,162,0,0.12)", borderRadius: "50px", fontSize: "11px", fontWeight: 600, color: "#F4D03F" }}>
              <Sparkles size={12} />
              {totalProjects} projet{totalProjects > 1 ? "s" : ""}
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>
            Gérez tous vos projets entrepreneuriaux en un coup d'œil
          </p>
        </div>

        {/* ===== STATS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <div className="stat-card">
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Total</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{totalProjects}</p>
          </div>
          <div className="stat-card">
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>En cours</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#F4D03F", margin: 0 }}>{inProgress}</p>
          </div>
          <div className="stat-card">
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Terminés</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#10B981", margin: 0 }}>{completed}</p>
          </div>
          <div className="stat-card">
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Non débutés</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#6B7280", margin: 0 }}>{notStarted}</p>
          </div>
        </div>

        {/* ===== BARRE D'OUTILS ===== */}
        <div className="fade-in-up delay-3" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-search"
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`filter-btn ${filterStage === stage ? 'filter-btn-active' : ''}`}
              >
                {stage === "all" ? "Tous" : stage}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
            <button
              onClick={() => setViewMode("grid")}
              className={`view-btn ${viewMode === "grid" ? "view-btn-active" : ""}`}
              aria-label="Vue grille"
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`view-btn ${viewMode === "list" ? "view-btn-active" : ""}`}
              aria-label="Vue liste"
            >
              <List size={16} />
            </button>
            <Link href="/dashboard/projets/nouveau" className="btn-primary" style={{ padding: "6px 16px", fontSize: "13px" }}>
              <Plus size={16} />
              Nouveau
            </Link>
          </div>
        </div>

        {/* ===== LISTE DES PROJETS ===== */}
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Aucun projet trouvé</p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)" }}>Essayez de modifier vos filtres ou créez un nouveau projet</p>
          </div>
        ) : viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {filteredProjects.map((project, index) => {
              const IconComponent = project.icon;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="project-card"
                >
                  <div
                    className="project-image"
                    style={{ backgroundImage: `url(${project.image})` }}
                  />
                  <div style={{ padding: "16px 18px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <IconComponent size={16} style={{ color: "rgba(255,255,255,0.7)" }} />
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#FFFFFF", margin: 0 }}>{project.title}</h3>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>
                      {project.stage} • {project.members} membre{project.members > 1 ? "s" : ""}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                      {project.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                        <span>Progression</span>
                        <span style={{ color: "#FFFFFF" }}>{project.progress}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                        <Wallet size={12} style={{ display: "inline", marginRight: "4px" }} />
                        {project.budget ? `${((project.spent / project.budget) * 100).toFixed(0)}% utilisé` : "Budget non estimé"}
                      </span>
                      <Link
                        href={`/dashboard/projets/${project.id}`}
                        style={{ fontSize: "13px", fontWeight: 500, color: "#F4D03F", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        Voir
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredProjects.map((project, index) => {
              const IconComponent = project.icon;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="list-item"
                >
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <IconComponent size={16} style={{ color: "rgba(255,255,255,0.7)" }} />
                  </div>
                  <div style={{ flex: 2, minWidth: "120px" }}>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF", margin: 0 }}>{project.title}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{project.stage}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: "80px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Users size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{project.members}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: "80px" }}>
                    <div className="progress-bar-bg" style={{ width: "80px" }}>
                      <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{project.progress}%</span>
                  </div>
                  <Link
                    href={`/dashboard/projets/${project.id}`}
                    style={{ fontSize: "13px", fontWeight: 500, color: "#F4D03F", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    Voir
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ===== PIED DE PAGE ===== */}
        <div className="fade-in-up delay-3" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.5px", margin: 0 }}>
            © 2026 <span style={{ color: "#C9A200" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </div>
      </div>
    </div>
  );
}