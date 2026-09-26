// app/dashboard/projets/nouveau/NewProjectForm.tsx
// PAGE DE CRÉATION D'UN PROJET - VERSION BLEU/OR CLAIRE

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createProject } from "../actions";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Target,
  Users,
  FileText,
  Send,
  XCircle
} from "lucide-react";

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
export default function NewProjectForm({ encadrants }: { encadrants: { id: string; name: string }[] }) {
  const router = useRouter();
  const scrollY = useScroll();

  // ===== ÉTATS DU FORMULAIRE =====
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [supervisorId, setSupervisorId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ===== VALIDATION CLIENT =====
  const [titleError, setTitleError] = useState("");
  const [sectorError, setSectorError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const sectors = [
    { value: "", label: "Sélectionnez un secteur" },
    { value: "tech", label: "Tech & Digital" },
    { value: "agriculture", label: "Agriculture" },
    { value: "commerce", label: "Commerce" },
    { value: "services", label: "Services" },
    { value: "health", label: "Santé" },
    { value: "education", label: "Éducation" },
    { value: "finance", label: "Finance" },
    { value: "autre", label: "Autre" },
  ];

  // ============================================================
  // SOUMISSION DU FORMULAIRE
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Réinitialiser les erreurs
    setError("");
    setSuccess(false);
    setTitleError("");
    setSectorError("");
    setDescriptionError("");

    // Valider les champs
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
    } else if (description.trim().length < 50) {
      setDescriptionError("La description doit contenir au moins 50 caractères");
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
      setTimeout(() => {
        router.push(`/dashboard/projets/${result.projectId}/idealisation`);
      }, 1500);
    } catch (err: any) {
      console.error("Erreur création projet:", err);
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
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
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.08,
            transform: `translateY(${scrollY * 0.03}px) scale(1.1)`,
            transition: "transform 0.05s ease-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(10,22,40,0.6) 0%, rgba(10,22,40,0.85) 100%)",
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
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "linear-gradient(180deg, transparent, rgba(10,22,40,0.4))",
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

        .card-glass {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(180, 200, 230, 0.08);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card-glass:hover {
          border-color: rgba(212, 175, 55, 0.15);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 8px 40px rgba(0, 20, 50, 0.3);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          border: none;
          border-radius: 50px;
          font-size: 15px;
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
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 1px solid rgba(180, 200, 230, 0.15);
          border-radius: 50px;
          color: rgba(200, 215, 235, 0.6);
          text-decoration: none;
          font-size: 14px;
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
        .input-error {
          border-color: #E4736B !important;
        }
        .input-error:focus {
          border-color: #E4736B !important;
          box-shadow: 0 0 0 3px rgba(228, 115, 107, 0.15) !important;
        }
        textarea.input {
          resize: vertical;
          min-height: 120px;
        }
        select.input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(200,215,235,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          color: #E8EDF5;
        }
        select.input option {
          background: #0A1628;
          color: #E8EDF5;
        }

        .label {
          display: block;
          color: rgba(200, 215, 235, 0.6);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }

        .error-text {
          color: #E4736B;
          font-size: 12px;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10B981;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          border-radius: 12px;
          background: rgba(228, 115, 107, 0.08);
          border: 1px solid rgba(228, 115, 107, 0.15);
          color: #E4736B;
          font-weight: 500;
        }
      `}</style>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "20px" }}>

        {/* ===== RETOUR + EN-TÊTE ===== */}
        <div className="fade-in-up delay-1" style={{ marginBottom: "24px" }}>
          <Link
            href="/dashboard/projets"
            className="btn-secondary"
            style={{ padding: "8px 16px", marginBottom: "12px", display: "inline-flex" }}
          >
            <ArrowLeft size={16} />
            Retour aux projets
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#E8EDF5", margin: "8px 0 4px", letterSpacing: "-0.5px" }}>
            Nouveau projet
          </h1>
          <p style={{ color: "rgba(200,215,235,0.5)", fontSize: "14px", margin: 0 }}>
            Renseignez les informations de votre projet pour démarrer l'aventure entrepreneuriale.
          </p>
        </div>

        {/* ===== CARTE DU FORMULAIRE ===== */}
        <div className="card-glass fade-in-up delay-2">
          {success ? (
            <div className="success-message">
              <CheckCircle size={20} />
              <span>Projet créé avec succès ! Redirection vers l'étape d'idéalisation...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* ===== TITRE ===== */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="title" className="label">
                  Titre du projet <span style={{ color: "#E4736B" }}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleError) setTitleError("");
                  }}
                  placeholder="Ex: Plateforme Innov'Afrique"
                  className={`input ${titleError ? "input-error" : ""}`}
                  disabled={isLoading}
                  required
                />
                {titleError && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {titleError}
                  </div>
                )}
              </div>

              {/* ===== SECTEUR ===== */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="sector" className="label">
                  Secteur d'activité <span style={{ color: "#E4736B" }}>*</span>
                </label>
                <select
                  id="sector"
                  value={sector}
                  onChange={(e) => {
                    setSector(e.target.value);
                    if (sectorError) setSectorError("");
                  }}
                  className={`input ${sectorError ? "input-error" : ""}`}
                  disabled={isLoading}
                  required
                >
                  {sectors.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {sectorError && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {sectorError}
                  </div>
                )}
              </div>

              {/* ===== DESCRIPTION ===== */}
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="description" className="label">
                  Description <span style={{ color: "#E4736B" }}>*</span>
                  <span style={{ color: "rgba(200,215,235,0.3)", fontWeight: 400, fontSize: "12px", marginLeft: "8px" }}>
                    (minimum 50 caractères)
                  </span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (descriptionError) setDescriptionError("");
                  }}
                  placeholder="Décrivez votre projet en détail : objectifs, valeur ajoutée, public cible..."
                  className={`input ${descriptionError ? "input-error" : ""}`}
                  disabled={isLoading}
                  required
                />
                {descriptionError && (
                  <div className="error-text">
                    <AlertCircle size={14} />
                    {descriptionError}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "rgba(200,215,235,0.3)", marginTop: "4px" }}>
                  {description.length} / 2000
                </div>
              </div>

              {/* ===== TAILLE DE L'ÉQUIPE ===== */}
              <div style={{ marginBottom: "24px" }}>
                <label htmlFor="teamSize" className="label">
                  Taille estimée de l'équipe
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    id="teamSize"
                    type="number"
                    min={1}
                    max={10}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.min(10, Math.max(1, Number(e.target.value))))}
                    className="input"
                    style={{ maxWidth: "80px", textAlign: "center" }}
                    disabled={isLoading}
                  />
                  <span style={{ color: "rgba(200,215,235,0.4)", fontSize: "13px" }}>
                    {teamSize === 1 ? "personne" : "personnes"}
                  </span>
                </div>
              </div>

              {/* ===== ENCADRANT ===== */}
              <div style={{ marginBottom: "24px" }}>
                <label htmlFor="supervisor" className="label">
                  Encadrant
                  <span style={{ color: "rgba(200,215,235,0.3)", fontWeight: 400, fontSize: "12px", marginLeft: "8px" }}>
                    (il recevra une demande d'encadrement)
                  </span>
                </label>
                <select
                  id="supervisor"
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="input"
                  disabled={isLoading || encadrants.length === 0}
                >
                  <option value="">
                    {encadrants.length === 0 ? "Aucun encadrant disponible pour le moment" : "Choisir plus tard"}
                  </option>
                  {encadrants.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              {/* ===== ERREUR GLOBALE ===== */}
              {error && (
                <div className="error-message" style={{ marginBottom: "16px" }}>
                  <XCircle size={18} />
                  {error}
                </div>
              )}

              {/* ===== BOUTONS ===== */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link
                  href="/dashboard/projets"
                  className="btn-secondary"
                  style={{ padding: "12px 24px" }}
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Lancer le projet
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="fade-in-up delay-4" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(180,200,230,0.06)", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.2)", letterSpacing: "0.5px", margin: 0 }}>
            © 2026 <span style={{ color: "#D4AF37" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </div>
      </div>
    </div>
  );
}
