// app/dashboard/projets/[id]/messagerie/page.tsx
// PAGE DE MESSAGERIE - VERSION CLAIRE & ÉLÉGANTE

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Pin,
  User,
  Users,
  Clock,
  Check,
  CheckCheck,
  Image,
  File,
  Mic,
  Plus,
  X,
  Trash2,
  Settings,
  Bell,
  BellOff,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
  Sparkles
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
type MessageStatus = "sent" | "delivered" | "read";
type MessageType = "text" | "image" | "file" | "voice";

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: string;
  status: MessageStatus;
  attachments?: { name: string; url: string; size: string }[];
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: "student" | "professor" | "admin" | "member";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
  projectId: string;
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
export default function MessageriePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const scrollY = useScroll();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ===== ÉTATS =====
  const [activeConversation, setActiveConversation] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ===== DONNÉES MOCKÉES =====
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "Jean Dupont",
      avatar: "JD",
      role: "student",
      lastMessage: "Super, je termine la maquette ce soir.",
      lastMessageTime: "14:32",
      unreadCount: 3,
      online: true,
      projectId: projectId,
      messages: [
        { id: "1", senderId: "user1", content: "Bonjour Jean, comment avance le projet ?", type: "text", timestamp: "10:15", status: "read" },
        { id: "2", senderId: "me", content: "Salut Marie ! Très bien, j'ai fini la partie backend.", type: "text", timestamp: "10:18", status: "read" },
        { id: "3", senderId: "user1", content: "Parfait ! On se voit demain pour la réunion ?", type: "text", timestamp: "10:20", status: "read" },
        { id: "4", senderId: "me", content: "Oui, à 10h comme prévu.", type: "text", timestamp: "10:22", status: "read" },
        { id: "5", senderId: "user1", content: "Super, je termine la maquette ce soir.", type: "text", timestamp: "14:32", status: "delivered" },
      ]
    },
    {
      id: "2",
      name: "Marie Claire",
      avatar: "MC",
      role: "professor",
      lastMessage: "Le rapport est excellent !",
      lastMessageTime: "11:45",
      unreadCount: 0,
      online: false,
      projectId: projectId,
      messages: [
        { id: "1", senderId: "me", content: "Bonjour Marie, j'ai terminé le rapport.", type: "text", timestamp: "09:30", status: "read" },
        { id: "2", senderId: "user2", content: "Le rapport est excellent !", type: "text", timestamp: "11:45", status: "read" },
      ]
    },
    {
      id: "3",
      name: "Paul Tchou",
      avatar: "PT",
      role: "member",
      lastMessage: "OK je m'en occupe.",
      lastMessageTime: "09:12",
      unreadCount: 1,
      online: true,
      projectId: projectId,
      messages: [
        { id: "1", senderId: "me", content: "Paul, peux-tu t'occuper des tests ?", type: "text", timestamp: "08:45", status: "read" },
        { id: "2", senderId: "user3", content: "OK je m'en occupe.", type: "text", timestamp: "09:12", status: "delivered" },
      ]
    },
    {
      id: "4",
      name: "Sarah Ngo",
      avatar: "SN",
      role: "admin",
      lastMessage: "La réunion est confirmée pour demain.",
      lastMessageTime: "Hier",
      unreadCount: 0,
      online: false,
      projectId: projectId,
      messages: [
        { id: "1", senderId: "user4", content: "La réunion est confirmée pour demain.", type: "text", timestamp: "18:30", status: "read" },
      ]
    },
    {
      id: "5",
      name: "Groupe Projet",
      avatar: "👥",
      role: "member",
      lastMessage: "Moi aussi je suis partant !",
      lastMessageTime: "15:20",
      unreadCount: 2,
      online: false,
      projectId: projectId,
      messages: [
        { id: "1", senderId: "user1", content: "Qui est disponible pour une réunion vendredi ?", type: "text", timestamp: "15:00", status: "read" },
        { id: "2", senderId: "user2", content: "Moi je suis disponible.", type: "text", timestamp: "15:10", status: "read" },
        { id: "3", senderId: "user3", content: "Moi aussi je suis partant !", type: "text", timestamp: "15:20", status: "delivered" },
      ]
    },
  ]);

  const [currentUser] = useState({
    id: "me",
    name: "Porteur de projet",
    avatar: "PP",
    role: "student"
  });

  // ===== CONVERSATION ACTIVE =====
  const activeConv = conversations.find(c => c.id === activeConversation);
  const messages = activeConv?.messages || [];

  // ============================================================
  // SCROLL AUTO VERS LE BAS
  // ============================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================================================
  // ENVOI DE MESSAGE
  // ============================================================
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConv) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: newMessage.trim(),
      type: "text",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent"
    };

    // Mettre à jour les messages de la conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMsg.content,
          lastMessageTime: newMsg.timestamp,
          unreadCount: 0
        };
      }
      return conv;
    }));

    setNewMessage("");
    if (inputRef.current) inputRef.current.focus();

    // Simuler la réponse
    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversation) {
          const updatedMessages = conv.messages.map(msg =>
            msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg
          );
          return { ...conv, messages: updatedMessages };
        }
        return conv;
      }));

      // Simuler une réponse automatique (pour la démo)
      if (Math.random() > 0.5) {
        const replyMsg: Message = {
          id: (Date.now() + 1).toString(),
          senderId: activeConv.id,
          content: "Merci pour votre message ! Je vous réponds dès que possible.",
          type: "text",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read"
        };
        setTimeout(() => {
          setConversations(prev => prev.map(conv => {
            if (conv.id === activeConversation) {
              return {
                ...conv,
                messages: [...conv.messages, replyMsg],
                lastMessage: replyMsg.content,
                lastMessageTime: replyMsg.timestamp
              };
            }
            return conv;
          }));
        }, 1500);
      }
    }, 1000);
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
      {/* ===== FOND AVEC PARALLAX (LÉGER) ===== */}
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
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .fade-in-up {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.15s; }

        .conv-item {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(200, 210, 220, 0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .conv-item:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(200, 210, 220, 0.4);
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .conv-item-active {
          background: rgba(255, 255, 255, 0.9);
          border-color: #D4AF37;
          box-shadow: 0 4px 24px rgba(212, 175, 55, 0.08);
        }

        .message-bubble-me {
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          border-bottom-right-radius: 4px;
          align-self: flex-end;
          max-width: 70%;
          padding: 10px 16px;
          border-radius: 16px 16px 4px 16px;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
        }
        .message-bubble-them {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(200, 210, 220, 0.2);
          color: #1A2A3A;
          border-bottom-left-radius: 4px;
          align-self: flex-start;
          max-width: 70%;
          padding: 10px 16px;
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .status-dot-online {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10B981;
          border: 2px solid #FFFFFF;
          position: absolute;
          bottom: 0;
          right: 0;
        }
        .status-dot-offline {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #9CA3AF;
          border: 2px solid #FFFFFF;
          position: absolute;
          bottom: 0;
          right: 0;
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

        .avatar-large {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: #0A1628;
          flex-shrink: 0;
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

        .msg-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid rgba(200, 210, 220, 0.2);
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(8px);
          color: #1A2A3A;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .msg-input:focus {
          border-color: #D4AF37;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08);
        }
        .msg-input::placeholder {
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

        .btn-send {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #D4AF37, #F5D76E);
          color: #0A1628;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
          flex-shrink: 0;
        }
        .btn-send:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
        }
        .btn-send:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: scale(1);
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: rgba(60, 80, 100, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-icon:hover {
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

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(60, 80, 100, 0.3);
          animation: pulse 1.4s ease-in-out infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .msg-enter-me {
          animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .msg-enter-them {
          animation: slideInLeft 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

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

        @media (max-width: 768px) {
          .sidebar-mobile-hidden {
            display: none;
          }
          .chat-mobile-full {
            width: 100%;
          }
        }
        @media (min-width: 769px) {
          .sidebar-mobile-hidden {
            display: flex;
          }
          .chat-mobile-full {
            width: auto;
          }
        }
      `}</style>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>

        {/* ===== EN-TÊTE ===== */}
        <div className="fade-in-up delay-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href={`/dashboard/projets/${projectId}`}
              className="btn-secondary"
              style={{
                padding: "8px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "12px",
                border: "1px solid rgba(200,210,220,0.2)",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                color: "#1A2A3A",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "rgba(200,210,220,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(200,210,220,0.2)"; }}
            >
              <ArrowLeft size={16} />
              Retour
            </Link>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1A2A3A", letterSpacing: "-0.5px" }}>
              Messagerie
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
              <Sparkles size={12} />
              {conversations.reduce((acc, c) => acc + c.unreadCount, 0)} non lus
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(200,210,220,0.2)",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                color: "#1A2A3A",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "rgba(200,210,220,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(200,210,220,0.2)"; }}
            >
              <Bell size={16} />
              Notifications
            </button>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(200,210,220,0.2)",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                color: "#1A2A3A",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "rgba(200,210,220,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(200,210,220,0.2)"; }}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* ===== MESSAGERIE - GRILLE ===== */}
        <div className="fade-in-up delay-2" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", minHeight: "600px" }}>

          {/* ---- LISTE DES CONVERSATIONS ---- */}
          <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", maxHeight: "660px" }}>
            {/* Recherche */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(60,80,100,0.3)" }} />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Liste */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }} className="scrollbar-custom">
              {conversations
                .filter(conv => conv.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((conv, index) => {
                  const isActive = conv.id === activeConversation;
                  return (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`conv-item ${isActive ? "conv-item-active" : ""}`}
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div className="avatar-circle" style={{
                            background: conv.role === "professor" ? "linear-gradient(135deg, #818CF8, #6366F1)" :
                              conv.role === "admin" ? "linear-gradient(135deg, #F59E0B, #D97706)" :
                              conv.name === "Groupe Projet" ? "linear-gradient(135deg, #10B981, #059669)" :
                              "linear-gradient(135deg, #D4AF37, #F5D76E)"
                          }}>
                            {conv.avatar}
                          </div>
                          <div className={`${conv.online ? "status-dot-online" : "status-dot-offline"}`} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A2A3A", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {conv.name}
                              {conv.role === "professor" && (
                                <span style={{ fontSize: "10px", fontWeight: 500, color: "#818CF8", marginLeft: "6px" }}>
                                  (Encadrant)
                                </span>
                              )}
                              {conv.role === "admin" && (
                                <span style={{ fontSize: "10px", fontWeight: 500, color: "#F59E0B", marginLeft: "6px" }}>
                                  (Admin)
                                </span>
                              )}
                            </p>
                            <span style={{ fontSize: "10px", color: "rgba(60,80,100,0.4)", flexShrink: 0 }}>
                              {conv.lastMessageTime}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                            <p style={{ fontSize: "13px", color: conv.unreadCount > 0 ? "#1A2A3A" : "rgba(60,80,100,0.5)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: conv.unreadCount > 0 ? 500 : 400 }}>
                              {conv.lastMessage}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="badge-count" style={{ flexShrink: 0 }}>
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              {conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(60,80,100,0.3)", padding: "32px 0" }}>
                  Aucune conversation trouvée
                </p>
              )}
            </div>
          </div>

          {/* ---- FENÊTRE DE CHAT ---- */}
          {activeConv && (
            <div className="glass-card-dark" style={{ display: "flex", flexDirection: "column", maxHeight: "660px" }}>
              {/* En-tête du chat */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(200,210,220,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div className="avatar-large" style={{
                      background: activeConv.role === "professor" ? "linear-gradient(135deg, #818CF8, #6366F1)" :
                        activeConv.role === "admin" ? "linear-gradient(135deg, #F59E0B, #D97706)" :
                        activeConv.name === "Groupe Projet" ? "linear-gradient(135deg, #10B981, #059669)" :
                        "linear-gradient(135deg, #D4AF37, #F5D76E)"
                    }}>
                      {activeConv.avatar}
                    </div>
                    <div className={`${activeConv.online ? "status-dot-online" : "status-dot-offline"}`} />
                  </div>
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#1A2A3A", margin: 0 }}>
                      {activeConv.name}
                      {activeConv.role === "professor" && (
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#818CF8", marginLeft: "8px" }}>
                          (Encadrant)
                        </span>
                      )}
                      {activeConv.role === "admin" && (
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#F59E0B", marginLeft: "8px" }}>
                          (Admin)
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: "12px", color: activeConv.online ? "#10B981" : "rgba(60,80,100,0.4)", margin: 0 }}>
                      {activeConv.online ? "En ligne" : "Hors ligne"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button className="btn-icon" style={{ width: "40px", height: "40px" }}>
                    <Phone size={18} />
                  </button>
                  <button className="btn-icon" style={{ width: "40px", height: "40px" }}>
                    <Video size={18} />
                  </button>
                  <button className="btn-icon" style={{ width: "40px", height: "40px" }}>
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px" }} className="scrollbar-custom">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "100%" }}
                    >
                      <div className={isMe ? "message-bubble-me" : "message-bubble-them"}>
                        <p style={{ fontSize: "14px", lineHeight: 1.5, margin: 0 }}>
                          {msg.content}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontSize: "10px", color: "rgba(60,80,100,0.3)" }}>
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <span>
                            {msg.status === "sent" && <Clock size={12} />}
                            {msg.status === "delivered" && <Check size={12} style={{ color: "rgba(60,80,100,0.3)" }} />}
                            {msg.status === "read" && <CheckCheck size={12} style={{ color: "rgba(16,185,129,0.6)" }} />}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div style={{
                padding: "12px 16px",
                borderTop: "1px solid rgba(200,210,220,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}>
                <button className="btn-icon" style={{ width: "40px", height: "40px" }}>
                  <Paperclip size={18} />
                </button>
                <button className="btn-icon" style={{ width: "40px", height: "40px" }}>
                  <Smile size={18} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="msg-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn-send"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="fade-in-up delay-2" style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(200,210,220,0.1)", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.2)", letterSpacing: "0.5px", margin: 0 }}>
            © 2026 <span style={{ color: "#D4AF37" }}>IAI Entrepreneur</span> · Plateforme de gestion de projets étudiants
          </p>
        </div>
      </div>
    </div>
  );
}