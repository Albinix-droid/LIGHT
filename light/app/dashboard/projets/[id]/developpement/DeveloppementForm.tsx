// app/dashboard/projets/[id]/developpement/DeveloppementForm.tsx
// PAGE DE DÉVELOPPEMENT - VERSION SANS CONNEXION GITHUB/GITLAB

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveStep, submitStep } from "../../actions";
import StepStatusBanner, { SubmissionNote } from "../StepStatusBanner";
import type { StepProps } from "../loadStep";
import StepChecklist from "../StepChecklist";
import { getStepRequirements } from "@/lib/parcours";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lightbulb,
  PenTool,
  Code,
  GitBranch,
  GitPullRequest,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Trash2,
  MessageCircle,
  Sparkles,
  Rocket,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Server,
  Database,
  Cloud,
  Play,
  RefreshCw,
  FileText,
  BookOpen,
  Layers,
  Users,
  Clock,
  Calendar,
  Terminal,
  Bug,
  Zap,
  Save
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface TaskTicket {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  labels: string[];
  createdAt: string;
}

interface Branch {
  name: string;
  lastCommit: string;
  status: "active" | "stale" | "merged";
}

interface PullRequest {
  id: number;
  title: string;
  status: "open" | "merged" | "closed";
  url: string;
}

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  duration: number;
}

interface Deployment {
  environment: string;
  url: string;
  status: "success" | "failed" | "pending";
  lastDeploy: string;
}

export interface DevelopmentData {
  repoUrl: string;
  docsUrl: string;
  apiDocsUrl: string;
  branches: Branch[];
  pullRequests: PullRequest[];
  tasks: TaskTicket[];
  testCoverage: number;
  testResults: TestResult[];
  deployments: Deployment[];
  brainstorming: string[];
}

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
// COMPOSANT PRINCIPAL
// ============================================================
export default function DeveloppementForm({ projectId, initialData, completed, status, supervisorName, review, locked, previousStageLabel }: StepProps<DevelopmentData>) {
  const router = useRouter();
  const [submissionNote, setSubmissionNote] = useState("");
  const scrollY = useScroll();

  // ===== ÉTATS =====
  const [data, setData] = useState<DevelopmentData>({
    repoUrl: "",
    docsUrl: "",
    apiDocsUrl: "",
    branches: [],
    pullRequests: [],
    tasks: [],
    testCoverage: 0,
    testResults: [],
    deployments: [],
    brainstorming: [],
    ...initialData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "code" | "tests" | "deploy" | "docs">("tasks");

  // ===== CHAMPS DYNAMIQUES =====
  const [newTask, setNewTask] = useState({ title: "", priority: "medium", assignee: "", labels: [] as string[] });
  const [newLabel, setNewLabel] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newDeployment, setNewDeployment] = useState({ environment: "", url: "" });
  const [newBrainstorm, setNewBrainstorm] = useState("");

  // ===== CONSEILS IA =====
  const [tips, setTips] = useState([
    { id: 1, category: "feedback", content: "Assurez-vous d'avoir une couverture de tests d'au moins 80% pour les fonctions critiques." },
    { id: 2, category: "suggestion", content: "Utilisez des branches pour chaque fonctionnalité (ex: feature/auth, feature/payment)." },
  ]);
  const [showTips, setShowTips] = useState(true);

  // ===== ÉTAPES =====
  const stages = [
    { id: "idealisation", label: "Idéalisation", icon: Lightbulb },
    { id: "conception", label: "Conception", icon: PenTool },
    { id: "developpement", label: "Développement", icon: Code },
    { id: "test", label: "Test", icon: Shield },
    { id: "concretisation", label: "Concrétisation", icon: Rocket },
  ];

  // ============================================================
  // COMPLETUDE
  // ============================================================
  const completionRate = () => {
    let filled = 0;
    const total = 6;
    if (data.repoUrl.trim().length > 0) filled++;
    if (data.branches.length > 0) filled++;
    if (data.tasks.length > 0) filled++;
    if (data.testCoverage > 0) filled++;
    if (data.deployments.length > 0) filled++;
    if (data.brainstorming.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  // Critères partagés avec la validation serveur (lib/parcours.ts)
  const requirements = getStepRequirements("developpement", data);
  const missing = requirements.filter(r => !r.ok).map(r => r.label);
  const isComplete = missing.length === 0;

  // ============================================================
  // GESTION DES TÂCHES
  // ============================================================
  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: TaskTicket = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: "",
      status: "todo",
      priority: newTask.priority as any,
      assignee: newTask.assignee || "Non assigné",
      labels: newTask.labels,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
    setNewTask({ title: "", priority: "medium", assignee: "", labels: [] });
  };

  const updateTaskStatus = (id: string, status: TaskTicket["status"]) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, status } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const addLabelToTask = (label: string) => {
    if (!label.trim()) return;
    if (newTask.labels.includes(label.trim())) return;
    setNewTask(prev => ({
      ...prev,
      labels: [...prev.labels, label.trim()]
    }));
    setNewLabel("");
  };

  const removeLabelFromTask = (label: string) => {
    setNewTask(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }));
  };

  // ============================================================
  // GESTION DES BRANCHES
  // ============================================================
  const addBranch = () => {
    if (!newBranch.trim()) return;
    const branch: Branch = {
      name: newBranch.trim(),
      lastCommit: new Date().toISOString(),
      status: "active",
    };
    setData(prev => ({ ...prev, branches: [...prev.branches, branch] }));
    setNewBranch("");
  };

  const removeBranch = (index: number) => {
    setData(prev => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index)
    }));
  };

  // ============================================================
  // GESTION DES DÉPLOIEMENTS
  // ============================================================
  const addDeployment = () => {
    if (!newDeployment.environment.trim() || !newDeployment.url.trim()) return;
    const deployment: Deployment = {
      environment: newDeployment.environment.trim(),
      url: newDeployment.url.trim(),
      status: "pending",
      lastDeploy: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, deployments: [...prev.deployments, deployment] }));
    setNewDeployment({ environment: "", url: "" });
  };

  const removeDeployment = (index: number) => {
    setData(prev => ({
      ...prev,
      deployments: prev.deployments.filter((_, i) => i !== index)
    }));
  };

  // ============================================================
  // SAUVEGARDE / VALIDATION
  // ============================================================
  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await saveStep(projectId, "developpement", data);
      if (result.ok) setSuccess("Projet sauvegardé avec succès.");
      else setError(result.error);
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!isComplete) {
      setError(`Pour soumettre cette étape, il manque : ${missing.join(" ; ")}.`);
      return;
    }
    setIsValidating(true);
    setError("");
    try {
      const result = await submitStep(projectId, "developpement", data, submissionNote);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/projets/${projectId}`);
    } catch {
      setError("Erreur lors de la soumission.");
    } finally {
      setIsValidating(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A1628",
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
              "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.06,
            transform: `translateY(${scrollY * 0.02}px) scale(1.1)`,
            transition: "transform 0.05s ease-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.9) 100%)",
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        .card-glass {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 28px;
          border: 1px solid rgba(180, 200, 230, 0.08);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card-glass:hover {
          border-color: rgba(212, 175, 55, 0.12);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 40px rgba(0, 20, 50, 0.3);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 40px rgba(212, 175, 55, 0.3);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: 1px solid rgba(180, 200, 230, 0.15);
          border-radius: 50px;
          color: rgba(200, 215, 235, 0.6);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(180, 200, 230, 0.25);
          color: #E8EDF5;
          transform: translateY(-2px);
        }

        .btn-success {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #10B981, #34D399);
          color: #FFFFFF;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
          cursor: pointer;
        }
        .btn-success:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 40px rgba(16, 185, 129, 0.3);
        }
        .btn-success:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 50px;
          font-size: 11px;
          font-weight: 600;
          color: #F5D76E;
        }

        .input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(180, 200, 230, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: #E8EDF5;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .input:focus {
          border-color: rgba(212, 175, 55, 0.3);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.06);
        }
        .input::placeholder {
          color: rgba(200, 215, 235, 0.3);
        }
        textarea.input {
          resize: vertical;
          min-height: 80px;
        }

        .tag-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 12px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(212, 175, 55, 0.08);
          color: #F5D76E;
          border: 1px solid rgba(212, 175, 55, 0.1);
          transition: all 0.3s ease;
        }
        .tag-item:hover {
          background: rgba(212, 175, 55, 0.15);
        }
        .tag-item .remove {
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        .tag-item .remove:hover {
          opacity: 1;
        }

        .task-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(180, 200, 230, 0.06);
          transition: all 0.3s ease;
        }
        .task-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(180, 200, 230, 0.12);
        }
        .task-card .delete-btn {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .task-card:hover .delete-btn {
          opacity: 1;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }
        .status-dot-todo { background: #6B8BA4; }
        .status-dot-in-progress { background: #6366F1; }
        .status-dot-review { background: #F59E0B; }
        .status-dot-done { background: #10B981; }

        .priority-tag {
          font-size: 10px;
          padding: 2px 10px;
          border-radius: 50px;
          font-weight: 600;
        }
        .priority-critical { background: rgba(228, 115, 107, 0.15); color: #E4736B; }
        .priority-high { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
        .priority-medium { background: rgba(99, 102, 241, 0.15); color: #818CF8; }
        .priority-low { background: rgba(107, 139, 164, 0.15); color: #6B8BA4; }

        .tab-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(200, 215, 235, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .tab-btn:hover {
          color: rgba(200, 215, 235, 0.7);
        }
        .tab-btn-active {
          background: rgba(212, 175, 55, 0.08);
          color: #F5D76E;
          border-color: rgba(212, 175, 55, 0.1);
        }

        .progress-ring-bg {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }
        .progress-ring-fill {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #D4AF37, #F5D76E);
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .stage-pill {
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(200, 215, 235, 0.4);
          border: 1px solid rgba(180, 200, 230, 0.06);
        }
        .stage-pill-active {
          background: rgba(212, 175, 55, 0.12);
          color: #F5D76E;
          border-color: rgba(212, 175, 55, 0.15);
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 2px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }

        .floating-particle {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.03);
          animation: floatParticle 15s ease-in-out infinite;
        }

        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(30px, -40px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(-20px, -70px) scale(0.8); opacity: 0.4; }
          75% { transform: translate(40px, -30px) scale(1.1); opacity: 0.7; }
        }
      `}</style>

      {/* ===== PARTICULES FLOTTANTES ===== */}
      <div className="floating-particle" style={{ width: "300px", height: "300px", top: "10%", right: "5%", animationDelay: "0s" }} />
      <div className="floating-particle" style={{ width: "200px", height: "200px", bottom: "20%", left: "8%", animationDelay: "-5s" }} />
      <div className="floating-particle" style={{ width: "150px", height: "150px", top: "40%", right: "15%", animationDelay: "-10s" }} />

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>

        {/* ===== EN-TÊTE ===== */}
        <div className="fade-in-up delay-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href={`/dashboard/projets/${projectId}`}
              className="btn-secondary"
              style={{ padding: "8px 16px" }}
            >
              <ArrowLeft size={16} />
              Retour
            </Link>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#E8EDF5", letterSpacing: "-0.5px" }}>
              Développement
            </h1>
            <span className="badge">
              <Code size={12} />
              {completed ? "Étape 3/5 · Validée ✓" : "Étape 3/5"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {stages.map((stage, index) => (
              <span
                key={stage.id}
                className={`stage-pill ${index === 2 ? "stage-pill-active" : ""}`}
              >
                {index === 2 && "●"} {stage.label}
              </span>
            ))}
          </div>
        </div>

        {/* ===== BARRE DE PROGRESSION ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)" }}>
              Complétude du développement
            </span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#F5D76E" }}>
              {completionRate()}%
            </span>
          </div>
          <div className="progress-ring-bg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="progress-ring-fill"
            />
          </div>
          <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)", marginTop: "4px" }}>
            {isComplete
              ? "Votre développement est bien avancé."
              : "Complétez les critères ci-dessous pour valider cette étape."}
          </p>
          <StepChecklist requirements={requirements} />
          <StepStatusBanner projectId={projectId} status={status} supervisorName={supervisorName} review={review} locked={locked} previousStageLabel={previousStageLabel} />
        </div>

        {/* ===== ONGLETS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "1px solid rgba(180,200,230,0.06)", paddingBottom: "8px" }}>
          {[
            { id: "tasks", label: "Tâches", icon: CheckCircle },
            { id: "code", label: "Code", icon: GitBranch },
            { id: "tests", label: "Tests", icon: Shield },
            { id: "deploy", label: "Déploiement", icon: Cloud },
            { id: "docs", label: "Documentation", icon: BookOpen },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
            >
              <tab.icon size={14} style={{ display: "inline", marginRight: "6px" }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== CONTENU DES ONGLETS ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>

          {/* ---- ONGLET TÂCHES ---- */}
          {activeTab === "tasks" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle size={18} style={{ color: "#F5D76E" }} />
                  Tâches techniques
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
                    ({data.tasks.filter(t => t.status === "done").length}/{data.tasks.length} terminées)
                  </span>
                </h3>
                <button
                  onClick={addTask}
                  className="btn-primary"
                  style={{ padding: "8px 16px" }}
                >
                  <Plus size={14} />
                  Nouvelle tâche
                </button>
              </div>

              {/* Ajout de tâche */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                <input
                  id="task-title-input"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Titre de la tâche..."
                  className="input"
                  style={{ flex: 2, minWidth: "150px" }}
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                  className="input"
                  style={{ flex: 1, minWidth: "100px" }}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
                <input
                  value={newTask.assignee}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="Assigné à..."
                  className="input"
                  style={{ flex: 1, minWidth: "100px" }}
                />
                <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
                  {newTask.labels.map(label => (
                    <span key={label} className="tag-item" style={{ fontSize: "10px", padding: "2px 8px" }}>
                      {label}
                      <span className="remove" onClick={() => removeLabelFromTask(label)}>
                        <X size={10} />
                      </span>
                    </span>
                  ))}
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLabelToTask(newLabel)}
                    placeholder="Label"
                    className="input"
                    style={{ width: "80px", fontSize: "12px", padding: "4px 8px" }}
                  />
                  <button
                    onClick={() => addLabelToTask(newLabel)}
                    className="btn-secondary"
                    style={{ padding: "4px 8px" }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Liste des tâches */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto" }} className="scrollbar-custom">
                {data.tasks.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                    Aucune tâche. Commencez à découper votre projet en tâches techniques.
                  </p>
                ) : (
                  data.tasks.map(task => (
                    <div key={task.id} className="task-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span className={`status-dot status-dot-${task.status}`} />
                        <span style={{ flex: 1, fontSize: "14px", color: task.status === "done" ? "rgba(200,215,235,0.5)" : "#E8EDF5", textDecoration: task.status === "done" ? "line-through" : "none" }}>
                          {task.title}
                        </span>
                        <span className={`priority-tag priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)" }}>
                          {task.assignee}
                        </span>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {task.labels.map(label => (
                            <span key={label} style={{ fontSize: "9px", padding: "1px 8px", borderRadius: "50px", background: "rgba(212,175,55,0.08)", color: "#F5D76E" }}>
                              {label}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                            className="input"
                            style={{ width: "auto", fontSize: "11px", padding: "4px 8px" }}
                          >
                            <option value="todo">À faire</option>
                            <option value="in-progress">En cours</option>
                            <option value="review">En test</option>
                            <option value="done">Terminé</option>
                          </select>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="delete-btn"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "rgba(200,215,235,0.15)",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "6px",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#E4736B"; e.currentTarget.style.background = "rgba(228,115,107,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,215,235,0.15)"; e.currentTarget.style.background = "transparent"; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ---- ONGLET CODE ---- */}
          {activeTab === "code" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <GitBranch size={18} style={{ color: "#F5D76E" }} />
                Suivi de code
              </h3>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", display: "block", marginBottom: "4px" }}>
                  URL du dépôt (GitHub/GitLab)
                </label>
                <input
                  value={data.repoUrl}
                  onChange={(e) => setData(prev => ({ ...prev, repoUrl: e.target.value }))}
                  placeholder="https://github.com/user/projet"
                  className="input"
                />
              </div>

              {/* Branches */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", display: "block", marginBottom: "4px" }}>
                  Branches
                </label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBranch()}
                    placeholder="Ex: main, develop, feature/auth"
                    className="input"
                    style={{ flex: 1 }}
                  />
                  <button onClick={addBranch} className="btn-primary" style={{ padding: "8px 16px" }}>
                    <Plus size={14} />
                    Ajouter
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.branches.map((branch, i) => (
                    <span key={i} className="tag-item">
                      <GitBranch size={12} />
                      {branch.name}
                      <span className="remove" onClick={() => removeBranch(i)}>
                        <X size={12} />
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pull Requests */}
              <div>
                <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", display: "block", marginBottom: "4px" }}>
                  Pull Requests / Merge Requests
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {data.pullRequests.length === 0 && (
                    <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.25)", margin: 0 }}>
                      Aucune pull request suivie pour le moment.
                    </p>
                  )}
                  {data.pullRequests.map(pr => (
                    <span key={pr.id} className="tag-item" style={{ background: pr.status === "merged" ? "rgba(16,185,129,0.08)" : "rgba(99,102,241,0.08)", borderColor: pr.status === "merged" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", color: pr.status === "merged" ? "#10B981" : "#818CF8" }}>
                      <GitPullRequest size={12} />
                      #{pr.id} - {pr.title}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ---- ONGLET TESTS ---- */}
          {activeTab === "tests" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={18} style={{ color: "#F5D76E" }} />
                Tests et qualité
              </h3>

              {/* Couverture */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label htmlFor="test-coverage" style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)" }}>Couverture des tests (%)</label>
                  <input
                    id="test-coverage"
                    type="number"
                    min={0}
                    max={100}
                    value={data.testCoverage}
                    onChange={(e) => setData(prev => ({ ...prev, testCoverage: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))}
                    className="input"
                    style={{ width: "90px", textAlign: "center", padding: "6px 10px" }}
                  />
                </div>
                <div className="progress-ring-bg">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.testCoverage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="progress-ring-fill"
                  />
                </div>
              </div>

              {/* Résultats */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {data.testResults.length === 0 && (
                    <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.25)", margin: 0 }}>
                      Les cas de test détaillés se gèrent à l'étape Tests.
                    </p>
                  )}
                  {data.testResults.map((result, idx) => (
                    <span key={idx} className="tag-item" style={{
                      background: result.failed === 0 ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                      borderColor: result.failed === 0 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      color: result.failed === 0 ? "#10B981" : "#F59E0B"
                    }}>
                      {result.failed === 0 ? "✓" : "⚠"} {result.suite} : {result.passed} passés
                      {result.failed > 0 && `, ${result.failed} échecs`}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ---- ONGLET DÉPLOIEMENT ---- */}
          {activeTab === "deploy" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Cloud size={18} style={{ color: "#F5D76E" }} />
                Déploiement
              </h3>

              {/* Ajout d'environnement */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input
                  value={newDeployment.environment}
                  onChange={(e) => setNewDeployment(prev => ({ ...prev, environment: e.target.value }))}
                  placeholder="Ex: staging, production"
                  className="input"
                  style={{ flex: 1 }}
                />
                <input
                  value={newDeployment.url}
                  onChange={(e) => setNewDeployment(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://staging.iai.com"
                  className="input"
                  style={{ flex: 2 }}
                />
                <button onClick={addDeployment} className="btn-primary" style={{ padding: "8px 16px" }}>
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {/* Liste */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.deployments.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                    Aucun environnement configuré.
                  </p>
                ) : (
                  data.deployments.map((dep, i) => (
                    <div key={i} className="task-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#E8EDF5" }}>
                          {dep.environment}
                        </span>
                        <a href={dep.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#818CF8", textDecoration: "underline" }}>
                          {dep.url}
                        </a>
                        <span className={`status-dot status-dot-${dep.status === "success" ? "done" : dep.status === "pending" ? "in-progress" : "todo"}`} />
                        <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)" }}>
                          {new Date(dep.lastDeploy).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => removeDeployment(i)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "rgba(200,215,235,0.15)",
                            cursor: "pointer",
                            padding: "4px",
                            borderRadius: "6px",
                            transition: "all 0.3s ease",
                            marginLeft: "auto",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#E4736B"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,215,235,0.15)"; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ---- ONGLET DOCUMENTATION ---- */}
          {activeTab === "docs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOpen size={18} style={{ color: "#F5D76E" }} />
                Documentation
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", display: "block", marginBottom: "4px" }}>
                    Documentation technique
                  </label>
                  <input
                    value={data.docsUrl}
                    onChange={(e) => setData(prev => ({ ...prev, docsUrl: e.target.value }))}
                    placeholder="https://docs.iai.com"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", display: "block", marginBottom: "4px" }}>
                    API (Swagger/OpenAPI)
                  </label>
                  <input
                    value={data.apiDocsUrl}
                    onChange={(e) => setData(prev => ({ ...prev, apiDocsUrl: e.target.value }))}
                    placeholder="https://api.iai.com/docs"
                    className="input"
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <span className="tag-item" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                  <FileText size={12} />
                  README.md
                </span>
                <span className="tag-item" style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                  <FileText size={12} />
                  Guide d'installation
                </span>
                <span className="tag-item" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                  <FileText size={12} />
                  API Reference
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ===== BRAINSTORMING ===== */}
        <motion.div className="card-glass fade-in-up delay-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageCircle size={18} style={{ color: "#F5D76E" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                Notes de développement
              </h3>
              <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
                ({data.brainstorming.length} notes)
              </span>
            </div>
            <button
              onClick={() => {
                const note = prompt("Ajouter une note de développement :");
                if (note && note.trim()) {
                  setData(prev => ({
                    ...prev,
                    brainstorming: [...prev.brainstorming, note.trim()]
                  }));
                }
              }}
              className="btn-secondary"
              style={{ padding: "4px 12px", fontSize: "12px" }}
            >
              <Plus size={14} />
              Ajouter une note
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }} className="scrollbar-custom">
            {data.brainstorming.length === 0 ? (
              <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                Notez vos réflexions techniques, problèmes rencontrés, solutions trouvées...
              </p>
            ) : (
              data.brainstorming.map((note, i) => (
                <div key={i} className="task-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <p style={{ fontSize: "13px", color: "#E8EDF5", margin: 0, lineHeight: 1.5 }}>
                      {note}
                    </p>
                    <button
                      onClick={() => setData(prev => ({
                        ...prev,
                        brainstorming: prev.brainstorming.filter((_, idx) => idx !== i)
                      }))}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "rgba(200,215,235,0.15)",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "6px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#E4736B"; e.currentTarget.style.background = "rgba(228,115,107,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,215,235,0.15)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* ===== CONSEILS IA ===== */}
        <motion.div className="card-glass fade-in-up delay-5">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "#F5D76E" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                Conseils IA
              </h3>
              <span style={{ fontSize: "10px", color: "rgba(200,215,235,0.2)", fontWeight: 400 }}>
                En temps réel
              </span>
            </div>
            <button
              onClick={() => setShowTips(!showTips)}
              className="btn-secondary"
              style={{ padding: "4px 8px", fontSize: "11px" }}
            >
              {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {tips.map((tip) => (
                  <div
                    key={tip.id}
                    className={`tip-item tip-item-${tip.category}`}
                  >
                    <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.7)", margin: 0, lineHeight: 1.6 }}>
                      {tip.content}
                    </p>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newTips = [
                      { id: Date.now(), category: "suggestion", content: "Utilisez des hooks Git pre-commit pour vérifier la qualité du code avant chaque push." },
                      { id: Date.now()+1, category: "feedback", content: "La couverture de tests est un bon indicateur de robustesse. Visez 80% minimum." },
                      { id: Date.now()+2, category: "question", content: "Avez-vous prévu une stratégie de rollback en cas d'échec de déploiement ?" },
                    ];
                    setTips(prev => [...prev, ...newTips]);
                  }}
                  className="btn-secondary"
                  style={{ padding: "6px 14px", fontSize: "12px", alignSelf: "flex-start" }}
                >
                  <RefreshCw size={12} />
                  Demander un conseil
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!locked && status !== "SUBMITTED" && status !== "COMPLETED" && (
          <SubmissionNote value={submissionNote} onChange={setSubmissionNote} supervisorName={supervisorName} />
        )}
        {/* ===== BOUTONS D'ACTION ===== */}
        <div className="fade-in-up delay-5" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px" }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-secondary"
            style={{ padding: "10px 20px" }}
          >
            {isSaving ? (
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(228,115,107,0.08)", border: "1px solid rgba(228,115,107,0.15)", color: "#E4736B", fontSize: "13px" }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {success && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#10B981", fontSize: "13px" }}>
                <CheckCircle size={16} />
                {success}
              </div>
            )}
            <button
              onClick={handleValidate}
              disabled={isValidating || locked || status === "SUBMITTED" || status === "COMPLETED"}
              className={isComplete && !locked ? "btn-success" : "btn-secondary"}
              style={{ padding: "10px 24px" }}
            >
              {isValidating ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Rocket size={16} />
              )}
              {isValidating ? "Envoi..." : locked && status !== "COMPLETED" ? `Soumission après validation : ${previousStageLabel}` : status === "SUBMITTED" ? "En attente de l'encadrant" : status === "COMPLETED" ? "Étape validée" : "Soumettre à l'encadrant"}
            </button>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="fade-in-up delay-5" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(180,200,230,0.06)", textAlign: "center" }}>
        <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.2)", letterSpacing: "0.5px", margin: 0 }}>
          © 2026 <span style={{ color: "#D4AF37" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
        </p>
      </div>
    </div>
  );
}