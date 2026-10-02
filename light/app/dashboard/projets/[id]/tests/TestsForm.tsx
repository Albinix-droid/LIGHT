// app/dashboard/projets/[id]/tests/TestsForm.tsx
// PAGE DE TESTS - VERSION DYNAMIQUE ET IMMERSIVE

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
  Bug,
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
  Zap
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface TestCase {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "passed" | "failed";
  expectedResult: string;
  actualResult: string;
  createdAt: string;
}

interface UserTest {
  id: string;
  userName: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

interface Bug {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  assignee: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface TestsData {
  testCases: TestCase[];
  userTests: UserTest[];
  bugs: Bug[];
  testCoverage: number;
  performanceScore: number;
  accessibilityScore: number;
  securityScore: number;
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
export default function TestsForm({ projectId, initialData, completed, status, supervisorName, review, locked, previousStageLabel }: StepProps<TestsData>) {
  const router = useRouter();
  const [submissionNote, setSubmissionNote] = useState("");
  const scrollY = useScroll();

  // ===== ÉTATS =====
  const [data, setData] = useState<TestsData>({
    testCases: [],
    userTests: [],
    bugs: [],
    testCoverage: 0,
    performanceScore: 0,
    accessibilityScore: 0,
    securityScore: 0,
    brainstorming: [],
    ...initialData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"functional" | "user" | "bugs" | "quality">("functional");

  // ===== CHAMPS DYNAMIQUES =====
  const [newTestCase, setNewTestCase] = useState({ title: "", description: "", expectedResult: "" });
  const [newUserTest, setNewUserTest] = useState({ userName: "", rating: 5, feedback: "" });
  const [newBug, setNewBug] = useState({ title: "", description: "", priority: "medium", assignee: "" });
  const [newBrainstorm, setNewBrainstorm] = useState("");

  // ===== CONSEILS IA =====
  const [tips, setTips] = useState([
    { id: 1, category: "feedback", content: "Priorisez les tests des fonctionnalités critiques avant les tests de performance." },
    { id: 2, category: "suggestion", content: "Réalisez des tests utilisateurs avec au moins 5 personnes pour avoir des retours significatifs." },
  ]);
  const [showTips, setShowTips] = useState(true);

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
    const total = 7;
    if (data.testCases.length > 0) filled++;
    if (data.testCases.some(t => t.status === "passed")) filled++;
    if (data.userTests.length > 0) filled++;
    if (data.bugs.length > 0) filled++;
    if (data.testCoverage > 0) filled++;
    if (data.bugs.every(b => b.status === "resolved" || b.status === "closed")) filled++;
    if (data.brainstorming.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  // Critères partagés avec la validation serveur (lib/parcours.ts)
  const requirements = getStepRequirements("tests", data);
  const missing = requirements.filter(r => !r.ok).map(r => r.label);
  const isComplete = missing.length === 0;

  // ============================================================
  // GESTION DES TESTS FONCTIONNELS
  // ============================================================
  const addTestCase = () => {
    if (!newTestCase.title.trim() || !newTestCase.expectedResult.trim()) return;
    const testCase: TestCase = {
      id: Date.now().toString(),
      title: newTestCase.title.trim(),
      description: newTestCase.description.trim(),
      status: "todo",
      expectedResult: newTestCase.expectedResult.trim(),
      actualResult: "",
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, testCases: [...prev.testCases, testCase] }));
    setNewTestCase({ title: "", description: "", expectedResult: "" });
  };

  const updateTestCaseStatus = (id: string, status: TestCase["status"]) => {
    setData(prev => ({
      ...prev,
      testCases: prev.testCases.map(t => t.id === id ? { ...t, status } : t)
    }));
  };

  const deleteTestCase = (id: string) => {
    setData(prev => ({
      ...prev,
      testCases: prev.testCases.filter(t => t.id !== id)
    }));
  };

  // ============================================================
  // GESTION DES TESTS UTILISATEURS
  // ============================================================
  const addUserTest = () => {
    if (!newUserTest.userName.trim() || !newUserTest.feedback.trim()) return;
    const userTest: UserTest = {
      id: Date.now().toString(),
      userName: newUserTest.userName.trim(),
      rating: newUserTest.rating,
      feedback: newUserTest.feedback.trim(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, userTests: [...prev.userTests, userTest] }));
    setNewUserTest({ userName: "", rating: 5, feedback: "" });
  };

  const deleteUserTest = (id: string) => {
    setData(prev => ({
      ...prev,
      userTests: prev.userTests.filter(t => t.id !== id)
    }));
  };

  // ============================================================
  // GESTION DES BUGS
  // ============================================================
  const addBug = () => {
    if (!newBug.title.trim()) return;
    const bug: Bug = {
      id: Date.now().toString(),
      title: newBug.title.trim(),
      description: newBug.description.trim(),
      priority: newBug.priority as any,
      status: "open",
      assignee: newBug.assignee || "Non assigné",
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, bugs: [...prev.bugs, bug] }));
    setNewBug({ title: "", description: "", priority: "medium", assignee: "" });
  };

  const updateBugStatus = (id: string, status: Bug["status"]) => {
    setData(prev => ({
      ...prev,
      bugs: prev.bugs.map(b => b.id === id ? { ...b, status, resolvedAt: status === "resolved" || status === "closed" ? new Date().toISOString() : b.resolvedAt } : b)
    }));
  };

  const deleteBug = (id: string) => {
    setData(prev => ({
      ...prev,
      bugs: prev.bugs.filter(b => b.id !== id)
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
      const result = await saveStep(projectId, "tests", data);
      if (result.ok) setSuccess("Tests sauvegardés avec succès.");
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
      const result = await submitStep(projectId, "tests", data, submissionNote);
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



      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>

        {/* ===== EN-TÊTE ===== */}
        <div className="fade-in-up delay-1 step-hero" style={{ "--hero-img": "url(/images/etapes/tests.jpg)" } as React.CSSProperties}>
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
              Tests
            </h1>
            <span className="badge">
              <Shield size={12} />
              {completed ? "Étape 4/5 · Validée ✓" : "Étape 4/5"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {stages.map((stage, index) => (
              <span
                key={stage.id}
                className={`stage-pill ${index === 3 ? "stage-pill-active" : ""}`}
              >
                {index === 3 && "●"} {stage.label}
              </span>
            ))}
          </div>
        </div>

        {/* ===== BARRE DE PROGRESSION ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--ink-subtle)" }}>
              Complétude des tests
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
              ? "Tous les tests sont passés et les bugs sont résolus."
              : "Complétez les critères ci-dessous pour valider cette étape."}
          </p>
          <StepChecklist requirements={requirements} />
          <StepStatusBanner projectId={projectId} status={status} supervisorName={supervisorName} review={review} locked={locked} previousStageLabel={previousStageLabel} />
        </div>

        {/* ===== ONGLETS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
          {[
            { id: "functional", label: "Tests fonctionnels", icon: CheckCircle },
            { id: "user", label: "Tests utilisateurs", icon: Users },
            { id: "bugs", label: "Bugs", icon: Bug },
            { id: "quality", label: "Qualité", icon: BarChart3 },
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

          {/* ---- ONGLET TESTS FONCTIONNELS ---- */}
          {activeTab === "functional" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Target size={18} style={{ color: "var(--brand)" }} />
                  Cas de test
                  <span style={{ fontSize: "12px", color: "var(--ink-subtle)", fontWeight: 400 }}>
                    ({data.testCases.filter(t => t.status === "passed").length}/{data.testCases.length} réussis)
                  </span>
                </h3>
                <button
                  onClick={addTestCase}
                  className="btn-primary"
                  style={{ padding: "8px 16px" }}
                >
                  <Plus size={14} />
                  Ajouter un test
                </button>
              </div>

              {/* Ajout de test */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", padding: "12px", background: "var(--surface-muted)", borderRadius: "12px" }}>
                <input
                  value={newTestCase.title}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTestCase()}
                  placeholder="Titre du test"
                  className="input"
                  style={{ flex: 1, minWidth: "150px" }}
                />
                <input
                  value={newTestCase.expectedResult}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, expectedResult: e.target.value }))}
                  placeholder="Résultat attendu"
                  className="input"
                  style={{ flex: 1, minWidth: "120px" }}
                />
                <input
                  value={newTestCase.description}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optionnel)"
                  className="input"
                  style={{ flex: 1, minWidth: "100px" }}
                />
                <button onClick={addTestCase} className="btn-primary" style={{ padding: "8px 16px" }}>
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {/* Liste des tests */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "350px", overflowY: "auto" }} className="scrollbar-custom">
                {data.testCases.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "13px", color: "var(--ink-subtle)", padding: "16px 0" }}>
                    Aucun test. Ajoutez des cas de test pour vérifier votre application.
                  </p>
                ) : (
                  data.testCases.map(test => (
                    <div key={test.id} className="test-case-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span className={`status-dot status-dot-${test.status}`} />
                        <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
                          {test.title}
                        </span>
                        {test.description && (
                          <span style={{ fontSize: "11px", color: "var(--ink-subtle)" }}>
                            {test.description}
                          </span>
                        )}
                        <span style={{ fontSize: "11px", color: "var(--ink-subtle)" }}>
                          Attendue: {test.expectedResult}
                        </span>
                        {test.status === "passed" && (
                          <span style={{ fontSize: "11px", color: "var(--success)" }}>
                            ✓ {test.actualResult}
                          </span>
                        )}
                        {test.status === "failed" && (
                          <span style={{ fontSize: "11px", color: "var(--danger)" }}>
                            ✗ {test.actualResult}
                          </span>
                        )}
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                          <select
                            value={test.status}
                            onChange={(e) => updateTestCaseStatus(test.id, e.target.value as any)}
                            className="input"
                            style={{ width: "auto", fontSize: "11px", padding: "4px 8px" }}
                          >
                            <option value="todo">À faire</option>
                            <option value="in-progress">En cours</option>
                            <option value="passed">Réussi</option>
                            <option value="failed">Échec</option>
                          </select>
                          <button
                            onClick={() => deleteTestCase(test.id)}
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
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ---- ONGLET TESTS UTILISATEURS ---- */}
          {activeTab === "user" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} style={{ color: "var(--brand)" }} />
                Retours utilisateurs
                <span style={{ fontSize: "12px", color: "var(--ink-subtle)", fontWeight: 400 }}>
                  ({data.userTests.length} retours)
                </span>
              </h3>

              {/* Ajout de retour */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", padding: "12px", background: "var(--surface-muted)", borderRadius: "12px" }}>
                <input
                  value={newUserTest.userName}
                  onChange={(e) => setNewUserTest(prev => ({ ...prev, userName: e.target.value }))}
                  placeholder="Nom du testeur"
                  className="input"
                  style={{ flex: 1, minWidth: "100px" }}
                />
                <select
                  value={newUserTest.rating}
                  onChange={(e) => setNewUserTest(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="input"
                  style={{ width: "auto", minWidth: "80px" }}
                >
                  <option value="5">5 ★</option>
                  <option value="4">4 ★</option>
                  <option value="3">3 ★</option>
                  <option value="2">2 ★</option>
                  <option value="1">1 ★</option>
                </select>
                <input
                  value={newUserTest.feedback}
                  onChange={(e) => setNewUserTest(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Feedback..."
                  className="input"
                  style={{ flex: 2, minWidth: "150px" }}
                />
                <button onClick={addUserTest} className="btn-primary" style={{ padding: "8px 16px" }}>
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {/* Liste des retours */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }} className="scrollbar-custom">
                {data.userTests.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "13px", color: "var(--ink-subtle)", padding: "16px 0" }}>
                    Aucun retour utilisateur. Faites tester votre projet par des utilisateurs.
                  </p>
                ) : (
                  data.userTests.map(test => (
                    <div key={test.id} className="test-case-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
                          {test.userName}
                        </span>
                        <span style={{ display: "flex", gap: "2px", color: "var(--brand)" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < test.rating ? "var(--brand)" : "none"} style={{ color: "var(--brand)" }} />
                          ))}
                        </span>
                        <span style={{ fontSize: "13px", color: "var(--ink-muted)" }}>
                          "{test.feedback}"
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--ink-subtle)", marginLeft: "auto" }}>
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => deleteUserTest(test.id)}
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
          )}

          {/* ---- ONGLET BUGS ---- */}
          {activeTab === "bugs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bug size={18} style={{ color: "var(--brand)" }} />
                  Bugs
                  <span style={{ fontSize: "12px", color: "var(--ink-subtle)", fontWeight: 400 }}>
                    ({data.bugs.filter(b => b.status === "resolved" || b.status === "closed").length}/{data.bugs.length} résolus)
                  </span>
                </h3>
                <button
                  onClick={addBug}
                  className="btn-primary"
                  style={{ padding: "8px 16px" }}
                >
                  <Plus size={14} />
                  Signaler un bug
                </button>
              </div>

              {/* Ajout de bug */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", padding: "12px", background: "var(--surface-muted)", borderRadius: "12px" }}>
                <input
                  value={newBug.title}
                  onChange={(e) => setNewBug(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre du bug"
                  className="input"
                  style={{ flex: 1, minWidth: "150px" }}
                />
                <input
                  value={newBug.description}
                  onChange={(e) => setNewBug(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="input"
                  style={{ flex: 1, minWidth: "120px" }}
                />
                <select
                  value={newBug.priority}
                  onChange={(e) => setNewBug(prev => ({ ...prev, priority: e.target.value }))}
                  className="input"
                  style={{ width: "auto", minWidth: "100px" }}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
                <input
                  value={newBug.assignee}
                  onChange={(e) => setNewBug(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="Assigné à..."
                  className="input"
                  style={{ flex: 1, minWidth: "100px" }}
                />
                <button onClick={addBug} className="btn-primary" style={{ padding: "8px 16px" }}>
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {/* Liste des bugs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "350px", overflowY: "auto" }} className="scrollbar-custom">
                {data.bugs.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "13px", color: "var(--ink-subtle)", padding: "16px 0" }}>
                    Aucun bug signalé.
                  </p>
                ) : (
                  data.bugs.map(bug => (
                    <div key={bug.id} className="test-case-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span className={`status-dot ${bug.status === "resolved" || bug.status === "closed" ? "status-dot-passed" : bug.status === "in-progress" ? "status-dot-in-progress" : "status-dot-todo"}`} />
                        <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
                          {bug.title}
                        </span>
                        <span className={`priority-tag priority-${bug.priority}`}>
                          {bug.priority}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--ink-subtle)" }}>
                          {bug.assignee}
                        </span>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                          <select
                            value={bug.status}
                            onChange={(e) => updateBugStatus(bug.id, e.target.value as any)}
                            className="input"
                            style={{ width: "auto", fontSize: "11px", padding: "4px 8px" }}
                          >
                            <option value="open">Ouvert</option>
                            <option value="in-progress">En cours</option>
                            <option value="resolved">Résolu</option>
                            <option value="closed">Fermé</option>
                          </select>
                          <button
                            onClick={() => deleteBug(bug.id)}
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
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ---- ONGLET QUALITÉ ---- */}
          {activeTab === "quality" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 size={18} style={{ color: "var(--brand)" }} />
                Indicateurs de qualité
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {([
                  { key: "testCoverage", label: "Couverture des tests", threshold: 70 },
                  { key: "performanceScore", label: "Performance", threshold: 70 },
                  { key: "accessibilityScore", label: "Accessibilité", threshold: 80 },
                  { key: "securityScore", label: "Sécurité", threshold: 80 },
                ] as const).map(metric => (
                  <div key={metric.key} className="test-case-card" style={{ textAlign: "center", padding: "20px" }}>
                    <label htmlFor={`metric-${metric.key}`} style={{ fontSize: "11px", color: "var(--ink-subtle)", display: "block" }}>
                      {metric.label} (%)
                    </label>
                    <input
                      id={`metric-${metric.key}`}
                      type="number"
                      min={0}
                      max={100}
                      value={data[metric.key]}
                      onChange={(e) => {
                        const value = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setData(prev => ({ ...prev, [metric.key]: value }));
                      }}
                      className="input"
                      style={{
                        fontSize: "24px", fontWeight: 700, textAlign: "center", padding: "6px", margin: "6px auto 0", maxWidth: "120px",
                        color: data[metric.key] >= metric.threshold ? "var(--success)" : "var(--warning)",
                      }}
                    />
                    <div className="progress-ring-bg" style={{ marginTop: "10px" }}>
                      <div className="progress-ring-fill" style={{ width: `${data[metric.key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ===== BRAINSTORMING ===== */}
        <motion.div className="card-glass fade-in-up delay-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageCircle size={18} style={{ color: "var(--brand)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Notes de test
              </h3>
              <span style={{ fontSize: "11px", color: "var(--ink-subtle)", fontWeight: 400 }}>
                ({data.brainstorming.length} notes)
              </span>
            </div>
            <button
              onClick={() => {
                const note = prompt("Ajouter une note de test :");
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
                Notez vos réflexions sur les tests à effectuer.
              </p>
            ) : (
              data.brainstorming.map((note, i) => (
                <div key={i} className="test-case-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
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

        {/* ===== CONSEILS IA ===== */}
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
                      { id: Date.now(), category: "suggestion", content: "Pensez à tester les cas limites (ex: données vides, fichiers volumineux)." },
                      { id: Date.now()+1, category: "feedback", content: "Les tests utilisateurs sont essentiels pour valider l'expérience utilisateur." },
                      { id: Date.now()+2, category: "question", content: "Avez-vous testé la compatibilité avec différents navigateurs ?" },
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

    </div>
  );
}