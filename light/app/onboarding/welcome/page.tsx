// app/onboarding/welcome/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  Brain, 
  Target, 
  BarChart3, 
  Users,
  Rocket,
  Clock,
  Star,
  Shield,
  ChevronRight
} from 'lucide-react';

export default function WelcomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const steps = [
    { icon: Brain, label: "Ton profil", desc: "Qui es-tu ? Étudiant, entrepreneur, porteur de projet ?" },
    { icon: Target, label: "Ton projet", desc: "Quelle est ton idée ? Dans quel secteur ?" },
    { icon: BarChart3, label: "Tes objectifs", desc: "Quels sont tes buts ? Court, moyen, long terme ?" },
    { icon: Users, label: "Ton équipe", desc: "Es-tu seul ou accompagné ?" },
  ];

  const benefits = [
    { icon: Rocket, label: "Accélération", desc: "Gagne du temps avec un plan personnalisé" },
    { icon: Clock, label: "Gain de temps", desc: "Ne pars pas de zéro, utilise nos modèles" },
    { icon: Star, label: "Pertinence", desc: "Des recommandations adaptées à ton profil" },
    { icon: Shield, label: "Confidentialité", desc: "Tes données sont sécurisées" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ===== FOND AVEC IMAGE ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        {/* Image de fond principale */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.12,
            transform: `translateY(${scrollY * 0.06}px) scale(1.1)`,
            transition: "transform 0.05s ease-out",
          }}
        />
        {/* Dégradé sombre pour lisibilité */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(26,10,46,0.6) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* Effets lumineux */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,162,0,0.06), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(201,162,0,0.04), transparent 70%)",
            bottom: "-100px",
            left: "-80px",
            animation: "floatBg 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
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

        .fade-in-up {
          opacity: 0;
          transform: translateY(40px) scale(0.96);
          animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.25s; }
        .delay-3 { animation-delay: 0.4s; }
        .delay-4 { animation-delay: 0.55s; }
        .delay-5 { animation-delay: 0.7s; }
        .delay-6 { animation-delay: 0.85s; }
        .delay-7 { animation-delay: 1s; }

        .step-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
        }

        .step-card:hover {
          transform: translateY(-6px);
          border-color: rgba(201, 162, 0, 0.2);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
        }

        .benefit-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.3s ease;
          text-align: center;
          cursor: default;
        }

        .benefit-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(201, 162, 0, 0.1);
          transform: translateY(-4px);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px;
          background: linear-gradient(135deg, #C9A200, #F4D03F);
          color: #1A1A2E;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 24px rgba(201, 162, 0, 0.2);
          cursor: pointer;
        }

        .btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 48px rgba(201, 162, 0, 0.35);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          transform: translateY(-3px);
        }

        .badge-welcome {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(201, 162, 0, 0.12);
          border: 1px solid rgba(201, 162, 0, 0.15);
          border-radius: 50px;
          font-size: 13px;
          font-weight: 500;
          color: #F4D03F;
        }
      `}</style>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* ===== HEADER ===== */}
        <div className="fade-in-up delay-1" style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <span className="badge-welcome">
              <Sparkles size={16} />
              Bienvenue dans LIGHT
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: "48px", 
            fontWeight: 700, 
            color: "#FFFFFF", 
            letterSpacing: "-1.5px",
            marginBottom: "12px",
            lineHeight: "1.1",
          }}>
            Prêt à faire briller ton idée ? 
          </h1>
          
          <p style={{ 
            fontSize: "18px", 
            color: "rgba(255,255,255,0.7)", 
            maxWidth: "600px", 
            margin: "0 auto",
            lineHeight: "1.7",
          }}>
            Pour te proposer un environnement parfaitement adapté à tes besoins, 
            nous avons besoin de mieux te connaître.
          </p>
        </div>

        {/* ===== ÉTAPES DU QUESTIONNAIRE ===== */}
        <div className="fade-in-up delay-2" style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
            <Brain size={20} style={{ color: "#F4D03F" }} />
            <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#FFFFFF", margin: 0 }}>
              Voici ce qui t'attend
            </h2>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
            gap: "16px",
          }}>
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  marginBottom: "10px",
                }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(115, 73, 250, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <step.icon size={18} style={{ color: "#F4D03F" }} />
                  </div>
                  <span style={{ 
                    fontSize: "14px", 
                    fontWeight: 600, 
                    color: "#FFFFFF",
                    letterSpacing: "0.3px",
                  }}>
                    {step.label}
                  </span>
                </div>
                <p style={{ 
                  fontSize: "13px", 
                  color: "rgba(255,255,255,0.5)", 
                  margin: 0,
                  lineHeight: "1.5",
                  paddingLeft: "4px",
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== BÉNÉFICES ===== */}
        <div className="fade-in-up delay-3" style={{ marginBottom: "48px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            justifyContent: "center", 
            marginBottom: "20px" 
          }}>
            <CheckCircle size={20} style={{ color: "#10B981" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 500, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Pourquoi ce questionnaire ?
            </h2>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
            gap: "12px",
          }}>
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(201, 162, 0, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                }}>
                  <benefit.icon size={18} style={{ color: "#F4D03F" }} />
                </div>
                <p style={{ 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  color: "#FFFFFF", 
                  margin: "0 0 4px",
                }}>
                  {benefit.label}
                </p>
                <p style={{ 
                  fontSize: "12px", 
                  color: "rgba(255,255,255,0.4)", 
                  margin: 0,
                  lineHeight: "1.4",
                }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="fade-in-up delay-4" style={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          gap: "16px",
          paddingTop: "8px",
        }}>
          <p style={{ 
            fontSize: "14px", 
            color: "rgba(255,255,255,0.4)", 
            margin: 0,
            textAlign: "center",
            maxWidth: "400px",
          }}>
            Cela prendra environ <strong style={{ color: "#F4D03F" }}>5 minutes</strong> et permettra de personnaliser ton expérience.
          </p>
          
          <Link href="/onboarding/questionnaire" className="btn-primary">
            Commencer le questionnaire
            <ChevronRight size={18} />
          </Link>

          <Link href="/dashboard" className="btn-secondary">
            <span>Passer pour l'instant</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="fade-in-up delay-5" style={{ 
          marginTop: "48px", 
          paddingTop: "24px", 
          borderTop: "1px solid rgba(255,255,255,0.04)",
          textAlign: "center",
        }}>
          <p style={{ 
            fontSize: "12px", 
            color: "rgba(255,255,255,0.2)", 
            letterSpacing: "1px", 
            textTransform: "uppercase",
            margin: 0,
          }}>
            © 2026 <span style={{ color: "#C9A200" }}>LIGHT</span> · Entrepreneuriat Africain
          </p>
        </div>
      </div>
    </div>
  );
}