// app/encadrant/validations/ReviewForm.tsx
// DÉCISION DE L'ENCADRANT : retour écrit, note, approbation ou demande de modifications

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, ThumbsUp, RotateCcw, Send, Loader2, AlertCircle } from "lucide-react";
import { reviewSubmission } from "../actions";
import { MIN_FEEDBACK_LENGTH } from "@/lib/parcours";
import { Alert, Card, CardHeader, buttonClass, cx, textareaClass } from "@/components/ui/kit";

type Decision = "APPROVED" | "CHANGES_REQUESTED";

export default function ReviewForm({ submissionId, stageLabel, isLastStage }: { submissionId: string; stageLabel: string; isLastStage: boolean }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const feedbackOk = feedback.trim().length >= MIN_FEEDBACK_LENGTH;
  const canSubmit = decision !== null && feedbackOk && rating > 0 && !isPending;

  const submit = () => {
    if (!canSubmit || !decision) return;
    setError("");
    startTransition(async () => {
      const result = await reviewSubmission({ submissionId, decision, feedback, rating });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/encadrant/validations");
      router.refresh();
    });
  };

  const decisionButton = (value: Decision, label: string, hint: string, Icon: typeof ThumbsUp, tone: "success" | "warning") => {
    const active = decision === value;
    return (
      <button
        type="button"
        onClick={() => setDecision(value)}
        aria-pressed={active}
        className={cx(
          "min-w-[200px] flex-1 rounded-2xl border-[1.5px] p-4 text-left transition-all duration-150",
          active
            ? tone === "success"
              ? "border-success bg-success-soft text-success"
              : "border-warning bg-warning-soft text-warning"
            : "border-line bg-surface text-ink hover:border-line-strong",
        )}
      >
        <span className="flex items-center gap-2 text-[14px] font-semibold">
          <Icon className="size-[18px]" strokeWidth={1.9} /> {label}
        </span>
        <span className={cx("mt-1 block text-[12.5px] leading-snug", active ? "opacity-90" : "text-ink-muted")}>{hint}</span>
      </button>
    );
  };

  return (
    <Card className="ring-1 ring-gold/25">
      <CardHeader title="Votre décision" description="Votre retour est envoyé à toute l'équipe du projet." />

      <div className="mb-6 flex flex-wrap gap-3">
        {decisionButton(
          "APPROVED", "Valider l'étape",
          isLastStage ? "Le projet est concrétisé : fin du parcours." : `${stageLabel} est validée, l'étape suivante se débloque.`,
          ThumbsUp, "success",
        )}
        {decisionButton("CHANGES_REQUESTED", "Demander des modifications", "L'étudiant corrige puis soumet à nouveau.", RotateCcw, "warning")}
      </div>

      <label htmlFor="review-feedback" className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-ink">
        Retour à l&apos;étudiant <span className="text-danger">*</span>
      </label>
      <textarea
        id="review-feedback"
        className={cx(textareaClass, "min-h-[150px]")}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        maxLength={4000}
        placeholder={
          decision === "CHANGES_REQUESTED"
            ? "Indiquez précisément ce qui doit être revu, et pourquoi. Commencez par ce qui fonctionne bien."
            : "Soulignez les points forts et donnez des pistes pour la suite."
        }
      />
      <p className={cx("mt-1.5 text-right text-[11.5px] tabular-nums", feedbackOk ? "text-success" : "text-ink-subtle")}>
        {feedback.trim().length} / {MIN_FEEDBACK_LENGTH} caractères minimum
      </p>

      <p className="mt-4 mb-1.5 text-[13px] font-semibold text-ink">
        Appréciation <span className="text-danger">*</span>
      </p>
      <div className="mb-6 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
            aria-pressed={rating === s}
            className="rounded-lg p-1 transition-transform hover:scale-110"
          >
            <Star className={cx("size-7 transition-colors", (hover || rating) >= s ? "fill-brand text-brand" : "text-line-strong")} strokeWidth={1.5} />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-[13px] font-medium text-ink-muted tabular-nums">{rating}/5</span>}
      </div>

      {error && <Alert tone="danger" icon={AlertCircle} className="mb-4">{error}</Alert>}

      <button className={buttonClass("primary", "lg", "w-full")} onClick={submit} disabled={!canSubmit}>
        {isPending ? <Loader2 className="animate-spin" /> : <Send />}
        {isPending ? "Envoi…" : "Envoyer la décision à l'étudiant"}
      </button>
      {!canSubmit && !isPending && (
        <p className="mt-2.5 text-center text-[12px] text-ink-subtle">Choisissez une décision, rédigez un retour et attribuez une note.</p>
      )}
    </Card>
  );
}
