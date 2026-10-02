// app/dashboard/projets/[id]/StepStatusBanner.tsx
// SUIVI ENCADRANT CÔTÉ ÉTUDIANT : statut de l'étape, retour de l'encadrant, message de soumission

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Compass, MessageSquare, UserPlus } from "lucide-react";
import StarsBase from "@/components/ui/Stars";
import { cx, textareaClass } from "@/components/ui/kit";

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
  return <StarsBase rating={rating} size={size} />;
}

const TONES = {
  info: { box: "bg-brand-soft ring-brand/15", title: "text-brand-ink", tile: "bg-brand text-white", quote: "border-brand/40" },
  pending: { box: "bg-warning-soft ring-warning/20", title: "text-warning", tile: "bg-warning text-white", quote: "border-warning/50" },
  warning: { box: "bg-danger-soft ring-danger/20", title: "text-danger", tile: "bg-danger text-white", quote: "border-danger/50" },
  success: { box: "bg-success-soft ring-success/20", title: "text-success", tile: "bg-success text-white", quote: "border-success/50" },
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
  const chooseLink = (
    <Link href={`/dashboard/projets/${projectId}`} className="font-semibold text-brand hover:text-brand-strong">
      Choisir mon encadrant →
    </Link>
  );

  if (locked && status !== "COMPLETED" && status !== "SUBMITTED") {
    tone = "info";
    Icon = Compass;
    title = "Étape à venir : vous pouvez la préparer dès maintenant";
    body = (
      <p>
        Remplissez et sauvegardez librement. Vous pourrez la soumettre
        {supervisorName ? ` à ${supervisorName}` : " à votre encadrant"} dès que l&apos;étape {previousStageLabel ?? "précédente"} aura été validée.
        {!supervisorName && <> {chooseLink}</>}
      </p>
    );
  } else if (!supervisorName && status !== "COMPLETED") {
    tone = "info";
    Icon = UserPlus;
    title = "Aucun encadrant n'est encore associé à ce projet";
    body = <p>Les étapes sont validées par votre encadrant. {chooseLink}</p>;
  } else if (status === "SUBMITTED") {
    tone = "pending";
    title = `Soumise${review ? ` le ${formatDate(review.submittedAt)}` : ""} · en attente de la décision de ${supervisorName}`;
    body = <p>Vous pouvez continuer à travailler : votre encadrant examine la version soumise.</p>;
  } else if (status === "CHANGES_REQUESTED") {
    tone = "warning";
    Icon = AlertTriangle;
    title = `${review?.reviewerName ?? supervisorName} demande des modifications`;
  } else if (status === "COMPLETED") {
    tone = "success";
    Icon = CheckCircle2;
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
    <div role="status" className={cx("mt-4 flex gap-3.5 rounded-2xl px-4 py-4 text-[13px] leading-relaxed ring-1 ring-inset", t.box)}>
      <span className={cx("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", t.tile)}>
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1 text-ink-muted">
        <div className={cx("flex flex-wrap items-center gap-2 font-semibold", t.title)}>
          <span>{title}</span>
          {showFeedback && review?.rating ? <Stars rating={review.rating} /> : null}
        </div>
        {body && <div className="mt-0.5">{body}</div>}
        {showFeedback && (
          <blockquote className={cx("mt-2.5 rounded-r-xl border-l-[3px] bg-surface/70 px-4 py-2.5 whitespace-pre-wrap text-ink", t.quote)}>
            {review!.feedback}
          </blockquote>
        )}
        {status === "CHANGES_REQUESTED" && <p className="mt-2">Apportez les corrections demandées puis soumettez à nouveau l&apos;étape.</p>}
      </div>
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
    <div className="mb-4">
      <label htmlFor="submission-note" className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
        <MessageSquare className="size-3.5 text-brand" strokeWidth={2} />
        Message pour {supervisorName ?? "votre encadrant"} <span className="font-normal text-ink-subtle">(facultatif)</span>
      </label>
      <textarea
        id="submission-note"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
        placeholder="Points sur lesquels vous souhaitez un avis, difficultés rencontrées, changements depuis la dernière version…"
        className={cx(textareaClass, "min-h-[90px] text-[13.5px]")}
      />
    </div>
  );
}
