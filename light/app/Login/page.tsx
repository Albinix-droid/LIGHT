// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [scrollY, setScrollY] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ===== NOUVELLES FONCTIONNALITÉS =====
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
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

      // ========================================================
      // AUTHENTIFICATION DIRECTE AVEC SUPABASE AUTH
      // ========================================================

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      // ========================================================
      // IDENTIFIANTS INCORRECTS
      // ========================================================

      if (authError) {
        console.error("Erreur Supabase :", authError);

        setError("Email ou mot de passe incorrect.");
        setLoading(false);

        return;
      }

      // ========================================================
      // VÉRIFICATION DE L'UTILISATEUR RETOURNÉ
      // ========================================================

      if (!data.user) {
        setError("Impossible de récupérer votre compte.");
        setLoading(false);

        return;
      }

      // ========================================================
      // CONNEXION RÉUSSIE
      // ========================================================

      setSuccess("Connexion réussie. Redirection...");

      // ========================================================
      // REDIRECTION VERS LE DASHBOARD
      // ========================================================

      router.replace("/dashboard");
    } catch (err) {
      console.error("Erreur connexion :", err);

      setError(
        "Une erreur inattendue est survenue. Veuillez réessayer."
      );

      setLoading(false);
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
      {/* ===== FOND : image en parallaxe, identique à ton frontend ===== */}

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

      {/* ===== ANIMATIONS ===== */}

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
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
          animation: fadeInUp 0.8s
            cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
          background: linear-gradient(
            90deg,
            #c9a200,
            #f4d03f,
            #c9a200
          );
          background-size: 200% auto;
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .input-wrapper:focus-within::after {
          animation: inputFocus 0.4s ease forwards;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 40px rgba(201, 162, 0, 0.4);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0) scale(1);
        }
      `}</style>

      {/* ===== CARTE EN VERRE ===== */}

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
        {/* ===== LOGO ===== */}

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
              background:
                "linear-gradient(135deg, #C9A200, #F4D03F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 700,
              color: "#1A1A2E",
              boxShadow:
                "0 8px 32px rgba(201, 162, 0, 0.3)",
              animation: "iconPulse 3s ease-in-out infinite",
              transition: "all 0.3s ease",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                "scale(1.08) rotate(-3deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                "scale(1) rotate(0deg)";
            }}
          >
            L
          </div>
        </div>

        {/* ==================================================
            CONTENU
        ================================================== */}

        <>
          <h1
            className="fade-in-up delay-2"
            style={{
              fontSize: "32px",
              fontWeight: 600,
              textAlign: "center",
              marginBottom: "4px",
              letterSpacing: "-0.5px",
              background:
                "linear-gradient(135deg, #C9A200, #F4D03F)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
              backgroundSize: "200% auto",
            }}
          >
            Connexion
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
            Heureux de te revoir. Continuons notre aventure
            ensemble
          </p>

          {/* ==================================================
              MESSAGE ERREUR
          ================================================== */}

          {error && (
            <div
              role="alert"
              className="fade-in-up"
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                color: "#B91C1C",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          {/* ==================================================
              MESSAGE SUCCÈS
          ================================================== */}

          {success && (
            <div
              role="status"
              className="fade-in-up"
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(22, 163, 74, 0.08)",
                border: "1px solid rgba(22, 163, 74, 0.2)",
                color: "#15803D",
                fontSize: "13px",
              }}
            >
              {success}
            </div>
          )}

          {/* ==================================================
              FORMULAIRE
          ================================================== */}

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div
              className="fade-in-up delay-3"
              style={{ marginBottom: "18px" }}
            >
              <label
                htmlFor="email"
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
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Votre email"
                  autoComplete="email"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    backgroundColor:
                      "rgba(255, 248, 231, 0.8)",
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
                    e.currentTarget.style.borderColor =
                      "#C9A200";

                    e.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(201, 162, 0, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "#E8E8E8";

                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                />
              </div>
            </div>

            {/* MOT DE PASSE */}

            <div
              className="fade-in-up delay-4"
              style={{ marginBottom: "8px" }}
            >
              <label
                htmlFor="password"
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

              <div
                className="input-wrapper"
                style={{ position: "relative" }}
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px 50px 14px 18px",
                    backgroundColor:
                      "rgba(255, 248, 231, 0.8)",
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
                    e.currentTarget.style.borderColor =
                      "#C9A200";

                    e.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(201, 162, 0, 0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "#E8E8E8";

                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                />

                {/* AFFICHER / MASQUER LE MOT DE PASSE */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "38px",
                    height: "38px",
                    border: "none",
                    background: "transparent",
                    color: "#8A8A96",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* MOT DE PASSE OUBLIÉ */}

            <div
              className="fade-in-up delay-5"
              style={{
                textAlign: "right",
                marginBottom: "28px",
              }}
            >
              <Link
                href="/forgot-password"
                style={{
                  color: "#A0A0A0",
                  fontSize: "13px",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#C9A200")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#A0A0A0")
                }
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* ==================================================
                BOUTON CONNEXION
            ================================================== */}

            <div className="fade-in-up delay-6">
              <button
                type="submit"
                disabled={loading}
                className="login-button"
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
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  transition:
                    "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow:
                    "0 4px 20px rgba(201, 162, 0, 0.3)",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      style={{
                        animation:
                          "spin 1s linear infinite",
                      }}
                    />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>

          {/* INSCRIPTION */}

          <p
            className="fade-in-up delay-7"
            style={{
              textAlign: "center",
              color: "#A0A0A0",
              fontSize: "14px",
              marginTop: "20px",
            }}
          >
            Pas encore de compte ?{" "}
            <Link
              href="/Register"
              style={{
                color: "#C9A200",
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#F4D03F")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#C9A200")
              }
            >
              S'inscrire
            </Link>
          </p>
        </>

        {/* ===== FOOTER ===== */}

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
          © 2026{" "}
          <span style={{ color: "#C9A200" }}>LIGHT</span> ·
          Entrepreneuriat Africain
        </p>
      </div>
    </div>
  );
}