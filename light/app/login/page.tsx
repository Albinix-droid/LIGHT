// app/login/page.tsx
// PAGE DE CONNEXION

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";
import CurrentSessionBanner from "@/components/CurrentSessionBanner";

// Messages affichés à l'arrivée sur la page (paramètres d'URL posés par les redirections)
const ARRIVAL_MESSAGES: Record<string, { type: "info" | "error"; text: string }> = {
  deconnecte: { type: "info", text: "Vous êtes déconnecté. À bientôt !" },
  reinitialise: { type: "info", text: "Votre mot de passe a été modifié. Connectez-vous avec le nouveau." },
  lien: { type: "error", text: "Ce lien a expiré ou a déjà été utilisé. Faites une nouvelle demande." },
  suspendu: { type: "error", text: "Ce compte a été suspendu par l'administration. Contactez-la pour en savoir plus." },
};

// Traduit les erreurs Supabase en messages compréhensibles
function loginErrorMessage(error: { code?: string; status?: number; message: string }) {
  if (error.code === "email_not_confirmed") {
    return "Votre adresse email n'est pas encore confirmée. Ouvrez le lien reçu par email, puis réessayez.";
  }
  if (error.code === "over_request_rate_limit" || error.status === 429) {
    return "Trop de tentatives de connexion. Patientez quelques minutes puis réessayez.";
  }
  if (error.code === "user_banned") {
    return "Ce compte a été suspendu. Contactez l'administration.";
  }
  if (error.status === 0 || /fetch|network/i.test(error.message)) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion internet.";
  }
  return "Email ou mot de passe incorrect.";
}

// Page à ouvrir après connexion : celle demandée avant la redirection, interne uniquement
// (« //site » et « /\site » sont interprétés comme des adresses externes par les navigateurs)
function getNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Message d'arrivée (déconnexion, lien expiré, mot de passe modifié)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.has("deconnecte") ? "deconnecte"
      : params.has("reinitialise") ? "reinitialise"
      : params.get("erreur") === "lien" ? "lien"
      : params.get("erreur") === "suspendu" ? "suspendu" : null;
    if (!key) return;
    const message = ARRIVAL_MESSAGES[key];
    if (message.type === "error") setError(message.text);
    else setSuccess(message.text);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) {
        setError(loginErrorMessage(authError));
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError("Impossible de récupérer votre compte.");
        setLoading(false);
        return;
      }
      setSuccess("Connexion réussie. Redirection…");
      // Le tableau de bord renvoie ensuite chaque rôle vers son espace
      router.replace(getNextPath());
      router.refresh();
    } catch (err) {
      console.error("Erreur connexion :", err);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Espace membre"
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour retrouver vos projets, votre encadrant et votre mentor IA."
      footer={
        <p className="mt-8 text-center text-[14px] text-ink-muted">
          Pas encore de compte ? <Link href="/register" className="auth-link">Créer un compte</Link>
        </p>
      }
    >
      <CurrentSessionBanner />
      {error && <div role="alert" className="auth-message auth-error">{error}</div>}
      {success && <div role="status" className="auth-message auth-success">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
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
            autoFocus
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="auth-label !mb-0">Mot de passe</label>
            <Link href="/mot-de-passe-oublie" className="auth-link text-[13px]">Mot de passe oublié ?</Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="auth-input pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? <><Loader2 className="size-[18px] animate-spin" /> Connexion…</> : <>Se connecter <ArrowRight className="size-[18px]" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
