// app/dashboard/projets/[id]/tests/page.tsx
// PAGE DE TESTS - VERSION DYNAMIQUE ET IMMERSIVE

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface TestsData {
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
export default function TestsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const scrollY = useScroll();

  // ===== ÉTATS =====
  const [data, setData] = useState<TestsData>({
    testCases: [
      { id: "1", title: "Connexion utilisateur", description: "Vérifier que l'utilisateur peut se connecter", status: "passed", expectedResult: "Connexion réussie", actualResult: "Connexion réussie", createdAt: "2026-09-01" },
      { id: "2", title: "Inscription utilisateur", description: "Vérifier que l'utilisateur peut s'inscrire", status: "failed", expectedResult: "Inscription réussie", actualResult: "Erreur 500", createdAt: "2026-09-02" },
      { id: "3", title: "Création de projet", description: "Vérifier que l'utilisateur peut créer un projet", status: "in-progress", expectedResult: "Projet créé", actualResult: "", createdAt: "2026-09-03" },
    ],
    userTests: [
      { id: "1", userName: "Marie", rating: 4, feedback: "L'interface est intuitive mais le chargement est lent.", createdAt: "2026-09-04" },
      { id: "2", userName: "Paul", rating: 5, feedback: "Très bonne expérience !", createdAt: "2026-09-05" },
    ],
    bugs: [
      { id: "1", title: "Erreur 500 lors de l'inscription", description: "L'inscription échoue avec une erreur serveur", priority: "critical", status: "in-progress", assignee: "Jean", createdAt: "2026-09-02" },
      { id: "2", title: "Lenteur du chargement des pages", description: "Les pages mettent plus de 5 secondes à charger", priority: "high", status: "open", assignee: "Marie", createdAt: "2026-09-03" },
    ],
    testCoverage: 78,
    performanceScore: 72,
    accessibilityScore: 85,
    securityScore: 90,
    brainstorming: [
      "Tester les cas extrêmes (données vides, fichiers volumineux)",
      "Vérifier la compatibilité navigateurs",
      "Tester la sécurité des API",
    ],
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

  const isComplete = data.testCases.length > 0 && data.testCases.some(t => t.status === "passed") && data.bugs.every(b => b.status === "resolved" || b.status === "closed");

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
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccess("Tests sauvegardés avec succès.");
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!isComplete) {
      setError("Veuillez au moins exécuter des tests et résoudre les bugs critiques.");
      return;
    }
    setIsValidating(true);
    setError("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/dashboard/projets/${projectId}`);
    } catch {
      setError("Erreur lors de la validation.");
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
              "url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
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

        .test-case-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(180, 200, 230, 0.06);
          transition: all 0.3s ease;
        }
        .test-case-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(180, 200, 230, 0.12);
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
        .status-dot-passed { background: #10B981; }
        .status-dot-failed { background: #E4736B; }

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
              Tests
            </h1>
            <span className="badge">
              <Shield size={12} />
              Étape 4/5
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
            <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)" }}>
              Complétude des tests
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
              ? "Tous les tests sont passés et les bugs sont résolus."
              : "Exécutez des tests et résolvez les bugs critiques pour valider cette étape."}
          </p>
        </div>

        {/* ===== ONGLETS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "1px solid rgba(180,200,230,0.06)", paddingBottom: "8px" }}>
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
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Target size={18} style={{ color: "#F5D76E" }} />
                  Cas de test
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
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
                  <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                    Aucun test. Ajoutez des cas de test pour vérifier votre application.
                  </p>
                ) : (
                  data.testCases.map(test => (
                    <div key={test.id} className="test-case-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span className={`status-dot status-dot-${test.status}`} />
                        <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#E8EDF5" }}>
                          {test.title}
                        </span>
                        {test.description && (
                          <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)" }}>
                            {test.description}
                          </span>
                        )}
                        <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)" }}>
                          Attendue: {test.expectedResult}
                        </span>
                        {test.status === "passed" && (
                          <span style={{ fontSize: "11px", color: "#10B981" }}>
                            ✓ {test.actualResult}
                          </span>
                        )}
                        {test.status === "failed" && (
                          <span style={{ fontSize: "11px", color: "#E4736B" }}>
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

          {/* ---- ONGLET TESTS UTILISATEURS ---- */}
          {activeTab === "user" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} style={{ color: "#F5D76E" }} />
                Retours utilisateurs
                <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
                  ({data.userTests.length} retours)
                </span>
              </h3>

              {/* Ajout de retour */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
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
                  <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                    Aucun retour utilisateur. Faites tester votre projet par des utilisateurs.
                  </p>
                ) : (
                  data.userTests.map(test => (
                    <div key={test.id} className="test-case-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#E8EDF5" }}>
                          {test.userName}
                        </span>
                        <span style={{ display: "flex", gap: "2px", color: "#F5D76E" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < test.rating ? "#F5D76E" : "none"} style={{ color: "#F5D76E" }} />
                          ))}
                        </span>
                        <span style={{ fontSize: "13px", color: "rgba(200,215,235,0.6)" }}>
                          "{test.feedback}"
                        </span>
                        <span style={{ fontSize: "10px", color: "rgba(200,215,235,0.2)", marginLeft: "auto" }}>
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => deleteUserTest(test.id)}
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
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bug size={18} style={{ color: "#F5D76E" }} />
                  Bugs
                  <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
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
                  <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                    Aucun bug signalé.
                  </p>
                ) : (
                  data.bugs.map(bug => (
                    <div key={bug.id} className="test-case-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span className={`status-dot ${bug.status === "resolved" || bug.status === "closed" ? "status-dot-passed" : bug.status === "in-progress" ? "status-dot-in-progress" : "status-dot-todo"}`} />
                        <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "#E8EDF5" }}>
                          {bug.title}
                        </span>
                        <span className={`priority-tag priority-${bug.priority}`}>
                          {bug.priority}
                        </span>
                        <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)" }}>
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

          {/* ---- ONGLET QUALITÉ ---- */}
          {activeTab === "quality" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass"
              style={{ padding: "24px" }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 size={18} style={{ color: "#F5D76E" }} />
                Indicateurs de qualité
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="test-case-card" style={{ textAlign: "center", padding: "20px" }}>
                  <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)" }}>Couverture des tests</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: data.testCoverage >= 70 ? "#10B981" : "#F59E0B" }}>
                    {data.testCoverage}%
                  </p>
                  <div className="progress-bar-bg" style={{ marginTop: "8px" }}>
                    <div className="progress-bar-fill" style={{ width: `${data.testCoverage}%` }} />
                  </div>
                </div>

                <div className="test-case-card" style={{ textAlign: "center", padding: "20px" }}>
                  <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)" }}>Performance</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: data.performanceScore >= 70 ? "#10B981" : "#F59E0B" }}>
                    {data.performanceScore}%
                  </p>
                  <div className="progress-bar-bg" style={{ marginTop: "8px" }}>
                    <div className="progress-bar-fill" style={{ width: `${data.performanceScore}%` }} />
                  </div>
                </div>

                <div className="test-case-card" style={{ textAlign: "center", padding: "20px" }}>
                  <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)" }}>Accessibilité</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: data.accessibilityScore >= 80 ? "#10B981" : "#F59E0B" }}>
                    {data.accessibilityScore}%
                  </p>
                  <div className="progress-bar-bg" style={{ marginTop: "8px" }}>
                    <div className="progress-bar-fill" style={{ width: `${data.accessibilityScore}%` }} />
                  </div>
                </div>

                <div className="test-case-card" style={{ textAlign: "center", padding: "20px" }}>
                  <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)" }}>Sécurité</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: data.securityScore >= 80 ? "#10B981" : "#F59E0B" }}>
                    {data.securityScore}%
                  </p>
                  <div className="progress-bar-bg" style={{ marginTop: "8px" }}>
                    <div className="progress-bar-fill" style={{ width: `${data.securityScore}%` }} />
                  </div>
                </div>
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
                Notes de test
              </h3>
              <span style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)", fontWeight: 400 }}>
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
              <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.25)", padding: "16px 0" }}>
                Notez vos réflexions sur les tests à effectuer.
              </p>
            ) : (
              data.brainstorming.map((note, i) => (
                <div key={i} className="test-case-card">
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
              disabled={isValidating || !isComplete}
              className={isComplete ? "btn-success" : "btn-secondary"}
              style={{ padding: "10px 24px" }}
            >
              {isValidating ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Rocket size={16} />
              )}
              {isValidating ? "Validation..." : "Valider l'étape"}
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