// app/dashboard/projets/[id]/idealisation/IdealisationForm.tsx
// PAGE D'IDÉALISATION - ESPACE DE CRÉATION IMMERSIF

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
  ArrowLeft, Lightbulb, Target, Users, TrendingUp, Sparkles,
  Send, Save, CheckCircle, AlertCircle, Loader2,
  Plus, X, Trash2, MessageCircle, Brain, Rocket,
  Star, ChevronRight, ChevronDown, ChevronUp,
  PenTool, HelpCircle, RefreshCw, Shield, Code
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface BrainstormingNote {
  id: number;
  content: string;
  createdAt: string;
}

export interface IdeationData {
  title: string;
  description: string;
  problem: string;
  solution: string;
  targetAudience: string;
  valueProposition: string;
  revenueModel: string;
  brainstorming: BrainstormingNote[];
}

interface IATip {
  id: number;
  category: "feedback" | "suggestion" | "question";
  content: string;
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
export default function IdealisationForm({ projectId, initialData, completed, status, supervisorName, review, locked, previousStageLabel }: StepProps<IdeationData>) {
  const router = useRouter();
  const [submissionNote, setSubmissionNote] = useState("");
  const scrollY = useScroll();

  // ===== ÉTATS DU FORMULAIRE =====
  const [data, setData] = useState<IdeationData>({
    title: "",
    description: "",
    problem: "",
    solution: "",
    targetAudience: "",
    valueProposition: "",
    revenueModel: "",
    brainstorming: [],
    ...initialData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // ===== BRAINSTORMING =====
  const [newNote, setNewNote] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);

  // ===== CONSEILS IA =====
  const [tips, setTips] = useState<IATip[]>([
    {
      id: 1,
      category: "feedback",
      content: "Commencez par définir clairement le problème que votre projet résout. C'est la base de toute bonne idée."
    },
    {
      id: 2,
      category: "question",
      content: "Qui sont vos clients cibles ? Décrivez-les précisément."
    },
  ]);
  const [showTips, setShowTips] = useState(true);

  // ===== SECTIONS DU PARCOURS =====
  const stages = [
    { id: "idealisation", label: "Idéalisation", icon: Lightbulb },
    { id: "conception", label: "Conception", icon: PenTool },
    { id: "developpement", label: "Développement", icon: Code },
    { id: "test", label: "Test", icon: Shield },
    { id: "concretisation", label: "Concrétisation", icon: Rocket },
  ];

  // ============================================================
  // COMPLETUDE DU FORMULAIRE
  // ============================================================
  const completionRate = () => {
    const fields = [
      data.title, data.description, data.problem, data.solution,
      data.targetAudience, data.valueProposition, data.revenueModel
    ];
    const filled = fields.filter(f => f.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Critères partagés avec la validation serveur (lib/parcours.ts)
  const requirements = getStepRequirements("idealisation", data);
  const missing = requirements.filter(r => !r.ok).map(r => r.label);
  const isComplete = missing.length === 0;

  // ============================================================
  // GESTION DU FORMULAIRE
  // ============================================================
  const handleChange = (field: keyof IdeationData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (field === "description" && value.length > 50 && value.length % 10 === 0) {
      generateAITip(value);
    }
  };

  // ============================================================
  // GÉNÉRATION DE CONSEILS IA
  // ============================================================
  const generateAITip = (text: string) => {
    const tipsPool: Record<string, string[]> = {
      feedback: [
        "Votre description est prometteuse. Pensez à la différencier de la concurrence.",
        "Le problème que vous identifiez est pertinent. Essayez de le quantifier avec des chiffres.",
        "Votre solution semble innovante. Quels sont les freins potentiels à son adoption ?",
        "La valeur ajoutée de votre projet commence à se dessiner. Continuez à l'affiner.",
      ],
      suggestion: [
        "Pour renforcer votre projet, réalisez une étude de marché approfondie.",
        "N'hésitez pas à parler à des utilisateurs potentiels pour valider vos hypothèses.",
        "Pensez à définir un indicateur clé de performance (KPI) pour mesurer votre succès.",
        "Identifiez vos principaux concurrents et analysez leurs forces et faiblesses.",
      ],
      question: [
        "Comment votre solution se distingue-t-elle de ce qui existe déjà ?",
        "Quel est le coût d'acquisition de vos premiers clients ?",
        "Avez-vous envisagé les aspects juridiques de votre projet ?",
        "Quelle est la taille potentielle de votre marché ?",
      ],
    };

    const categories = ["feedback", "suggestion", "question"] as const;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const pool = tipsPool[category];
    const content = pool[Math.floor(Math.random() * pool.length)];

    const newTip: IATip = {
      id: Date.now(),
      category,
      content,
    };
    setTips(prev => [...prev, newTip]);
  };

  // ============================================================
  // BRAINSTORMING
  // ============================================================
  const addNote = () => {
    if (!newNote.trim()) return;
    const note: BrainstormingNote = {
      id: Date.now(),
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, brainstorming: [...prev.brainstorming, note] }));
    setNewNote("");
    setShowAddNote(false);
  };

  const deleteNote = (id: number) => {
    setData(prev => ({
      ...prev,
      brainstorming: prev.brainstorming.filter(n => n.id !== id)
    }));
  };

  // ============================================================
  // SAUVEGARDE
  // ============================================================
  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await saveStep(projectId, "idealisation", data);
      if (result.ok) setSuccess("Votre projet a été sauvegardé avec succès.");
      else setError(result.error);
    } catch {
      setError("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // VALIDATION DE L'ÉTAPE
  // ============================================================
  const handleValidate = async () => {
    if (!isComplete) {
      setError(`Pour soumettre cette étape, il manque : ${missing.join(" ; ")}.`);
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      const result = await submitStep(projectId, "idealisation", data, submissionNote);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/projets/${projectId}`);
    } catch {
      setError("Erreur lors de la validation. Veuillez réessayer.");
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
              "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
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
        .card-glass-focus {
          border-color: rgba(212, 175, 55, 0.25) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 8px 40px rgba(212, 175, 55, 0.05) !important;
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
          min-height: 100px;
        }

        .input-title {
          font-size: 28px;
          font-weight: 700;
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(180, 200, 230, 0.1);
          padding: 8px 0;
          color: #E8EDF5;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
        }
        .input-title:focus {
          border-bottom-color: rgba(212, 175, 55, 0.3);
        }
        .input-title::placeholder {
          color: rgba(200, 215, 235, 0.2);
          font-weight: 400;
        }

        .note-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid rgba(180, 200, 230, 0.06);
          transition: all 0.3s ease;
          cursor: default;
          position: relative;
        }
        .note-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(180, 200, 230, 0.12);
        }
        .note-item:hover .note-delete {
          opacity: 1;
        }

        .note-delete {
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tip-item {
          padding: 12px 16px;
          border-radius: 12px;
          border-left: 3px solid #D4AF37;
          background: rgba(212, 175, 55, 0.04);
          transition: all 0.3s ease;
        }
        .tip-item-feedback {
          border-left-color: #10B981;
          background: rgba(16, 185, 129, 0.04);
        }
        .tip-item-suggestion {
          border-left-color: #6366F1;
          background: rgba(99, 102, 241, 0.04);
        }
        .tip-item-question {
          border-left-color: #F59E0B;
          background: rgba(245, 158, 11, 0.04);
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
              Idéalisation
            </h1>
            <span className="badge">
              <Lightbulb size={12} />
              {completed ? "Étape 1/5 · Validée ✓" : "Étape 1/5"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {stages.map((stage, index) => (
              <span
                key={stage.id}
                className={`stage-pill ${index === 0 ? "stage-pill-active" : ""}`}
              >
                {index === 0 && "●"} {stage.label}
              </span>
            ))}
          </div>
        </div>

        {/* ===== BARRE DE PROGRESSION ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)" }}>
              Complétude de l'idéation
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
              ? "Votre idée est suffisamment développée pour passer à l'étape suivante."
              : "Complétez les critères ci-dessous pour valider cette étape."}
          </p>
          <StepChecklist requirements={requirements} />
          <StepStatusBanner projectId={projectId} status={status} supervisorName={supervisorName} review={review} locked={locked} previousStageLabel={previousStageLabel} />
        </div>

        {/* ===== GRILLE PRINCIPALE ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>

          {/* ---- CARTE PRINCIPALE : FORMULAIRE ---- */}
          <motion.div
            className={`card-glass fade-in-up delay-2 ${isFocused ? "card-glass-focus" : ""}`}
            style={{ padding: "32px" }}
          >
            {/* Titre */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Lightbulb size={18} style={{ color: "#F5D76E" }} />
                <span style={{ fontSize: "13px", color: "rgba(200,215,235,0.4)", fontWeight: 500 }}>
                  Nom du projet
                </span>
              </div>
              <input
                type="text"
                value={data.title}
                onChange={(e) => handleChange("title", e.target.value)}
                onFocus={() => setIsFocused("title")}
                onBlur={() => setIsFocused(null)}
                placeholder="Ex: Innov'Afrique, EcoGreen, Digital Hub..."
                className="input-title"
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Brain size={16} style={{ color: "#F5D76E" }} />
                <span style={{ fontSize: "13px", color: "rgba(200,215,235,0.4)", fontWeight: 500 }}>
                  Description du projet
                </span>
                <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.2)", marginLeft: "auto" }}>
                  {data.description.length} / 2000
                </span>
              </div>
              <textarea
                value={data.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onFocus={() => setIsFocused("description")}
                onBlur={() => setIsFocused(null)}
                placeholder="Décrivez votre vision, l'objectif du projet, sa valeur ajoutée..."
                className="input"
                style={{ minHeight: "120px" }}
                maxLength={2000}
              />
            </div>

            {/* Problème et Solution (2 colonnes) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <AlertCircle size={14} style={{ color: "#E4736B" }} />
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", fontWeight: 500 }}>
                    Problème identifié
                  </span>
                </div>
                <textarea
                  value={data.problem}
                  onChange={(e) => handleChange("problem", e.target.value)}
                  onFocus={() => setIsFocused("problem")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Quel problème votre projet résout-il ?"
                  className="input"
                  style={{ minHeight: "80px", fontSize: "13px" }}
                />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <CheckCircle size={14} style={{ color: "#10B981" }} />
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", fontWeight: 500 }}>
                    Solution proposée
                  </span>
                </div>
                <textarea
                  value={data.solution}
                  onChange={(e) => handleChange("solution", e.target.value)}
                  onFocus={() => setIsFocused("solution")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Comment votre projet résout ce problème ?"
                  className="input"
                  style={{ minHeight: "80px", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Cible et Proposition de valeur (2 colonnes) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <Users size={14} style={{ color: "#6366F1" }} />
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", fontWeight: 500 }}>
                    Clients cibles
                  </span>
                </div>
                <textarea
                  value={data.targetAudience}
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  onFocus={() => setIsFocused("targetAudience")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Qui sont vos clients ? Décrivez-les..."
                  className="input"
                  style={{ minHeight: "80px", fontSize: "13px" }}
                />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <Star size={14} style={{ color: "#F59E0B" }} />
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", fontWeight: 500 }}>
                    Valeur ajoutée
                  </span>
                </div>
                <textarea
                  value={data.valueProposition}
                  onChange={(e) => handleChange("valueProposition", e.target.value)}
                  onFocus={() => setIsFocused("valueProposition")}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Pourquoi vos clients vous choisiraient-ils ?"
                  className="input"
                  style={{ minHeight: "80px", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Modèle de revenus */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <TrendingUp size={14} style={{ color: "#D4AF37" }} />
                <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", fontWeight: 500 }}>
                  Modèle de revenus
                </span>
              </div>
              <textarea
                value={data.revenueModel}
                onChange={(e) => handleChange("revenueModel", e.target.value)}
                onFocus={() => setIsFocused("revenueModel")}
                onBlur={() => setIsFocused(null)}
                placeholder="Comment allez-vous générer des revenus ? (abonnement, vente, commission...)"
                className="input"
                style={{ minHeight: "80px", fontSize: "13px" }}
              />
            </div>
          </motion.div>

          {/* ---- BRAINSTORMING ---- */}
          <motion.div className="card-glass fade-in-up delay-3">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={18} style={{ color: "#F5D76E" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                  Brainstorming
                </h3>
                <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
                  ({data.brainstorming.length} notes)
                </span>
              </div>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="btn-secondary"
                style={{ padding: "4px 12px", fontSize: "12px" }}
              >
                <Plus size={14} />
                Ajouter une note
              </button>
            </div>

            <AnimatePresence>
              {showAddNote && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Notez vos idées, réflexions, inspirations..."
                      className="input"
                      style={{ minHeight: "60px", fontSize: "13px", flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          addNote();
                        }
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button onClick={addNote} className="btn-primary" style={{ padding: "6px 16px", fontSize: "12px" }}>
                        <Send size={14} />
                        Ajouter
                      </button>
                      <button onClick={() => { setShowAddNote(false); setNewNote(""); }} className="btn-secondary" style={{ padding: "6px 16px", fontSize: "12px" }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }} className="scrollbar-custom">
              {data.brainstorming.length === 0 ? (
                <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                  Pas encore de notes. Laissez libre cours à votre créativité.
                </p>
              ) : (
                data.brainstorming.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="note-item"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", color: "#E8EDF5", margin: 0, lineHeight: 1.5 }}>
                          {note.content}
                        </p>
                        <p style={{ fontSize: "10px", color: "rgba(200,215,235,0.3)", marginTop: "4px" }}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="note-delete"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "rgba(200,215,235,0.2)",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "6px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#E4736B"; e.currentTarget.style.background = "rgba(228,115,107,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,215,235,0.2)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* ---- CONSEILS IA ---- */}
          <motion.div className="card-glass fade-in-up delay-4">
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
                      const newTip: IATip = {
                        id: Date.now(),
                        category: "suggestion",
                        content: "Pour approfondir votre idée, essayez de parler à 5 personnes de votre secteur. Leurs retours sont précieux."
                      };
                      setTips(prev => [...prev, newTip]);
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
          {/* ---- BOUTONS D'ACTION ---- */}
          <div className="fade-in-up delay-5" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
            </div>
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
    </div>
  );
}