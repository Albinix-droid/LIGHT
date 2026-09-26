// app/login/page.tsx
// PAGE DE CONNEXION - VERSION DYNAMIQUE & IMMERSIVE (STYLE DASHBOARD)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, Building2, Award, Cloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CurrentSessionBanner from "@/components/CurrentSessionBanner";

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
// MESSAGES
// ============================================================
// Messages affichés à l'arrivée sur la page (paramètres d'URL posés par les redirections)
const ARRIVAL_MESSAGES: Record<string, { type: "info" | "error"; text: string }> = {
  deconnecte: { type: "info", text: "Vous êtes déconnecté. À bientôt !" },
  reinitialise: { type: "info", text: "Votre mot de passe a été modifié. Connectez-vous avec le nouveau." },
  lien: { type: "error", text: "Ce lien a expiré ou a déjà été utilisé. Faites une nouvelle demande." },
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

// Page à ouvrir après connexion : celle demandée avant la redirection (interne uniquement)
function getNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const scrollY = useScroll();

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
      : params.get("erreur") === "lien" ? "lien" : null;
    if (!key) return;
    const message = ARRIVAL_MESSAGES[key];
    if (message.type === "error") setError(message.text);
    else setSuccess(message.text);
  }, []);

  // ============================================================
  // AUTHENTIFICATION SUPABASE
  // ============================================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
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

      setSuccess("Connexion réussie. Redirection...");
      // Le dashboard renvoie ensuite chaque rôle vers son espace (encadrant → /encadrant)
      router.replace(getNextPath());
      router.refresh();
    } catch (err) {
      console.error("Erreur connexion :", err);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        background: "#0A1628",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ===== FOND AVEC PARALLAX ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        {/* Image de fond principale */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.12,
            transform: `translateY(${scrollY * 0.04}px) scale(1.1)`,
            transition: "transform 0.05s ease-out",
          }}
        />
        {/* Dégradé pour la lisibilité */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(10,22,40,0.6) 0%, rgba(10,22,40,0.85) 100%)",
          }}
        />
        {/* Orbes lumineuses */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.06), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(212,175,55,0.04), transparent 70%)",
            bottom: "-100px",
            left: "-80px",
            animation: "floatBg 10s ease-in-out infinite reverse",
          }}
        />
        {/* Vague bleue en bas */}
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
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(-3deg); }
          75% { transform: scale(1.05) rotate(3deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
          animation: fadeInUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.15s; }
        .delay-3 { animation-delay: 0.25s; }
        .delay-4 { animation-delay: 0.35s; }
        .delay-5 { animation-delay: 0.45s; }
        .delay-6 { animation-delay: 0.55s; }
        .delay-7 { animation-delay: 0.65s; }

        .login-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(180, 200, 230, 0.08);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .login-card:hover {
          border-color: rgba(212, 175, 55, 0.15);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
        }

        .input-wrapper {
          position: relative;
        }
        .input-wrapper::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #D4AF37, #F5D76E, #D4AF37);
          background-size: 200% auto;
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }
        .input-wrapper:focus-within::after {
          animation: inputFocus 0.4s ease forwards;
        }
        @keyframes inputFocus {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .login-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 40px rgba(212, 175, 55, 0.3);
        }
        .login-button:active:not(:disabled) {
          transform: translateY(0) scale(1);
        }
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-field {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.04);
          color: #E8EDF5;
          border: 2px solid rgba(180, 200, 230, 0.08);
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, sans-serif;
          box-sizing: border-box;
        }
        .input-field:focus {
          border-color: rgba(212, 175, 55, 0.3);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.06);
        }
        .input-field::placeholder {
          color: rgba(200, 215, 235, 0.3);
        }

        .input-field-password {
          padding-right: 50px;
        }

        .label {
          display: block;
          color: rgba(200, 215, 235, 0.6);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }

        .error-message {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(228, 115, 107, 0.08);
          border: 1px solid rgba(228, 115, 107, 0.15);
          color: #E4736B;
          font-size: 13px;
          line-height: 1.5;
        }

        .success-message {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: #10B981;
          font-size: 13px;
        }

        .trust-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(200, 215, 235, 0.3);
          font-weight: 500;
          font-size: 12px;
          transition: all 0.3s ease;
        }
        .trust-logo:hover {
          color: #F5D76E;
          transform: scale(1.05);
        }
      `}</style>

      {/* ============================================================
          CARTE DE CONNEXION
          ============================================================ */}
      <div className="login-card fade-in-up delay-1">
        {/* Logo */}
        <div
          className="fade-in-up delay-2"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 700,
              color: "#0A1628",
              boxShadow: "0 8px 32px rgba(212, 175, 55, 0.25)",
              animation: "iconPulse 3s ease-in-out infinite",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08) rotate(-3deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            IAI
          </div>
        </div>

        {/* Titre */}
        <h1
          className="fade-in-up delay-2"
          style={{
            fontSize: "32px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "4px",
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
            animation: "shimmer 3s linear infinite",
          }}
        >
          Connexion
        </h1>

        <p
          className="fade-in-up delay-3"
          style={{
            fontSize: "15px",
            color: "rgba(200,215,235,0.5)",
            textAlign: "center",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          Heureux de te revoir. Continuons notre aventure ensemble
        </p>

        {/* ============================================================
            MESSAGES
            ============================================================ */}
        {error && (
          <div role="alert" className="error-message fade-in-up">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="success-message fade-in-up">
            {success}
          </div>
        )}

        {/* ============================================================
            FORMULAIRE
            ============================================================ */}
        <CurrentSessionBanner />

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="fade-in-up delay-3" style={{ marginBottom: "18px" }}>
            <label htmlFor="email" className="label">
              Adresse email
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="exemple@iai-cameroun.com"
                autoComplete="email"
                disabled={loading}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="fade-in-up delay-4" style={{ marginBottom: "8px" }}>
            <label htmlFor="password" className="label">
              Mot de passe
            </label>
            <div className="input-wrapper" style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="input-field input-field-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                disabled={loading}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "38px",
                  height: "38px",
                  border: "none",
                  background: "transparent",
                  color: "rgba(200,215,235,0.4)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#E8EDF5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,215,235,0.4)"; }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Mot de passe oublié */}
          <div
            className="fade-in-up delay-5"
            style={{
              textAlign: "right",
              marginBottom: "28px",
            }}
          >
            <Link
              href="/mot-de-passe-oublie"
              style={{
                color: "rgba(200,215,235,0.4)",
                fontSize: "13px",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#F5D76E"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,215,235,0.4)"; }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton connexion */}
          <div className="fade-in-up delay-6">
            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <>
                  <Loader2 size={19} style={{ animation: "spin 1s linear infinite" }} />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </div>
        </form>

        {/* Inscription */}
        <p
          className="fade-in-up delay-7"
          style={{
            textAlign: "center",
            color: "rgba(200,215,235,0.4)",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            style={{
              color: "#F5D76E",
              textDecoration: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#F5D76E"; }}
          >
            S'inscrire
          </Link>
        </p>

        {/* ===== FOOTER ===== */}
        <div
          className="fade-in-up delay-7"
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(180,200,230,0.06)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "rgba(200,215,235,0.2)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            © 2026 <span style={{ color: "#D4AF37" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </div>
      </div>
    </div>
  );
}