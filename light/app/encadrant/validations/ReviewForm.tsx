// app/encadrant/validations/ReviewForm.tsx
// DÉCISION DE L'ENCADRANT : retour écrit, note, approbation ou demande de modifications

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, ThumbsUp, RotateCcw, Send, Loader2, AlertCircle } from "lucide-react";
import { reviewSubmission } from "../actions";
import { MIN_FEEDBACK_LENGTH } from "@/lib/parcours";

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

  const decisionButton = (value: Decision, label: string, hint: string, Icon: typeof ThumbsUp, color: string, bg: string) => {
    const active = decision === value;
    return (
      <button
        type="button"
        onClick={() => setDecision(value)}
        aria-pressed={active}
        style={{
          flex: 1, minWidth: "180px", textAlign: "left", padding: "14px 16px", borderRadius: "14px", cursor: "pointer",
          border: `1.5px solid ${active ? color : "rgba(180,200,230,0.12)"}`,
          background: active ? bg : "rgba(255,255,255,0.03)", color: active ? color : "rgba(200,215,235,0.7)",
          transition: "all 0.2s ease", fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700 }}>
          <Icon size={17} /> {label}
        </span>
        <span style={{ display: "block", fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>{hint}</span>
      </button>
    );
  };

  return (
    <div className="enc-card" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
      <h3 className="enc-h2" style={{ marginBottom: "16px" }}>Votre décision</h3>

      {/* Décision */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "18px" }}>
        {decisionButton(
          "APPROVED", "Valider l'étape",
          isLastStage ? "Le projet est concrétisé : fin du parcours." : `${stageLabel} est validée, l'étape suivante se débloque.`,
          ThumbsUp, "#34D399", "rgba(16,185,129,0.1)",
        )}
        {decisionButton(
          "CHANGES_REQUESTED", "Demander des modifications",
          "L'étudiant corrige puis soumet à nouveau.",
          RotateCcw, "#F5B544", "rgba(245,158,11,0.1)",
        )}
      </div>

      {/* Retour écrit */}
      <label htmlFor="review-feedback" style={{ display: "block", fontSize: "13px", color: "rgba(200,215,235,0.6)", marginBottom: "6px", fontWeight: 500 }}>
        Retour à l&apos;étudiant <span style={{ color: "#E4736B" }}>*</span>
      </label>
      <textarea
        id="review-feedback"
        className="enc-input"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        maxLength={4000}
        placeholder={
          decision === "CHANGES_REQUESTED"
            ? "Indiquez précisément ce qui doit être revu, et pourquoi. Commencez par ce qui fonctionne bien."
            : "Soulignez les points forts et donnez des pistes pour la suite."
        }
        style={{ minHeight: "130px", resize: "vertical", lineHeight: 1.6 }}
      />
      <p style={{ fontSize: "11px", margin: "4px 0 16px", textAlign: "right", color: feedbackOk ? "rgba(52,211,153,0.8)" : "rgba(200,215,235,0.35)" }}>
        {feedback.trim().length} / {MIN_FEEDBACK_LENGTH} caractères minimum
      </p>

      {/* Note */}
      <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.6)", margin: "0 0 6px", fontWeight: 500 }}>
        Appréciation <span style={{ color: "#E4736B" }}>*</span>
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "2px", marginBottom: "20px" }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer" }}
          >
            <Star size={24} style={{ color: "#F5D76E", fill: (hover || rating) >= s ? "#F5D76E" : "transparent", transition: "fill 0.15s ease" }} />
          </button>
        ))}
        {rating > 0 && <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.5)", marginLeft: "8px" }}>{rating}/5</span>}
      </div>

      {error && (
        <p role="alert" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F0928B", fontSize: "13px", margin: "0 0 12px" }}>
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <button className="enc-btn enc-btn-primary" onClick={submit} disabled={!canSubmit} style={{ width: "100%", padding: "13px" }}>
        {isPending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
        {isPending ? "Envoi…" : "Envoyer la décision à l'étudiant"}
      </button>
      {!canSubmit && !isPending && (
        <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.35)", textAlign: "center", margin: "8px 0 0" }}>
          Choisissez une décision, rédigez un retour et attribuez une note.
        </p>
      )}
    </div>
  );
}
