// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation simple
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulation d'inscription (à remplacer par Firebase)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Nom:", name);
      console.log("Email:", email);
      console.log("Mot de passe:", password);
      
      // ✅ Afficher l'écran de succès
      setIsSuccess(true);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== ÉCRAN DE SUCCÈS =====
  if (isSuccess) {
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
        {/* Fond */}
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
                "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
              opacity: 0.08,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, rgba(26,10,46,0.6) 0%, rgba(0,0,0,0.85) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: "500px",
            padding: "40px 24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 40px rgba(16, 185, 129, 0.2)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
            Inscription réussie ! 
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", marginBottom: "28px" }}>
            Bienvenue, <strong style={{ color: "#F4D03F" }}>{name.split(" ")[0]}</strong> ! <br />
            Ton compte a été créé avec succès. 
            <br />
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Prêt à commencer ton aventure ?</span>
          </p>
          
          {/* ✅ Bouton vers la page de bienvenue */}
          <Link
            href="/onboarding/welcome"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              background: "linear-gradient(135deg, #C9A200, #F4D03F)",
              color: "#1A1A2E",
              borderRadius: "50px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 24px rgba(201, 162, 0, 0.2)",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 8px 48px rgba(201, 162, 0, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(201, 162, 0, 0.2)";
            }}
          >
            Continuer vers la page de bienvenue →
          </Link>
        </div>
      </div>
    );
  }

  // ===== FORMULAIRE D'INSCRIPTION =====
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
      {/* ===== FOND : image en parallaxe ===== */}
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
            background: "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(26,10,46,0.7), rgba(0,0,0,0.55))",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.1), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(201,162,0,0.07), transparent 70%)",
            bottom: "-150px",
            left: "-120px",
            animation: "floatBg 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes floatBg {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
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
        @keyframes inputFocus {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(50px) scale(0.95);
          animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.25s; }
        .delay-3 { animation-delay: 0.4s; }
        .delay-4 { animation-delay: 0.55s; }
        .delay-5 { animation-delay: 0.7s; }
        .delay-6 { animation-delay: 0.85s; }
        .delay-7 { animation-delay: 1s; }

        .input-wrapper { position: relative; }
        .input-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #C9A200, #F4D03F, #C9A200);
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
          border-top: 2px solid #1A1A2E;
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
          color: #EF4444;
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
        {/* Logo LIGHT */}
        <div className="fade-in-up delay-2" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
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
              e.currentTarget.style.transform = "scale(1.08) rotate(-3deg)";
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
          style={{ fontSize: "15px", color: "#6B6B7B", textAlign: "center", marginBottom: "32px", lineHeight: "1.6" }}
        >
          Rejoins la communauté <strong style={{ color: "#C9A200" }}>LIGHT</strong> et fais briller ton idée
        </p>

        {/* Message d'erreur */}
        {error && (
          <div className="fade-in-up delay-3 error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="fade-in-up delay-3" style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", color: "#6B6B7B", fontSize: "13px", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.3px" }}>
              Nom complet
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
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
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C9A200";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(201, 162, 0, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8E8E8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>

          <div className="fade-in-up delay-4" style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", color: "#6B6B7B", fontSize: "13px", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.3px" }}>
              Adresse email
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
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
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C9A200";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(201, 162, 0, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8E8E8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>

          <div className="fade-in-up delay-5" style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", color: "#6B6B7B", fontSize: "13px", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.3px" }}>
              Mot de passe
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
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
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C9A200";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(201, 162, 0, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E8E8E8";
                  e.currentTarget.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>

          <div className="fade-in-up delay-6">
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(135deg, #C9A200, #F4D03F)",
                color: "#1A1A2E",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: "0 4px 20px rgba(201, 162, 0, 0.3)",
                letterSpacing: "0.5px",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 8px 40px rgba(201, 162, 0, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(201, 162, 0, 0.3)";
              }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <span className="spinner" />
                  Inscription en cours...
                </span>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>

        <p className="fade-in-up delay-7" style={{ textAlign: "center", color: "#A0A0A0", fontSize: "14px", marginTop: "20px" }}>
          Déjà un compte ?{" "}
          <Link
            href="/Login"
            style={{ color: "#C9A200", textDecoration: "none", fontWeight: 600, transition: "all 0.3s ease" }}
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
          © 2026 <span style={{ color: "#C9A200" }}>LIGHT</span> · Entrepreneuriat Africain
        </p>
      </div>
    </div>
  );
}