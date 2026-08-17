// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Wallet, Users, Clock, ArrowRight, Mail, CheckCircle2, MessageCircle, Bell,
} from "lucide-react";

// ===== TYPES =====
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
}

interface Notification {
  id: number;
  type: "invitation" | "validation" | "message";
  message: string;
  time: string;
}

const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(16px)",
  borderRadius: "18px",
  padding: "22px",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.03)",
};

export default function DashboardHome() {
  const projectInfo = {
    name: "Projet Innov'Afrique",
    progress: 65,
    stage: "Développement",
    budget: { estimated: 4_500_000, spent: 2_150_000 },
  };

  const stages = ["Idéalisation", "Conception", "Développement", "Test", "Concrétisation"];
  const currentStageIndex = stages.indexOf(projectInfo.stage);
  const budgetPercent = Math.min(Math.round((projectInfo.budget.spent / projectInfo.budget.estimated) * 100), 100);

  const notifications: Notification[] = [
    { id: 1, type: "invitation", message: "Paul Tchou a accepté votre invitation", time: "2 min" },
    { id: 2, type: "validation", message: "Jalon « Conception » validé par l'encadrant", time: "1h" },
    { id: 3, type: "message", message: "Nouveau message de Marie Claire", time: "3h" },
  ];

  const notifIcons = { invitation: Mail, validation: CheckCircle2, message: MessageCircle };

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Étude de marché", status: "completed", priority: "high" },
    { id: 2, title: "Prototype MVP", status: "in-progress", priority: "high" },
    { id: 3, title: "Test utilisateurs", status: "todo", priority: "medium" },
    { id: 4, title: "Présentation investisseurs", status: "todo", priority: "low" },
  ]);

  const [team, setTeam] = useState<TeamMember[]>([
    { name: "Jean Dupont", role: "Directeur", avatar: "JD" },
    { name: "Marie Claire", role: "Directrice adjointe", avatar: "MC" },
    { name: "Paul Tchou", role: "Secrétaire/Trésorier", avatar: "PT" },
    { name: "Sarah Ngo", role: "Main d'œuvre", avatar: "SN" },
  ]);

  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter((t) => t.status === taskFilter);

  const filterOptions: { value: TaskFilter; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "todo", label: "À faire" },
    { value: "in-progress", label: "En cours" },
    { value: "completed", label: "Terminé" },
  ];

  function toggleTaskStatus(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "completed" ? "todo" : "completed" } : t))
    );
  }

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  function handleInviteMember() {
    const name = newMemberName.trim();
    const role = newMemberRole.trim();
    if (!name || !role) return;
    const avatar = name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    setTeam((prev) => [...prev, { name, role, avatar }]);
    setNewMemberName("");
    setNewMemberRole("");
    setShowInviteForm(false);
  }

  const priorityColor: Record<TaskPriority, string> = { high: "#E4736B", medium: "#D9A441", low: "#B0B0B0" };
  const priorityLabel: Record<TaskPriority, string> = { high: "Haute", medium: "Moyenne", low: "Basse" };

  const stats = [
    { icon: TrendingUp, label: "Progression", value: `${projectInfo.progress}%` },
    { icon: Wallet, label: "Budget dépensé", value: `${budgetPercent}%` },
    { icon: Users, label: "Équipe", value: `${team.length} membres` },
    { icon: Clock, label: "Étape actuelle", value: projectInfo.stage },
  ];

  return (
    <div>
      {/* ===== EN-TÊTE ===== */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1A1A2E", marginBottom: "4px" }}>Tableau de bord</h1>
        <p style={{ color: "#6B6B7B", fontSize: "14px", margin: 0 }}>
          Bienvenue, Jean. Voici l'avancement de ton projet principal.
        </p>
      </div>

      {/* ===== BANDEAU DE STATS RAPIDES ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...glassCard, padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "11px",
                background: "linear-gradient(135deg, rgba(201,162,0,0.16), rgba(244,208,63,0.12))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.icon size={17} style={{ color: "#C9A200" }} aria-hidden="true" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "11px", color: "#9A9A9A", margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#1A1A2E", margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== GRILLE DES WIDGETS ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px", marginBottom: "20px" }}>
        {/* Widget 1 : Parcours */}
        <div style={glassCard}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A2E", marginBottom: "14px" }}>
            Parcours de concrétisation
          </h3>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B6B7B", marginBottom: "6px" }}>
              <span>Progression</span>
              <span style={{ fontWeight: 600, color: "#1A1A2E" }}>{projectInfo.progress}%</span>
            </div>
            <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${projectInfo.progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #C9A200, #F4D03F)",
                  borderRadius: "4px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {stages.map((s, index) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "6px 4px",
                  borderRadius: "6px",
                  fontSize: "9px",
                  fontWeight: 600,
                  background: index <= currentStageIndex ? "linear-gradient(135deg, #C9A200, #F4D03F)" : "rgba(0,0,0,0.05)",
                  color: index <= currentStageIndex ? "#1A1A2E" : "#9A9A9A",
                  transition: "all 0.3s ease",
                }}
              >
                {s.substring(0, 4)}
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#9A9A9A", marginTop: "12px", textAlign: "center" }}>
            Étape actuelle : <strong style={{ color: "#1A1A2E" }}>{projectInfo.stage}</strong>
          </p>
        </div>

        {/* Widget 2 : Budget */}
        <div style={glassCard}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A2E", marginBottom: "14px" }}>Estimation budgétaire</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: "#6B6B7B", fontSize: "13px" }}>Estimé</span>
            <span style={{ fontWeight: 600, color: "#1A1A2E", fontSize: "13px" }}>
              {projectInfo.budget.estimated.toLocaleString()} FCFA
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#6B6B7B", fontSize: "13px" }}>Dépensé</span>
            <span style={{ fontWeight: 600, color: "#1A1A2E", fontSize: "13px" }}>
              {projectInfo.budget.spent.toLocaleString()} FCFA
            </span>
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "3px", overflow: "hidden", marginBottom: "14px" }}>
            <div
              style={{
                width: `${budgetPercent}%`,
                height: "100%",
                background: budgetPercent > 80 ? "#E4736B" : "linear-gradient(90deg, #C9A200, #F4D03F)",
                borderRadius: "3px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <Link
            href="/dashboard/projets/1/budget"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#C9A200", textDecoration: "none", padding: "8px", borderRadius: "10px", transition: "background 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,162,0,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Voir le détail <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* Widget 3 : Équipe */}
        <div style={glassCard}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A2E", marginBottom: "14px" }}>Équipe & rôles</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
            {team.map((member, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 8px", borderRadius: "10px", backgroundColor: index % 2 === 0 ? "rgba(0,0,0,0.02)" : "transparent" }}>
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
                    flexShrink: 0,
                  }}
                >
                  {member.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#1A1A2E", margin: 0 }}>{member.name}</p>
                  <p style={{ fontSize: "11px", color: "#9A9A9A", margin: 0 }}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          {showInviteForm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <input
                type="text"
                placeholder="Nom complet"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "13px", outline: "none" }}
              />
              <input
                type="text"
                placeholder="Rôle dans le projet"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "13px", outline: "none" }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={handleInviteMember}
                  disabled={!newMemberName.trim() || !newMemberRole.trim()}
                  style={{ flex: 1, padding: "8px", background: "linear-gradient(135deg, #C9A200, #F4D03F)", border: "none", borderRadius: "8px", color: "#1A1A2E", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Ajouter
                </button>
                <button
                  onClick={() => { setShowInviteForm(false); setNewMemberName(""); setNewMemberRole(""); }}
                  style={{ flex: 1, padding: "8px", background: "rgba(0,0,0,0.04)", border: "none", borderRadius: "8px", color: "#6B6B7B", fontSize: "13px", cursor: "pointer" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowInviteForm(true)}
              style={{ width: "100%", padding: "9px", background: "rgba(201,162,0,0.06)", border: "1px dashed rgba(201,162,0,0.3)", borderRadius: "10px", color: "#C9A200", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,162,0,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,162,0,0.06)")}
            >
              + Inviter un membre
            </button>
          )}
        </div>
      </div>

      {/* ===== TÂCHES + NOTIFICATIONS ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "18px" }}>
        {/* Tâches */}
        <div style={glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A2E", margin: 0 }}>Tâches en cours</h3>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {filterOptions.map((opt) => {
                const isActive = taskFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTaskFilter(opt.value)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "20px",
                      border: isActive ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
                      background: isActive ? "linear-gradient(135deg, #C9A200, #F4D03F)" : "transparent",
                      color: isActive ? "#1A1A2E" : "#6B6B7B",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {filteredTasks.length === 0 && (
              <p style={{ fontSize: "13px", color: "#9A9A9A", textAlign: "center", padding: "16px" }}>
                Aucune tâche dans cette catégorie.
              </p>
            )}
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  borderLeft: `3px solid ${priorityColor[task.priority]}`,
                }}
              >
                <div
                  onClick={() => toggleTaskStatus(task.id)}
                  style={{
                    width: "17px",
                    height: "17px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: task.status === "completed" ? "none" : "2px solid rgba(0,0,0,0.15)",
                    background: task.status === "completed" ? "linear-gradient(135deg, #C9A200, #F4D03F)" : "transparent",
                  }}
                >
                  {task.status === "completed" && <span style={{ fontSize: "10px", color: "#1A1A2E" }}>✓</span>}
                </div>
                <span
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    color: task.status === "completed" ? "#9A9A9A" : "#1A1A2E",
                    textDecoration: task.status === "completed" ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </span>
                <span style={{ fontSize: "10px", padding: "2px 9px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.04)", color: priorityColor[task.priority], fontWeight: 600 }}>
                  {priorityLabel[task.priority]}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/projets/1/taches"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#C9A200", textDecoration: "none", padding: "10px", marginTop: "10px", borderRadius: "10px" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(201,162,0,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Voir toutes les tâches <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* Notifications */}
        <div style={glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1A1A2E", margin: 0 }}>Notifications</h3>
            <Link href="/dashboard/notifications" style={{ fontSize: "12px", color: "#C9A200", textDecoration: "none", fontWeight: 500 }}>
              Voir tout
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {notifications.map((notif) => {
              const Icon = notifIcons[notif.type];
              return (
                <div key={notif.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "9px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(201,162,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={13} style={{ color: "#C9A200" }} aria-hidden="true" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "12px", color: "#1A1A2E", margin: 0, lineHeight: 1.4 }}>{notif.message}</p>
                    <p style={{ fontSize: "10px", color: "#9A9A9A", margin: 0 }}>Il y a {notif.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}