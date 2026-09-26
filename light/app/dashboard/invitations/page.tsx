// app/dashboard/invitations/page.tsx
// PAGE DEMANDES & INVITATIONS - VERSION CLAIRE & ÉLÉGANTE

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Mail,
  Check,
  X,
  Clock,
  Users,
  User,
  MessageCircle,
  Send,
  Sparkles,
  Bell,
  CheckCheck,
  UserCheck,
  UserX,
  Calendar,
  Briefcase,
  Building2,
  MoreVertical,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Inbox,
  Archive,
  Trash2,
  Settings,
  Plus
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
type InvitationStatus = "pending" | "accepted" | "rejected" | "expired";
type InvitationType = "project" | "friend" | "collaboration";

interface Invitation {
  id: string;
  type: InvitationType;
  from: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  to: string;
  projectName?: string;
  projectId?: string;
  message: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt?: string;
}

interface Request {
  id: string;
  type: "friend" | "collaboration";
  from: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
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
export default function InvitationsPage() {
  const router = useRouter();
  const scrollY = useScroll();

  // ===== ÉTATS =====
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "archived">("received");
  const [filterType, setFilterType] = useState<"all" | "project" | "friend" | "collaboration">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ===== DONNÉES MOCKÉES =====
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: "1",
      type: "project",
      from: {
        id: "user1",
        name: "Jean Dupont",
        avatar: "JD",
        role: "Étudiant"
      },
      to: "moi",
      projectName: "Projet Innov'Afrique",
      message: "Je vous invite à rejoindre mon projet Innov'Afrique. Votre expertise en développement serait précieuse.",
      status: "pending",
      createdAt: "2026-09-05T10:30:00Z",
      expiresAt: "2026-09-12T10:30:00Z"
    },
    {
      id: "2",
      type: "friend",
      from: {
        id: "user2",
        name: "Marie Claire",
        avatar: "MC",
        role: "Étudiante"
      },
      to: "moi",
      message: "Souhaitez-vous échanger sur vos projets ? Je trouve vos idées très inspirantes.",
      status: "pending",
      createdAt: "2026-09-04T14:20:00Z"
    },
    {
      id: "3",
      type: "collaboration",
      from: {
        id: "user3",
        name: "Paul Tchou",
        avatar: "PT",
        role: "Porteur de projet"
      },
      to: "moi",
      projectName: "Projet GreenTech",
      projectId: "proj-2",
      message: "Nous cherchons un expert en IA pour notre projet GreenTech. Votre profil correspond parfaitement.",
      status: "pending",
      createdAt: "2026-09-03T09:15:00Z"
    },
    {
      id: "4",
      type: "project",
      from: {
        id: "user4",
        name: "Sarah Ngo",
        avatar: "SN",
        role: "Encadrant"
      },
      to: "moi",
      projectName: "Projet Santé+",
      projectId: "proj-3",
      message: "Je vous propose de superviser ce projet en tant qu'encadrant technique.",
      status: "accepted",
      createdAt: "2026-09-02T16:45:00Z"
    },
    {
      id: "5",
      type: "friend",
      from: {
        id: "user5",
        name: "David Kamga",
        avatar: "DK",
        role: "Étudiant"
      },
      to: "moi",
      message: "Bonjour, j'aimerais discuter de nos projets communs.",
      status: "rejected",
      createdAt: "2026-09-01T11:00:00Z"
    },
  ]);

  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      type: "friend",
      from: {
        id: "user6",
        name: "Amandine Essomba",
        avatar: "AE",
        role: "Étudiante"
      },
      message: "J'ai vu votre projet Innov'Afrique, j'aimerais collaborer avec vous.",
      status: "pending",
      createdAt: "2026-09-06T08:30:00Z"
    },
    {
      id: "2",
      type: "collaboration",
      from: {
        id: "user7",
        name: "François Ngana",
        avatar: "FN",
        role: "Porteur de projet"
      },
      message: "Nous avons un projet en agriculture numérique, cherchons un partenaire.",
      status: "pending",
      createdAt: "2026-09-05T15:10:00Z"
    },
  ]);

  // ============================================================
  // ACTIONS
  // ============================================================
  const handleAccept = (id: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: "accepted" } : inv
    ));
  };

  const handleReject = (id: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: "rejected" } : inv
    ));
  };

  const handleAcceptRequest = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "accepted" } : req
    ));
  };

  const handleRejectRequest = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: "rejected" } : req
    ));
  };

  const handleSendInvitation = () => {
    // Simuler l'envoi d'une invitation
    setIsLoading(true);
    setTimeout(() => {
      const newInv: Invitation = {
        id: (Date.now() + 1).toString(),
        type: "project",
        from: {
          id: "me",
          name: "Moi",
          avatar: "MO",
          role: "Porteur de projet"
        },
        to: "utilisateur",
        projectName: "Mon projet",
        message: "Invitation à rejoindre mon projet",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      setInvitations(prev => [...prev, newInv]);
      setIsLoading(false);
    }, 800);
  };

  // ============================================================
  // FILTRAGE
  // ============================================================
  const filteredInvitations = invitations.filter(inv => {
    const matchSearch = inv.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.projectName && inv.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchType = filterType === "all" || inv.type === filterType;
    const matchStatus = activeTab === "received" ? inv.status === "pending" :
      activeTab === "sent" ? inv.status === "pending" :
      inv.status === "accepted" || inv.status === "rejected";
    return matchSearch && matchType && matchStatus;
  });

  const filteredRequests = requests.filter(req => {
    const matchSearch = req.from.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch && req.status === "pending";
  });

  // ============================================================
  // STATISTIQUES
  // ============================================================
  const pendingCount = invitations.filter(i => i.status === "pending").length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;

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
      {/* ===== FOND ===== */}
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
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.15s; }
        .delay-3 { animation-delay: 0.25s; }

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

        .invitation-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 16px 20px;
          border: 1px solid rgba(200, 210, 220, 0.15);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .invitation-card:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(200, 210, 220, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #0A1628;
          flex-shrink: 0;
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

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.15);
        }
        .btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);
        }

        .btn-success {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 12px;
          border: none;
          background: #10B981;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-success:hover {
          background: #059669;
        }

        .btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 12px;
          border: none;
          background: #E4736B;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-danger:hover {
          background: #DC2626;
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
        }
        .tab-btn:hover {
          color: #1A2A3A;
          background: rgba(255,255,255,0.4);
        }
        .tab-btn-active {
          color: #1A2A3A;
          background: rgba(255,255,255,0.7);
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }

        .filter-btn {
          padding: 4px 12px;
          border-radius: 50px;
          border: 1px solid rgba(200, 210, 220, 0.15);
          background: transparent;
          color: rgba(60, 80, 100, 0.5);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .filter-btn:hover {
          border-color: rgba(200, 210, 220, 0.3);
          color: #1A2A3A;
        }
        .filter-btn-active {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.08);
          color: #D4AF37;
        }

        .badge-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #E4736B;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          padding: 0 6px;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border-radius: 12px;
          border: 1px solid rgba(200, 210, 220, 0.2);
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          color: #1A2A3A;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .search-input:focus {
          border-color: #D4AF37;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08);
        }
        .search-input::placeholder {
          color: rgba(60, 80, 100, 0.3);
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

        .status-badge {
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 600;
        }
        .status-pending {
          background: rgba(245, 158, 11, 0.12);
          color: #F59E0B;
        }
        .status-accepted {
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }
        .status-rejected {
          background: rgba(228, 115, 107, 0.12);
          color: #E4736B;
        }
        .status-expired {
          background: rgba(107, 114, 128, 0.12);
          color: #6B7280;
        }

        .type-badge {
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 500;
          background: rgba(99, 102, 241, 0.08);
          color: #6366F1;
        }
        .type-badge-project {
          background: rgba(16, 185, 129, 0.08);
          color: #10B981;
        }
        .type-badge-friend {
          background: rgba(99, 102, 241, 0.08);
          color: #6366F1;
        }
        .type-badge-collaboration {
          background: rgba(245, 158, 11, 0.08);
          color: #F59E0B;
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none; }
        }
        @media (min-width: 769px) {
          .show-mobile-only { display: none; }
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
              href="/dashboard"
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Retour
            </Link>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1A2A3A", letterSpacing: "-0.5px" }}>
              Demandes & invitations
            </h1>
            {(pendingCount > 0 || pendingRequests > 0) && (
              <span className="badge-count">
                {pendingCount + pendingRequests}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link
              href="/dashboard/messagerie"
              className="btn-secondary"
              style={{ borderColor: "rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.05)" }}
            >
              <MessageCircle size={16} />
              Messagerie
            </Link>
            <button
              onClick={handleSendInvitation}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <UserPlus size={16} />
              )}
              Inviter
            </button>
          </div>
        </div>

        {/* ===== STATISTIQUES RAPIDES ===== */}
        <div className="fade-in-up delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <div className="glass-card-dark" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>En attente</p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#F59E0B", margin: 0 }}>{pendingCount + pendingRequests}</p>
          </div>
          <div className="glass-card-dark" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Acceptées</p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#10B981", margin: 0 }}>
              {invitations.filter(i => i.status === "accepted").length}
            </p>
          </div>
          <div className="glass-card-dark" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Total reçues</p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#1A2A3A", margin: 0 }}>
              {invitations.length + requests.length}
            </p>
          </div>
          <div className="glass-card-dark" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Projets</p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#6366F1", margin: 0 }}>
              {invitations.filter(i => i.type === "project").length}
            </p>
          </div>
        </div>

        {/* ===== RECHERCHE & FILTRES ===== */}
        <div className="fade-in-up delay-2" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(60,80,100,0.3)" }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {["all", "project", "friend", "collaboration"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`filter-btn ${filterType === type ? "filter-btn-active" : ""}`}
              >
                {type === "all" ? "Tous" : type === "project" ? "Projets" : type === "friend" ? "Amis" : "Collaborations"}
              </button>
            ))}
          </div>
        </div>

        {/* ===== ONGLETS ===== */}
        <div className="fade-in-up delay-2" style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "1px solid rgba(200,210,220,0.1)", paddingBottom: "8px" }}>
          {[
            { id: "received", label: "Reçues", icon: Inbox, count: pendingCount + pendingRequests },
            { id: "sent", label: "Envoyées", icon: Send, count: invitations.filter(i => i.from.id === "me" && i.status === "pending").length },
            { id: "archived", label: "Archivées", icon: Archive, count: invitations.filter(i => i.status === "accepted" || i.status === "rejected").length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className="badge-count" style={{ fontSize: "9px", minWidth: "16px", height: "16px", padding: "0 4px" }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== CONTENU ===== */}
        <div className="fade-in-up delay-3" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>

          {/* ---- DEMANDES D'AMIS / COLLABORATIONS (reçues) ---- */}
          {activeTab === "received" && filteredRequests.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(60,80,100,0.4)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Demandes de collaboration
              </p>
              {filteredRequests.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="invitation-card"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="avatar-circle" style={{ background: "linear-gradient(135deg, #818CF8, #6366F1)" }}>
                      {req.from.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                          {req.from.name}
                        </p>
                        <span className="type-badge type-badge-collaboration">
                          {req.type === "friend" ? "Amis" : "Collaboration"}
                        </span>
                        <span className="status-badge status-pending">En attente</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "rgba(60,80,100,0.5)", margin: "4px 0 0 0" }}>
                        {req.message}
                      </p>
                      <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.3)", margin: "2px 0 0 0" }}>
                        Reçu le {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="btn-success"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <Check size={14} />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="btn-danger"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ---- INVITATIONS ---- */}
          {filteredInvitations.length === 0 && activeTab !== "archived" ? (
            <div className="glass-card-dark" style={{ padding: "40px", textAlign: "center" }}>
              <Inbox size={48} style={{ color: "rgba(60,80,100,0.2)", marginBottom: "12px" }} />
              <p style={{ fontSize: "16px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                Aucune invitation
              </p>
              <p style={{ fontSize: "14px", color: "rgba(60,80,100,0.4)", margin: "4px 0 0 0" }}>
                {activeTab === "received" ? "Vous n'avez pas encore d'invitations en attente." :
                 "Vous n'avez pas encore envoyé d'invitations."}
              </p>
            </div>
          ) : activeTab === "archived" && filteredInvitations.length === 0 ? (
            <div className="glass-card-dark" style={{ padding: "40px", textAlign: "center" }}>
              <Archive size={48} style={{ color: "rgba(60,80,100,0.2)", marginBottom: "12px" }} />
              <p style={{ fontSize: "16px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                Aucune invitation archivée
              </p>
              <p style={{ fontSize: "14px", color: "rgba(60,80,100,0.4)", margin: "4px 0 0 0" }}>
                Les invitations que vous acceptez ou refusez apparaissent ici.
              </p>
            </div>
          ) : (
            filteredInvitations.map((inv, index) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="invitation-card"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="avatar-circle" style={{ background: "linear-gradient(135deg, #D4AF37, #F5D76E)" }}>
                    {inv.from.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                        {inv.from.name}
                        <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(60,80,100,0.4)", marginLeft: "6px" }}>
                          ({inv.from.role})
                        </span>
                      </p>
                      <span className={`type-badge ${inv.type === "project" ? "type-badge-project" : inv.type === "friend" ? "type-badge-friend" : "type-badge-collaboration"}`}>
                        {inv.type === "project" ? "Projet" : inv.type === "friend" ? "Amis" : "Collaboration"}
                      </span>
                      <span className={`status-badge ${inv.status === "pending" ? "status-pending" : inv.status === "accepted" ? "status-accepted" : inv.status === "rejected" ? "status-rejected" : "status-expired"}`}>
                        {inv.status === "pending" ? "En attente" : inv.status === "accepted" ? "Acceptée" : inv.status === "rejected" ? "Refusée" : "Expirée"}
                      </span>
                    </div>
                    {inv.projectName && (
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#6366F1", margin: "2px 0 0 0" }}>
                        📁 {inv.projectName}
                      </p>
                    )}
                    <p style={{ fontSize: "13px", color: "rgba(60,80,100,0.5)", margin: "4px 0 0 0" }}>
                      {inv.message}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                      <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.3)", margin: 0 }}>
                        Reçu le {new Date(inv.createdAt).toLocaleDateString()}
                        {inv.expiresAt && ` • Expire le ${new Date(inv.expiresAt).toLocaleDateString()}`}
                      </p>
                      <Link
                        href="/dashboard/messagerie"
                        style={{ fontSize: "11px", color: "#D4AF37", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                      >
                        <MessageCircle size={12} />
                        Répondre
                      </Link>
                    </div>
                  </div>
                  {inv.status === "pending" && activeTab === "received" && (
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={() => handleAccept(inv.id)}
                        className="btn-success"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <Check size={14} />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleReject(inv.id)}
                        className="btn-danger"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {inv.status === "pending" && activeTab === "sent" && (
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <span className="status-badge status-pending" style={{ fontSize: "11px", padding: "4px 12px" }}>
                        En attente de réponse
                      </span>
                      <button
                        onClick={() => handleReject(inv.id)}
                        className="btn-danger"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  {inv.status !== "pending" && activeTab === "archived" && (
                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <RefreshCw size={14} />
                        Relancer
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ===== LIEN VERS MESSAGERIE ===== */}
        <div className="fade-in-up delay-3" style={{ marginTop: "24px", padding: "16px", background: "rgba(212,175,55,0.04)", borderRadius: "16px", border: "1px solid rgba(212,175,55,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <MessageCircle size={20} style={{ color: "#D4AF37" }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                Retrouvez vos discussions
              </p>
              <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)", margin: 0 }}>
                Accédez à la messagerie pour échanger avec vos contacts
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/messagerie"
            className="btn-primary"
            style={{ padding: "10px 24px" }}
          >
            <MessageCircle size={16} />
            Ouvrir la messagerie
          </Link>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="fade-in-up delay-3" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(200,210,220,0.1)", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.2)", letterSpacing: "0.5px", margin: 0 }}>
            © 2026 <span style={{ color: "#D4AF37" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </div>
      </div>
    </div>
  );
}