// components/AuthShell.tsx
// Cadre commun des pages d'authentification secondaires (mot de passe oublié, réinitialisation)
// Reprend le style de la page de connexion : fond bleu nuit, carte vitrée, accents or.

import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "radial-gradient(ellipse at 30% 20%, #102440 0%, #0A1628 70%)",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes authFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .auth-card {
          width: 100%; max-width: 440px; padding: 44px 36px; border-radius: 24px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(180,200,230,0.08);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3); backdrop-filter: blur(20px);
          animation: authFadeIn 0.6s ease both;
        }
        .auth-label { display: block; color: rgba(200,215,235,0.6); font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        .auth-input {
          width: 100%; padding: 14px 18px; border-radius: 12px; box-sizing: border-box; outline: none;
          background: rgba(255,255,255,0.04); color: #E8EDF5; border: 2px solid rgba(180,200,230,0.08);
          font-size: 15px; font-family: inherit; transition: all 0.25s ease;
        }
        .auth-input:focus { border-color: rgba(212,175,55,0.3); background: rgba(255,255,255,0.06); }
        .auth-input::placeholder { color: rgba(200,215,235,0.3); }
        .auth-button {
          width: 100%; padding: 15px; border: none; border-radius: 12px; cursor: pointer;
          background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; font-size: 15px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit;
          box-shadow: 0 4px 20px rgba(212,175,55,0.2); transition: all 0.25s ease;
        }
        .auth-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 36px rgba(212,175,55,0.3); }
        .auth-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-message { margin-bottom: 18px; padding: 12px 14px; border-radius: 10px; font-size: 13px; line-height: 1.5; }
        .auth-error { background: rgba(228,115,107,0.08); border: 1px solid rgba(228,115,107,0.15); color: #E4736B; }
        .auth-success { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); color: #10B981; }
        .auth-link { color: #F5D76E; text-decoration: none; font-weight: 600; }
        .auth-link:hover { color: #FFFFFF; }
      `}</style>

      <div className="auth-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            style={{
              width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #D4AF37, #F5D76E)", color: "#0A1628", fontSize: "22px", fontWeight: 700,
              textDecoration: "none", boxShadow: "0 8px 32px rgba(212,175,55,0.25)",
            }}
          >
            IAI
          </Link>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 700, textAlign: "center", color: "#F5D76E", margin: "0 0 6px" }}>{title}</h1>
        <p style={{ fontSize: "14px", color: "rgba(200,215,235,0.5)", textAlign: "center", margin: "0 0 28px", lineHeight: 1.6 }}>{subtitle}</p>
        {children}
        <p style={{ textAlign: "center", fontSize: "14px", color: "rgba(200,215,235,0.4)", margin: "22px 0 0" }}>
          <Link href="/login" className="auth-link">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
