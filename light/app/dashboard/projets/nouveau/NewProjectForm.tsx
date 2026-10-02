// app/dashboard/projets/nouveau/NewProjectForm.tsx
// CRÉATION D'UN PROJET : titre, secteur, description, équipe, encadrant

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Code, GraduationCap, Lightbulb, Loader2, Minus, PenTool, Plus, Rocket, Send, Shield, XCircle } from "lucide-react";
import { createProject } from "../actions";
import ProjectCover from "@/components/ui/ProjectCover";
import { Alert, Card, Field, PageHeader, buttonClass, cx, inputClass, selectClass, textareaClass } from "@/components/ui/kit";
import { MIN_DESCRIPTION_LENGTH, STAGES } from "@/lib/parcours";

const SECTORS = [
  { value: "tech", label: "Tech & Digital" },
  { value: "agriculture", label: "Agriculture" },
  { value: "commerce", label: "Commerce" },
  { value: "services", label: "Services" },
  { value: "health", label: "Santé" },
  { value: "education", label: "Éducation" },
  { value: "finance", label: "Finance" },
  { value: "autre", label: "Autre" },
];

const STAGE_ICONS = [Lightbulb, PenTool, Code, Shield, Rocket];
const MAX_DESCRIPTION = 2000;

export default function NewProjectForm({ encadrants }: { encadrants: { id: string; name: string }[] }) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [supervisorId, setSupervisorId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [sectorError, setSectorError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setTitleError("");
    setSectorError("");
    setDescriptionError("");

    let hasError = false;
    if (!title.trim()) {
      setTitleError("Le titre est requis");
      hasError = true;
    } else if (title.trim().length < 3) {
      setTitleError("Le titre doit contenir au moins 3 caractères");
      hasError = true;
    }
    if (!sector) {
      setSectorError("Veuillez sélectionner un secteur");
      hasError = true;
    }
    if (!description.trim()) {
      setDescriptionError("La description est requise");
      hasError = true;
    } else if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      setDescriptionError(`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`);
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);
    try {
      const result = await createProject({ title, sector, description, teamSize, supervisorId });
      if (!result.ok) throw new Error(result.error);
      setSuccess(true);
      setIsLoading(false);
      // Démarrer directement la première étape du parcours
      setTimeout(() => router.push(`/dashboard/projets/${result.projectId}/idealisation`), 1500);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const descriptionLength = description.trim().length;

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        back={{ href: "/dashboard/projets", label: "Mes projets" }}
        eyebrow="Nouveau projet"
        title="Donnez vie à votre idée"
        description="Quelques informations suffisent pour démarrer. Vous approfondirez chaque aspect au fil des cinq étapes du parcours."
      />

      {success ? (
        <Card className="mx-auto max-w-xl text-center animate-rise">
          <span className="mx-auto inline-flex size-16 items-center justify-center rounded-3xl bg-success-soft text-success">
            <CheckCircle2 className="size-8" strokeWidth={1.75} />
          </span>
          <h2 className="mt-5 font-display text-[22px] font-bold text-ink">Projet créé</h2>
          <p className="mt-2 text-[14px] text-ink-muted">Direction l&apos;étape d&apos;Idéalisation pour poser les bases de « {title.trim()} »…</p>
          <Loader2 className="mx-auto mt-5 size-5 animate-spin text-brand" />
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form onSubmit={handleSubmit} noValidate className="space-y-6 animate-rise">
            <Card>
              <div className="space-y-6">
                <Field label="Nom du projet" htmlFor="title" required error={titleError}>
                  <input
                    id="title"
                    className={cx(inputClass, "h-12 text-[15px]", titleError && "border-danger")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex. AgriConnect, la place de marché des producteurs locaux"
                    maxLength={120}
                    disabled={isLoading}
                    autoFocus
                  />
                </Field>

                <div>
                  <span className="mb-2 flex items-center gap-1 text-[13px] font-semibold text-ink">
                    Secteur d&apos;activité <span className="text-danger">*</span>
                  </span>
                  <div role="radiogroup" aria-label="Secteur d'activité" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {SECTORS.map((s) => {
                      const active = sector === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSector(s.value)}
                          disabled={isLoading}
                          className={cx(
                            "flex items-center gap-2.5 rounded-2xl border-[1.5px] p-2.5 text-left text-[13px] font-semibold transition-all duration-150",
                            active ? "border-brand bg-brand-soft text-brand-ink shadow-card" : "border-line bg-surface text-ink hover:border-line-strong",
                          )}
                        >
                          <ProjectCover sector={s.value} title={s.label} variant="tile" className="size-9 rounded-xl" />
                          <span className="leading-tight">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {sectorError && <p className="mt-1.5 text-[12px] text-danger" role="alert">{sectorError}</p>}
                </div>

                <Field
                  label="Description"
                  htmlFor="description"
                  required
                  error={descriptionError}
                  hint={
                    <span className="flex justify-between gap-3">
                      <span>Le problème que vous résolvez, pour qui, et comment.</span>
                      <span className={cx("tabular-nums", descriptionLength >= MIN_DESCRIPTION_LENGTH ? "text-success" : "")}>
                        {description.length} / {MAX_DESCRIPTION}
                      </span>
                    </span>
                  }
                >
                  <textarea
                    id="description"
                    className={cx(textareaClass, "min-h-[150px]", descriptionError && "border-danger")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre idée en quelques phrases…"
                    maxLength={MAX_DESCRIPTION}
                    disabled={isLoading}
                  />
                </Field>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Taille estimée de l'équipe" htmlFor="teamSize">
                    <div className="flex items-center gap-2">
                      <button type="button" className={buttonClass("secondary", "icon")} onClick={() => setTeamSize((n) => Math.max(1, n - 1))} disabled={isLoading || teamSize <= 1} aria-label="Moins">
                        <Minus />
                      </button>
                      <input
                        id="teamSize"
                        type="number"
                        min={1}
                        max={10}
                        value={teamSize}
                        onChange={(e) => setTeamSize(Math.min(10, Math.max(1, Number(e.target.value))))}
                        className={cx(inputClass, "!w-20 text-center font-semibold tabular-nums")}
                        disabled={isLoading}
                      />
                      <button type="button" className={buttonClass("secondary", "icon")} onClick={() => setTeamSize((n) => Math.min(10, n + 1))} disabled={isLoading || teamSize >= 10} aria-label="Plus">
                        <Plus />
                      </button>
                      <span className="text-[13px] text-ink-muted">{teamSize === 1 ? "personne" : "personnes"}</span>
                    </div>
                  </Field>

                  <Field label="Encadrant" htmlFor="supervisor" optional hint="Il recevra une demande d'encadrement.">
                    <select
                      id="supervisor"
                      value={supervisorId}
                      onChange={(e) => setSupervisorId(e.target.value)}
                      className={selectClass}
                      disabled={isLoading || encadrants.length === 0}
                    >
                      <option value="">{encadrants.length === 0 ? "Aucun encadrant disponible pour le moment" : "Choisir plus tard"}</option>
                      {encadrants.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </Card>

            {error && <Alert tone="danger" icon={XCircle}>{error}</Alert>}

            <div className="flex flex-wrap justify-end gap-3">
              <Link href="/dashboard/projets" className={buttonClass("secondary", "lg")}>Annuler</Link>
              <button type="submit" disabled={isLoading} className={buttonClass("primary", "lg")}>
                {isLoading ? <><Loader2 className="animate-spin" /> Création en cours…</> : <><Send /> Lancer le projet</>}
              </button>
            </div>
          </form>

          {/* ===== LE PARCOURS ===== */}
          <aside className="space-y-4 lg:sticky lg:top-[88px] animate-rise [animation-delay:80ms]">
            <Card>
              <h2 className="font-display text-[16px] font-semibold text-ink">Ce qui vous attend</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">Un parcours en cinq étapes, chacune validée par votre encadrant.</p>
              <ol className="relative mt-5 space-y-4 before:absolute before:top-5 before:bottom-5 before:left-[19px] before:w-px before:bg-line">
                {STAGES.map((s, i) => {
                  const Icon = STAGE_ICONS[i];
                  return (
                    <li key={s.slug} className="relative flex items-center gap-3">
                      <span className={cx("relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-xl ring-4 ring-surface", i === 0 ? "bg-brand text-white" : "bg-surface-muted text-ink-muted")}>
                        <Icon className="size-[18px]" strokeWidth={1.75} />
                      </span>
                      <span>
                        <span className="block text-[11px] font-semibold tracking-[0.12em] text-ink-subtle uppercase">Étape {i + 1}</span>
                        <span className="block text-[14px] font-semibold text-ink">{s.label}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Card>
            <div className="flex gap-3 rounded-[22px] border border-gold/30 bg-gold-soft/60 p-4">
              <GraduationCap className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.75} />
              <p className="text-[12.5px] leading-relaxed text-ink-muted">
                <strong className="font-semibold text-ink">Conseil :</strong> choisissez votre encadrant dès maintenant. Sans lui, vous pourrez préparer vos étapes mais pas les faire valider.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
