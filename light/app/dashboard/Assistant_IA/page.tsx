// app/dashboard/projets/[id]/assistant/page.tsx
// ASSISTANT IA - MENTOR ENTREPRENEURIAL (VERSION FINALE)

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Target,
  Users,
  Wallet,
  Rocket,
  BarChart3,
  Lightbulb,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  Calendar,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Brain,
  Award,
  Globe,
  Building2,
  Briefcase,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Crown,
  AlertCircle,
  Play,
  Gift,
  Plus,
  X
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface KPI {
  label: string;
  value: string | number;
  change?: string;
  status: "positive" | "negative" | "neutral";
  icon: any;
}

interface StrategyItem {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  impact: "high" | "medium" | "low";
}

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  trend: "up" | "down" | "stable";
  source: string;
}

interface RevenueStream {
  id: string;
  name: string;
  description: string;
  potential: "high" | "medium" | "low";
  status: "active" | "planned" | "exploring";
}

interface ChatMessage {
  id: string;
  sender: "user" | "mentor";
  content: string;
  timestamp: string;
}

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
// COMPOSANT PRINCIPAL
// ============================================================
export default function AssistantPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const scrollY = useScroll();

  // ===== ÉTATS =====
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "mentor",
      content: "👋 Félicitations pour l'avancement de votre projet ! Je suis votre mentor entrepreneurial. Ensemble, nous allons transformer votre projet en une entreprise prospère et durable.",
      timestamp: "10:00"
    },
    {
      id: "2",
      sender: "mentor",
      content: "🔍 Analyse rapide : Votre projet a un fort potentiel de croissance. Le marché est porteur, mais il faudra différencier votre offre. Prêt à passer à l'action ?",
      timestamp: "10:02"
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "monetization" | "growth" | "chat">("overview");

  // ===== DONNÉES MOCKÉES =====
  const [kpis, setKpis] = useState<KPI[]>([
    { label: "Potentiel de marché", value: "85%", change: "+12%", status: "positive", icon: TrendingUp },
    { label: "Taux de croissance estimé", value: "32%", change: "+8%", status: "positive", icon: Rocket },
    { label: "Score de monétisation", value: "72/100", change: "+15", status: "positive", icon: Wallet },
    { label: "Niveau de maturité", value: "Élevé", change: "+2", status: "positive", icon: Award },
  ]);

  const [strategies, setStrategies] = useState<StrategyItem[]>([
    { id: "1", title: "Définir la proposition de valeur unique", description: "Clarifier ce qui vous différencie des concurrents", status: "in-progress", impact: "high" },
    { id: "2", title: "Valider le modèle économique", description: "Tester les hypothèses de revenus avec des clients réels", status: "todo", impact: "high" },
    { id: "3", title: "Établir un plan de marketing digital", description: "Créer une stratégie d'acquisition sur les réseaux sociaux", status: "todo", impact: "medium" },
    { id: "4", title: "Préparer un pitch deck investisseur", description: "Structurer une présentation pour lever des fonds", status: "done", impact: "high" },
  ]);

  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([
    { id: "1", title: "Croissance du secteur EdTech", description: "Le marché de l'éducation numérique croît de 25% par an en Afrique", trend: "up", source: "GSMA 2026" },
    { id: "2", title: "Adoption du mobile", description: "75% des utilisateurs accèdent aux services via smartphone", trend: "up", source: "DataReportal" },
    { id: "3", title: "Concurrence croissante", description: "5 nouveaux concurrents locaux sont apparus cette année", trend: "down", source: "StartupBase" },
  ]);

  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([
    { id: "1", name: "Abonnements premium", description: "Accès à des fonctionnalités avancées payantes", potential: "high", status: "planned" },
    { id: "2", name: "Services de conseil", description: "Accompagnement personnalisé pour les projets", potential: "medium", status: "exploring" },
    { id: "3", name: "Formation et coaching", description: "Ateliers et formations sur l'entrepreneuriat", potential: "high", status: "planned" },
    { id: "4", name: "Place de marché", description: "Mise en relation avec des investisseurs", potential: "medium", status: "exploring" },
  ]);

  // ============================================================
  // GESTION DU CHAT
  // ============================================================
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: userMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setUserMessage("");
    setIsLoading(true);

    // Simuler une réponse du mentor
    setTimeout(() => {
      const mentorResponses = [
        "💡 Excellente réflexion ! Voici une piste : analysez vos concurrents directs pour identifier vos atouts différenciants.",
        "📊 D'après mon analyse, le marché est en pleine expansion. C'est le moment d'accélérer votre acquisition.",
        "🎯 Votre proposition de valeur est claire. Concentrez-vous sur la validation de votre modèle économique avec des clients pilotes.",
        "🚀 La croissance viendra de votre capacité à fidéliser vos premiers utilisateurs. Pensez à un programme de recommandation.",
        "💎 N'oubliez pas de documenter vos succès. Les témoignages clients sont vos meilleurs arguments.",
      ];
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "mentor",
        content: mentorResponses[Math.floor(Math.random() * mentorResponses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, reply]);
      setIsLoading(false);
    }, 1200);
  };

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FA",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "0 0 24px 0",
      }}
    >
      {/* ===== FOND AVEC PARALLAX ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.03,
            transform: `translateY(${scrollY * 0.02}px) scale(1.1)`,
            transition: "transform 0.05s ease-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(200,220,240,0.3) 0%, rgba(245,247,250,0.8) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.04), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(212,175,55,0.02), transparent 70%)",
            bottom: "-100px",
            left: "-80px",
            animation: "floatBg 10s ease-in-out infinite reverse",
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.15s; }
        .delay-3 { animation-delay: 0.25s; }
        .delay-4 { animation-delay: 0.35s; }

        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.02);
        }

        .glass-card-dark {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1px solid rgba(200, 210, 220, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        }

        .kpi-card {
          padding: 16px 18px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200, 210, 220, 0.1);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
          border-color: rgba(212, 175, 55, 0.15);
        }

        .strategy-item {
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(200, 210, 220, 0.1);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .strategy-item:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(200, 210, 220, 0.2);
        }

        .status-badge {
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 600;
        }
        .status-todo { background: rgba(107, 114, 128, 0.12); color: #6B7280; }
        .status-in-progress { background: rgba(99, 102, 241, 0.12); color: #6366F1; }
        .status-done { background: rgba(16, 185, 129, 0.12); color: #10B981; }

        .impact-badge {
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 9px;
          font-weight: 600;
        }
        .impact-high { background: rgba(212, 175, 55, 0.15); color: #D4AF37; }
        .impact-medium { background: rgba(99, 102, 241, 0.12); color: #6366F1; }
        .impact-low { background: rgba(107, 114, 128, 0.12); color: #6B7280; }

        .revenue-card {
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(200, 210, 220, 0.1);
          transition: all 0.3s ease;
        }
        .revenue-card:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(200, 210, 220, 0.2);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
        }
        .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 40px rgba(212, 175, 55, 0.2);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid rgba(200, 210, 220, 0.2);
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          color: #1A2A3A;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(200, 210, 220, 0.4);
        }

        .tab-btn {
          padding: 8px 20px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: rgba(60, 80, 100, 0.5);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tab-btn:hover {
          color: #1A2A3A;
          background: rgba(255, 255, 255, 0.4);
        }
        .tab-btn-active {
          color: #1A2A3A;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }

        .mentor-bubble {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200, 210, 220, 0.1);
          border-radius: 16px 16px 16px 4px;
          padding: 14px 18px;
          max-width: 80%;
          align-self: flex-start;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }
        .user-bubble {
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          border-radius: 16px 16px 4px 16px;
          padding: 14px 18px;
          max-width: 80%;
          align-self: flex-end;
          box-shadow: 0 2px 12px rgba(212, 175, 55, 0.1);
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 2px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }

        .trend-up { color: #10B981; }
        .trend-down { color: #E4736B; }
        .trend-stable { color: #F59E0B; }

        @media (max-width: 768px) {
          .hide-mobile { display: none; }
        }
      `}</style>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>

        {/* ===== EN-TÊTE ===== */}
        <div className="fade-in-up delay-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href={`/dashboard/projets/${projectId}`}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Retour
            </Link>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1A2A3A", letterSpacing: "-0.5px" }}>
              Assistant IA
            </h1>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 12px",
              borderRadius: "50px",
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.1)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#D4AF37",
            }}>
              <Brain size={12} />
              Mentor actif
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn-secondary" style={{ borderColor: "rgba(212,175,55,0.2)" }}>
              <RefreshCw size={14} />
              Actualiser
            </button>
            <Link
              href={`/dashboard/projets/${projectId}/messagerie`}
              className="btn-secondary"
            >
              <MessageCircle size={14} />
              Messagerie
            </Link>
          </div>
        </div>

        {/* ===== KPI ===== */}
        <div className="fade-in-up delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="kpi-card"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.5)", margin: 0 }}>{kpi.label}</p>
                <kpi.icon size={16} style={{ color: kpi.status === "positive" ? "#10B981" : kpi.status === "negative" ? "#E4736B" : "#6B8BA4" }} />
              </div>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#1A2A3A", margin: "4px 0" }}>{kpi.value}</p>
              {kpi.change && (
                <p style={{ fontSize: "11px", color: kpi.status === "positive" ? "#10B981" : kpi.status === "negative" ? "#E4736B" : "#6B8BA4", margin: 0 }}>
                  {kpi.status === "positive" ? "↑" : "↓"} {kpi.change}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ===== ONGLETS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "1px solid rgba(200,210,220,0.1)", paddingBottom: "8px", flexWrap: "wrap" }}>
          {[
            { id: "overview", label: "Vue d'ensemble", icon: Target },
            { id: "market", label: "Marché", icon: Globe },
            { id: "monetization", label: "Monétisation", icon: Wallet },
            { id: "growth", label: "Croissance", icon: Rocket },
            { id: "chat", label: "Conversation", icon: MessageCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================
            CONTENU DES ONGLETS
            ============================================================ */}

        {/* ---- ONGLET VUE D'ENSEMBLE ---- */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}
          >
            {/* Stratégies */}
            <div className="glass-card-dark" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                  📋 Stratégies prioritaires
                </h3>
                <span style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)" }}>
                  {strategies.filter(s => s.status === "done").length}/{strategies.length} terminées
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {strategies.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="strategy-item"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                          {item.title}
                        </p>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status === "todo" ? "À faire" : item.status === "in-progress" ? "En cours" : "Terminé"}
                        </span>
                        <span className={`impact-badge impact-${item.impact}`}>
                          {item.impact === "high" ? "⚡ Important" : item.impact === "medium" ? "Moyen" : "Faible"}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", margin: "2px 0 0 0" }}>
                        {item.description}
                      </p>
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ padding: "4px 12px", fontSize: "11px", flexShrink: 0 }}
                    >
                      Détails
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Conseils et actions */}
            <div className="glass-card-dark" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                💡 Action du jour
              </h3>
              <div style={{
                padding: "16px",
                borderRadius: "14px",
                background: "rgba(212,175,55,0.06)",
                border: "1px solid rgba(212,175,55,0.1)",
                flex: 1,
              }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                  Validez votre modèle économique
                </p>
                <p style={{ fontSize: "13px", color: "rgba(60,80,100,0.5)", margin: "4px 0 0 0" }}>
                  Contactez 5 clients potentiels pour tester vos hypothèses de revenus.
                </p>
                <button className="btn-primary" style={{ marginTop: "12px", padding: "6px 16px", fontSize: "12px" }}>
                  <Play size={14} />
                  Démarrer
                </button>
              </div>
              <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.06)" }}>
                <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)", margin: 0 }}>
                  🔔 Prochain rendez-vous : 15/10/2026 - Réunion avec l'encadrant
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---- ONGLET MARCHÉ ---- */}
        {activeTab === "market" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}
          >
            <div className="glass-card-dark" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", marginBottom: "16px" }}>
                📊 Analyse de marché
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                {marketInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="revenue-card"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>{insight.title}</p>
                      <span className={`trend-${insight.trend}`}>
                        {insight.trend === "up" ? "▲" : insight.trend === "down" ? "▼" : "—"}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", margin: "4px 0 0 0" }}>
                      {insight.description}
                    </p>
                    <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.3)", margin: "4px 0 0 0" }}>
                      Source : {insight.source}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-card-dark" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                  🎯 Positionnement recommandé
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Segment cible</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: "2px 0 0 0" }}>Étudiants & jeunes entrepreneurs</p>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Différenciation</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: "2px 0 0 0" }}>IA intégrée + mentorat personnalisé</p>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Avantage concurrentiel</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: "2px 0 0 0" }}>Écosystème collaboratif</p>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.1)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Opportunité de marché</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: "2px 0 0 0" }}>Croissance 25% dans le secteur</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---- ONGLET MONÉTISATION ---- */}
        {activeTab === "monetization" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
          >
            <div className="glass-card-dark" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", marginBottom: "16px" }}>
                💰 Flux de revenus
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {revenueStreams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="revenue-card"
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>{stream.name}</p>
                        <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", margin: "2px 0 0 0" }}>{stream.description}</p>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <span className={`impact-badge ${stream.potential === "high" ? "impact-high" : stream.potential === "medium" ? "impact-medium" : "impact-low"}`}>
                          {stream.potential === "high" ? "▲ Potentiel élevé" : stream.potential === "medium" ? "● Moyen" : "▼ Faible"}
                        </span>
                        <span className={`status-badge ${stream.status === "active" ? "status-done" : stream.status === "planned" ? "status-in-progress" : "status-todo"}`}>
                          {stream.status === "active" ? "Actif" : stream.status === "planned" ? "Planifié" : "Exploration"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button className="btn-primary" style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}>
                <Plus size={16} />
                Ajouter un flux de revenus
              </button>
            </div>

            <div className="glass-card-dark" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", marginBottom: "16px" }}>
                📈 Prévisions financières
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(200,210,220,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)" }}>Revenus projetés (an 1)</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#10B981" }}>12 500 000 FCFA</span>
                  </div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(200,210,220,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)" }}>Marge brute estimée</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#F5D76E" }}>65%</span>
                  </div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(200,210,220,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)" }}>Point mort</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#1A2A3A" }}>150 utilisateurs</span>
                  </div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(200,210,220,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)" }}>Croissance annuelle</span>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#10B981" }}>+35%</span>
                  </div>
                </div>
              </div>
              <button className="btn-secondary" style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}>
                <LineChart size={14} />
                Simuler les projections
              </button>
            </div>
          </motion.div>
        )}

        {/* ---- ONGLET CROISSANCE ---- */}
        {activeTab === "growth" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}
          >
            <div className="glass-card-dark" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", marginBottom: "16px" }}>
                🚀 Plan d'expansion
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Phase 1</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: "2px 0 0 0" }}>Acquisition</p>
                  <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", margin: "2px 0 0 0" }}>Atteindre 500 utilisateurs</p>
                  <span className="status-badge status-in-progress">En cours</span>
                </div>
                <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Phase 2</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: "2px 0 0 0" }}>Expansion</p>
                  <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", margin: "2px 0 0 0" }}>Ouvrir à 3 nouvelles régions</p>
                  <span className="status-badge status-todo">Planifié</span>
                </div>
                <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.1)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Phase 3</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: "2px 0 0 0" }}>Monétisation avancée</p>
                  <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", margin: "2px 0 0 0" }}>Lancer les services premium</p>
                  <span className="status-badge status-todo">Planifié</span>
                </div>
              </div>
            </div>

            <div className="glass-card-dark" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                  📊 Indicateurs de croissance
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {[
                  { label: "Taux de conversion", value: "12%", change: "+3%" },
                  { label: "Coût d'acquisition", value: "2 500 FCFA", change: "-8%" },
                  { label: "Valeur vie client", value: "45 000 FCFA", change: "+15%" },
                  { label: "Taux de rétention", value: "72%", change: "+5%" },
                ].map((item, index) => (
                  <div key={index} style={{ padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.4)", border: "1px solid rgba(200,210,220,0.1)" }}>
                    <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.4)", margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#1A2A3A", margin: "2px 0 0 0" }}>{item.value}</p>
                    <p style={{ fontSize: "10px", color: "#10B981", margin: 0 }}>{item.change}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ---- ONGLET CHAT ---- */}
        {activeTab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-dark"
            style={{ display: "flex", flexDirection: "column", maxHeight: "520px", padding: "20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}>
                🤖
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>Mentor IA</p>
                <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>En ligne • Prêt à vous conseiller</p>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }} className="scrollbar-custom">
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "mentor" ? "flex-start" : "flex-end" }}
                >
                  <div className={msg.sender === "mentor" ? "mentor-bubble" : "user-bubble"}>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                      {msg.content}
                    </p>
                  </div>
                  <p style={{ fontSize: "9px", color: "rgba(60,80,100,0.3)", margin: "4px 0 0 0" }}>
                    {msg.timestamp}
                  </p>
                </motion.div>
              ))}
              {isLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", padding: "8px 0" }}>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "#D4AF37" }} />
                  <span style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)" }}>Le mentor réfléchit...</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px", borderTop: "1px solid rgba(200,210,220,0.1)", paddingTop: "16px" }}>
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="msg-input"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(200,210,220,0.2)",
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(8px)",
                  color: "#1A2A3A",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#D4AF37";
                  e.currentTarget.style.background = "rgba(255,255,255,0.85)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,210,220,0.2)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="Posez votre question au mentor..."
              />
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim() || isLoading}
                className="btn-send"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "none",
                  background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                  color: "#0A1628",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 4px 16px rgba(212,175,55,0.2)",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(212,175,55,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,175,55,0.2)";
                }}
              >
                {isLoading ? (
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== FOOTER ===== */}
        <div className="fade-in-up delay-4" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(200,210,220,0.1)", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.2)", letterSpacing: "0.5px", margin: 0 }}>
            © 2026 <span style={{ color: "#D4AF37" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </div>
      </div>
    </div>
  );
}