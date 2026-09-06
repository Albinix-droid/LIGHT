// app/dashboard/parametres/page.tsx
// PAGE PARAMÈTRES - ÉLÉGANTE ET FONCTIONNELLE

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Palette,
  Moon,
  Sun,
  Globe,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  LogOut,
  ChevronRight,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  CreditCard,
  Building2,
  Users,
  Calendar,
  Clock,
  Zap,
  Sparkles
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  bio: string;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  projectUpdates: boolean;
  messages: boolean;
  invitations: boolean;
  reminders: boolean;
  marketing: boolean;
}

interface SecuritySettings {
  twoFactor: boolean;
  sessionTimeout: string;
  trustedDevices: { id: string; name: string; lastActive: string }[];
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  language: string;
  fontSize: "small" | "medium" | "large";
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function ParametresPage() {
  const router = useRouter();

  // ===== ÉTATS =====
  const [activeSection, setActiveSection] = useState<"profil" | "notifications" | "securite" | "apparence">("profil");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ===== PROFIL =====
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@iai-cameroun.com",
    phone: "+237 6XX XX XX XX",
    role: "Étudiant",
    avatar: "JD",
    bio: "Étudiant en génie logiciel, passionné par l'entrepreneuriat et l'innovation technologique."
  });

  // ===== NOTIFICATIONS =====
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    push: true,
    projectUpdates: true,
    messages: true,
    invitations: true,
    reminders: true,
    marketing: false
  });

  // ===== SÉCURITÉ =====
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactor: false,
    sessionTimeout: "30",
    trustedDevices: [
      { id: "1", name: "MacBook Pro - Safari", lastActive: "Aujourd'hui, 14:32" },
      { id: "2", name: "iPhone 15 - Chrome", lastActive: "Hier, 20:15" },
    ]
  });

  // ===== APPAREIL =====
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "system",
    language: "fr",
    fontSize: "medium"
  });

  // ===== GESTION DES CHAMPS =====
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setAppearance(prev => ({ ...prev, theme }));
  };

  // ============================================================
  // SAUVEGARDE
  // ============================================================
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
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
      {/* ===== FOND ===== */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
            opacity: 0.03,
            transform: `scale(1.1)`,
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

        .section-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: rgba(60, 80, 100, 0.5);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          text-align: left;
        }
        .section-nav-btn:hover {
          background: rgba(255, 255, 255, 0.5);
          color: #1A2A3A;
        }
        .section-nav-btn-active {
          background: rgba(255, 255, 255, 0.7);
          color: #1A2A3A;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          border: 1px solid rgba(200, 210, 220, 0.1);
        }

        .toggle-btn {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 12px;
          border: none;
          background: rgba(200, 210, 220, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .toggle-btn-active {
          background: #D4AF37;
        }
        .toggle-btn::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .toggle-btn-active::after {
          left: 22px;
        }

        .input-field {
          width: 100%;
          padding: 10px 14px;
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
        .input-field:focus {
          border-color: #D4AF37;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08);
        }
        .input-field::placeholder {
          color: rgba(60, 80, 100, 0.3);
        }
        textarea.input-field {
          resize: vertical;
          min-height: 80px;
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
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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

        .btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid rgba(228, 115, 107, 0.3);
          background: rgba(228, 115, 107, 0.05);
          color: #E4736B;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-danger:hover {
          background: rgba(228, 115, 107, 0.1);
          border-color: rgba(228, 115, 107, 0.5);
        }

        .device-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(200, 210, 220, 0.1);
          transition: all 0.3s ease;
        }
        .device-item:hover {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(200, 210, 220, 0.2);
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

        @media (max-width: 768px) {
          .sidebar-mobile-hidden {
            display: none;
          }
          .content-mobile-full {
            width: 100%;
          }
        }
        @media (min-width: 769px) {
          .sidebar-mobile-hidden {
            display: block;
          }
          .content-mobile-full {
            width: auto;
          }
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
              Paramètres
            </h1>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            {saveSuccess && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10B981", fontSize: "13px" }}>
                <CheckCircle size={16} />
                Sauvegardé
              </span>
            )}
            {saveError && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#E4736B", fontSize: "13px" }}>
                <AlertCircle size={16} />
                {saveError}
              </span>
            )}
          </div>
        </div>

        {/* ===== GRILLE ===== */}
        <div className="fade-in-up delay-2" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px", minHeight: "600px" }}>

          {/* ---- NAVIGATION LATÉRALE ---- */}
          <div className="glass-card" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              { id: "profil", label: "Profil", icon: User },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "securite", label: "Sécurité", icon: Shield },
              { id: "apparence", label: "Apparence", icon: Palette },
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`section-nav-btn ${activeSection === section.id ? "section-nav-btn-active" : ""}`}
              >
                <section.icon size={18} />
                {section.label}
                <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />
              </button>
            ))}
            <div style={{ borderTop: "1px solid rgba(200,210,220,0.1)", margin: "8px 0" }} />
            <button
              className="section-nav-btn"
              style={{ color: "#E4736B" }}
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
                  // Logout logic
                }
              }}
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>

          {/* ---- CONTENU ---- */}
          <div className="glass-card-dark" style={{ padding: "24px", maxHeight: "660px", overflowY: "auto" }} className="scrollbar-custom">

            {/* ---- SECTION PROFIL ---- */}
            {activeSection === "profil" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1A2A3A", marginBottom: "20px" }}>
                  Informations personnelles
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#0A1628",
                    }}>
                      {profile.avatar}
                    </div>
                    <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                      <Camera size={14} />
                      Changer la photo
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                        Nom
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange("email", e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Rôle
                    </label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="input-field"
                      style={{ opacity: 0.6, cursor: "not-allowed" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleProfileChange("bio", e.target.value)}
                      className="input-field"
                      rows={3}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---- SECTION NOTIFICATIONS ---- */}
            {activeSection === "notifications" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1A2A3A", marginBottom: "20px" }}>
                  Préférences de notifications
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { key: "email", label: "Notifications par email", desc: "Recevoir les alertes par email" },
                    { key: "push", label: "Notifications push", desc: "Recevoir des notifications sur votre appareil" },
                    { key: "projectUpdates", label: "Mises à jour des projets", desc: "Être informé des changements dans vos projets" },
                    { key: "messages", label: "Nouveaux messages", desc: "Notifications pour les messages reçus" },
                    { key: "invitations", label: "Invitations", desc: "Recevoir les demandes d'invitation" },
                    { key: "reminders", label: "Rappels", desc: "Rappels pour les échéances importantes" },
                    { key: "marketing", label: "Offres marketing", desc: "Recevoir des offres et actualités" },
                  ].map((item) => (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(200,210,220,0.05)" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)", margin: "2px 0 0 0" }}>
                          {item.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(item.key as keyof NotificationPreferences)}
                        className={`toggle-btn ${notifications[item.key as keyof NotificationPreferences] ? "toggle-btn-active" : ""}`}
                        aria-label={item.label}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---- SECTION SÉCURITÉ ---- */}
            {activeSection === "securite" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1A2A3A", marginBottom: "20px" }}>
                  Sécurité et accès
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(200,210,220,0.05)" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>
                        Authentification à deux facteurs
                      </p>
                      <p style={{ fontSize: "12px", color: "rgba(60,80,100,0.4)", margin: "2px 0 0 0" }}>
                        Renforcez la sécurité de votre compte
                      </p>
                    </div>
                    <button
                      onClick={() => setSecurity(prev => ({ ...prev, twoFactor: !prev.twoFactor }))}
                      className={`toggle-btn ${security.twoFactor ? "toggle-btn-active" : ""}`}
                      aria-label="Authentification à deux facteurs"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Délai d'expiration de session (minutes)
                    </label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                      className="input-field"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                      <option value="240">4 heures</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "8px" }}>
                      Appareils de confiance
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {security.trustedDevices.map(device => (
                        <div key={device.id} className="device-item">
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "#1A2A3A", margin: 0 }}>{device.name}</p>
                            <p style={{ fontSize: "11px", color: "rgba(60,80,100,0.4)", margin: "2px 0 0 0" }}>Dernière activité : {device.lastActive}</p>
                          </div>
                          <button className="btn-danger" style={{ padding: "4px 12px", fontSize: "11px" }}>
                            <X size={12} />
                            Révoquer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="btn-secondary" style={{ justifyContent: "center" }}>
                    <Key size={14} />
                    Changer le mot de passe
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- SECTION APPAREIL ---- */}
            {activeSection === "apparence" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1A2A3A", marginBottom: "20px" }}>
                  Apparence et préférences
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Thème
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        { value: "light", label: "Clair", icon: Sun },
                        { value: "dark", label: "Sombre", icon: Moon },
                        { value: "system", label: "Système", icon: Smartphone },
                      ].map(theme => (
                        <button
                          key={theme.value}
                          onClick={() => handleThemeChange(theme.value as any)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            borderRadius: "12px",
                            border: appearance.theme === theme.value ? "2px solid #D4AF37" : "1px solid rgba(200,210,220,0.2)",
                            background: appearance.theme === theme.value ? "rgba(212,175,55,0.05)" : "rgba(255,255,255,0.4)",
                            color: appearance.theme === theme.value ? "#1A2A3A" : "rgba(60,80,100,0.5)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          <theme.icon size={16} />
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Langue
                    </label>
                    <select
                      value={appearance.language}
                      onChange={(e) => setAppearance(prev => ({ ...prev, language: e.target.value }))}
                      className="input-field"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "rgba(60,80,100,0.5)", display: "block", marginBottom: "4px" }}>
                      Taille de la police
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        { value: "small", label: "Petite" },
                        { value: "medium", label: "Moyenne" },
                        { value: "large", label: "Grande" },
                      ].map(size => (
                        <button
                          key={size.value}
                          onClick={() => setAppearance(prev => ({ ...prev, fontSize: size.value as any }))}
                          style={{
                            padding: "6px 16px",
                            borderRadius: "12px",
                            border: appearance.fontSize === size.value ? "2px solid #D4AF37" : "1px solid rgba(200,210,220,0.2)",
                            background: appearance.fontSize === size.value ? "rgba(212,175,55,0.05)" : "rgba(255,255,255,0.4)",
                            color: appearance.fontSize === size.value ? "#1A2A3A" : "rgba(60,80,100,0.5)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            fontSize: size.value === "small" ? "13px" : size.value === "medium" ? "15px" : "17px",
                            fontWeight: 500,
                          }}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
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