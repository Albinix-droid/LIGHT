// app/dashboard/projets/[id]/concretisation/ConcretisationForm.tsx
// PAGE DE CONCRÉTISATION - L'ÂME DU PROJET

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
  Shield,
  Rocket,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Trash2,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  Star,
  BarChart3,
  Clock,
  Calendar,
  RefreshCw,
  Save,
  FileText,
  Upload,
  Flag,
  Target,
  Zap,
  Award,
  Globe,
  Send,
  PartyPopper,
  Crown,
  Briefcase,
  Handshake
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface LaunchInfo {
  date: string;
  status: "planned" | "in-progress" | "live" | "post-launch";
  url: string;
}

interface GoToMarket {
  channels: string[];
  targetAudience: string;
  acquisitionPlan: string;
}

interface Communication {
  plan: string;
  socialNetworks: string[];
  pressContacts: string[];
}

interface PostLaunch {
  kpis: { name: string; value: string; target: string }[];
  feedback: string;
  nextSteps: string[];
}

interface Partner {
  id: string;
  name: string;
  type: "investor" | "partner" | "client";
  logo: string;
  description: string;
}

export interface ConcretisationData {
  launch: LaunchInfo;
  goToMarket: GoToMarket;
  communication: Communication;
  postLaunch: PostLaunch;
  partners: Partner[];
  businessPlanUrl: string;
  pitchDeckUrl: string;
  presentationUrl: string;
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
export default function ConcretisationForm({ projectId, initialData, completed, status, supervisorName, review, locked, previousStageLabel }: StepProps<ConcretisationData>) {
  const router = useRouter();
  const [submissionNote, setSubmissionNote] = useState("");
  const scrollY = useScroll();

  // ===== ÉTATS =====
  const [data, setData] = useState<ConcretisationData>(() => ({
    launch: { date: "", status: "planned", url: "", ...initialData?.launch },
    goToMarket: { channels: [], targetAudience: "", acquisitionPlan: "", ...initialData?.goToMarket },
    communication: { plan: "", socialNetworks: [], pressContacts: [], ...initialData?.communication },
    postLaunch: { kpis: [], feedback: "", nextSteps: [], ...initialData?.postLaunch },
    partners: initialData?.partners ?? [],
    businessPlanUrl: initialData?.businessPlanUrl ?? "",
    pitchDeckUrl: initialData?.pitchDeckUrl ?? "",
    presentationUrl: initialData?.presentationUrl ?? "",
    brainstorming: initialData?.brainstorming ?? [],
  }));
  const [isCompleted, setIsCompleted] = useState(completed);

  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // ===== CHAMPS DYNAMIQUES =====
  const [newKpi, setNewKpi] = useState({ name: "", value: "", target: "" });
  const [newStep, setNewStep] = useState("");
  const [newPartner, setNewPartner] = useState({ name: "", type: "partner", logo: "", description: "" });
  const [newBrainstorm, setNewBrainstorm] = useState("");

  // ===== CONSEILS IA =====
  const [tips, setTips] = useState([
    { id: 1, category: "feedback", content: "Félicitations ! Le lancement est une étape majeure. Assurez-vous d'avoir un plan de communication solide." },
    { id: 2, category: "suggestion", content: "Pensez à créer un tableau de bord pour suivre vos KPI en temps réel." },
  ]);
  const [showTips, setShowTips] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // ===== ÉTAPES =====
  const stages = [
    { id: "idealisation", label: "Idéalisation", icon: Lightbulb },
    { id: "conception", label: "Conception", icon: PenTool },
    { id: "developpement", label: "Développement", icon: Code },
    { id: "tests", label: "Tests", icon: Shield },
    { id: "concretisation", label: "Concrétisation", icon: Rocket },
  ];

  // ============================================================
  // COMPLETUDE
  // ============================================================
  const completionRate = () => {
    let filled = 0;
    const total = 10;
    if (data.launch.date) filled++;
    if (data.launch.url) filled++;
    if (data.goToMarket.channels.length > 0) filled++;
    if (data.goToMarket.targetAudience) filled++;
    if (data.communication.plan) filled++;
    if (data.postLaunch.kpis.length > 0) filled++;
    if (data.postLaunch.nextSteps.length > 0) filled++;
    if (data.partners.length > 0) filled++;
    if (data.businessPlanUrl) filled++;
    if (data.pitchDeckUrl) filled++;
    return Math.round((filled / total) * 100);
  };

  // Critères partagés avec la validation serveur (lib/parcours.ts)
  const requirements = getStepRequirements("concretisation", data);
  const missing = requirements.filter(r => !r.ok).map(r => r.label);
  const isComplete = missing.length === 0;

  // ============================================================
  // GESTION DES KPI
  // ============================================================
  const addKpi = () => {
    if (!newKpi.name.trim() || !newKpi.value.trim() || !newKpi.target.trim()) return;
    setData(prev => ({
      ...prev,
      postLaunch: {
        ...prev.postLaunch,
        kpis: [...prev.postLaunch.kpis, { name: newKpi.name.trim(), value: newKpi.value.trim(), target: newKpi.target.trim() }]
      }
    }));
    setNewKpi({ name: "", value: "", target: "" });
  };

  const deleteKpi = (index: number) => {
    setData(prev => ({
      ...prev,
      postLaunch: {
        ...prev.postLaunch,
        kpis: prev.postLaunch.kpis.filter((_, i) => i !== index)
      }
    }));
  };

  // ============================================================
  // GESTION DES PROCHAINES ÉTAPES
  // ============================================================
  const addStep = () => {
    if (!newStep.trim()) return;
    setData(prev => ({
      ...prev,
      postLaunch: {
        ...prev.postLaunch,
        nextSteps: [...prev.postLaunch.nextSteps, newStep.trim()]
      }
    }));
    setNewStep("");
  };

  const deleteStep = (index: number) => {
    setData(prev => ({
      ...prev,
      postLaunch: {
        ...prev.postLaunch,
        nextSteps: prev.postLaunch.nextSteps.filter((_, i) => i !== index)
      }
    }));
  };

  // ============================================================
  // GESTION DES PARTENAIRES
  // ============================================================
  const addPartner = () => {
    if (!newPartner.name.trim()) return;
    const partner: Partner = {
      id: Date.now().toString(),
      name: newPartner.name.trim(),
      type: newPartner.type as any,
      logo: newPartner.logo || "🤝",
      description: newPartner.description.trim() || "",
    };
    setData(prev => ({ ...prev, partners: [...prev.partners, partner] }));
    setNewPartner({ name: "", type: "partner", logo: "", description: "" });
  };

  const deletePartner = (id: string) => {
    setData(prev => ({
      ...prev,
      partners: prev.partners.filter(p => p.id !== id)
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
      const result = await saveStep(projectId, "concretisation", data);
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
      const result = await submitStep(projectId, "concretisation", data, submissionNote);
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
    <div className="step-form">



      {/* ===== CONFETTIS DE CÉLÉBRATION ===== */}
      {showCelebration && (
        <>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 10}%`,
                background: ['#d6b25e', '#f1d48a', '#1f4fd8', '#4d7cff', '#0b8a5f'][Math.floor(Math.random() * 5)],
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
          <div className="celebrate-overlay">
            <div className="celebrate-card">
              <PartyPopper size={64} style={{ color: "var(--brand)", marginBottom: "16px" }} />
              <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>
                🎉 Félicitations !
              </h2>
              <p style={{ fontSize: "16px", color: "var(--ink-muted)", marginBottom: "8px" }}>
                Votre projet est officiellement lancé !
              </p>
              <p style={{ fontSize: "14px", color: "var(--ink-subtle)", marginBottom: "24px" }}>
                Vous avez parcouru toutes les étapes avec succès.
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowCelebration(false)}
                  className="btn-primary"
                >
                  Continuer
                </button>
                <Link
                  href={`/dashboard/projets/${projectId}`}
                  className="btn-secondary"
                >
                  Voir le projet
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>

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
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>
              Concrétisation
            </h1>
            <span className="badge badge-success">
              <Rocket size={12} />
              Étape 5/5
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {stages.map((stage, index) => (
              <span
                key={stage.id}
                className={`stage-pill ${index === 4 ? "stage-pill-active" : ""} ${index < 4 ? "stage-pill-completed" : ""}`}
              >
                {index < 4 ? "✓" : "●"} {stage.label}
              </span>
            ))}
          </div>
        </div>

        {/* ===== BARRE DE PROGRESSION ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--ink-subtle)" }}>
              Concrétisation du projet
            </span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--brand)" }}>
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
          <p style={{ fontSize: "11px", color: "var(--ink-subtle)", marginTop: "4px" }}>
            {isComplete
              ? "Votre projet est prêt à être lancé !"
              : "Complétez les critères ci-dessous pour valider cette étape."}
          </p>
          <StepChecklist requirements={requirements} />
          <StepStatusBanner projectId={projectId} status={status} supervisorName={supervisorName} review={review} locked={locked} previousStageLabel={previousStageLabel} />
        </div>

        {/* ===== BANDEAU DE RÉUSSITE ===== */}
        {isCompleted && (
          <div className="fade-in-up delay-1" style={{ marginBottom: "24px", padding: "16px 24px", background: "var(--success-soft)", border: "1px solid color-mix(in srgb, var(--success) 22%, transparent)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Crown size={24} style={{ color: "var(--brand)" }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--success)", margin: 0 }}>
                🎉 Projet concrétisé avec succès !
              </p>
              <p style={{ fontSize: "12px", color: "var(--ink-subtle)", margin: 0 }}>
                Votre projet est maintenant en production. Félicitations !
              </p>
            </div>
          </div>
        )}

        {/* ===== GRILLE PRINCIPALE ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>

          {/* ---- SECTION 1 : LANCEMENT OFFICIEL ---- */}
          <motion.div className={`card-glass fade-in-up delay-2 ${isFocused?.startsWith("launch") ? "card-glass-focus" : ""}`} style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Rocket size={20} style={{ color: "var(--brand)" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Lancement officiel
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                  Date de lancement
                </label>
                <input
                  type="date"
                  value={data.launch.date}
                  onChange={(e) => setData(prev => ({ ...prev, launch: { ...prev.launch, date: e.target.value } }))}
                  className="input"
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                  Statut
                </label>
                <select
                  value={data.launch.status}
                  onChange={(e) => setData(prev => ({ ...prev, launch: { ...prev.launch, status: e.target.value as any } }))}
                  className="input"
                >
                  <option value="planned">Planifié</option>
                  <option value="in-progress">En cours</option>
                  <option value="live">En production</option>
                  <option value="post-launch">Post-lancement</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                URL du projet
              </label>
              <input
                value={data.launch.url}
                onChange={(e) => setData(prev => ({ ...prev, launch: { ...prev.launch, url: e.target.value } }))}
                placeholder="https://mon-projet.com"
                className="input"
              />
            </div>
          </motion.div>

          {/* ---- SECTION 2 : STRATÉGIE GO-TO-MARKET ---- */}
          <motion.div className="card-glass fade-in-up delay-2" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Target size={20} style={{ color: "var(--brand)" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Stratégie go-to-market
              </h2>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                Public cible
              </label>
              <input
                value={data.goToMarket.targetAudience}
                onChange={(e) => setData(prev => ({ ...prev, goToMarket: { ...prev.goToMarket, targetAudience: e.target.value } }))}
                placeholder="Ex: Étudiants en informatique, jeunes entrepreneurs..."
                className="input"
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                Canaux de distribution
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.goToMarket.channels.map((channel, i) => (
                  <span key={i} className="tag-item">
                    {channel}
                    <span className="remove" onClick={() => setData(prev => ({
                      ...prev,
                      goToMarket: {
                        ...prev.goToMarket,
                        channels: prev.goToMarket.channels.filter((_, idx) => idx !== i)
                      }
                    }))}>
                      <X size={12} />
                    </span>
                  </span>
                ))}
                <input
                  placeholder="Ajouter un canal"
                  className="input"
                  style={{ width: "auto", minWidth: "120px", padding: "4px 12px", fontSize: "12px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      setData(prev => ({
                        ...prev,
                        goToMarket: {
                          ...prev.goToMarket,
                          channels: [...prev.goToMarket.channels, e.currentTarget.value.trim()]
                        }
                      }));
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                Plan d'acquisition
              </label>
              <textarea
                value={data.goToMarket.acquisitionPlan}
                onChange={(e) => setData(prev => ({ ...prev, goToMarket: { ...prev.goToMarket, acquisitionPlan: e.target.value } }))}
                placeholder="Décrivez votre stratégie pour acquérir les premiers utilisateurs..."
                className="input"
                style={{ minHeight: "60px" }}
              />
            </div>
          </motion.div>

          {/* ---- SECTION 3 : COMMUNICATION ---- */}
          <motion.div className="card-glass fade-in-up delay-3" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Globe size={20} style={{ color: "var(--brand)" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Communication
              </h2>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                Plan de communication
              </label>
              <textarea
                value={data.communication.plan}
                onChange={(e) => setData(prev => ({ ...prev, communication: { ...prev.communication, plan: e.target.value } }))}
                placeholder="Ex: Lancement sur LinkedIn, articles de blog, campagne email..."
                className="input"
                style={{ minHeight: "60px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                Réseaux sociaux
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.communication.socialNetworks.map((social, i) => (
                  <span key={i} className="tag-item" style={{ background: "var(--brand-soft)", borderColor: "var(--brand-soft)", color: "var(--brand-ink)" }}>
                    {social}
                    <span className="remove" onClick={() => setData(prev => ({
                      ...prev,
                      communication: {
                        ...prev.communication,
                        socialNetworks: prev.communication.socialNetworks.filter((_, idx) => idx !== i)
                      }
                    }))}>
                      <X size={12} />
                    </span>
                  </span>
                ))}
                <input
                  placeholder="Ajouter un réseau"
                  className="input"
                  style={{ width: "auto", minWidth: "120px", padding: "4px 12px", fontSize: "12px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      setData(prev => ({
                        ...prev,
                        communication: {
                          ...prev.communication,
                          socialNetworks: [...prev.communication.socialNetworks, e.currentTarget.value.trim()]
                        }
                      }));
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* ---- SECTION 4 : SUIVI POST-LANCEMENT ---- */}
          <motion.div className="card-glass fade-in-up delay-4" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <BarChart3 size={20} style={{ color: "var(--brand)" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Suivi post-lancement
              </h2>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "8px" }}>
                Indicateurs clés (KPI)
              </label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <input
                  value={newKpi.name}
                  onChange={(e) => setNewKpi(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du KPI"
                  className="input"
                  style={{ flex: 1, minWidth: "100px" }}
                />
                <input
                  value={newKpi.value}
                  onChange={(e) => setNewKpi(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Valeur actuelle"
                  className="input"
                  style={{ flex: 1, minWidth: "80px" }}
                />
                <input
                  value={newKpi.target}
                  onChange={(e) => setNewKpi(prev => ({ ...prev, target: e.target.value }))}
                  placeholder="Objectif"
                  className="input"
                  style={{ flex: 1, minWidth: "80px" }}
                />
                <button onClick={addKpi} className="btn-primary" style={{ padding: "6px 16px" }}>
                  <Plus size={14} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "8px" }}>
                {data.postLaunch.kpis.map((kpi, i) => (
                  <div key={i} className="kpi-card">
                    <p style={{ fontSize: "11px", color: "var(--ink-subtle)", margin: 0 }}>{kpi.name}</p>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)", margin: "4px 0" }}>{kpi.value}</p>
                    <p style={{ fontSize: "10px", color: "var(--ink-subtle)", margin: 0 }}>Objectif: {kpi.target}</p>
                    <button
                      onClick={() => deleteKpi(i)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--ink-subtle)",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "6px",
                        marginTop: "4px",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-subtle)"; }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                Retour utilisateurs
              </label>
              <textarea
                value={data.postLaunch.feedback}
                onChange={(e) => setData(prev => ({ ...prev, postLaunch: { ...prev.postLaunch, feedback: e.target.value } }))}
                placeholder="Ex: Les premiers retours sont très positifs..."
                className="input"
                style={{ minHeight: "60px" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", color: "var(--ink-muted)", display: "block", marginBottom: "4px" }}>
                Prochaines étapes
              </label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <input
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Ex: Lancer l'app mobile"
                  className="input"
                  style={{ flex: 1, minWidth: "120px" }}
                />
                <button onClick={addStep} className="btn-primary" style={{ padding: "6px 16px" }}>
                  <Plus size={14} />
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.postLaunch.nextSteps.map((step, i) => (
                  <span key={i} className="tag-item" style={{ background: "var(--warning-soft)", borderColor: "var(--warning-soft)", color: "var(--warning)" }}>
                    {step}
                    <span className="remove" onClick={() => deleteStep(i)}>
                      <X size={12} />
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ---- SECTION 5 : PARTENAIRES ---- */}
          <motion.div className="card-glass fade-in-up delay-5" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Handshake size={20} style={{ color: "var(--brand)" }} />
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                  Partenaires et investisseurs
                </h2>
              </div>
              <button
                onClick={() => {
                  const name = prompt("Nom du partenaire :");
                  if (name && name.trim()) {
                    const type = prompt("Type (investor/partner/client) :") || "partner";
                    const logo = prompt("Logo (emoji) :") || "🤝";
                    const description = prompt("Description :") || "";
                    setData(prev => ({
                      ...prev,
                      partners: [...prev.partners, {
                        id: Date.now().toString(),
                        name: name.trim(),
                        type: type as any,
                        logo: logo,
                        description: description,
                      }]
                    }));
                  }
                }}
                className="btn-secondary"
                style={{ padding: "4px 12px", fontSize: "12px" }}
              >
                <Plus size={14} />
                Ajouter
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto" }} className="scrollbar-custom">
              {data.partners.map(partner => (
                <div key={partner.id} className="partner-card">
                  <span style={{ fontSize: "24px" }}>{partner.logo}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)", margin: 0 }}>{partner.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--ink-subtle)", margin: 0 }}>
                      {partner.type === "investor" ? "Investisseur" : partner.type === "partner" ? "Partenaire" : "Client"}
                      {partner.description && ` - ${partner.description}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deletePartner(partner.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--ink-subtle)",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "6px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-soft)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-subtle)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ---- SECTION 6 : DOCUMENTATION FINALE ---- */}
          <motion.div className="card-glass fade-in-up delay-5" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <FileText size={20} style={{ color: "var(--brand)" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Documentation finale
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--ink-subtle)", display: "block", marginBottom: "4px" }}>
                  Business plan
                </label>
                <input
                  value={data.businessPlanUrl}
                  onChange={(e) => setData(prev => ({ ...prev, businessPlanUrl: e.target.value }))}
                  placeholder="URL du business plan"
                  className="input"
                  style={{ fontSize: "12px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--ink-subtle)", display: "block", marginBottom: "4px" }}>
                  Pitch deck
                </label>
                <input
                  value={data.pitchDeckUrl}
                  onChange={(e) => setData(prev => ({ ...prev, pitchDeckUrl: e.target.value }))}
                  placeholder="URL du pitch deck"
                  className="input"
                  style={{ fontSize: "12px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--ink-subtle)", display: "block", marginBottom: "4px" }}>
                  Présentation finale
                </label>
                <input
                  value={data.presentationUrl}
                  onChange={(e) => setData(prev => ({ ...prev, presentationUrl: e.target.value }))}
                  placeholder="URL de la présentation"
                  className="input"
                  style={{ fontSize: "12px" }}
                />
              </div>
            </div>
          </motion.div>

          {/* ---- BRAINSTORMING ---- */}
          <motion.div className="card-glass fade-in-up delay-4">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={18} style={{ color: "var(--brand)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                  Notes de lancement
                </h3>
                <span style={{ fontSize: "11px", color: "var(--ink-subtle)", fontWeight: 400 }}>
                  ({data.brainstorming.length} notes)
                </span>
              </div>
              <button
                onClick={() => {
                  const note = prompt("Ajouter une note de lancement :");
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
                <p style={{ textAlign: "center", fontSize: "13px", color: "var(--ink-subtle)", padding: "16px 0" }}>
                  Notez vos réflexions sur le lancement.
                </p>
              ) : (
                data.brainstorming.map((note, i) => (
                  <div key={i} className="partner-card" style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", width: "100%" }}>
                      <p style={{ fontSize: "13px", color: "var(--ink)", margin: 0, lineHeight: 1.5 }}>
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
                          color: "var(--ink-subtle)",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "6px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-soft)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-subtle)"; e.currentTarget.style.background = "transparent"; }}
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
                <Sparkles size={18} style={{ color: "var(--brand)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                  Conseils IA
                </h3>
                <span style={{ fontSize: "10px", color: "var(--ink-subtle)", fontWeight: 400 }}>
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
                      <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>
                        {tip.content}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newTips = [
                        { id: Date.now(), category: "suggestion", content: "Créez un tableau de bord pour suivre vos KPI en temps réel." },
                        { id: Date.now()+1, category: "feedback", content: "Le lancement est une étape clé. Assurez-vous d'avoir un plan de communication solide." },
                        { id: Date.now()+2, category: "question", content: "Avez-vous prévu des partenariats pour accélérer votre croissance ?" },
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "var(--danger-soft)", border: "1px solid color-mix(in srgb, var(--danger) 22%, transparent)", color: "var(--danger)", fontSize: "13px" }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {success && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "var(--success-soft)", border: "1px solid color-mix(in srgb, var(--success) 22%, transparent)", color: "var(--success)", fontSize: "13px" }}>
                  <CheckCircle size={16} />
                  {success}
                </div>
              )}
              <button
                onClick={handleValidate}
                disabled={isValidating || isCompleted || locked || status === "SUBMITTED"}
                className={isComplete && !isCompleted && !locked && status !== "SUBMITTED" ? "btn-success" : "btn-secondary"}
                style={{ padding: "10px 24px" }}
              >
                {isValidating ? (
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                ) : isCompleted ? (
                  <>
                    <CheckCircle size={16} />
                    Projet concrétisé
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    {locked ? `Soumission après validation : ${previousStageLabel}` : status === "SUBMITTED" ? "En attente de l'encadrant" : "Soumettre à l'encadrant"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}