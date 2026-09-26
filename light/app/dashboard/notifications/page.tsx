// app/dashboard/notifications/page.tsx
// PAGE DES NOTIFICATIONS - VERSION CLAIRE & ÉLÉGANTE

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Users,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
  Filter,
  Search,
  Mail,
  Award,
  Star,
  Sparkles,
  RefreshCw,
  Loader2,
  MoreVertical,
  Eye,
  EyeOff,
  Archive,
  Inbox,
  Settings,
  ArrowLeft
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
type NotificationType = "info" | "success" | "warning" | "error" | "message" | "invitation";

interface Notification {
  id: string;
  type: NotificationType;
  icon: any;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
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
export default function NotificationsPage() {
  const router = useRouter();
  const scrollY = useScroll();

  // ===== ÉTATS =====
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "invitation",
      icon: Users,
      title: "Nouvelle invitation",
      message: "Jean Dupont vous a invité à rejoindre le projet Innov'Afrique",
      link: "/dashboard/invitations",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "2",
      type: "success",
      icon: CheckCircle,
      title: "Étape validée",
      message: "L'encadrant a validé l'étape de conception",
      link: "/dashboard/projets",
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      type: "message",
      icon: MessageCircle,
      title: "Nouveau message",
      message: "Marie Claire vous a envoyé un message dans la messagerie",
      link: "/dashboard/messagerie",
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "4",
      type: "warning",
      icon: AlertCircle,
      title: "Budget dépassé",
      message: "Vous avez dépassé 80% du budget estimé pour votre projet.",
      link: "/dashboard/projets",
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "5",
      type: "info",
      icon: Calendar,
      title: "Soutenance approche",
      message: "La soutenance de votre projet aura lieu dans 10 jours",
      link: "/dashboard/projets",
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "6",
      type: "invitation",
      icon: Users,
      title: "Invitation acceptée",
      message: "Sarah Ngo a accepté votre invitation à rejoindre le projet",
      link: "/dashboard/invitations",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "7",
      type: "success",
      icon: Star,
      title: "Projet mis en avant",
      message: "Votre projet a été sélectionné comme projet du mois !",
      link: "/dashboard/projets",
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "8",
      type: "message",
      icon: Mail,
      title: "Nouveau message de l'encadrant",
      message: "L'encadrant a laissé un commentaire sur votre projet",
      link: "/dashboard/messagerie",
      isRead: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ============================================================
  // FILTRAGE
  // ============================================================
  const filteredNotifications = notifications.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === "all" ||
      (filter === "unread" && !n.isRead) ||
      (filter === "read" && n.isRead);
    const matchType = typeFilter === "all" || n.type === typeFilter;
    return matchSearch && matchFilter && matchType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ============================================================
  // ACTIONS
  // ============================================================
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: false } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(n => selectedIds.includes(n.id) ? { ...n, isRead: true } : n)
    );
    setSelectedIds([]);
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

        .notification-item {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          border-radius: 14px;
          padding: 14px 18px;
          border: 1px solid rgba(200, 210, 220, 0.15);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .notification-item:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(200, 210, 220, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        }
        .notification-item-unread {
          border-left: 4px solid #D4AF37;
          background: rgba(255, 255, 255, 0.75);
        }
        .notification-item-unread:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .notification-item-selected {
          border: 2px solid #D4AF37;
          background: rgba(212, 175, 55, 0.04);
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

        .filter-btn {
          padding: 4px 14px;
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

        .icon-container {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-container-info {
          background: rgba(99, 102, 241, 0.12);
          color: #6366F1;
        }
        .icon-container-success {
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }
        .icon-container-warning {
          background: rgba(245, 158, 11, 0.12);
          color: #F59E0B;
        }
        .icon-container-error {
          background: rgba(228, 115, 107, 0.12);
          color: #E4736B;
        }
        .icon-container-message {
          background: rgba(99, 102, 241, 0.12);
          color: #6366F1;
        }
        .icon-container-invitation {
          background: rgba(212, 175, 55, 0.12);
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

        .type-tag {
          padding: 2px 10px;
          border-radius: 50px;
          font-size: 9px;
          font-weight: 600;
          background: rgba(99, 102, 241, 0.08);
          color: #6366F1;
        }
        .type-tag-info { background: rgba(99, 102, 241, 0.08); color: #6366F1; }
        .type-tag-success { background: rgba(16, 185, 129, 0.08); color: #10B981; }
        .type-tag-warning { background: rgba(245, 158, 11, 0.08); color: #F59E0B; }
        .type-tag-error { background: rgba(228, 115, 107, 0.08); color: #E4736B; }
        .type-tag-message { background: rgba(99, 102, 241, 0.08); color: #6366F1; }
        .type-tag-invitation { background: rgba(212, 175, 55, 0.08); color: #D4AF37; }

        @media (max-width: 768px) {
          .hide-mobile { display: none; }
        }
      `}</style>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>

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
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="badge-count">
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={markAllAsRead}
              className="btn-primary"
              style={{ padding: "8px 16px" }}
            >
              <Check size={14} />
              Tout marquer comme lu
            </button>
            <button
              onClick={deleteAllRead}
              className="btn-secondary"
            >
              <Trash2 size={14} />
              Supprimer lus
            </button>
          </div>
        </div>

        {/* ===== STATISTIQUES ===== */}
        <div className="fade-in-up delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          <div className="glass-card-dark" style={{ padding: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Total</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#1A2A3A", margin: 0 }}>{notifications.length}</p>
          </div>
          <div className="glass-card-dark" style={{ padding: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Non lues</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#F59E0B", margin: 0 }}>{unreadCount}</p>
          </div>
          <div className="glass-card-dark" style={{ padding: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Lues</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#10B981", margin: 0 }}>{notifications.filter(n => n.isRead).length}</p>
          </div>
          <div className="glass-card-dark" style={{ padding: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.4)", margin: 0 }}>Invitations</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#D4AF37", margin: 0 }}>
              {notifications.filter(n => n.type === "invitation").length}
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
            {[
              { id: "all", label: "Toutes" },
              { id: "unread", label: "Non lues" },
              { id: "read", label: "Lues" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`filter-btn ${filter === f.id ? "filter-btn-active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {[
              { id: "all", label: "Tous" },
              { id: "invitation", label: "Invitations" },
              { id: "success", label: "Succès" },
              { id: "warning", label: "Alertes" },
              { id: "message", label: "Messages" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id as any)}
                className={`filter-btn ${typeFilter === t.id ? "filter-btn-active" : ""}`}
                style={{ fontSize: "10px", padding: "3px 10px" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== LISTE DES NOTIFICATIONS ===== */}
        <div className="fade-in-up delay-3" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredNotifications.length === 0 ? (
            <div className="glass-card-dark" style={{ padding: "60px 20px", textAlign: "center" }}>
              <Bell size={48} style={{ color: "rgba(60,80,100,0.2)", marginBottom: "12px" }} />
              <p style={{ fontSize: "16px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                Aucune notification
              </p>
              <p style={{ fontSize: "14px", color: "rgba(60,80,100,0.4)", margin: "4px 0 0 0" }}>
                {searchQuery || filter !== "all" || typeFilter !== "all"
                  ? "Aucun résultat ne correspond à vos filtres."
                  : "Vous n'avez pas encore de notifications."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif, index) => {
              const Icon = notif.icon;
              const isSelected = selectedIds.includes(notif.id);
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`notification-item ${!notif.isRead ? "notification-item-unread" : ""} ${isSelected ? "notification-item-selected" : ""}`}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(notif.id)}
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        border: "1px solid rgba(200,210,220,0.3)",
                        accentColor: "#D4AF37",
                        cursor: "pointer",
                      }}
                    />
                    <div className={`icon-container icon-container-${notif.type}`}>
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                          {notif.title}
                        </p>
                        <span className={`type-tag type-tag-${notif.type}`}>
                          {notif.type === "invitation" ? "Invitation" :
                           notif.type === "success" ? "Succès" :
                           notif.type === "warning" ? "Alerte" :
                           notif.type === "error" ? "Erreur" :
                           notif.type === "message" ? "Message" : "Info"}
                        </span>
                        {!notif.isRead && (
                          <span style={{ fontSize: "9px", fontWeight: 600, color: "#D4AF37", background: "rgba(212,175,55,0.08)", padding: "1px 8px", borderRadius: "50px" }}>
                            Non lue
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "rgba(60,80,100,0.5)", margin: "2px 0 0 0" }}>
                        {notif.message}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "10px", color: "rgba(60,80,100,0.3)", margin: 0 }}>
                          {new Date(notif.createdAt).toLocaleDateString()} à {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            style={{ fontSize: "11px", color: "#D4AF37", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
                          >
                            <Eye size={12} />
                            Voir
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    {!notif.isRead ? (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "10px" }}
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsUnread(notif.id)}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "10px" }}
                      >
                        <EyeOff size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "10px", color: "#E4736B" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ===== ACTIONS GROUPÉES ===== */}
        {selectedIds.length > 0 && (
          <div className="fade-in-up delay-3" style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(212,175,55,0.06)", borderRadius: "14px", border: "1px solid rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "13px", color: "#1A2A3A", margin: 0 }}>
              {selectedIds.length} notification{selectedIds.length > 1 ? "s" : ""} sélectionnée{selectedIds.length > 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={markSelectedAsRead}
                className="btn-primary"
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                <Check size={14} />
                Marquer comme lues
              </button>
              <button
                onClick={deleteSelected}
                className="btn-secondary"
                style={{ padding: "6px 14px", fontSize: "12px", color: "#E4736B" }}
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            </div>
          </div>
        )}

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