// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(url, anonKey);
};

export default function RegisterPage() {
  const router = useRouter();

  const [scrollY, setScrollY] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      /*
       * ============================================================
       * INSCRIPTION 100 % SUPABASE
       * ============================================================
       *
       * Nous ne faisons PLUS de :
       *
       * fetch("/api/auth/create-profile")
       *
       * L'ancien appel provoquait :
       * Unexpected token '<', "<!DOCTYPE "... is not valid JSON
       *
       * Le profil de base est stocké dans les métadonnées Supabase
       * au moment de la création du compte.
       */
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              name: cleanName,
            },
          },
        });

      if (authError) {
        console.error("Supabase Auth Error:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Supabase n'a pas retourné l'utilisateur créé.");
      }

      console.log(
        "✅ Utilisateur créé dans Supabase Auth:",
        authData.user.id
      );

      /*
       * CAS 1 :
       * Confirmation email activée dans Supabase.
       * Supabase crée l'utilisateur mais ne fournit pas encore
       * de session.
       */
      if (!authData.session) {
        setSuccess(
          "Votre compte a bien été créé. Vérifiez votre adresse email pour confirmer votre compte."
        );

        setName("");
        setEmail("");
        setPassword("");

        return;
      }

      /*
       * CAS 2 :
       * Confirmation email désactivée.
       * L'utilisateur possède déjà une session.
       */
      router.replace("/onboarding/welcome");
      router.refresh();
    } catch (err: unknown) {
      console.error("❌ Erreur d'inscription Supabase:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.";

      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes("user already registered") ||
        normalizedMessage.includes("already registered")
      ) {
        setError("Cette adresse email est déjà utilisée.");
      } else if (normalizedMessage.includes("invalid email")) {
        setError("Veuillez saisir une adresse email valide.");
      } else if (normalizedMessage.includes("password")) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else if (normalizedMessage.includes("rate limit")) {
        setError(
          "Trop de tentatives. Veuillez patienter quelques instants puis réessayer."
        );
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        background: "#000000",
      }}
    >
      {/* =========================================================
          FOND
      ========================================================== */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.4,
            transform: `translateY(${scrollY * 0.1}px) scale(1.08)`,
            transition: "transform 0.05s ease-out",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(26,10,46,0.7), rgba(0,0,0,0.55))",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,162,0,0.1), transparent 70%)",
            top: "-250px",
            right: "-150px",
            animation: "floatBg 8s ease-in-out infinite",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,162,0,0.07), transparent 70%)",
            bottom: "-150px",
            left: "-120px",
            animation: "floatBg 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes floatBg {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.05) rotate(-3deg);
          }
          75% {
            transform: scale(1.05) rotate(3deg);
          }
        }

        @keyframes inputFocus {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
          animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
        }

        .delay-1 {
          animation-delay: 0.1s;
        }

        .delay-2 {
          animation-delay: 0.25s;
        }

        .delay-3 {
          animation-delay: 0.4s;
        }

        .delay-4 {
          animation-delay: 0.55s;
        }

        .delay-5 {
          animation-delay: 0.7s;
        }

        .delay-6 {
          animation-delay: 0.85s;
        }

        .delay-7 {
          animation-delay: 1s;
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
          background: linear-gradient(90deg, #c9a200, #f4d03f, #c9a200);
          background-size: 200% auto;
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .input-wrapper:focus-within::after {
          animation: inputFocus 0.4s ease forwards;
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(26, 26, 46, 0.2);
          border-top: 2px solid #1a1a2e;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .error-message {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .success-message {
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #059669;
          line-height: 1.5;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #8b8b99;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .password-toggle:hover {
          color: #c9a200;
        }
      `}</style>

      {/* =========================================================
          CARTE
      ========================================================== */}
      <div
        className="fade-in-up delay-1"
        style={{
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "48px 40px",
          maxWidth: "440px",
          width: "100%",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
        }}
      >
        {/* Logo */}
        <div
          className="fade-in-up delay-2"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A200, #F4D03F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 700,
              color: "#1A1A2E",
              boxShadow: "0 8px 32px rgba(201, 162, 0, 0.3)",
              animation: "iconPulse 3s ease-in-out infinite",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "scale(1.08) rotate(-3deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            L
          </div>
        </div>

        <h1
          className="fade-in-up delay-2"
          style={{
            fontSize: "32px",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: "4px",
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #C9A200, #F4D03F)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3s linear infinite",
            backgroundSize: "200% auto",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Inscription
        </h1>

        <p
          className="fade-in-up delay-3"
          style={{
            fontSize: "15px",
            color: "#6B6B7B",
            textAlign: "center",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          Rejoins la communauté{" "}
          <strong style={{ color: "#C9A200" }}>LIGHT</strong> et fais briller
          ton idée
        </p>

        {/* Message de succès */}
        {success && (
          <div className="fade-in-up delay-3 success-message">
            {success}
            <div style={{ marginTop: "12px" }}>
              <Link
                href="/login"
                style={{
                  color: "#059669",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Aller à la connexion
              </Link>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="fade-in-up delay-3 error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nom */}
          <div
            className="fade-in-up delay-3"
            style={{ marginBottom: "18px" }}
          >
            <label
              style={{
                display: "block",
                color: "#6B6B7B",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
                letterSpacing: "0.3px",
              }}
            >
              Nom complet
            </label>

            <div className="input-wrapper">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                autoComplete="name"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  backgroundColor: "rgba(255, 248, 231, 0.8)",
                  color: "#1A1A2E",
                  border: "2px solid #E8E8E8",
                  borderRadius: "12px",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C9A200";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(201, 162, 0, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8E8E8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div
            className="fade-in-up delay-4"
            style={{ marginBottom: "18px" }}
          >
            <label
              style={{
                display: "block",
                color: "#6B6B7B",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
                letterSpacing: "0.3px",
              }}
            >
              Adresse email
            </label>

            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                autoComplete="email"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  backgroundColor: "rgba(255, 248, 231, 0.8)",
                  color: "#1A1A2E",
                  border: "2px solid #E8E8E8",
                  borderRadius: "12px",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C9A200";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(201, 162, 0, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8E8E8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div
            className="fade-in-up delay-5"
            style={{ marginBottom: "28px" }}
          >
            <label
              style={{
                display: "block",
                color: "#6B6B7B",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
                letterSpacing: "0.3px",
              }}
            >
              Mot de passe
            </label>

            <div className="input-wrapper" style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="new-password"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px 90px 14px 18px",
                  backgroundColor: "rgba(255, 248, 231, 0.8)",
                  color: "#1A1A2E",
                  border: "2px solid #E8E8E8",
                  borderRadius: "12px",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C9A200";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(201, 162, 0, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8E8E8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
                minLength={6}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                disabled={isLoading}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {/* Bouton */}
          <div className="fade-in-up delay-6">
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                background:
                  "linear-gradient(135deg, #C9A200, #F4D03F)",
                color: "#1A1A2E",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition:
                  "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: "0 4px 20px rgba(201, 162, 0, 0.3)",
                letterSpacing: "0.5px",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform =
                    "translateY(-3px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 40px rgba(201, 162, 0, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(201, 162, 0, 0.3)";
              }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <span className="spinner" />
                  Inscription en cours...
                </span>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>

        <p
          className="fade-in-up delay-7"
          style={{
            textAlign: "center",
            color: "#A0A0A0",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          Déjà un compte ?{" "}
          <Link
            href="/Login"
            style={{
              color: "#C9A200",
              textDecoration: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F4D03F")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A200")}
          >
            Connectez-vous ici
          </Link>
        </p>

        <p
          className="fade-in-up delay-7"
          style={{
            textAlign: "center",
            color: "#B0B0B0",
            fontSize: "10px",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          © {new Date().getFullYear()}{" "}
          <span style={{ color: "#C9A200" }}>LIGHT</span> · Entrepreneuriat
          Africain
        </p>
      </div>
    </div>
  );
}
