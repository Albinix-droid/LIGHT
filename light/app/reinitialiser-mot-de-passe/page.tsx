// app/reinitialiser-mot-de-passe/page.tsx
// CHOIX D'UN NOUVEAU MOT DE PASSE (ouvert depuis le lien reçu par email, via /auth/callback)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // null : vérification en cours ; false : pas de session (lien expiré ou page ouverte directement)
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setHasSession(!!data.user));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setLoading(false);
      setError(
        updateError.code === "same_password"
          ? "Choisissez un mot de passe différent de l'ancien."
          : "Impossible de modifier le mot de passe. Le lien a peut-être expiré : faites une nouvelle demande.",
      );
      return;
    }

    // On referme la session ouverte par le lien : l'utilisateur se reconnecte avec son nouveau mot de passe
    await supabase.auth.signOut();
    router.replace("/login?reinitialise=1");
  };

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez le mot de passe que vous utiliserez désormais pour vous connecter.">
      {hasSession === false ? (
        <div role="alert" className="auth-message auth-error">
          Ce lien a expiré ou a déjà été utilisé.{" "}
          <Link href="/mot-de-passe-oublie" className="auth-link">Faire une nouvelle demande</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div role="alert" className="auth-message auth-error">{error}</div>}

          <label htmlFor="password" className="auth-label">Nouveau mot de passe <span style={{ fontWeight: 400, opacity: 0.6 }}>(min. {MIN_PASSWORD_LENGTH} caractères)</span></label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              disabled={loading || hasSession === null}
              style={{ paddingRight: "50px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--ink-muted)", cursor: "pointer", padding: "8px" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label htmlFor="confirmation" className="auth-label">Confirmer le mot de passe</label>
          <input
            id="confirmation"
            type={showPassword ? "text" : "password"}
            className="auth-input"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading || hasSession === null}
            style={{ marginBottom: "22px" }}
          />

          <button type="submit" className="auth-button" disabled={loading || hasSession === null}>
            {loading && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
