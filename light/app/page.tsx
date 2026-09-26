// app/page.tsx
// PAGE D'ACCUEIL - AVEC IMAGE DE FOND CONTEXTUELLE

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Menu, X, Home, Info, LogIn, UserPlus,
  Lightbulb, Palette, Settings, Rocket,
  Languages, TrendingUp, FileText,
  Sparkles, Target, Quote, Star, Users,
  Zap, Award, Building2, Cloud, ArrowRight,
  Globe2, GraduationCap, Briefcase, Heart,
  Cpu, Shield, ChevronRight, CheckCircle,
  BarChart3, MessageCircle, Mail, LayoutDashboard
} from "lucide-react";

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
// DONNÉES
// ============================================================
const STATS = [
  { value: "60%", label: "Des jeunes aspirent à entreprendre" },
  { value: "78%", label: "Échouent par manque d'accompagnement" },
  { value: "15%", label: "Passent à l'acte" },
  { value: "100%", label: "D'ambition à révéler" },
];

const STEPS = [
  { icon: Lightbulb, label: "Idéalisation", desc: "Déposez votre idée et recevez une première estimation IA" },
  { icon: Palette, label: "Conception", desc: "Structurez votre projet avec des outils collaboratifs" },
  { icon: Settings, label: "Développement", desc: "Construisez avec le suivi de votre encadrant" },
  { icon: Rocket, label: "Test", desc: "Validez chaque jalon et préparez le lancement" },
  { icon: Award, label: "Concrétisation", desc: "Lancez votre entreprise avec la communauté" },
];

const FEATURES = [
  { icon: Languages, title: "9 langues", desc: "Guide personnalisé dans votre langue maternelle", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" },
  { icon: TrendingUp, title: "Prévisions IA", desc: "Estimations budgétaires contextualisées au Cameroun", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" },
  { icon: FileText, title: "Modèles prêts", desc: "Templates adaptés à votre secteur d'activité", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop" },
  { icon: Users, title: "Collaboration", desc: "Invitez des membres et gérez les rôles en temps réel", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" },
  { icon: Target, title: "Validation", desc: "Soumettez vos jalons et recevez des feedbacks", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop" },
  { icon: Award, title: "Concrétisation", desc: "Transformez votre projet en entreprise prospère", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2070&auto=format&fit=crop" },
];

const TESTIMONIALS = [
  {
    quote: "J'ai utilisé cette plateforme pour mon projet étudiant, et c'est une véritable révolution. L'estimation IA m'a permis de présenter un business plan solide.",
    author: "Atangana Jacques",
    role: "Étudiant IAI Cameroun",
    stars: 5,
  },
  {
    quote: "En tant qu'encadrant, j'ai enfin une vision claire de l'avancement de tous mes projets. La traçabilité est exemplaire.",
    author: "Kadje Jephte",
    role: "Encadrant académique",
    stars: 5,
  },
  {
    quote: "La plateforme m'a permis de structurer mon idée et de trouver des investisseurs. Je recommande vivement !",
    author: "Mbengue Sarah",
    role: "Porteuse de projet, GreenTech",
    stars: 5,
  },
];

const TRUSTED_BY = [
  { name: "IAI-Cameroun", icon: Building2 },
  { name: "BEONWEB", icon: Cloud },
  { name: "Ministère de l'Enseignement Supérieur", icon: Award },
];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function HomePage() {
  const scrollY = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Visiteur déjà connecté : on lui propose d'aller directement à son espace
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A1628",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "0 0 24px 0",
      }}
    >
      {/* ===== IMAGE DE FOND CONTEXTUELLE AVEC PARALLAX ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        {/* Image de fond principale */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.15,
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
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          animation: fadeInUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.15s; }
        .delay-3 { animation-delay: 0.25s; }
        .delay-4 { animation-delay: 0.35s; }
        .delay-5 { animation-delay: 0.45s; }
        .delay-6 { animation-delay: 0.55s; }

        .stat-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 18px 20px;
          border: 1px solid rgba(180, 200, 230, 0.08);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.2);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 8px 40px rgba(0, 20, 50, 0.3);
        }

        .hero-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(180, 200, 230, 0.08);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        .hero-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.2);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 8px 40px rgba(0, 20, 50, 0.3);
        }

        .feature-image {
          height: 160px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .feature-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(10,22,40,0.8) 100%);
        }

        .step-dot {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .step-dot:hover {
          transform: scale(1.08);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 36px;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
          cursor: pointer;
        }
        .btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 40px rgba(212, 175, 55, 0.3);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 14px 32px;
          border: 1px solid rgba(180, 200, 230, 0.15);
          border-radius: 50px;
          color: rgba(200, 215, 235, 0.7);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(180, 200, 230, 0.25);
          color: #E8EDF5;
          transform: translateY(-3px);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          color: #F5D76E;
        }

        .trust-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(200, 215, 235, 0.4);
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .trust-logo:hover {
          color: #F5D76E;
          transform: scale(1.05);
        }

        .testimonial-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 28px 24px;
          border: 1px solid rgba(180, 200, 230, 0.08);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.15);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 40px rgba(0, 20, 50, 0.3);
        }

        .tag {
          padding: 2px 12px;
          border-radius: 50px;
          font-size: 9px;
          font-weight: 600;
          background: rgba(255,255,255,0.05);
          color: rgba(200,215,235,0.5);
          border: 1px solid rgba(180,200,230,0.05);
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(24px);
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          border-radius: 16px;
          max-width: 1100px;
          margin: 0 auto 24px;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .navbar-idle {
          background: rgba(10, 22, 40, 0.6);
          border: 1px solid rgba(180, 200, 230, 0.06);
        }
        .navbar-scrolled {
          background: rgba(10, 22, 40, 0.9);
          border: 1px solid rgba(180, 200, 230, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(200, 215, 235, 0.6);
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .nav-link:hover {
          color: #E8EDF5;
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(180, 200, 230, 0.08);
        }
        .nav-link-active {
          color: #E8EDF5;
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(180, 200, 230, 0.08);
        }

        .nav-links-desktop { display: none; align-items: center; gap: 4px; }
        .nav-toggle-btn {
          display: flex;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: #E8EDF5;
        }

        @media (min-width: 768px) {
          .nav-links-desktop { display: flex; }
          .nav-toggle-btn { display: none; }
        }

        .scrollbar-custom::-webkit-scrollbar { width: 4px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 2px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.5); }
      `}</style>

      {/* ============================================================
          NAVBAR
          ============================================================ */}
      <header className={`navbar ${scrollY > 10 ? "navbar-scrolled" : "navbar-idle"}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 700,
                color: "#0A1628",
              }}
            >
              IAI
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#E8EDF5" }}>Entrepreneur</span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#D4AF37",
                background: "rgba(212,175,55,0.12)",
                padding: "2px 10px",
                borderRadius: "50px",
                textTransform: "uppercase",
                border: "1px solid rgba(212,175,55,0.1)",
              }}
            >
              Beta
            </span>
          </Link>

          <nav className="nav-links-desktop" aria-label="Navigation principale">
            <Link href="/" className="nav-link nav-link-active">
              <Home size={15} aria-hidden="true" /> Accueil
            </Link>
            <Link href="#fonctionnalites" className="nav-link">
              <Info size={15} aria-hidden="true" /> Fonctionnalités
            </Link>
            <span style={{ width: "1px", height: "24px", background: "rgba(180,200,230,0.1)", margin: "0 4px" }} />
            {isLoggedIn && (
              <Link href="/dashboard" className="nav-link">
                <LayoutDashboard size={15} aria-hidden="true" /> Mon espace
              </Link>
            )}
            <Link href="/login" className="nav-link">
              <LogIn size={15} aria-hidden="true" /> Connexion
            </Link>
            <Link href="/register" className="btn-primary" style={{ padding: "8px 20px", fontSize: "13px" }}>
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
            background: "rgba(10,22,40,0.98)",
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
          <Link href="#fonctionnalites" className="nav-link" style={{ fontSize: "20px", padding: "16px 32px" }} onClick={() => setIsMenuOpen(false)}>
            <Info size={20} /> Fonctionnalités
          </Link>
          <div style={{ width: "60px", height: "1px", background: "rgba(180,200,230,0.1)", margin: "8px 0" }} />
          {isLoggedIn && (
            <Link href="/dashboard" className="nav-link" style={{ fontSize: "20px", padding: "16px 32px" }} onClick={() => setIsMenuOpen(false)}>
              <LayoutDashboard size={20} /> Mon espace
            </Link>
          )}
          <Link href="/login" className="nav-link" style={{ fontSize: "20px", padding: "16px 32px" }} onClick={() => setIsMenuOpen(false)}>
            <LogIn size={20} /> Connexion
          </Link>
          <Link href="/register" className="btn-primary" style={{ fontSize: "18px", padding: "16px 48px", marginTop: "8px" }} onClick={() => setIsMenuOpen(false)}>
            <UserPlus size={20} /> S'inscrire
          </Link>
        </div>
      )}

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>

        {/* ============================================================
            HERO
            ============================================================ */}
        <section className="fade-in-up delay-1" style={{ padding: "40px 0 60px" }}>
          <div className="hero-card" style={{ padding: "48px 40px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <span className="badge">
                <Sparkles size={14} />
                La Plateforme entrepreneuriale pour étudiants
              </span>
            </div>
            <h1 style={{
              fontSize: "44px",
              fontWeight: 700,
              color: "#E8EDF5",
              letterSpacing: "-1px",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}>
              UN ÉTUDIANT UN PROJET, <br />
              <span style={{ color: "#F5D76E" }}>UNE ENTREPRISE</span>
            </h1>
            <p style={{
              fontSize: "18px",
              color: "rgba(200,215,235,0.6)",
              maxWidth: "500px",
              margin: "0 auto 32px",
              lineHeight: 1.7,
            }}>
              L'application intelligente qui guide les entrepreneurs de l'idée à la réussite.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "12px" }}>
              <Link href="/register" className="btn-primary">
                Commençons !
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="#fonctionnalites" className="btn-secondary">
                En savoir plus
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================
            STATS
            ============================================================ */}
        <section className="fade-in-up delay-2" style={{ marginBottom: "48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            {STATS.map((stat, index) => (
              <div key={index} className="stat-card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "#F5D76E", margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", margin: "4px 0 0 0" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================
            TRUST
            ============================================================ */}
        <section className="fade-in-up delay-2" style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(180,200,230,0.04)" }}>
            <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
              Ils nous font confiance
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "28px" }}>
              {TRUSTED_BY.map((item) => (
                <div key={item.name} className="trust-logo">
                  <item.icon size={18} aria-hidden="true" /> {item.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            STEPS (Parcours)
            ============================================================ */}
        <section className="fade-in-up delay-3" style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span className="badge" style={{ marginBottom: "12px" }}>
              <Target size={14} aria-hidden="true" /> Feuille de route
            </span>
            <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#E8EDF5", letterSpacing: "-0.5px" }}>
              Transforme ton idée en plan d'affaires
            </h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            {STEPS.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="step-dot"
                style={{
                  flex: 1,
                  minWidth: "140px",
                  maxWidth: "200px",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "16px",
                  padding: "20px 16px",
                  border: "1px solid rgba(180,200,230,0.06)",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(180,200,230,0.06)"; }}
              >
                <step.icon size={28} style={{ color: "#F5D76E", marginBottom: "8px" }} aria-hidden="true" />
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#E8EDF5", margin: "0 0 4px 0" }}>{step.label}</p>
                <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.4)", margin: 0, lineHeight: 1.4 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================================================
            FEATURES
            ============================================================ */}
        <section id="fonctionnalites" className="fade-in-up delay-4" style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span className="badge" style={{ marginBottom: "12px" }}>
              <Zap size={14} aria-hidden="true" /> Propulsé par l'IA
            </span>
            <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#E8EDF5", letterSpacing: "-0.5px" }}>
              Construis ton plan plus rapidement
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(200,215,235,0.4)", marginTop: "4px" }}>
              L'IA au service de ton projet entrepreneurial
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="hero-card"
              >
                <div
                  className="feature-image"
                  style={{ backgroundImage: `url(${feature.image})` }}
                />
                <div style={{ padding: "16px 18px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(212,175,55,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <feature.icon size={16} style={{ color: "#F5D76E" }} />
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>{feature.title}</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(200,215,235,0.5)", margin: 0, lineHeight: 1.5 }}>
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================================================
            TESTIMONIALS
            ============================================================ */}
        <section className="fade-in-up delay-5" style={{ marginBottom: "48px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span className="badge" style={{ marginBottom: "12px" }}>
              <Users size={14} aria-hidden="true" /> Témoignages
            </span>
            <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#E8EDF5", letterSpacing: "-0.5px" }}>
              Ce que nos utilisateurs disent
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="testimonial-card"
              >
                <Quote size={24} style={{ color: "#D4AF37", opacity: 0.3, marginBottom: "12px" }} aria-hidden="true" />
                <p style={{ fontSize: "14px", color: "rgba(200,215,235,0.7)", lineHeight: 1.6, marginBottom: "12px" }}>
                  "{testimonial.quote}"
                </p>
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }} aria-label={`Note : ${testimonial.stars} sur 5`}>
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} size={14} style={{ color: "#F5D76E", fill: "#F5D76E" }} aria-hidden="true" />
                  ))}
                </div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#E8EDF5", margin: 0 }}>
                  {testimonial.author}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", margin: 0 }}>
                  {testimonial.role}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================================================
            CTA
            ============================================================ */}
        <section className="fade-in-up delay-6" style={{ marginBottom: "32px" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(10,22,40,0.8))",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "48px 40px",
            textAlign: "center",
            border: "1px solid rgba(212,175,55,0.1)",
          }}>
            <span className="badge" style={{ marginBottom: "12px" }}>
              <Award size={14} aria-hidden="true" /> Rejoins la communauté
            </span>
            <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#E8EDF5", marginBottom: "12px" }}>
              Prêt à commencer ?
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(200,215,235,0.5)", marginBottom: "28px" }}>
              Rejoins la communauté IAI Entrepreneur et fais briller ton idée
            </p>
            <Link href="/register" className="btn-primary">
              S'inscrire gratuitement
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ============================================================
            FOOTER
            ============================================================ */}
        <footer className="fade-in-up delay-6" style={{
          paddingTop: "24px",
          borderTop: "1px solid rgba(180,200,230,0.06)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.2)", letterSpacing: "0.5px", margin: 0 }}>
            © 2026 <span style={{ color: "#D4AF37" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </footer>
      </div>
    </div>
  );
}