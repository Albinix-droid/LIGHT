// app/dashboard/page.tsx
// DASHBOARD REFONDU - AVEC ROUTE DYNAMIQUE VERS LES PROJETS

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Wallet, Users, Clock, ArrowRight, Mail, CheckCircle2, MessageCircle, Bell,
  Plus, X, ChevronDown, ChevronUp, RefreshCw, Check, AlertCircle,
  Sparkles, Brain, Target, Rocket, Star, Shield
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
type TaskStatus = "todo" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";
type TaskFilter = "all" | TaskStatus;

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  status?: "online" | "offline" | "away";
}

interface Notification {
  id: number;
  type: "invitation" | "validation" | "message" | "system";
  message: string;
  time: string;
  read: boolean;
}

// ============================================================
// HOOK POUR LE SCROLL
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
// COMPOSANT PRINCIPAL
// ============================================================
export default function DashboardHome() {
  const scrollY = useScroll();

  // ===== DONNÉES DU PROJET (avec ID dynamique) =====
  const projectInfo = {
    id: "1", // ← ID du projet (à récupérer depuis Supabase/Prisma)
    name: "Projet Innov'Afrique",
    progress: 65,
    stage: "Développement",
    budget: { estimated: 4_500_000, spent: 2_150_000 },
  };

  // ===== ROUTE DYNAMIQUE =====
  const projectBasePath = `/dashboard/projets/${projectInfo.id}`;

  const stages = ["Idéalisation", "Conception", "Développement", "Test", "Concrétisation"];
  const currentStageIndex = stages.indexOf(projectInfo.stage);
  const budgetPercent = Math.min(Math.round((projectInfo.budget.spent / projectInfo.budget.estimated) * 100), 100);

  // ===== NOTIFICATIONS =====
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: "invitation", message: "Paul Tchou a accepté votre invitation", time: "2 min", read: false },
    { id: 2, type: "validation", message: "Jalon « Conception » validé par l'encadrant", time: "1h", read: false },
    { id: 3, type: "message", message: "Nouveau message de Marie Claire", time: "3h", read: true },
    { id: 4, type: "system", message: "Rappel : Soutenance dans 15 jours", time: "5h", read: true },
  ]);

  const notifIcons = {
    invitation: Mail,
    validation: CheckCircle2,
    message: MessageCircle,
    system: Bell,
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // ===== TÂCHES =====
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Étude de marché", status: "completed", priority: "high" },
    { id: 2, title: "Prototype MVP", status: "in-progress", priority: "high" },
    { id: 3, title: "Test utilisateurs", status: "todo", priority: "medium" },
    { id: 4, title: "Présentation investisseurs", status: "todo", priority: "low" },
  ]);

  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");

  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter((t) => t.status === taskFilter);

  const filterOptions: { value: TaskFilter; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "todo", label: "À faire" },
    { value: "in-progress", label: "En cours" },
    { value: "completed", label: "Terminé" },
  ];

  const priorityColor: Record<TaskPriority, string> = {
    high: "#E4736B",
    medium: "#D9A441",
    low: "#B0B0B0"
  };

  const priorityLabel: Record<TaskPriority, string> = {
    high: "Haute",
    medium: "Moyenne",
    low: "Basse"
  };

  function toggleTaskStatus(id: number) {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === "completed" ? "todo" : "completed" }
        : t
    ));
  }

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    const newTask: Task = {
      id: Date.now(),
      title,
      status: "todo",
      priority: newTaskPriority,
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskPriority("medium");
    setShowAddTask(false);
  }

  function deleteTask(id: number) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  // ===== ÉQUIPE =====
  const [team, setTeam] = useState<TeamMember[]>([
    { name: "Jean Dupont", role: "Directeur", avatar: "JD", status: "online" },
    { name: "Marie Claire", role: "Directrice adjointe", avatar: "MC", status: "online" },
    { name: "Paul Tchou", role: "Secrétaire/Trésorier", avatar: "PT", status: "away" },
    { name: "Sarah Ngo", role: "Main d'œuvre", avatar: "SN", status: "offline" },
  ]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  function handleInviteMember() {
    const name = newMemberName.trim();
    const role = newMemberRole.trim();
    if (!name || !role) return;
    const avatar = name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    setTeam(prev => [...prev, { name, role, avatar, status: "offline" }]);
    setNewMemberName("");
    setNewMemberRole("");
    setShowInviteForm(false);
  }

  function removeMember(index: number) {
    setTeam(prev => prev.filter((_, i) => i !== index));
  }

  // ===== STATISTIQUES =====
  const stats = [
    { icon: TrendingUp, label: "Progression", value: `${projectInfo.progress}%`, change: "+12%", positive: true },
    { icon: Wallet, label: "Budget dépensé", value: `${budgetPercent}%`, change: `${budgetPercent}%`, positive: budgetPercent < 80 },
    { icon: Users, label: "Équipe", value: `${team.length} membres`, change: "+2", positive: true },
    { icon: Clock, label: "Étape actuelle", value: projectInfo.stage, change: "Prochaine: Test", positive: true },
  ];

  // ============================================================
  // RENDU
  // ============================================================
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
      {/* ===== FOND AVEC IMAGE ET PARALLAX ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.1,
            transform: `translateY(${scrollY * 0.04}px) scale(1.1)`,
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
            background: "radial-gradient(circle, rgba(201,162,0,0.05), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(201,162,0,0.03), transparent 70%)",
            bottom: "-100px",
            left: "-80px",
            animation: "floatBg 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          animation: fadeInUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.15s; }
        .delay-3 { animation-delay: 0.25s; }
        .delay-4 { animation-delay: 0.35s; }
        .delay-5 { animation-delay: 0.45s; }
        .delay-6 { animation-delay: 0.55s; }

        .stat-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 18px 20px;
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

        .widget-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
          height: 100%;
        }

        .widget-card:hover {
          transform: translateY(-4px);
          border-color: rgba(201, 162, 0, 0.15);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
        }

        .task-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.3s ease;
        }

        .task-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .notif-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .stage-dot {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .stage-dot:hover {
          transform: scale(1.08);
        }

        .btn-primary-dash {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
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

        .btn-primary-dash:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 40px rgba(201, 162, 0, 0.25);
        }

        .btn-ghost-dash {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
        }

        .btn-ghost-dash:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          transform: translateY(-2px);
        }

        .badge-dash {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(201, 162, 0, 0.12);
          border: 1px solid rgba(201, 162, 0, 0.12);
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
          color: #F4D03F;
        }

        .filter-btn {
          padding: 4px 14px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: transparent;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.7);
        }

        .filter-btn-active {
          background: linear-gradient(135deg, #C9A200, #F4D03F);
          border-color: transparent;
          color: #1A1A2E;
        }

        .filter-btn-active:hover {
          color: #1A1A2E;
        }

        .member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C9A200, #F4D03F);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #1A1A2E;
          flex-shrink: 0;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid #000;
          position: absolute;
          bottom: -1px;
          right: -1px;
        }

        .input-dash {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #FFFFFF;
          font-size: 13px;
          outline: none;
          transition: all 0.3s ease;
        }

        .input-dash:focus {
          border-color: rgba(201, 162, 0, 0.3);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(201, 162, 0, 0.06);
        }

        .input-dash::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        select.input-dash {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          color: #FFFFFF;
        }

        select.input-dash option {
          background: #1A1A2E;
          color: #FFFFFF;
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #C9A200, #F4D03F);
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .progress-bar-fill-danger {
          background: linear-gradient(90deg, #E4736B, #F87171);
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(201, 162, 0, 0.3);
          border-radius: 2px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 162, 0, 0.5);
        }

        /* Responsive helpers */
        .hide-mobile {
          display: none;
        }
        @media (min-width: 768px) {
          .hide-mobile {
            display: inline;
          }
        }
      `}</style>

      {/* ============================================================
          CONTENU
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "24px 20px" }}>
        
        {/* ===== EN-TÊTE ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.5px", margin: 0 }}>
              Tableau de bord
            </h1>
            <span className="badge-dash">
              <Sparkles size={12} />
              Projet actif
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>
            Bienvenue, Jean. Voici l'avancement de ton projet principal.
          </p>
        </div>

        {/* ===== STATS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {stats.map((stat, index) => (
            <div key={stat.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "rgba(201, 162, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <stat.icon size={15} style={{ color: "#F4D03F" }} />
                </div>
                {stat.change && (
                  <span style={{ fontSize: "11px", fontWeight: 600, color: stat.positive ? "#10B981" : "#E4736B" }}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2px 0" }}>
                {stat.value}
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ===== GRILLE DES WIDGETS ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          
          {/* Widget 1 : Parcours */}
          <div className="widget-card fade-in-up delay-3">
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={16} style={{ color: "#F4D03F" }} />
              Parcours de concrétisation
            </h3>
            
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                <span>Progression</span>
                <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{projectInfo.progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${projectInfo.progress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="progress-bar-fill"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              {stages.map((stage, index) => (
                <div
                  key={stage}
                  className="stage-dot"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "5px 2px",
                    borderRadius: "8px",
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                    background: index <= currentStageIndex 
                      ? "linear-gradient(135deg, #C9A200, #F4D03F)" 
                      : "rgba(255,255,255,0.05)",
                    color: index <= currentStageIndex ? "#1A1A2E" : "rgba(255,255,255,0.25)",
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                >
                  {stage.substring(0, 4)}
                  {index <= currentStageIndex && (
                    <span style={{ marginLeft: "2px", fontSize: "7px" }}>✓</span>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "12px", textAlign: "center" }}>
              Étape actuelle : <span style={{ color: "#F4D03F", fontWeight: 600 }}>{projectInfo.stage}</span>
            </p>
          </div>

          {/* Widget 2 : Budget */}
          <div className="widget-card fade-in-up delay-4">
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Wallet size={16} style={{ color: "#F4D03F" }} />
              Estimation budgétaire
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Estimé</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>
                {projectInfo.budget.estimated.toLocaleString()} FCFA
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Dépensé</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>
                {projectInfo.budget.spent.toLocaleString()} FCFA
              </span>
            </div>

            <div className="progress-bar-bg" style={{ marginBottom: "12px" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className={`progress-bar-fill ${budgetPercent > 80 ? 'progress-bar-fill-danger' : ''}`}
              />
            </div>

            {/* ✅ Lien dynamique vers le budget */}
            <Link
              href={`${projectBasePath}/budget`}
              className="btn-ghost-dash"
              style={{ width: "100%", justifyContent: "center", padding: "8px 16px" }}
            >
              Voir le détail
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Widget 3 : Équipe */}
          <div className="widget-card fade-in-up delay-5">
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={16} style={{ color: "#F4D03F" }} />
              Équipe & rôles
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px", maxHeight: "140px", overflowY: "auto" }} className="scrollbar-custom">
              {team.map((member, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px", borderRadius: "10px", transition: "all 0.3s ease" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div className="member-avatar">{member.avatar}</div>
                    <div className="status-dot" style={{
                      background: member.status === 'online' ? '#10B981' : 
                                 member.status === 'away' ? '#F59E0B' : '#6B7280',
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#FFFFFF", margin: 0 }}>{member.name}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{member.role}</p>
                  </div>
                  <button
                    onClick={() => removeMember(index)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.15)",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "6px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#E4736B"; e.currentTarget.style.background = "rgba(228,115,107,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {showInviteForm ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "4px" }}>
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="input-dash"
                    />
                    <input
                      type="text"
                      placeholder="Rôle dans le projet"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="input-dash"
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={handleInviteMember}
                        disabled={!newMemberName.trim() || !newMemberRole.trim()}
                        className="btn-primary-dash"
                        style={{ flex: 1, justifyContent: "center", padding: "8px 16px", fontSize: "13px" }}
                      >
                        Ajouter
                      </button>
                      <button
                        onClick={() => { setShowInviteForm(false); setNewMemberName(""); setNewMemberRole(""); }}
                        className="btn-ghost-dash"
                        style={{ padding: "8px 16px", fontSize: "13px" }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowInviteForm(true)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "10px",
                    border: "1px dashed rgba(201, 162, 0, 0.2)",
                    background: "rgba(201, 162, 0, 0.04)",
                    color: "#F4D03F",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201, 162, 0, 0.08)"; e.currentTarget.style.borderColor = "rgba(201, 162, 0, 0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201, 162, 0, 0.04)"; e.currentTarget.style.borderColor = "rgba(201, 162, 0, 0.2)"; }}
                >
                  <Plus size={14} />
                  Inviter un membre
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ===== TÂCHES + NOTIFICATIONS ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          
          {/* Tâches */}
          <div className="widget-card fade-in-up delay-6" style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} style={{ color: "#F4D03F" }} />
                Tâches en cours
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                  ({tasks.filter(t => t.status !== "completed").length} restantes)
                </span>
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTaskFilter(opt.value)}
                    className={`filter-btn ${taskFilter === opt.value ? 'filter-btn-active' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAddTask(!showAddTask)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showAddTask && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Nouvelle tâche..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTask()}
                      className="input-dash"
                      style={{ flex: 1, minWidth: "120px" }}
                    />
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                      className="input-dash"
                      style={{ width: "auto", minWidth: "100px" }}
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                    <button onClick={addTask} disabled={!newTaskTitle.trim()} className="btn-primary-dash" style={{ padding: "8px 16px", fontSize: "13px" }}>
                      Ajouter
                    </button>
                    <button onClick={() => { setShowAddTask(false); setNewTaskTitle(""); }} className="btn-ghost-dash" style={{ padding: "8px 16px", fontSize: "13px" }}>
                      Annuler
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <AnimatePresence>
                {filteredTasks.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.25)", padding: "16px 0" }}>
                    Aucune tâche dans cette catégorie
                  </p>
                ) : (
                  filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.04 }}
                      className="task-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderLeft: `3px solid ${priorityColor[task.priority]}`,
                      }}
                    >
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: task.status === "completed" ? "none" : "2px solid rgba(255,255,255,0.15)",
                          background: task.status === "completed" ? "linear-gradient(135deg, #C9A200, #F4D03F)" : "transparent",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {task.status === "completed" && (
                          <Check size={10} style={{ color: "#1A1A2E" }} />
                        )}
                      </button>
                      <span style={{
                        flex: 1,
                        fontSize: "13px",
                        color: task.status === "completed" ? "rgba(255,255,255,0.25)" : "#FFFFFF",
                        textDecoration: task.status === "completed" ? "line-through" : "none",
                        transition: "all 0.3s ease",
                      }}>
                        {task.title}
                      </span>
                      <span style={{
                        fontSize: "9px",
                        padding: "2px 10px",
                        borderRadius: "50px",
                        background: `rgba(${priorityColor[task.priority] === '#E4736B' ? '228,115,107' : priorityColor[task.priority] === '#D9A441' ? '217,164,65' : '176,176,176'}, 0.12)`,
                        color: priorityColor[task.priority],
                        fontWeight: 600,
                      }}>
                        {priorityLabel[task.priority]}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "rgba(255,255,255,0.1)",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "6px",
                          transition: "all 0.3s ease",
                          opacity: 0,
                        }}
                        className="task-delete-btn"
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#E4736B"; e.currentTarget.style.background = "rgba(228,115,107,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <style>{`
              .task-item:hover .task-delete-btn {
                opacity: 1;
              }
            `}</style>

            {/* ✅ Lien dynamique vers toutes les tâches */}
            <Link
              href={`${projectBasePath}/taches`}
              className="btn-ghost-dash"
              style={{ width: "100%", justifyContent: "center", marginTop: "12px", padding: "8px 16px" }}
            >
              Voir toutes les tâches
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Notifications */}
          <div className="widget-card fade-in-up delay-6" style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={16} style={{ color: "#F4D03F" }} />
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: "9px",
                    background: "#E4736B",
                    color: "#FFFFFF",
                    padding: "1px 8px",
                    borderRadius: "50px",
                    fontWeight: 700,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </h3>
              <Link href="/dashboard/notifications" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#F4D03F"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                Voir tout
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "220px", overflowY: "auto" }} className="scrollbar-custom">
              {notifications.slice(0, 4).map((notif, index) => {
                const Icon = notifIcons[notif.type] || Bell;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="notif-item"
                    onClick={() => markAsRead(notif.id)}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      background: !notif.read ? "rgba(201, 162, 0, 0.05)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(201, 162, 0, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={12} style={{ color: "#F4D03F" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12px", color: !notif.read ? "#FFFFFF" : "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>
                        {notif.message}
                      </p>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", margin: "2px 0 0 0" }}>
                        Il y a {notif.time}
                      </p>
                    </div>
                    {!notif.read && (
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F4D03F", flexShrink: 0, marginTop: "4px" }} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== PIED DE PAGE ===== */}
        <div className="fade-in-up delay-6" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.5px", margin: 0 }}>
            © 2026 <span style={{ color: "#C9A200" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </div>
      </div>
    </div>
  );
}