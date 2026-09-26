// app/register/page.tsx
// PAGE D'INSCRIPTION - VERSION CLAIRE BLEU/OR (STYLE LOGIN)
// CORRECTION : isLoading au lieu de loading

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, Building2, Award, Cloud, UserPlus, GraduationCap, Rocket } from "lucide-react";
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
// RÔLES PROPOSÉS À L'INSCRIPTION
// ============================================================
type SignupRole = "STUDENT" | "ENCADRANT";

const ROLE_OPTIONS: { value: SignupRole; label: string; desc: string; icon: typeof Rocket }[] = [
  { value: "STUDENT", label: "Étudiant", desc: "Je porte un projet", icon: Rocket },
  { value: "ENCADRANT", label: "Encadrant", desc: "J'accompagne des projets", icon: GraduationCap },
];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function RegisterPage() {
  const router = useRouter();
  const scrollY = useScroll();

  const [role, setRole] = useState<SignupRole>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // INSCRIPTION SUPABASE
  // ============================================================
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

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          // Si la confirmation d'email est activée dans Supabase, le lien reçu ouvre la session ici
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${role === "ENCADRANT" ? "/encadrant" : "/onboarding/welcome"}`,
          data: {
            full_name: cleanName,
            name: cleanName,
            // Lu à la création du profil (lib/auth.ts) pour orienter vers le bon espace
            role,
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

      console.log("✅ Utilisateur créé dans Supabase Auth:", authData.user.id);

      if (!authData.session) {
        setSuccess(
          "Votre compte a bien été créé. Vérifiez votre adresse email pour confirmer votre compte."
        );
        setName("");
        setEmail("");
        setPassword("");
        setIsLoading(false);
        return;
      }

      // Chaque rôle arrive directement dans son espace
      router.replace(role === "ENCADRANT" ? "/encadrant" : "/onboarding/welcome");
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
        @keyframes inputFocus {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
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

        .register-card {
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
        .register-card:hover {
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

        .register-button {
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
        .register-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 40px rgba(212, 175, 55, 0.3);
        }
        .register-button:active:not(:disabled) {
          transform: translateY(0) scale(1);
        }
        .register-button:disabled {
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
          padding-right: 90px;
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
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 14px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: #10B981;
          line-height: 1.5;
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
          CARTE D'INSCRIPTION
          ============================================================ */}
      <div className="register-card fade-in-up delay-1">
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
          Inscription
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
          Rejoins la communauté <strong style={{ color: "#F5D76E" }}>IAI Entrepreneur</strong> et fais briller ton idée
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
            <div style={{ marginTop: "12px" }}>
              <Link
                href="/login"
                style={{
                  color: "#10B981",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Aller à la connexion
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================
            FORMULAIRE
            ============================================================ */}
        <form onSubmit={handleSubmit}>
          {/* Rôle */}
          <div className="fade-in-up delay-3" style={{ marginBottom: "18px" }}>
            <span className="label" id="role-label">Je suis</span>
            <div role="radiogroup" aria-labelledby="role-label" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {ROLE_OPTIONS.map((option) => {
                const selected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={isLoading}
                    onClick={() => setRole(option.value)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "6px",
                      padding: "14px",
                      borderRadius: "12px",
                      textAlign: "left",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      border: `2px solid ${selected ? "rgba(212, 175, 55, 0.6)" : "rgba(180, 200, 230, 0.08)"}`,
                      background: selected ? "rgba(212, 175, 55, 0.1)" : "rgba(255, 255, 255, 0.04)",
                      boxShadow: selected ? "0 0 0 4px rgba(212, 175, 55, 0.06)" : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <option.icon size={20} style={{ color: selected ? "#F5D76E" : "rgba(200,215,235,0.4)" }} aria-hidden="true" />
                    <span style={{ fontSize: "15px", fontWeight: 700, color: selected ? "#E8EDF5" : "rgba(200,215,235,0.7)" }}>
                      {option.label}
                    </span>
                    <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.45)" }}>{option.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nom complet */}
          <div className="fade-in-up delay-3" style={{ marginBottom: "18px" }}>
            <label htmlFor="name" className="label">
              Nom complet
            </label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Votre nom"
                autoComplete="name"
                disabled={isLoading}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="fade-in-up delay-4" style={{ marginBottom: "18px" }}>
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
                disabled={isLoading}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="fade-in-up delay-5" style={{ marginBottom: "28px" }}>
            <label htmlFor="password" className="label">
              Mot de passe
              <span style={{ color: "rgba(200,215,235,0.3)", fontWeight: 400, fontSize: "12px", marginLeft: "6px" }}>
                (min. 6 caractères)
              </span>
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
                autoComplete="new-password"
                disabled={isLoading}
                className="input-field input-field-password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                disabled={isLoading}
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
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.3s ease",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#E8EDF5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,215,235,0.4)"; }}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {/* Bouton inscription */}
          <div className="fade-in-up delay-6">
            <button type="submit" disabled={isLoading} className="register-button">
              {isLoading ? (
                <>
                  <Loader2 size={19} style={{ animation: "spin 1s linear infinite" }} />
                  Inscription en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>

        {/* Connexion */}
        <p
          className="fade-in-up delay-7"
          style={{
            textAlign: "center",
            color: "rgba(200,215,235,0.4)",
            fontSize: "14px",
            marginTop: "20px",
          }}
        >
          Déjà un compte ?{" "}
          <Link
            href="/login"
            style={{
              color: "#F5D76E",
              textDecoration: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#F5D76E"; }}
          >
            Connectez-vous ici
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