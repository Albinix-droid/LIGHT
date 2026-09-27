// components/parametres/SettingsApp.tsx
// PARAMÈTRES DU COMPTE (étudiant et encadrant) : profil, compte & sécurité, notifications, données personnelles

"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Shield, Bell, Database, Camera, Trash2, Loader2, Check, Mail, KeyRound, Eye, EyeOff, LogOut,
  Download, AlertTriangle, FolderKanban, MessageSquare, Paperclip, GraduationCap, Users, ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteAccount, prepareAvatarUpload, removeAvatar, saveAvatar, updateNotificationPrefs, updateProfile,
} from "@/lib/parametres/actions";
import {
  AVATAR_SIZE, AVATARS_BUCKET, MAX_BIO_LENGTH, MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH, NOTIFICATION_SETTINGS, TRACK_OPTIONS,
  passwordStrength,
  type AccountStats, type SettingsProfile, type Track,
} from "@/lib/parametres/types";
import type { NotificationKind } from "@/lib/notifications/types";

type Section = "profil" | "securite" | "notifications" | "donnees";

const SECTIONS: { id: Section; label: string; icon: typeof User; hint: string }[] = [
  { id: "profil", label: "Profil", icon: User, hint: "Photo, nom, présentation" },
  { id: "securite", label: "Compte & sécurité", icon: Shield, hint: "Email, mot de passe, sessions" },
  { id: "notifications", label: "Notifications", icon: Bell, hint: "Ce que vous recevez" },
  { id: "donnees", label: "Mes données", icon: Database, hint: "Export, suppression" },
];

const ROLE_LABELS = { STUDENT: "Étudiant", ENCADRANT: "Encadrant", ADMIN: "Administrateur" } as const;
const dateTime = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Douala" });
const dateOnly = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Douala" });

const initialsOf = (first: string, last: string) =>
  [first, last].filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function SettingsApp({
  profile: initialProfile,
  stats,
  basePath,
  initialSection,
}: {
  profile: SettingsProfile;
  stats: AccountStats;
  basePath: string;
  initialSection: Section;
}) {
  const [section, setSection] = useState<Section>(initialSection);
  const [profile, setProfile] = useState(initialProfile);

  const go = (id: Section) => {
    setSection(id);
    window.history.replaceState(null, "", `${basePath}?section=${id}`);
  };

  return (
    <div className="set-root">
      <style>{STYLES}</style>
      <h1 className="set-h1">Paramètres</h1>
      <p className="set-sub">Gérez votre profil, la sécurité de votre compte et ce que la plateforme vous envoie.</p>

      <div className="set-layout">
        <nav className="set-nav" aria-label="Sections des paramètres">
          {SECTIONS.map((s) => (
            <button key={s.id} className={`set-nav-btn ${section === s.id ? "set-nav-active" : ""}`} onClick={() => go(s.id)} aria-current={section === s.id ? "page" : undefined}>
              <s.icon size={17} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block" }}>{s.label}</span>
                <span className="set-nav-hint">{s.hint}</span>
              </span>
            </button>
          ))}
        </nav>

        <div style={{ flex: 1, minWidth: 0 }}>
          {section === "profil" && <ProfileSection profile={profile} onSaved={(p) => setProfile((prev) => ({ ...prev, ...p }))} />}
          {section === "securite" && <SecuritySection profile={profile} basePath={basePath} />}
          {section === "notifications" && (
            <NotificationsSection
              muted={profile.mutedNotifications}
              basePath={basePath}
              onChange={(mutedNotifications) => setProfile((prev) => ({ ...prev, mutedNotifications }))}
            />
          )}
          {section === "donnees" && <DataSection profile={profile} stats={stats} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BRIQUES
// ============================================================
function Card({ title, icon: Icon, children, tone }: { title: string; icon: typeof User; children: React.ReactNode; tone?: "danger" }) {
  return (
    <section className={`set-card ${tone === "danger" ? "set-card-danger" : ""}`}>
      <h2 className="set-h2"><Icon size={17} style={{ color: tone === "danger" ? "#F0928B" : "#F5D76E" }} /> {title}</h2>
      {children}
    </section>
  );
}

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (error) return <p role="alert" className="set-msg" style={{ color: "#F0928B" }}>{error}</p>;
  if (success) return <p role="status" className="set-msg" style={{ color: "#34D399" }}><Check size={14} /> {success}</p>;
  return null;
}

function Avatar({ url, initials, size = 88 }: { url: string | null; initials: string; size?: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="Photo de profil" width={size} height={size} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(212,175,55,0.35)" }} />
  ) : (
    <span style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #D4AF37, #F5D76E)", color: "#0A1628", fontWeight: 800, fontSize: size * 0.36,
    }}>{initials}</span>
  );
}

// Recadrage carré centré et redimensionnement dans le navigateur : la photo envoyée pèse quelques dizaines de Ko
async function resizeAvatar(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = document.createElement("img");
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
    if (blob && blob.type === "image/webp") return blob;
    // Navigateurs sans WebP : JPEG
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!jpeg) throw new Error("Conversion impossible");
    return jpeg;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ============================================================
// PROFIL
// ============================================================
function ProfileSection({ profile, onSaved }: { profile: SettingsProfile; onSaved: (p: Partial<SettingsProfile>) => void }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [bio, setBio] = useState(profile.bio);
  const [track, setTrack] = useState<Track | null>(profile.track);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = firstName !== profile.firstName || lastName !== profile.lastName || bio !== profile.bio || track !== profile.track;
  const initials = initialsOf(firstName, lastName);

  const save = () => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const result = await updateProfile({ firstName, lastName, bio, track });
      if (!result.ok) return setError(result.error);
      onSaved({ firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim(), track });
      setSuccess("Profil enregistré.");
      router.refresh();
    });
  };

  const changePhoto = async (file: File) => {
    setError("");
    setSuccess("");
    if (!file.type.startsWith("image/")) return setError("Choisissez une image (JPG, PNG, WebP…).");
    if (file.size > 15 * 1024 * 1024) return setError("Image trop lourde (15 Mo maximum avant redimensionnement).");
    setAvatarBusy(true);
    try {
      const blob = await resizeAvatar(file);
      const prepared = await prepareAvatarUpload(blob.type);
      if (!prepared.ok) throw new Error(prepared.error);
      const { error: uploadError } = await createClient().storage.from(AVATARS_BUCKET)
        .uploadToSignedUrl(prepared.path, prepared.token, blob, { contentType: blob.type });
      if (uploadError) throw new Error("Échec de l'envoi de la photo.");
      const saved = await saveAvatar(prepared.path);
      if (!saved.ok) throw new Error(saved.error);
      setAvatarUrl(saved.avatarUrl);
      onSaved({ avatarUrl: saved.avatarUrl });
      setSuccess("Photo de profil mise à jour.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de mettre à jour la photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const deletePhoto = async () => {
    setAvatarBusy(true);
    setError("");
    const result = await removeAvatar();
    setAvatarBusy(false);
    if (!result.ok) return setError(result.error);
    setAvatarUrl(null);
    onSaved({ avatarUrl: null });
    setSuccess("Photo retirée.");
    router.refresh();
  };

  return (
    <>
      <Card title="Photo de profil" icon={Camera}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Avatar url={avatarUrl} initials={initials} />
            {avatarBusy && (
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(10,22,40,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={22} style={{ color: "#F5D76E", animation: "spin 1s linear infinite" }} />
              </span>
            )}
          </div>
          <div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) changePhoto(f); e.target.value = ""; }} />
              <button className="set-btn set-btn-primary" onClick={() => fileRef.current?.click()} disabled={avatarBusy}>
                <Camera size={14} /> {avatarUrl ? "Changer la photo" : "Ajouter une photo"}
              </button>
              {avatarUrl && <button className="set-btn set-btn-danger" onClick={deletePhoto} disabled={avatarBusy}><Trash2 size={14} /> Retirer</button>}
            </div>
            <p className="set-help">La photo est recadrée en carré et réduite automatiquement ({AVATAR_SIZE} × {AVATAR_SIZE} px).</p>
          </div>
        </div>
      </Card>

      <Card title="Informations" icon={User}>
        <div className="set-grid-2">
          <label className="set-field">
            <span className="set-label">Prénom</span>
            <input className="set-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={MAX_NAME_LENGTH} autoComplete="given-name" />
          </label>
          <label className="set-field">
            <span className="set-label">Nom</span>
            <input className="set-input" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={MAX_NAME_LENGTH} autoComplete="family-name" />
          </label>
        </div>

        <div className="set-field">
          <span className="set-label">Filière</span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} role="radiogroup" aria-label="Filière">
            {TRACK_OPTIONS.map((t) => (
              <button key={t.value} role="radio" aria-checked={track === t.value} className={`set-chip ${track === t.value ? "set-chip-active" : ""}`} onClick={() => setTrack(track === t.value ? null : t.value)}>
                <span className="set-chip-tag">{t.value}</span> {t.label}
              </button>
            ))}
          </div>
          <span className="set-help">Aide vos collègues à vous situer et à trouver les bons canaux de discussion.</span>
        </div>

        <label className="set-field">
          <span className="set-label" style={{ display: "flex", justifyContent: "space-between" }}>
            Présentation <span style={{ color: bio.length > MAX_BIO_LENGTH - 30 ? "#F5B544" : "rgba(200,215,235,0.4)", fontWeight: 400 }}>{bio.length}/{MAX_BIO_LENGTH}</span>
          </span>
          <textarea className="set-input" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={MAX_BIO_LENGTH} rows={3}
            placeholder={profile.role === "ENCADRANT" ? "Vos domaines d'expertise, votre parcours, ce que vous aimez accompagner…" : "Vos compétences, vos centres d'intérêt, ce que vous recherchez dans un projet…"}
            style={{ resize: "vertical" }} />
        </label>

        {/* Aperçu en direct */}
        <div className="set-preview">
          <span className="set-help" style={{ margin: "0 0 10px", display: "block" }}>Aperçu : ce que voient les autres membres</span>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <Avatar url={avatarUrl} initials={initials} size={48} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: "#E8EDF5" }}>{`${firstName} ${lastName}`.trim() || "Votre nom"}</p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: profile.role === "ENCADRANT" ? "#A5B4FC" : "#F5D76E" }}>
                {ROLE_LABELS[profile.role]}{track ? ` · ${TRACK_OPTIONS.find((t) => t.value === track)?.label}` : ""}
              </p>
              {bio.trim() && <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(232,237,245,0.75)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{bio.trim()}</p>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
          <button className="set-btn set-btn-primary" onClick={save} disabled={!dirty || isPending || !firstName.trim()}>
            {isPending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />} Enregistrer
          </button>
          {dirty && !isPending && <span className="set-help" style={{ margin: 0 }}>Modifications non enregistrées</span>}
        </div>
        <Feedback error={error} success={success} />
      </Card>
    </>
  );
}

// ============================================================
// COMPTE & SÉCURITÉ
// ============================================================
function SecuritySection({ profile, basePath }: { profile: SettingsProfile; basePath: string }) {
  return (
    <>
      <EmailCard currentEmail={profile.email} basePath={basePath} />
      <PasswordCard email={profile.email} />
      <SessionsCard profile={profile} />
    </>
  );
}

function EmailCard({ currentEmail, basePath }: { currentEmail: string; basePath: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const next = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) return setError("Adresse email invalide.");
    if (next === currentEmail.toLowerCase()) return setError("C'est déjà votre adresse actuelle.");
    setBusy(true);
    const { error: authError } = await createClient().auth.updateUser(
      { email: next },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`${basePath}?section=securite`)}` },
    );
    setBusy(false);
    if (authError) return setError(/already|registered|exists/i.test(authError.message) ? "Cette adresse est déjà utilisée par un autre compte." : authError.message);
    setEmail("");
    setSuccess(`Un lien de confirmation a été envoyé à ${next}. Votre adresse changera dès que vous l'aurez ouvert.`);
  };

  return (
    <Card title="Adresse email" icon={Mail}>
      <p className="set-text">Adresse actuelle : <strong style={{ color: "#E8EDF5" }}>{currentEmail}</strong></p>
      <form onSubmit={submit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input className="set-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nouvelle adresse email" autoComplete="email" aria-label="Nouvelle adresse email" style={{ flex: 1, minWidth: "220px" }} />
        <button className="set-btn set-btn-primary" type="submit" disabled={busy || !email.trim()}>
          {busy ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Mail size={14} />} Changer d&apos;adresse
        </button>
      </form>
      <p className="set-help">Par sécurité, le changement ne prend effet qu&apos;après confirmation depuis la nouvelle adresse.</p>
      <Feedback error={error} success={success} />
    </Card>
  );
}

function PasswordCard({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const strength = passwordStrength(next);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (next.length < MIN_PASSWORD_LENGTH) return setError(`Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
    if (next !== confirm) return setError("Les deux nouveaux mots de passe ne correspondent pas.");
    if (next === current) return setError("Le nouveau mot de passe doit être différent de l'actuel.");
    setBusy(true);
    const supabase = createClient();
    // Vérification du mot de passe actuel avant tout changement
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (signInError) {
      setBusy(false);
      return setError("Mot de passe actuel incorrect.");
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (updateError) return setError(/weak|short/i.test(updateError.message) ? "Mot de passe trop faible : allongez-le ou variez les caractères." : updateError.message);
    setCurrent("");
    setNext("");
    setConfirm("");
    setSuccess("Mot de passe modifié.");
  };

  const type = show ? "text" : "password";
  return (
    <Card title="Mot de passe" icon={KeyRound}>
      <form onSubmit={submit}>
        <input type="email" value={email} autoComplete="username" readOnly hidden />
        <div className="set-grid-2">
          <label className="set-field" style={{ gridColumn: "1 / -1" }}>
            <span className="set-label">Mot de passe actuel</span>
            <input className="set-input" type={type} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
          </label>
          <label className="set-field">
            <span className="set-label">Nouveau mot de passe</span>
            <input className="set-input" type={type} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
          </label>
          <label className="set-field">
            <span className="set-label">Confirmation</span>
            <input className="set-input" type={type} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required
              style={confirm && confirm !== next ? { borderColor: "rgba(228,115,107,0.6)" } : undefined} />
          </label>
        </div>
        {next && (
          <div style={{ margin: "-4px 0 12px" }} aria-live="polite">
            <div style={{ display: "flex", gap: "4px" }}>
              {[1, 2, 3, 4].map((i) => (
                <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: strength.score >= i ? strength.color : "rgba(255,255,255,0.08)", transition: "background 0.2s ease" }} />
              ))}
            </div>
            <span style={{ fontSize: "12px", color: strength.color }}>Robustesse : {strength.label}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="set-btn set-btn-primary" type="submit" disabled={busy || !current || !next || !confirm}>
            {busy ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={14} />} Modifier le mot de passe
          </button>
          <button className="set-btn" type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? "Masquer" : "Afficher"}
          </button>
        </div>
      </form>
      <Feedback error={error} success={success} />
    </Card>
  );
}

function SessionsCard({ profile }: { profile: SettingsProfile }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signOutEverywhere = async () => {
    setBusy(true);
    const { error: authError } = await createClient().auth.signOut({ scope: "global" });
    if (authError) {
      setBusy(false);
      return setError(authError.message);
    }
    window.location.href = "/login?deconnecte=1";
  };

  return (
    <Card title="Sessions" icon={LogOut}>
      <dl className="set-dl">
        <div><dt>Dernière connexion</dt><dd>{profile.lastSignInAt ? dateTime.format(new Date(profile.lastSignInAt)) : "—"}</dd></div>
        <div><dt>Membre depuis</dt><dd>{dateOnly.format(new Date(profile.createdAt))}</dd></div>
        <div><dt>Rôle</dt><dd>{ROLE_LABELS[profile.role]}</dd></div>
      </dl>
      <p className="set-text">Un appareil perdu ou une session oubliée sur un ordinateur partagé ? Déconnectez toutes les sessions, y compris celle-ci.</p>
      {confirming ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="set-btn set-btn-danger" onClick={signOutEverywhere} disabled={busy}>
            {busy ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <LogOut size={14} />} Oui, tout déconnecter
          </button>
          <button className="set-btn" onClick={() => setConfirming(false)} disabled={busy}>Annuler</button>
        </div>
      ) : (
        <button className="set-btn" onClick={() => setConfirming(true)}><LogOut size={14} /> Se déconnecter de tous les appareils</button>
      )}
      <Feedback error={error} />
    </Card>
  );
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function NotificationsSection({ muted, basePath, onChange }: { muted: NotificationKind[]; basePath: string; onChange: (m: NotificationKind[]) => void }) {
  const [current, setCurrent] = useState(muted);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const toggle = async (kind: NotificationKind) => {
    const next = current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind];
    const previous = current;
    setCurrent(next);
    setError("");
    setSaved(false);
    const result = await updateNotificationPrefs(next);
    if (!result.ok) {
      setCurrent(previous);
      return setError(result.error);
    }
    onChange(next);
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 2000);
  };

  const notificationsHref = basePath.replace(/\/parametres$/, "/notifications");
  return (
    <Card title="Notifications reçues" icon={Bell}>
      <p className="set-text">Choisissez les notifications à recevoir. Les changements sont enregistrés immédiatement.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {NOTIFICATION_SETTINGS.map((s) => {
          const enabled = !current.includes(s.kind);
          return (
            <label key={s.kind} className="set-toggle-row">
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#E8EDF5" }}>{s.label}</span>
                <span style={{ fontSize: "12px", color: "rgba(200,215,235,0.55)" }}>{s.detail}</span>
              </span>
              <input type="checkbox" className="set-switch" role="switch" checked={enabled} onChange={() => toggle(s.kind)} aria-label={`Notifications ${s.label}`} />
            </label>
          );
        })}
      </div>
      <p className="set-help" style={{ marginTop: "14px" }}>
        La section « À traiter » de vos <Link href={notificationsHref} style={{ color: "#F5D76E" }}>notifications</Link> reste toujours visible :
        elle reflète ce qui attend réellement votre action.
      </p>
      <Feedback error={error} success={saved ? "Préférences enregistrées." : undefined} />
    </Card>
  );
}

// ============================================================
// MES DONNÉES
// ============================================================
function DataSection({ profile, stats }: { profile: SettingsProfile; stats: AccountStats }) {
  const isEncadrant = profile.role === "ENCADRANT";
  const tiles = useMemo(() => [
    { icon: FolderKanban, label: "Projets portés", value: stats.ownedProjects.length, show: !isEncadrant },
    { icon: Users, label: "Équipes rejointes", value: stats.memberProjects, show: !isEncadrant },
    { icon: GraduationCap, label: "Projets encadrés", value: stats.supervisedProjects, show: isEncadrant },
    { icon: MessageSquare, label: "Messages envoyés", value: stats.messages, show: true },
    { icon: Paperclip, label: "Fichiers partagés", value: stats.files, show: true },
  ].filter((t) => t.show), [stats, isEncadrant]);

  return (
    <>
      <Card title="Votre activité" icon={Database}>
        <div className="set-tiles">
          {tiles.map((t) => (
            <div key={t.label} className="set-tile">
              <t.icon size={16} style={{ color: "#F5D76E" }} />
              <span className="set-tile-value">{t.value}</span>
              <span className="set-tile-label">{t.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Exporter mes données" icon={Download}>
        <p className="set-text">
          Téléchargez en un fichier JSON tout ce que la plateforme conserve sur vous : profil, projets et étapes, demandes,
          messages envoyés, conversations avec l&apos;assistant IA et notifications.
        </p>
        <a href="/api/compte/export" className="set-btn set-btn-primary" style={{ textDecoration: "none" }} download>
          <Download size={14} /> Télécharger mes données
        </a>
      </Card>

      <DeleteAccountCard profile={profile} stats={stats} />
    </>
  );
}

function DeleteAccountCard({ profile, stats }: { profile: SettingsProfile; stats: AccountStats }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const matches = confirm.trim().toLowerCase() === profile.email.toLowerCase();

  const remove = async () => {
    setBusy(true);
    setError("");
    const result = await deleteAccount(confirm);
    if (!result.ok) {
      setBusy(false);
      return setError(result.error);
    }
    await createClient().auth.signOut({ scope: "local" }).catch(() => {});
    window.location.href = "/?compte=supprime";
  };

  return (
    <Card title="Supprimer mon compte" icon={AlertTriangle} tone="danger">
      <p className="set-text">La suppression est <strong style={{ color: "#F0928B" }}>définitive</strong>. Seront effacés :</p>
      <ul className="set-list">
        <li>votre profil, vos messages, fichiers envoyés, notifications et conversations avec l&apos;assistant IA ;</li>
        {stats.ownedProjects.length > 0 && (
          <li>
            les projets que vous portez, avec leurs étapes et leurs équipes :{" "}
            {stats.ownedProjects.map((p, i) => (
              <span key={p.id}>
                {i > 0 && ", "}<strong style={{ color: "#E8EDF5" }}>{p.title}</strong>
                {p.memberCount > 1 && <span style={{ color: "#F5B544" }}> ({p.memberCount - 1} autre{p.memberCount > 2 ? "s" : ""} membre{p.memberCount > 2 ? "s" : ""})</span>}
              </span>
            ))}
          </li>
        )}
        {stats.createdConversations.length > 0 && (
          <li>
            les {stats.createdConversations.some((c) => c.type === "CHANNEL") ? "groupes et canaux" : "groupes"} que vous avez créés :{" "}
            {stats.createdConversations.map((c) => c.name).join(", ")}
          </li>
        )}
        {stats.supervisedProjects > 0 && <li>vos projets encadrés perdront leur encadrant ({stats.supervisedProjects}).</li>}
      </ul>
      {stats.ownedProjects.some((p) => p.memberCount > 1) && (
        <p className="set-help" style={{ color: "#F5B544" }}>Prévenez les membres de vos équipes avant de supprimer votre compte : leurs projets communs disparaîtront aussi.</p>
      )}

      {open ? (
        <div style={{ marginTop: "12px" }}>
          <label className="set-field">
            <span className="set-label">Pour confirmer, saisissez votre adresse email : {profile.email}</span>
            <input className="set-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" placeholder={profile.email} />
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="set-btn set-btn-danger-solid" onClick={remove} disabled={!matches || busy}>
              {busy ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />} Supprimer définitivement
            </button>
            <button className="set-btn" onClick={() => { setOpen(false); setConfirm(""); }} disabled={busy}>Annuler</button>
          </div>
        </div>
      ) : (
        <button className="set-btn set-btn-danger" onClick={() => setOpen(true)} style={{ marginTop: "8px" }}>
          <Trash2 size={14} /> Supprimer mon compte <ArrowRight size={14} />
        </button>
      )}
      <Feedback error={error} />
    </Card>
  );
}

// ============================================================
// STYLES
// ============================================================
const STYLES = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .set-root { max-width: 1040px; margin: 0 auto; padding: 24px 20px 48px; font-family: 'Inter', -apple-system, sans-serif; color: #E8EDF5; }
  .set-h1 { font-size: 28px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.5px; }
  .set-sub { color: rgba(200,215,235,0.55); font-size: 14px; margin: 0 0 24px; }
  .set-layout { display: flex; gap: 24px; align-items: flex-start; }
  .set-nav { width: 250px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; position: sticky; top: 80px; }
  .set-nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; border: 1px solid transparent; background: none; color: rgba(200,215,235,0.7); font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; font-family: inherit; transition: all 0.2s ease; }
  .set-nav-btn:hover { background: rgba(255,255,255,0.04); color: #E8EDF5; }
  .set-nav-active { background: rgba(212,175,55,0.1) !important; border-color: rgba(212,175,55,0.25); color: #F5D76E !important; }
  .set-nav-hint { display: block; font-size: 11px; font-weight: 400; color: rgba(200,215,235,0.4); margin-top: 1px; }
  .set-card { padding: 20px 22px; border-radius: 18px; background: rgba(255,255,255,0.035); border: 1px solid rgba(180,200,230,0.08); margin-bottom: 16px; }
  .set-card-danger { border-color: rgba(228,115,107,0.25); background: rgba(228,115,107,0.04); }
  .set-h2 { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; margin: 0 0 16px; }
  .set-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; }
  .set-field { display: block; margin-bottom: 14px; }
  .set-label { display: block; font-size: 12px; font-weight: 600; color: rgba(200,215,235,0.6); margin-bottom: 6px; }
  .set-input { width: 100%; box-sizing: border-box; padding: 11px 14px; border-radius: 12px; border: 1px solid rgba(180,200,230,0.14); background: rgba(255,255,255,0.04); color: #E8EDF5; font-size: 14px; outline: none; font-family: inherit; transition: border-color 0.2s ease; }
  .set-input:focus { border-color: rgba(212,175,55,0.5); }
  .set-input::placeholder { color: rgba(200,215,235,0.3); }
  .set-help { font-size: 12px; color: rgba(200,215,235,0.45); margin: 8px 0 0; line-height: 1.5; }
  .set-text { font-size: 14px; color: rgba(200,215,235,0.7); line-height: 1.6; margin: 0 0 14px; }
  .set-msg { display: flex; align-items: center; gap: 6px; font-size: 13px; margin: 12px 0 0; }
  .set-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 16px; border-radius: 50px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid rgba(180,200,230,0.18); background: rgba(255,255,255,0.03); color: rgba(200,215,235,0.85); transition: all 0.2s ease; white-space: nowrap; }
  .set-btn:hover:not(:disabled) { color: #E8EDF5; border-color: rgba(180,200,230,0.35); }
  .set-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .set-btn-primary { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628 !important; border: none; font-weight: 700; }
  .set-btn-primary:hover:not(:disabled) { box-shadow: 0 6px 24px rgba(212,175,55,0.25); }
  .set-btn-danger { color: #F0928B; border-color: rgba(228,115,107,0.35); }
  .set-btn-danger:hover:not(:disabled) { color: #fff; background: rgba(228,115,107,0.18); border-color: rgba(228,115,107,0.5); }
  .set-btn-danger-solid { background: #D9534F; color: #fff; border: none; font-weight: 700; }
  .set-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 50px; border: 1px solid rgba(180,200,230,0.14); background: rgba(255,255,255,0.03); color: rgba(200,215,235,0.75); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .set-chip-active { border-color: rgba(99,102,241,0.55); background: rgba(99,102,241,0.14); color: #C7D2FE; }
  .set-chip-tag { font-size: 10px; font-weight: 800; letter-spacing: 0.5px; padding: 2px 6px; border-radius: 6px; background: rgba(99,102,241,0.2); color: #A5B4FC; }
  .set-preview { padding: 14px 16px; border-radius: 14px; border: 1px dashed rgba(180,200,230,0.15); background: rgba(10,22,40,0.35); }
  .set-dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin: 0 0 16px; }
  .set-dl div { padding: 12px 14px; border-radius: 12px; background: rgba(255,255,255,0.03); }
  .set-dl dt { font-size: 11px; color: rgba(200,215,235,0.45); margin-bottom: 3px; }
  .set-dl dd { margin: 0; font-size: 13px; font-weight: 600; color: #E8EDF5; }
  .set-toggle-row { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(180,200,230,0.06); cursor: pointer; }
  .set-switch { appearance: none; -webkit-appearance: none; width: 42px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.12); position: relative; cursor: pointer; flex-shrink: 0; transition: background 0.2s ease; margin: 0; }
  .set-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #E8EDF5; transition: transform 0.2s ease; }
  .set-switch:checked { background: linear-gradient(135deg, #D4AF37, #F5D76E); }
  .set-switch:checked::after { transform: translateX(18px); background: #0A1628; }
  .set-switch:focus-visible { outline: 2px solid #F5D76E; outline-offset: 2px; }
  .set-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  .set-tile { display: flex; flex-direction: column; gap: 4px; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.03); }
  .set-tile-value { font-size: 24px; font-weight: 800; color: #E8EDF5; }
  .set-tile-label { font-size: 12px; color: rgba(200,215,235,0.55); }
  .set-list { margin: 0 0 12px; padding-left: 20px; color: rgba(200,215,235,0.7); font-size: 13px; line-height: 1.7; }
  @media (max-width: 820px) {
    .set-layout { flex-direction: column; }
    .set-nav { width: 100%; flex-direction: row; overflow-x: auto; position: static; padding-bottom: 4px; }
    .set-nav-btn { flex-shrink: 0; padding: 9px 14px; }
    .set-nav-hint { display: none; }
    .set-grid-2 { grid-template-columns: 1fr; }
    .set-h1 { font-size: 23px; }
    .set-root { padding: 16px 16px 40px; }
  }
`;
