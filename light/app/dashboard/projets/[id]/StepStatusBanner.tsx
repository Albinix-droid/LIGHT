// app/dashboard/projets/[id]/StepStatusBanner.tsx
// SUIVI ENCADRANT CÔTÉ ÉTUDIANT : statut de l'étape, retour de l'encadrant, message de soumission

import Link from "next/link";
import { Clock, CheckCircle, AlertTriangle, UserPlus, Star, MessageSquare, Compass } from "lucide-react";

export type StepStatusKey = "IN_PROGRESS" | "SUBMITTED" | "CHANGES_REQUESTED" | "COMPLETED";

export interface StepReviewInfo {
  submittedAt: string;
  note: string | null;
  decision: "APPROVED" | "CHANGES_REQUESTED" | null;
  feedback: string | null;
  rating: number | null;
  reviewedAt: string | null;
  reviewerName: string | null;
}

// Fuseau fixe : même rendu côté serveur et navigateur
const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }} aria-label={`Note : ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} style={{ color: "#F5D76E", fill: s <= rating ? "#F5D76E" : "transparent" }} />
      ))}
    </span>
  );
}

const TONES = {
  info: { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.22)", color: "#A5B4FC" },
  pending: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", color: "#F5B544" },
  warning: { bg: "rgba(228,115,107,0.08)", border: "rgba(228,115,107,0.28)", color: "#F0928B" },
  success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", color: "#34D399" },
};

export default function StepStatusBanner({
  projectId,
  status,
  supervisorName,
  review,
  locked = false,
  previousStageLabel = null,
}: {
  projectId: string;
  status: StepStatusKey;
  supervisorName: string | null;
  review: StepReviewInfo | null;
  locked?: boolean;
  previousStageLabel?: string | null;
}) {
  let tone: keyof typeof TONES;
  let Icon = Clock;
  let title: string;
  let body: React.ReactNode = null;

  if (locked && status !== "COMPLETED" && status !== "SUBMITTED") {
    tone = "info";
    Icon = Compass;
    title = "Étape à venir : vous pouvez la préparer dès maintenant";
    body = (
      <p style={{ margin: "4px 0 0" }}>
        Remplissez et sauvegardez librement. Vous pourrez la soumettre
        {supervisorName ? ` à ${supervisorName}` : " à votre encadrant"} dès que l&apos;étape {previousStageLabel ?? "précédente"} aura été validée.
        {!supervisorName && (
          <>
            {" "}
            <Link href={`/dashboard/projets/${projectId}`} style={{ color: "#F5D76E", fontWeight: 600 }}>
              Choisir mon encadrant →
            </Link>
          </>
        )}
      </p>
    );
  } else if (!supervisorName && status !== "COMPLETED") {
    tone = "info";
    Icon = UserPlus;
    title = "Aucun encadrant n'est encore associé à ce projet";
    body = (
      <p style={{ margin: "4px 0 0" }}>
        Les étapes sont validées par votre encadrant.{" "}
        <Link href={`/dashboard/projets/${projectId}`} style={{ color: "#F5D76E", fontWeight: 600 }}>
          Choisir mon encadrant →
        </Link>
      </p>
    );
  } else if (status === "SUBMITTED") {
    tone = "pending";
    title = `Soumise${review ? ` le ${formatDate(review.submittedAt)}` : ""} · en attente de la décision de ${supervisorName}`;
    body = (
      <p style={{ margin: "4px 0 0", opacity: 0.85 }}>
        Vous pouvez continuer à travailler : votre encadrant examine la version soumise.
      </p>
    );
  } else if (status === "CHANGES_REQUESTED") {
    tone = "warning";
    Icon = AlertTriangle;
    title = `${review?.reviewerName ?? supervisorName} demande des modifications`;
  } else if (status === "COMPLETED") {
    tone = "success";
    Icon = CheckCircle;
    title = review?.decision === "APPROVED" && review.reviewerName
      ? `Étape validée par ${review.reviewerName}${review.reviewedAt ? ` le ${formatDate(review.reviewedAt)}` : ""}`
      : "Étape validée";
  } else {
    // En cours, encadrant choisi : rien d'urgent à signaler
    return null;
  }

  const t = TONES[tone];
  const showFeedback = review?.feedback && (status === "CHANGES_REQUESTED" || status === "COMPLETED");

  return (
    <div
      role="status"
      style={{
        marginTop: "14px",
        padding: "14px 18px",
        borderRadius: "14px",
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        fontSize: "13px",
        lineHeight: 1.55,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, flexWrap: "wrap" }}>
        <Icon size={16} />
        <span>{title}</span>
        {showFeedback && review?.rating ? <Stars rating={review.rating} /> : null}
      </div>
      {body}
      {showFeedback && (
        <blockquote
          style={{
            margin: "10px 0 0",
            padding: "10px 14px",
            borderLeft: `3px solid ${t.border}`,
            background: "rgba(255,255,255,0.03)",
            borderRadius: "0 10px 10px 0",
            color: "rgba(232,237,245,0.85)",
            whiteSpace: "pre-wrap",
          }}
        >
          {review!.feedback}
        </blockquote>
      )}
      {status === "CHANGES_REQUESTED" && (
        <p style={{ margin: "8px 0 0", opacity: 0.85 }}>
          Apportez les corrections demandées puis soumettez à nouveau l&apos;étape.
        </p>
      )}
    </div>
  );
}

// Message facultatif joint à la soumission
export function SubmissionNote({
  value,
  onChange,
  supervisorName,
}: {
  value: string;
  onChange: (v: string) => void;
  supervisorName: string | null;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label
        htmlFor="submission-note"
        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(200,215,235,0.5)", marginBottom: "6px", fontWeight: 500 }}
      >
        <MessageSquare size={13} />
        Message pour {supervisorName ?? "votre encadrant"} (facultatif)
      </label>
      <textarea
        id="submission-note"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
        placeholder="Points sur lesquels vous souhaitez un avis, difficultés rencontrées, changements depuis la dernière version…"
        className="input"
        style={{ minHeight: "70px", fontSize: "13px" }}
      />
    </div>
  );
}
