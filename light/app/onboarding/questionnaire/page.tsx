// app/onboarding/questionnaire/page.tsx
// QUESTIONNAIRE DE DÉMARRAGE : 6 questions, une à la fois
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Code2,
  Cog,
  Coins,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  Lightbulb,
  type LucideIcon,
  MessageCircle,
  Rocket,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { buttonClass, Card, cx, ProgressBar } from "@/components/ui/kit";

// ============================================================
// DONNÉES DU QUESTIONNAIRE
// ============================================================
type Option = { value: string; label: string; icon: LucideIcon };

const QUESTIONS: { id: number; icon: LucideIcon; question: string; options: Option[] }[] = [
  {
    id: 1,
    icon: GraduationCap,
    question: "Quel est ton statut actuel ?",
    options: [
      { value: "etudiant", label: "Étudiant", icon: GraduationCap },
      { value: "entrepreneur", label: "Entrepreneur", icon: Rocket },
      { value: "porteur-projet", label: "Porteur de projet", icon: Lightbulb },
      { value: "professionnel", label: "Professionnel en activité", icon: Briefcase },
    ],
  },
  {
    id: 2,
    icon: Target,
    question: "Quel est ton objectif principal ?",
    options: [
      { value: "creer-entreprise", label: "Créer mon entreprise", icon: Building2 },
      { value: "developper-projet", label: "Développer un projet existant", icon: TrendingUp },
      { value: "trouver-idee", label: "Trouver une idée", icon: MessageCircle },
      { value: "lever-fonds", label: "Lever des fonds", icon: Coins },
    ],
  },
  {
    id: 3,
    icon: Briefcase,
    question: "Dans quel secteur souhaites-tu entreprendre ?",
    options: [
      { value: "tech", label: "Technologie / Digital", icon: Code2 },
      { value: "commerce", label: "Commerce / E-commerce", icon: ShoppingBag },
      { value: "agriculture", label: "Agriculture / Agroalimentaire", icon: Sprout },
      { value: "services", label: "Services / Conseil", icon: Handshake },
      { value: "sante", label: "Santé / Bien-être", icon: HeartPulse },
      { value: "education", label: "Éducation / Formation", icon: BookOpen },
    ],
  },
  {
    id: 4,
    icon: Users,
    question: "Comment envisages-tu de travailler ?",
    options: [
      { value: "seul", label: "Seul(e)", icon: User },
      { value: "equipe", label: "En équipe", icon: Users },
      { value: "collaboration", label: "En collaboration avec d'autres", icon: Handshake },
      { value: "incubateur", label: "En incubateur / Accélérateur", icon: Building2 },
    ],
  },
  {
    id: 5,
    icon: Rocket,
    question: "Quelle est ta priorité à court terme ?",
    options: [
      { value: "validation", label: "Valider mon idée", icon: CheckCircle },
      { value: "financement", label: "Trouver du financement", icon: Coins },
      { value: "reseau", label: "Développer mon réseau", icon: Globe },
      { value: "prototype", label: "Créer un prototype", icon: Cog },
    ],
  },
  {
    id: 6,
    icon: BarChart3,
    question: "Quelle est ton expérience en entrepreneuriat ?",
    options: [
      { value: "debutant", label: "Débutant(e) (aucune expérience)", icon: Star },
      { value: "confirme", label: "Confirmé(e) (1-3 ans)", icon: BarChart3 },
      { value: "expert", label: "Expert(e) (3+ ans)", icon: Award },
    ],
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;
  const isLastQuestion = currentStep === totalQuestions - 1;
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  // Redirection vers le tableau de bord après l'écran de fin
  useEffect(() => {
    if (!isComplete) return;
    const timer = setTimeout(() => router.push("/dashboard"), 2500);
    return () => clearTimeout(timer);
  }, [isComplete, router]);

  const handleSelect = (value: string) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

  const handleNext = () => {
    // Les réponses ne sont pas encore enregistrées côté serveur
    if (isLastQuestion) setIsComplete(true);
    else setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  // ===== Écran de fin =====
  if (isComplete) {
    return (
      <Card className="mx-auto mt-10 max-w-lg animate-rise text-center sm:p-10">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CheckCircle className="size-8" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-[26px] font-bold tracking-tight text-ink">Questionnaire terminé !</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          Merci ! Nous avons personnalisé ton dashboard en fonction de tes réponses.
        </p>
        <p className="mt-3 text-[14px] font-semibold text-gold">Prêt à démarrer l&apos;aventure ?</p>
        <ProgressBar value={100} tone="gold" className="mx-auto mt-6 max-w-[160px]" />
      </Card>
    );
  }

  const QuestionIcon = currentQuestion.icon;

  return (
    <div className="mx-auto max-w-[680px]">
      {/* ===== PROGRESSION ===== */}
      <div className="mb-6">
        <div className="mb-2.5 flex items-center justify-between text-[12.5px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink-muted">
            <Sparkles className="size-3.5 text-brand" aria-hidden="true" />
            Question {currentStep + 1}/{totalQuestions}
          </span>
          <span className="text-ink-subtle tabular-nums">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <Card key={currentQuestion.id} className="animate-rise sm:p-8">
        {/* ===== QUESTION ===== */}
        <div className="flex items-center gap-4">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
            <QuestionIcon className="size-[22px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 id="question-title" className="font-display text-[20px] leading-snug font-semibold tracking-tight text-ink sm:text-[23px]">
            {currentQuestion.question}
          </h1>
        </div>

        {/* ===== OPTIONS ===== */}
        <div role="radiogroup" aria-labelledby="question-title" className={cx("mt-6 grid gap-2.5", currentQuestion.options.length > 4 && "sm:grid-cols-2")}>
          {currentQuestion.options.map((option) => {
            const selected = answers[currentQuestion.id] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelect(option.value)}
                className={cx(
                  "flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[14px] font-medium transition-all duration-150",
                  selected ? "border-brand bg-brand-soft text-brand-ink shadow-card" : "border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-muted",
                )}
              >
                <span className={cx("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", selected ? "bg-brand text-white" : "bg-surface-muted text-ink-muted")}>
                  <option.icon className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">{option.label}</span>
                {selected && <CheckCircle className="size-[18px] shrink-0 text-brand" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          <button type="button" onClick={handlePrevious} disabled={currentStep === 0} className={buttonClass("secondary", "lg")}>
            <ArrowLeft /> Précédent
          </button>
          <button type="button" onClick={handleNext} disabled={!hasAnswered} className={buttonClass("primary", "lg", "px-6")}>
            {isLastQuestion ? "Terminer" : "Suivant"} <ChevronRight />
          </button>
        </div>
      </Card>

      <p className="mt-4 text-center text-[12.5px] text-ink-subtle" aria-live="polite">
        {hasAnswered ? "Réponse enregistrée" : "Choisis une option pour continuer"}
      </p>
    </div>
  );
}
