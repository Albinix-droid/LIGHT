// app/onboarding/questionnaire/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Brain,
  Target,
  Users,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Sparkles,
  ChevronRight,
  BarChart3,
  Rocket,
  Clock,
  Award,
} from "lucide-react";

// ============================================================
// DONNÉES DU QUESTIONNAIRE
// ============================================================
const QUESTIONS = [
  {
    id: 1,
    icon: GraduationCap,
    question: "Quel est ton statut actuel ?",
    options: [
      { value: "etudiant", label: " Étudiant" },
      { value: "entrepreneur", label: " Entrepreneur" },
      { value: "porteur-projet", label: " Porteur de projet" },
      { value: "professionnel", label: "Professionnel en activité" },
    ],
  },
  {
    id: 2,
    icon: Target,
    question: "Quel est ton objectif principal ?",
    options: [
      { value: "creer-entreprise", label: "🏢 Créer mon entreprise" },
      { value: "developper-projet", label: "📈 Développer un projet existant" },
      { value: "trouver-idee", label: "💭 Trouver une idée" },
      { value: "lever-fonds", label: "💰 Lever des fonds" },
    ],
  },
  {
    id: 3,
    icon: Briefcase,
    question: "Dans quel secteur souhaites-tu entreprendre ?",
    options: [
      { value: "tech", label: "💻 Technologie / Digital" },
      { value: "commerce", label: "🛍️ Commerce / E-commerce" },
      { value: "agriculture", label: "🌾 Agriculture / Agroalimentaire" },
      { value: "services", label: "🤝 Services / Conseil" },
      { value: "sante", label: "🏥 Santé / Bien-être" },
      { value: "education", label: "📚 Éducation / Formation" },
    ],
  },
  {
    id: 4,
    icon: Users,
    question: "Comment envisages-tu de travailler ?",
    options: [
      { value: "seul", label: "🧑‍💻 Seul(e)" },
      { value: "equipe", label: "👥 En équipe" },
      { value: "collaboration", label: "🤝 En collaboration avec d'autres" },
      { value: "incubateur", label: "🏢 En incubateur / Accélérateur" },
    ],
  },
  {
    id: 5,
    icon: Rocket,
    question: "Quelle est ta priorité à court terme ?",
    options: [
      { value: "validation", label: "✅ Valider mon idée" },
      { value: "financement", label: "💰 Trouver du financement" },
      { value: "reseau", label: "🌐 Développer mon réseau" },
      { value: "prototype", label: "⚙️ Créer un prototype" },
    ],
  },
  {
    id: 6,
    icon: BarChart3,
    question: "Quelle est ton expérience en entrepreneuriat ?",
    options: [
      { value: "debutant", label: "🌟 Débutant(e) (aucune expérience)" },
      { value: "confirme", label: "📊 Confirmé(e) (1-3 ans)" },
      { value: "expert", label: "🏆 Expert(e) (3+ ans)" },
    ],
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentQuestion = QUESTIONS[currentStep];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;
  const isLastQuestion = currentStep === totalQuestions - 1;

  // ✅ Vérifier si la question actuelle a une réponse
  const hasAnswered = answers[currentQuestion?.id] !== undefined;

  const handleSelect = (value: string) => {
    console.log("Sélection :", value);
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [currentQuestion.id]: value,
      };
      console.log("Nouvelles réponses :", newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Sauvegarder les réponses (à connecter avec Firebase plus tard)
      console.log("Réponses finales :", answers);
      setIsComplete(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getOptionEmoji = (label: string) => {
    const emojis: Record<string, string> = {
      "🎓 Étudiant": "🎓",
      "🚀 Entrepreneur": "🚀",
      "💡 Porteur de projet": "💡",
      "👔 Professionnel en activité": "👔",
      "🏢 Créer mon entreprise": "🏢",
      "📈 Développer un projet existant": "📈",
      "💭 Trouver une idée": "💭",
      "💰 Lever des fonds": "💰",
      "💻 Technologie / Digital": "💻",
      "🛍️ Commerce / E-commerce": "🛍️",
      "🌾 Agriculture / Agroalimentaire": "🌾",
      "🤝 Services / Conseil": "🤝",
      "🏥 Santé / Bien-être": "🏥",
      "📚 Éducation / Formation": "📚",
      "🧑‍💻 Seul(e)": "🧑‍💻",
      "👥 En équipe": "👥",
      "🤝 En collaboration avec d'autres": "🤝",
      "🏢 En incubateur / Accélérateur": "🏢",
      "✅ Valider mon idée": "✅",
      "💰 Trouver du financement": "💰",
      "🌐 Développer mon réseau": "🌐",
      "⚙️ Créer un prototype": "⚙️",
      "🌟 Débutant(e) (aucune expérience)": "🌟",
      "📊 Confirmé(e) (1-3 ans)": "📊",
      "🏆 Expert(e) (3+ ans)": "🏆",
    };
    return emojis[label] || "📌";
  };

  // ✅ Écran de fin
  if (isComplete) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
              opacity: 0.08,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, rgba(26,10,46,0.6) 0%, rgba(0,0,0,0.85) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: "500px",
            padding: "40px 24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 40px rgba(16, 185, 129, 0.2)",
            }}
          >
            <CheckCircle size={40} style={{ color: "#FFFFFF" }} />
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
            Questionnaire terminé ! 🎉
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7" }}>
            Merci ! Nous avons personnalisé ton dashboard en fonction de tes réponses.
            <br />
            <span style={{ color: "#F4D03F" }}>Prêt à démarrer l'aventure ?</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ===== FOND ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.08,
            transform: `translateY(${scrollY * 0.05}px) scale(1.08)`,
            transition: "transform 0.05s ease-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(195, 183, 108, 0.6) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(24, 2, 51, 0.81), transparent 70%)",
            top: "-150px",
            right: "-100px",
            animation: "floatBg 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.03), transparent 70%)",
            bottom: "-80px",
            left: "-60px",
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

        .fade-in-up {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }

        .option-item {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 2px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          font-weight: 500;
          width: 100%;
          background: transparent;
          font-family: "'Inter', sans-serif";
        }

        .option-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .option-item.selected {
          background: rgba(201, 162, 0, 0.12);
          border-color: #C9A200;
          color: #FFFFFF;
          box-shadow: 0 0 30px rgba(201, 162, 0, 0.05);
        }

        .option-item .emoji {
          font-size: 20px;
          flex-shrink: 0;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #C9A200, #F4D03F);
          color: #1A1A2E;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 24px rgba(201, 162, 0, 0.2);
          font-family: "'Inter', sans-serif";
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 48px rgba(201, 162, 0, 0.35);
        }

        .btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.5);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          font-family: "'Inter', sans-serif";
        }

        .btn-secondary:hover {
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        .btn-secondary:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #C9A200, #F4D03F);
          border-radius: 4px;
          transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 20px rgba(201, 162, 0, 0.15);
        }

        .badge-step {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 14px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 50px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
      `}</style>

      {/* ============================================================
          CONTENU
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto", padding: "32px 24px" }}>
        {/* ===== PROGRESSION ===== */}
        <div className="fade-in-up" style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span className="badge-step">
              <Sparkles size={12} style={{ color: "#F4D03F" }} />
              Question {currentStep + 1}/{totalQuestions}
            </span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* ===== QUESTION ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(201, 162, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <currentQuestion.icon size={24} style={{ color: "#F4D03F" }} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#FFFFFF", margin: 0, lineHeight: "1.3" }}>
              {currentQuestion.question}
            </h2>
          </div>
        </div>

        {/* ===== OPTIONS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.value;
            const emoji = getOptionEmoji(option.label);
            return (
              <button
                key={option.value}
                className={`option-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="emoji">{emoji}</span>
                <span>{option.label}</span>
                {isSelected && (
                  <CheckCircle size={18} style={{ color: "#F4D03F", marginLeft: "auto", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="fade-in-up delay-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handlePrevious}
            className="btn-secondary"
            disabled={currentStep === 0}
          >
            <ArrowLeft size={18} />
            Précédent
          </button>

          <button
            onClick={handleNext}
            className="btn-primary"
            disabled={!hasAnswered}
          >
            {isLastQuestion ? "Terminer" : "Suivant"}
            <ChevronRight size={18} />
          </button>
        </div>

        {/* ===== INDICATEUR ===== */}
        <div className="fade-in-up delay-4" style={{ marginTop: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(234, 222, 5, 0.8)", margin: 0 }}>
            {hasAnswered ? "✅ Réponse enregistrée" : "Choisis une option pour continuer"}
          </p>
        </div>
      </div>
    </div>
  );
}