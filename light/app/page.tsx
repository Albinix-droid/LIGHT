// app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Menu, X, Home, Info, LogIn, UserPlus,
  Lightbulb, Palette, Settings, Rocket,
  Languages, TrendingUp, FileText,
  Sparkles, Target, Quote, Star, Users,
  Zap, Award, Building2, Cloud, ArrowRight,
} from "lucide-react";

// ============================================================
// DONNÉES
// ============================================================
const STEPS = [
  { icon: Lightbulb, label: "Idée" },
  { icon: Palette, label: "Conception" },
  { icon: Settings, label: "Développement" },
  { icon: Rocket, label: "Test" },
];

const FEATURES = [
  { icon: Languages, title: "9 langues", desc: "Guide personnalisé dans ta langue" },
  { icon: TrendingUp, title: "Revenus", desc: "Prévisions financières adaptées" },
  { icon: FileText, title: "Modèles", desc: "Templates prêts pour ton secteur" },
];

const TRUSTED_BY = [
  { name: "IAI-Cameroun", icon: Building2 },
  { name: "BEONWEB", icon: Cloud },
];

const TESTIMONIALS = [
  {
    quote: "J'ai utilisé cette application pour mon projet étudiant, et c'est une merveille.",
    author: "Atangana Jacques",
    role: "Étudiant à l'IAI Cameroun",
    stars: 5,
  },
  {
    quote: "Une plateforme fluide ! Je la conseille à tous les étudiants africains.",
    author: "Kadje Jephte",
    role: "Étudiant à Ngoaekele",
    stars: 5,
  },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isScrolled = scrollY > 10;

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        minHeight: "100vh",
        position: "relative",
        padding: "24px 0 0 0", // Supprimé le padding bottom pour le footer
        overflow: "hidden",
      }}
    >
      {/* ===== IMAGE DE FOND ANIMÉE (PARALLAXE) ===== */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden" }} aria-hidden="true">
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "120%",
            height: "140%",
            background:
              "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            transform: `translateY(${scrollY * 0.15}px) scale(1.05)`,
            willChange: "transform",
            filter: "brightness(0.85) saturate(0.9)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(255,248,235,0.25) 0%, rgba(255,255,255,0.4) 50%, rgba(248,246,243,0.7) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-30%",
            right: "-20%",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.04), transparent 70%)",
            animation: "floatGlow 10s ease-in-out infinite alternate",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-20%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.03), transparent 70%)",
            animation: "floatGlow 12s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes floatGlow {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          100% { transform: translate(40px, -40px) scale(1.2); opacity: 0.8; }
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; }

        .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }
        .section { padding: 40px 0; }
        .text-center { text-align: center; }
        .flex-center { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px; }

        .title-lg { font-size: 44px; font-weight: 700; color: #1A1A2E; letter-spacing: -1px; line-height: 1.2; }
        .title-md { font-size: 28px; font-weight: 700; color: #1A1A2E; letter-spacing: -0.5px; }
        .title-sm { font-size: 18px; font-weight: 600; color: #1A1A2E; }
        .text-body { font-size: 16px; color: #4B4B5C; line-height: 1.6; }
        .text-small { font-size: 14px; color: #6B6B7B; line-height: 1.5; }
        .text-muted { font-size: 13px; color: #9A9A9A; }
        .text-gold { color: #C9A200; }

        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; background: rgba(255,255,255,0.6); backdrop-filter: blur(8px); border-radius: 50px; font-size: 12px; font-weight: 600; color: #6B6B7B; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.15); }
        .badge-gold { background: rgba(201, 162, 0, 0.12); color: #C9A200; border-color: rgba(201,162,0,0.1); }

        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 36px; background: linear-gradient(135deg, #C9A200, #F4D03F); color: #1A1A2E; border-radius: 50px; font-size: 15px; font-weight: 700; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(201, 162, 0, 0.2); border: none; cursor: pointer; }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(201, 162, 0, 0.3); }
        .btn-secondary { display: inline-flex; align-items: center; gap: 6px; padding: 14px 32px; border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 500; transition: all 0.3s ease; background: rgba(255,255,255,0.08); backdrop-filter: blur(8px); }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); border-color: #FFFFFF; transform: translateY(-3px); }
        .btn-small { padding: 8px 20px; font-size: 13px; }

        a:focus-visible, button:focus-visible {
          outline: 2px solid #C9A200;
          outline-offset: 3px;
          border-radius: 8px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        .box { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border-radius: 20px; padding: 40px 36px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; }
        .box:hover { transform: translateY(-4px); box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08); }

        .box-light { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(12px); border-radius: 16px; padding: 28px 24px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02); transition: all 0.3s ease; }
        .box-light:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06); }

        .box-step { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02); transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; min-width: 140px; max-width: 200px; }
        .box-step:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(201, 162, 0, 0.08); }

        .testimonial-card { background: rgba(248, 246, 243, 0.7); backdrop-filter: blur(12px); border-radius: 16px; padding: 28px 24px; transition: all 0.3s ease; text-align: left; }
        .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06); }

        .cta-box { background: linear-gradient(135deg, rgba(26,26,46,0.85), rgba(45,27,78,0.85)); backdrop-filter: blur(16px); border-radius: 20px; padding: 48px 40px; text-align: center; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08); transition: all 0.4s ease; max-width: 1100px; margin: 0 auto; }
        .cta-box:hover { transform: translateY(-4px); box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12); }

        .trust-logo { display: inline-flex; align-items: center; gap: 8px; color: #9A9A9A; font-weight: 500; transition: all 0.3s ease; }
        .trust-logo:hover { color: #C9A200; transform: scale(1.05); }

        .step-item { padding: 10px 20px; background: rgba(248, 246, 243, 0.6); backdrop-filter: blur(8px); border-radius: 50px; font-size: 14px; font-weight: 600; color: #1A1A2E; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease; border: 1px solid rgba(255, 255, 255, 0.2); }
        .step-item:hover { background: rgba(201, 162, 0, 0.12); border-color: #C9A200; transform: scale(1.04) translateY(-2px); box-shadow: 0 4px 20px rgba(201,162,0,0.08); }

        /* ===== HERO - PLEINE LARGEUR ===== */
        .hero { 
          padding: 80px 24px; 
          min-height: 80vh; 
          display: flex; 
          align-items: center; 
          position: relative; 
          overflow: hidden; 
          background: #000000; 
          margin: 0 -24px; /* Pour dépasser du container */
          border-radius: 0;
          box-shadow: 0 8px 48px rgba(0, 0, 0, 0.2);
          width: 100vw;
          left: 50%;
          transform: translateX(-50%);
        }
        .hero-bg { position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat; opacity: 0.4; z-index: 0; animation: heroZoom 12s ease-in-out infinite alternate; }
        @keyframes heroZoom { 0% { transform: scale(1.05); } 100% { transform: scale(1.2); } }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(26,10,46,0.7), rgba(0,0,0,0.5)); z-index: 1; }
        .hero-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(201,162,0,0.08), transparent 70%); top: -200px; right: -200px; z-index: 1; animation: glowPulse 6s ease-in-out infinite alternate; }
        .hero-glow-2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(201,162,0,0.05), transparent 70%); bottom: -100px; left: -100px; z-index: 1; animation: glowPulse 8s ease-in-out infinite alternate-reverse; }
        @keyframes glowPulse { 0% { opacity: 0.3; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1.2); } }
        .hero-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; text-align: center; }

        /* ===== NAVBAR ===== */
        .navbar { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(24px); padding: 0 24px; height: 64px; display: flex; align-items: center; border-radius: 16px; max-width: 1100px; margin: 0 auto 24px; transition: background 0.3s ease, box-shadow 0.3s ease; }
        .navbar-idle { background: rgba(255,255,255,0.7); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); }
        .navbar-scrolled { background: rgba(255,255,255,0.92); box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08); }

        .nav-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 50px; font-size: 14px; font-weight: 500; color: #6B6B7B; text-decoration: none; transition: all 0.2s ease; border: 1px solid transparent; }
        .nav-link:hover { color: #1A1A2E; background: rgba(245, 240, 235, 0.5); border-color: rgba(232, 221, 208, 0.3); }
        .nav-link-active { color: #1A1A2E; background: rgba(245, 240, 235, 0.5); border-color: rgba(232, 221, 208, 0.3); }

        .nav-links-desktop { display: none; align-items: center; gap: 4px; }
        .nav-toggle-btn { display: flex; background: none; border: none; cursor: pointer; padding: 8px; color: #1A1A2E; }

        @media (min-width: 768px) {
          .nav-links-desktop { display: flex; }
          .nav-toggle-btn { display: none; }
        }

        @media (max-width: 768px) {
          .title-lg { font-size: 32px; }
          .title-md { font-size: 24px; }
          .section { padding: 24px 0; }
          .box { padding: 28px 20px; }
          .hero { min-height: 70vh; padding: 40px 24px; margin: 0 -12px; }
          .hero-glow { width: 300px; height: 300px; top: -100px; right: -100px; }
          .hero-glow-2 { width: 200px; height: 200px; bottom: -50px; left: -50px; }
          .navbar { margin: 0 12px 16px; padding: 0 12px; border-radius: 12px; }
          .box-step { min-width: 100px; padding: 16px; }
          .cta-box { padding: 32px 24px; margin: 0 12px; }
        }

        /* ===== FOOTER - PLEINE LARGEUR ===== */
        .footer-full {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          padding: 24px 24px;
          text-align: center;
          backdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }
      `}</style>

      {/* ============================================================
          NAVBAR
          ============================================================ */}
      <header className={`navbar ${isScrolled ? "navbar-scrolled" : "navbar-idle"}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #C9A200, #F4D03F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 700,
                color: "#1A1A2E",
              }}
            >
              L
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A2E" }}>LIGHT</span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#C9A200",
                background: "rgba(201,162,0,0.1)",
                padding: "2px 10px",
                borderRadius: "50px",
                textTransform: "uppercase",
              }}
            >
              Beta
            </span>
          </Link>

          <nav className="nav-links-desktop" aria-label="Navigation principale">
            <Link href="/" className="nav-link nav-link-active">
              <Home size={15} aria-hidden="true" /> Accueil
            </Link>
            <Link href="/about" className="nav-link">
              <Info size={15} aria-hidden="true" /> À propos
            </Link>
            <span style={{ width: "1px", height: "24px", background: "rgba(232, 221, 208, 0.3)", margin: "0 4px" }} />
            <Link href="/Login" className="nav-link">
              <LogIn size={15} aria-hidden="true" /> Connexion
            </Link>
            <Link href="/Register" className="btn-primary btn-small">
              <UserPlus size={15} aria-hidden="true" /> S'inscrire
            </Link>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="nav-toggle-btn"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            zIndex: 49,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            gap: "12px",
          }}
        >
          <Link href="/" className="nav-link nav-link-active" style={{ fontSize: "20px", padding: "16px 32px" }} onClick={() => setIsMenuOpen(false)}>
            <Home size={20} /> Accueil
          </Link>
          <Link href="/about" className="nav-link" style={{ fontSize: "20px", padding: "16px 32px" }} onClick={() => setIsMenuOpen(false)}>
            <Info size={20} /> À propos
          </Link>
          <div style={{ width: "60px", height: "1px", background: "rgba(232, 221, 208, 0.3)", margin: "8px 0" }} />
          <Link href="/Login" className="nav-link" style={{ fontSize: "20px", padding: "16px 32px" }} onClick={() => setIsMenuOpen(false)}>
            <LogIn size={20} /> Connexion
          </Link>
          <Link href="/Register" className="btn-primary" style={{ fontSize: "18px", padding: "16px 48px", marginTop: "8px" }} onClick={() => setIsMenuOpen(false)}>
            <UserPlus size={20} /> S'inscrire
          </Link>
        </div>
      )}

      <main>
        {/* ============================================================
            HERO - PLEINE LARGEUR
            ============================================================ */}
        <section className="hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-glow-2" aria-hidden="true" />
          <div className="hero-content">
            <span
              className="badge badge-gold"
              style={{ marginBottom: "16px", background: "rgba(201,162,0,0.15)", color: "#F4D03F", border: "none" }}
            >
              <Sparkles size={14} aria-hidden="true" /> La Plateforme entrepreneuriale pour étudiants
            </span>
            <h1 className="title-lg" style={{ color: "#FFFFFF" }}>
              UN ÉTUDIANT UN PROJET, <span style={{ color: "#F4D03F" }}>UNE ENTREPRISE</span>
            </h1>
            <p className="text-body" style={{ color: "rgba(255,255,255,0.85)", maxWidth: "500px", margin: "16px auto 32px" }}>
              L'application intelligente qui guide les entrepreneurs de l'idée à la réussite.
            </p>
            <div className="flex-center">
              <Link href="/Register" className="btn-primary">
                Commençons ! <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="#features" className="btn-secondary">
                En savoir plus
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================
            TRUST
            ============================================================ */}
        <section className="section">
          <div className="container">
            <div className="box" style={{ padding: "32px 36px" }}>
              <div className="text-center">
                <p className="text-muted" style={{ textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                  Ils nous font confiance
                </p>
                <div className="flex-center" style={{ gap: "28px" }}>
                  {TRUSTED_BY.map((item) => (
                    <div key={item.name} className="trust-logo">
                      <item.icon size={18} aria-hidden="true" /> {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            STEPS
            ============================================================ */}
        <section className="section">
          <div className="container">
            <div className="box" style={{ padding: "48px 40px" }}>
              <div className="text-center">
                <span className="badge" style={{ marginBottom: "12px" }}>
                  <Target size={14} aria-hidden="true" /> Feuille de route
                </span>
                <h2 className="title-md" style={{ marginBottom: "36px" }}>
                  Transforme ton idée en plan d'affaires
                </h2>
                <div className="flex-center" style={{ gap: "16px" }}>
                  {STEPS.map((step) => (
                    <div key={step.label} className="box-step">
                      <step.icon size={28} style={{ color: "#C9A200" }} aria-hidden="true" />
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A2E" }}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            FEATURES
            ============================================================ */}
        <section className="section" id="features">
          <div className="container">
            <div className="box" style={{ padding: "40px 36px" }}>
              <div className="text-center">
                <span className="badge" style={{ marginBottom: "12px" }}>
                  <Zap size={14} aria-hidden="true" /> Propulsé par l'IA
                </span>
                <h2 className="title-md" style={{ marginBottom: "8px" }}>
                  Construis ton plan plus rapidement
                </h2>
                <p className="text-muted" style={{ marginBottom: "32px" }}>
                  L'IA au service de ton projet entrepreneurial
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                  {FEATURES.map((f) => (
                    <div key={f.title} className="box-light" style={{ textAlign: "center" }}>
                      <f.icon size={32} style={{ color: "#C9A200", marginBottom: "12px" }} aria-hidden="true" />
                      <h3 className="title-sm" style={{ marginBottom: "4px" }}>
                        {f.title}
                      </h3>
                      <p className="text-small" style={{ margin: 0 }}>
                        {f.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            TESTIMONIALS
            ============================================================ */}
        <section className="section">
          <div className="container">
            <div className="box" style={{ padding: "40px 36px" }}>
              <div className="text-center">
                <span className="badge" style={{ marginBottom: "12px" }}>
                  <Users size={14} aria-hidden="true" /> Témoignages
                </span>
                <h2 className="title-md" style={{ marginBottom: "32px" }}>
                  Ce que nos utilisateurs disent
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                  {TESTIMONIALS.map((t) => (
                    <div key={t.author} className="testimonial-card">
                      <Quote size={24} style={{ color: "#C9A200", opacity: 0.3, marginBottom: "12px" }} aria-hidden="true" />
                      <p className="text-body" style={{ marginBottom: "12px" }}>
                        "{t.quote}"
                      </p>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }} aria-label={`Note : ${t.stars} sur 5`}>
                        {[...Array(t.stars)].map((_, i2) => (
                          <Star key={i2} size={14} style={{ color: "#C9A200", fill: "#C9A200" }} aria-hidden="true" />
                        ))}
                      </div>
                      <p className="text-body" style={{ fontWeight: 600, margin: 0 }}>
                        {t.author}
                      </p>
                      <p className="text-small" style={{ margin: 0 }}>
                        {t.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            CTA
            ============================================================ */}
        <section className="section">
          <div className="container">
            <div className="cta-box">
              <span className="badge" style={{ background: "rgba(255,215,0,0.1)", color: "#F4D03F", border: "none", marginBottom: "12px" }}>
                <Award size={14} aria-hidden="true" /> Rejoins la communauté
              </span>
              <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>Prêt à commencer ?</h2>
              <p className="text-body" style={{ color: "rgba(255,255,255,0.6)", marginBottom: "28px" }}>
                Rejoins la communauté LIGHT et fais briller ton idée
              </p>
              <Link href="/Register" className="btn-primary">
                S'inscrire gratuitement <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================
          FOOTER - PLEINE LARGEUR
          ============================================================ */}
      <footer
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          padding: "32px 24px",
          textAlign: "center",
          backdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          marginTop: "24px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p className="text-small" style={{ letterSpacing: "1px", textTransform: "uppercase", margin: 0, color: "rgba(0,0,0,0.35)" }}>
            © 2026 <span className="text-gold">LIGHT</span> · Entrepreneuriat Africain
          </p>
        </div>
      </footer>
    </div>
  );
}