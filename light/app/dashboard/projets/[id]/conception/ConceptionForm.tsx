// app/dashboard/projets/[id]/conception/ConceptionForm.tsx
// PAGE DE CONCEPTION

"use client";

import { useState, useEffect, useRef } from "react";
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
  Target,
  Users,
  TrendingUp,
  Sparkles,
  Send,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Trash2,
  MessageCircle,
  Brain,
  Rocket,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Code,
  Layout,
  Server,
  Database,
  Cloud,
  Image,
  Upload,
  Link2,
  Calendar,
  Clock,
  GitBranch,
  Layers,
  Palette,
  Type,
  Smartphone,
  Monitor,
  RefreshCw,   // ✅ AJOUTÉ
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface FunctionalSpec {
  objectives: string;
  features: string[];
  useCases: string[];
}

interface TechArchitecture {
  frontend: string;
  backend: string;
  database: string;
  hosting: string;
  apis: string[];
}

interface UXDesign {
  wireframes: string[];
  userJourney: string;
  colors: string;
  typography: string;
}

interface Planning {
  milestones: { name: string; date: string }[];
  resources: string[];
  risks: string[];
  constraints: string[];
}

export interface ConceptionData {
  functional: FunctionalSpec;
  architecture: TechArchitecture;
  ux: UXDesign;
  planning: Planning;
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
// MAQUETTES : redimensionnement avant stockage (data URL JPEG)
// ============================================================
const MAX_WIREFRAME_SIDE = 1280;
const MAX_WIREFRAMES = 8;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img"); // `Image` est l'icône lucide importée plus haut
    img.onload = () => {
      const scale = Math.min(1, MAX_WIREFRAME_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas indisponible"));
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Image illisible : ${file.name}`));
    };
    img.src = url;
  });
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function ConceptionForm({ projectId, initialData, completed, status, supervisorName, review, locked, previousStageLabel }: StepProps<ConceptionData>) {
  const router = useRouter();
  const [submissionNote, setSubmissionNote] = useState("");
  const scrollY = useScroll();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== ÉTATS =====
  const [data, setData] = useState<ConceptionData>(() => ({
    functional: { objectives: "", features: [], useCases: [], ...initialData?.functional },
    architecture: { frontend: "", backend: "", database: "", hosting: "", apis: [], ...initialData?.architecture },
    ux: { wireframes: [], userJourney: "", colors: "", typography: "", ...initialData?.ux },
    planning: { milestones: [], resources: [], risks: [], constraints: [], ...initialData?.planning },
    brainstorming: initialData?.brainstorming ?? [],
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // ===== CHAMPS DYNAMIQUES =====
  const [newFeature, setNewFeature] = useState("");
  const [newUseCase, setNewUseCase] = useState("");
  const [newApi, setNewApi] = useState("");
  const [newResource, setNewResource] = useState("");
  const [newRisk, setNewRisk] = useState("");
  const [newConstraint, setNewConstraint] = useState("");
  const [newMilestone, setNewMilestone] = useState({ name: "", date: "" });
  const [newBrainstorm, setNewBrainstorm] = useState("");

  // ===== UPLOAD =====
  const [uploading, setUploading] = useState(false);

  // ===== CONSEILS IA =====
  const [tips, setTips] = useState([
    { id: 1, category: "feedback", content: "Définissez clairement les fonctionnalités principales avant de vous lancer dans l'architecture." },
    { id: 2, category: "suggestion", content: "Pour une application scalable, privilégiez une architecture modulaire." },
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
    const total = 12;
    if (data.functional.objectives.trim().length > 0) filled++;
    if (data.functional.features.length > 0) filled++;
    if (data.functional.useCases.length > 0) filled++;
    if (data.architecture.frontend.trim().length > 0) filled++;
    if (data.architecture.backend.trim().length > 0) filled++;
    if (data.architecture.database.trim().length > 0) filled++;
    if (data.ux.wireframes.length > 0) filled++;
    if (data.ux.userJourney.trim().length > 0) filled++;
    if (data.ux.colors.trim().length > 0) filled++;
    if (data.ux.typography.trim().length > 0) filled++;
    if (data.planning.milestones.length > 0) filled++;
    if (data.planning.resources.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  // Critères partagés avec la validation serveur (lib/parcours.ts)
  const requirements = getStepRequirements("conception", data);
  const missing = requirements.filter(r => !r.ok).map(r => r.label);
  const isComplete = missing.length === 0;

  // ============================================================
  // GESTION DES LISTES
  // ============================================================
  const addItem = (list: string[], setList: (list: string[]) => void, item: string, reset: () => void) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (list.includes(trimmed)) return;
    setList([...list, trimmed]);
    reset();
  };

  const removeItem = (list: string[], setList: (list: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    if (!newMilestone.name.trim() || !newMilestone.date) return;
    setData(prev => ({
      ...prev,
      planning: {
        ...prev.planning,
        milestones: [...prev.planning.milestones, { name: newMilestone.name.trim(), date: newMilestone.date }]
      }
    }));
    setNewMilestone({ name: "", date: "" });
  };

  const removeMilestone = (index: number) => {
    setData(prev => ({
      ...prev,
      planning: {
        ...prev.planning,
        milestones: prev.planning.milestones.filter((_, i) => i !== index)
      }
    }));
  };

  // ============================================================
  // UPLOAD
  // ============================================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = MAX_WIREFRAMES - data.ux.wireframes.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_WIREFRAMES} maquettes par projet.`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const images = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, remaining);
      const newFiles = await Promise.all(images.map(resizeImage));
      setData(prev => ({
        ...prev,
        ux: {
          ...prev.ux,
          wireframes: [...prev.ux.wireframes, ...newFiles]
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import de l'image impossible.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeWireframe = (index: number) => {
    setData(prev => ({
      ...prev,
      ux: {
        ...prev.ux,
        wireframes: prev.ux.wireframes.filter((_, i) => i !== index)
      }
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
      const result = await saveStep(projectId, "conception", data);
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
      const result = await submitStep(projectId, "conception", data, submissionNote);
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
              "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
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

        .wireframe-thumb {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(180, 200, 230, 0.08);
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.3s ease;
          aspect-ratio: 16/10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wireframe-thumb:hover {
          border-color: rgba(212, 175, 55, 0.2);
        }
        .wireframe-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .wireframe-thumb .remove-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0;
        }
        .wireframe-thumb:hover .remove-btn {
          opacity: 1;
        }
        .wireframe-thumb .remove-btn:hover {
          background: rgba(228, 115, 107, 0.8);
        }

        .upload-zone {
          border: 2px dashed rgba(180, 200, 230, 0.1);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
        }
        .upload-zone:hover {
          border-color: rgba(212, 175, 55, 0.2);
          background: rgba(255, 255, 255, 0.04);
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
              Conception
            </h1>
            <span className="badge">
              <PenTool size={12} />
              {completed ? "Étape 2/5 · Validée ✓" : "Étape 2/5"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {stages.map((stage, index) => (
              <span
                key={stage.id}
                className={`stage-pill ${index === 1 ? "stage-pill-active" : ""}`}
              >
                {index === 1 && "●"} {stage.label}
              </span>
            ))}
          </div>
        </div>

        {/* ===== BARRE DE PROGRESSION ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)" }}>
              Complétude de la conception
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
              ? "Votre conception est suffisamment avancée pour passer à l'étape suivante."
              : "Complétez les critères ci-dessous pour valider cette étape."}
          </p>
          <StepChecklist requirements={requirements} />
          <StepStatusBanner projectId={projectId} status={status} supervisorName={supervisorName} review={review} locked={locked} previousStageLabel={previousStageLabel} />
        </div>

        {/* ===== GRILLE PRINCIPALE ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>

          {/* ---- SECTION 1 : SPÉCIFICATIONS FONCTIONNELLES ---- */}
          <motion.div
            className={`card-glass fade-in-up delay-2 ${isFocused?.startsWith("functional") ? "card-glass-focus" : ""}`}
            style={{ padding: "32px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Layout size={20} style={{ color: "#F5D76E" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                Spécifications fonctionnelles
              </h2>
            </div>

            {/* Objectifs */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Objectifs du projet
              </label>
              <textarea
                value={data.functional.objectives}
                onChange={(e) => setData(prev => ({ ...prev, functional: { ...prev.functional, objectives: e.target.value } }))}
                onFocus={() => setIsFocused("functional-objectives")}
                onBlur={() => setIsFocused(null)}
                placeholder="Quels sont les objectifs concrets de votre projet ?"
                className="input"
                style={{ minHeight: "80px" }}
              />
            </div>

            {/* Fonctionnalités */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Fonctionnalités principales
              </label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem(
                    data.functional.features,
                    (list) => setData(prev => ({ ...prev, functional: { ...prev.functional, features: list } })),
                    newFeature,
                    () => setNewFeature("")
                  )}
                  placeholder="Ajouter une fonctionnalité..."
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => addItem(
                    data.functional.features,
                    (list) => setData(prev => ({ ...prev, functional: { ...prev.functional, features: list } })),
                    newFeature,
                    () => setNewFeature("")
                  )}
                  className="btn-primary"
                  style={{ padding: "8px 16px" }}
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.functional.features.map((f, i) => (
                  <span key={i} className="tag-item">
                    {f}
                    <span className="remove" onClick={() => removeItem(
                      data.functional.features,
                      (list) => setData(prev => ({ ...prev, functional: { ...prev.functional, features: list } })),
                      i
                    )}>
                      <X size={12} />
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Cas d'usage */}
            <div>
              <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Cas d'usage principaux
              </label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  value={newUseCase}
                  onChange={(e) => setNewUseCase(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem(
                    data.functional.useCases,
                    (list) => setData(prev => ({ ...prev, functional: { ...prev.functional, useCases: list } })),
                    newUseCase,
                    () => setNewUseCase("")
                  )}
                  placeholder="Ex: L'utilisateur se connecte, crée un projet..."
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => addItem(
                    data.functional.useCases,
                    (list) => setData(prev => ({ ...prev, functional: { ...prev.functional, useCases: list } })),
                    newUseCase,
                    () => setNewUseCase("")
                  )}
                  className="btn-primary"
                  style={{ padding: "8px 16px" }}
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.functional.useCases.map((u, i) => (
                  <span key={i} className="tag-item">
                    {u}
                    <span className="remove" onClick={() => removeItem(
                      data.functional.useCases,
                      (list) => setData(prev => ({ ...prev, functional: { ...prev.functional, useCases: list } })),
                      i
                    )}>
                      <X size={12} />
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ---- SECTION 2 : ARCHITECTURE TECHNIQUE ---- */}
          <motion.div
            className={`card-glass fade-in-up delay-3 ${isFocused?.startsWith("architecture") ? "card-glass-focus" : ""}`}
            style={{ padding: "32px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Server size={20} style={{ color: "#F5D76E" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                Architecture technique
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Frontend
                </label>
                <select
                  value={data.architecture.frontend}
                  onChange={(e) => setData(prev => ({ ...prev, architecture: { ...prev.architecture, frontend: e.target.value } }))}
                  className="input"
                  style={{ fontSize: "13px" }}
                >
                  <option value="">Sélectionner</option>
                  <option value="Next.js">Next.js</option>
                  <option value="React">React</option>
                  <option value="Vue.js">Vue.js</option>
                  <option value="Angular">Angular</option>
                  <option value="Svelte">Svelte</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Backend
                </label>
                <select
                  value={data.architecture.backend}
                  onChange={(e) => setData(prev => ({ ...prev, architecture: { ...prev.architecture, backend: e.target.value } }))}
                  className="input"
                  style={{ fontSize: "13px" }}
                >
                  <option value="">Sélectionner</option>
                  <option value="Node.js">Node.js</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="PHP">PHP</option>
                  <option value="Go">Go</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Base de données
                </label>
                <select
                  value={data.architecture.database}
                  onChange={(e) => setData(prev => ({ ...prev, architecture: { ...prev.architecture, database: e.target.value } }))}
                  className="input"
                  style={{ fontSize: "13px" }}
                >
                  <option value="">Sélectionner</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="MySQL">MySQL</option>
                  <option value="MongoDB">MongoDB</option>
                  <option value="Supabase">Supabase</option>
                  <option value="Firebase">Firebase</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Hébergement
                </label>
                <select
                  value={data.architecture.hosting}
                  onChange={(e) => setData(prev => ({ ...prev, architecture: { ...prev.architecture, hosting: e.target.value } }))}
                  className="input"
                  style={{ fontSize: "13px" }}
                >
                  <option value="">Sélectionner</option>
                  <option value="Vercel">Vercel</option>
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="Heroku">Heroku</option>
                  <option value="DigitalOcean">DigitalOcean</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                API et services externes
              </label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  value={newApi}
                  onChange={(e) => setNewApi(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem(
                    data.architecture.apis,
                    (list) => setData(prev => ({ ...prev, architecture: { ...prev.architecture, apis: list } })),
                    newApi,
                    () => setNewApi("")
                  )}
                  placeholder="Ex: Stripe, OpenAI, Twilio..."
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => addItem(
                    data.architecture.apis,
                    (list) => setData(prev => ({ ...prev, architecture: { ...prev.architecture, apis: list } })),
                    newApi,
                    () => setNewApi("")
                  )}
                  className="btn-primary"
                  style={{ padding: "8px 16px" }}
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.architecture.apis.map((api, i) => (
                  <span key={i} className="tag-item">
                    {api}
                    <span className="remove" onClick={() => removeItem(
                      data.architecture.apis,
                      (list) => setData(prev => ({ ...prev, architecture: { ...prev.architecture, apis: list } })),
                      i
                    )}>
                      <X size={12} />
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ---- SECTION 3 : MAQUETTES ET UX ---- */}
          <motion.div
            className={`card-glass fade-in-up delay-4 ${isFocused?.startsWith("ux") ? "card-glass-focus" : ""}`}
            style={{ padding: "32px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Palette size={20} style={{ color: "#F5D76E" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                Maquettes et UX
              </h2>
            </div>

            {/* Upload wireframes */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Wireframes / Maquettes
              </label>
              <div
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                {uploading ? (
                  <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#F5D76E" }} />
                ) : (
                  <>
                    <Image size={24} style={{ color: "rgba(200,215,235,0.3)", marginBottom: "8px" }} />
                    <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", margin: 0 }}>
                      Cliquez pour importer des images de vos maquettes
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.2)", margin: "4px 0 0" }}>
                      PNG, JPG, SVG (max 5Mo)
                    </p>
                  </>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginTop: "12px" }}>
                {data.ux.wireframes.map((url, i) => (
                  <div key={i} className="wireframe-thumb">
                    <img src={url} alt={`Maquette ${i+1}`} />
                    <button className="remove-btn" onClick={() => removeWireframe(i)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Parcours utilisateur */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Parcours utilisateur
              </label>
              <textarea
                value={data.ux.userJourney}
                onChange={(e) => setData(prev => ({ ...prev, ux: { ...prev.ux, userJourney: e.target.value } }))}
                placeholder="Décrivez le parcours type d'un utilisateur (étapes clés, actions, écrans...)"
                className="input"
                style={{ minHeight: "80px" }}
              />
            </div>

            {/* Couleurs et typographie */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Palette de couleurs
                </label>
                <input
                  value={data.ux.colors}
                  onChange={(e) => setData(prev => ({ ...prev, ux: { ...prev.ux, colors: e.target.value } }))}
                  placeholder="Ex: #0A1628, #D4AF37, #E8EDF5"
                  className="input"
                  style={{ fontSize: "13px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Typographie
                </label>
                <input
                  value={data.ux.typography}
                  onChange={(e) => setData(prev => ({ ...prev, ux: { ...prev.ux, typography: e.target.value } }))}
                  placeholder="Ex: Inter, Roboto, Playfair Display"
                  className="input"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>
          </motion.div>

          {/* ---- SECTION 4 : PLANIFICATION ---- */}
          <motion.div
            className={`card-glass fade-in-up delay-5 ${isFocused?.startsWith("planning") ? "card-glass-focus" : ""}`}
            style={{ padding: "32px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Calendar size={20} style={{ color: "#F5D76E" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                Planification
              </h2>
            </div>

            {/* Jalons */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Jalons clés
              </label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <input
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du jalon"
                  className="input"
                  style={{ flex: 2, minWidth: "120px" }}
                />
                <input
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                  className="input"
                  style={{ flex: 1, minWidth: "100px" }}
                />
                <button onClick={addMilestone} className="btn-primary" style={{ padding: "8px 16px" }}>
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.planning.milestones.map((m, i) => (
                  <span key={i} className="tag-item" style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                    {m.name} ({new Date(m.date).toLocaleDateString()})
                    <span className="remove" onClick={() => removeMilestone(i)}>
                      <X size={12} />
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Ressources, Risques, Contraintes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Ressources
                </label>
                <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <input
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem(
                      data.planning.resources,
                      (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, resources: list } })),
                      newResource,
                      () => setNewResource("")
                    )}
                    placeholder="Ex: Équipe de 3 devs"
                    className="input"
                    style={{ fontSize: "13px", flex: 1 }}
                  />
                  <button
                    onClick={() => addItem(
                      data.planning.resources,
                      (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, resources: list } })),
                      newResource,
                      () => setNewResource("")
                    )}
                    className="btn-primary"
                    style={{ padding: "4px 10px" }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {data.planning.resources.map((r, i) => (
                    <span key={i} className="tag-item" style={{ fontSize: "11px", padding: "2px 8px" }}>
                      {r}
                      <span className="remove" onClick={() => removeItem(
                        data.planning.resources,
                        (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, resources: list } })),
                        i
                      )}>
                        <X size={10} />
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Risques
                </label>
                <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <input
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem(
                      data.planning.risks,
                      (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, risks: list } })),
                      newRisk,
                      () => setNewRisk("")
                    )}
                    placeholder="Ex: Délais trop serrés"
                    className="input"
                    style={{ fontSize: "13px", flex: 1 }}
                  />
                  <button
                    onClick={() => addItem(
                      data.planning.risks,
                      (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, risks: list } })),
                      newRisk,
                      () => setNewRisk("")
                    )}
                    className="btn-primary"
                    style={{ padding: "4px 10px" }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {data.planning.risks.map((r, i) => (
                    <span key={i} className="tag-item" style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(228,115,107,0.08)", borderColor: "rgba(228,115,107,0.1)", color: "#E4736B" }}>
                      {r}
                      <span className="remove" onClick={() => removeItem(
                        data.planning.risks,
                        (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, risks: list } })),
                        i
                      )}>
                        <X size={10} />
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", display: "block", marginBottom: "4px" }}>
                  Contraintes
                </label>
                <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <input
                    value={newConstraint}
                    onChange={(e) => setNewConstraint(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem(
                      data.planning.constraints,
                      (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, constraints: list } })),
                      newConstraint,
                      () => setNewConstraint("")
                    )}
                    placeholder="Ex: Budget limité"
                    className="input"
                    style={{ fontSize: "13px", flex: 1 }}
                  />
                  <button
                    onClick={() => addItem(
                      data.planning.constraints,
                      (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, constraints: list } })),
                      newConstraint,
                      () => setNewConstraint("")
                    )}
                    className="btn-primary"
                    style={{ padding: "4px 10px" }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {data.planning.constraints.map((c, i) => (
                    <span key={i} className="tag-item" style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                      {c}
                      <span className="remove" onClick={() => removeItem(
                        data.planning.constraints,
                        (list) => setData(prev => ({ ...prev, planning: { ...prev.planning, constraints: list } })),
                        i
                      )}>
                        <X size={10} />
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---- BRAINSTORMING ---- */}
          <motion.div className="card-glass fade-in-up delay-4">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={18} style={{ color: "#F5D76E" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                  Notes de conception
                </h3>
                <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
                  ({data.brainstorming.length} notes)
                </span>
              </div>
              <button
                onClick={() => {
                  const note = prompt("Ajouter une note de conception :");
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

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }} className="scrollbar-custom">
              {data.brainstorming.length === 0 ? (
                <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                  Pas encore de notes. Notez vos idées de conception ici.
                </p>
              ) : (
                data.brainstorming.map((note, i) => (
                  <div key={i} className="note-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <p style={{ fontSize: "13px", color: "#E8EDF5", margin: 0, lineHeight: 1.5 }}>
                        {note}
                      </p>
                      <button
                        onClick={() => setData(prev => ({
                          ...prev,
                          brainstorming: prev.brainstorming.filter((_, idx) => idx !== i)
                        }))}
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
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* ---- CONSEILS IA ---- */}
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
                        { id: Date.now(), category: "suggestion", content: "Pour une meilleure maintenabilité, adoptez une architecture modulaire." },
                        { id: Date.now()+1, category: "feedback", content: "Votre choix de technologie semble cohérent avec le besoin. Pensez à la scalabilité." },
                        { id: Date.now()+2, category: "question", content: "Avez-vous prévu des tests automatisés ?" },
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
          {/* ---- BOUTONS D'ACTION ---- */}
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
    </div>
  );
}