// app/mot-de-passe-oublie/page.tsx
// DEMANDE DE RÉINITIALISATION DU MOT DE PASSE (lien envoyé par email)

"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      // Le lien reçu passe par /auth/callback qui ouvre la session, puis affiche le formulaire
      redirectTo: `${window.location.origin}/auth/callback?next=/reinitialiser-mot-de-passe`,
    });
    setLoading(false);

    if (resetError && (resetError.status === 429 || resetError.code === "over_email_send_rate_limit")) {
      setError("Trop de demandes. Patientez quelques minutes avant de réessayer.");
      return;
    }
    // Même message que le compte existe ou non : on ne révèle pas quelles adresses sont inscrites
    setSent(true);
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Indiquez l'adresse email de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe."
    >
      {error && <div role="alert" className="auth-message auth-error">{error}</div>}

      {sent ? (
        <div role="status" className="auth-message auth-success" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <Mail size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>
            Si un compte existe pour <strong>{email.trim()}</strong>, un email vient d&apos;être envoyé avec un lien de
            réinitialisation. Pensez à vérifier vos courriers indésirables.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="auth-label">Adresse email</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@iai-cameroun.com"
            autoComplete="email"
            required
            disabled={loading}
            style={{ marginBottom: "22px" }}
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
