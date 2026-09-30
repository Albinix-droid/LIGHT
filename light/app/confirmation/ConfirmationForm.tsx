// app/confirmation/ConfirmationForm.tsx
// Formulaire de confirmation encadrant / administrateur (style des pages d'authentification)

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck, Briefcase, GraduationCap } from "lucide-react";
import { cancelStaffRequest, confirmStaffAccount } from "./actions";

type StaffRole = "ENCADRANT" | "ADMIN";

// Suggestions proposées dans les champs (saisie libre possible)
const GRADES = ["Assistant", "Chargé de cours", "Maître-assistant", "Maître de conférences", "Professeur", "Intervenant professionnel"];
const FUNCTIONS = ["Directeur", "Directeur des études", "Responsable de la scolarité", "Chef de département", "Responsable de l'incubateur", "Administrateur de la plateforme"];
const DEPARTMENTS = ["Génie Logiciel", "Systèmes et Réseaux", "Mathématiques et Informatique", "Management et Entrepreneuriat", "Langues et Communication"];
const SERVICES = ["Direction", "Direction des études", "Scolarité", "Incubateur", "Service informatique"];

export default function ConfirmationForm({ role, email, fullName }: { role: StaffRole; email: string; fullName: string }) {
  const router = useRouter();
  const isEncadrant = role === "ENCADRANT";
  const [matricule, setMatricule] = useState("");
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [grade, setGrade] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [department, setDepartment] = useState("");
  const [certify, setCertify] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    setError("");
    startTransition(async () => {
      const result = await confirmStaffAccount({ matricule, code, grade, specialty, department, certify });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(isEncadrant ? "Compte encadrant confirmé. Redirection vers votre espace…" : "Compte administrateur confirmé. Redirection vers votre espace…");
      router.replace(result.redirectTo);
      router.refresh();
    });
  };

  const continueAsStudent = () => {
    if (pending) return;
    if (!window.confirm("Renoncer à ce rôle et continuer avec un compte étudiant ?")) return;
    startTransition(async () => {
      const result = await cancelStaffRequest();
      if (!result.ok) return setError(result.error);
      router.replace(result.redirectTo);
      router.refresh();
    });
  };

  const sectionTitle = (icon: React.ReactNode, text: string) => (
    <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#F5D76E", margin: "0 0 14px" }}>
      {icon}
      {text}
    </p>
  );

  return (
    <form onSubmit={submit} noValidate>
      <style>{`
        .conf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 520px) { .conf-grid { grid-template-columns: 1fr; } }
        .conf-block { padding: 18px; border-radius: 16px; background: rgba(255,255,255,0.025); border: 1px solid rgba(180,200,230,0.08); margin-bottom: 18px; }
        .conf-hint { font-size: 12px; color: rgba(200,215,235,0.4); margin: 6px 0 0; line-height: 1.5; }
      `}</style>

      {/* Compte concerné */}
      <div className="auth-message" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)", color: "rgba(232,237,245,0.8)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        {isEncadrant ? <GraduationCap size={18} style={{ color: "#F5D76E", flexShrink: 0, marginTop: "1px" }} /> : <ShieldCheck size={18} style={{ color: "#F5D76E", flexShrink: 0, marginTop: "1px" }} />}
        <span>
          Demande de rôle <strong>{isEncadrant ? "encadrant" : "administrateur"}</strong> pour <strong>{fullName || email}</strong> ({email}).
          En attendant la confirmation, ce compte n&apos;a accès à aucun espace.
        </span>
      </div>

      {error && <div role="alert" className="auth-message auth-error">{error}</div>}
      {success && <div role="status" className="auth-message auth-success">{success}</div>}

      {/* ===== IDENTIFIANTS DE L'ÉCOLE ===== */}
      <div className="conf-block">
        {sectionTitle(<KeyRound size={14} />, "Identifiants remis par l'école")}
        <div className="conf-grid">
          <div>
            <label htmlFor="matricule" className="auth-label">Matricule</label>
            <input
              id="matricule"
              className="auth-input"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value.toUpperCase())}
              placeholder="Ex. ENS-2026-014"
              autoComplete="off"
              spellCheck={false}
              required
              disabled={pending}
            />
          </div>
          <div>
            <label htmlFor="code" className="auth-label">Code confidentiel</label>
            <div style={{ position: "relative" }}>
              <input
                id="code"
                type={showCode ? "text" : "password"}
                className="auth-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                autoComplete="one-time-code"
                spellCheck={false}
                required
                disabled={pending}
                style={{ paddingRight: "46px", letterSpacing: showCode ? "1px" : undefined }}
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                aria-label={showCode ? "Masquer le code" : "Afficher le code"}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(200,215,235,0.45)", display: "flex" }}
              >
                {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <p className="conf-hint">
          Ces informations vous ont été communiquées par {isEncadrant ? "la direction des études" : "la direction de l'école"}. Le code ne sert qu&apos;une
          fois ; après 5 essais incorrects il est bloqué pendant 30 minutes.
        </p>
      </div>

      {/* ===== INFORMATIONS PROFESSIONNELLES ===== */}
      <div className="conf-block">
        {sectionTitle(<Briefcase size={14} />, "Informations professionnelles")}
        <div className="conf-grid">
          <div>
            <label htmlFor="grade" className="auth-label">{isEncadrant ? "Grade" : "Fonction"}</label>
            <input
              id="grade"
              className="auth-input"
              list="grade-options"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder={isEncadrant ? "Ex. Maître-assistant" : "Ex. Directeur des études"}
              maxLength={120}
              required
              disabled={pending}
            />
            <datalist id="grade-options">
              {(isEncadrant ? GRADES : FUNCTIONS).map((g) => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="department" className="auth-label">{isEncadrant ? "Département" : "Service"}</label>
            <input
              id="department"
              className="auth-input"
              list="department-options"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder={isEncadrant ? "Ex. Génie Logiciel" : "Ex. Scolarité"}
              maxLength={120}
              required
              disabled={pending}
            />
            <datalist id="department-options">
              {(isEncadrant ? DEPARTMENTS : SERVICES).map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
        </div>
        <div style={{ marginTop: "14px" }}>
          <label htmlFor="specialty" className="auth-label">
            {isEncadrant ? "Spécialité" : "Domaine de compétence"}
            {!isEncadrant && <span style={{ fontWeight: 400, color: "rgba(200,215,235,0.35)" }}> (facultatif)</span>}
          </label>
          <input
            id="specialty"
            className="auth-input"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder={isEncadrant ? "Ex. Intelligence artificielle, entrepreneuriat numérique" : "Ex. Pédagogie, suivi des projets"}
            maxLength={120}
            required={isEncadrant}
            disabled={pending}
          />
        </div>
      </div>

      <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: "rgba(200,215,235,0.65)", lineHeight: 1.5, marginBottom: "22px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={certify}
          onChange={(e) => setCertify(e.target.checked)}
          disabled={pending}
          style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: "#D4AF37", flexShrink: 0 }}
        />
        Je certifie que ces informations sont exactes et que ces identifiants m&apos;ont été remis personnellement par l&apos;école.
      </label>

      <button type="submit" className="auth-button" disabled={pending || !!success}>
        {pending && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
        {pending ? "Vérification…" : "Confirmer mon compte"}
      </button>

      <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(200,215,235,0.4)", margin: "18px 0 0", lineHeight: 1.6 }}>
        Vous n&apos;avez pas reçu d&apos;identifiants ? Contactez l&apos;administration de l&apos;école.
        <br />
        <button
          type="button"
          onClick={continueAsStudent}
          disabled={pending}
          className="auth-link"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "inherit", padding: 0 }}
        >
          Je suis étudiant : continuer sans ce rôle
        </button>
      </p>
    </form>
  );
}
