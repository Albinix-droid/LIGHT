// app/register/page.tsx
// PAGE D'INSCRIPTION

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, GraduationCap, KeyRound, Loader2, Rocket, ShieldCheck } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import AuthShell from "@/components/AuthShell";
import CurrentSessionBanner from "@/components/CurrentSessionBanner";

const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient(url, anonKey);
};

// ============================================================
// RÔLES PROPOSÉS À L'INSCRIPTION
// ============================================================
type SignupRole = "STUDENT" | "ENCADRANT" | "ADMIN";

const ROLE_OPTIONS: { value: SignupRole; label: string; desc: string; icon: typeof Rocket }[] = [
  { value: "STUDENT", label: "Étudiant", desc: "Je porte un projet", icon: Rocket },
  { value: "ENCADRANT", label: "Encadrant", desc: "J'accompagne des projets", icon: GraduationCap },
  { value: "ADMIN", label: "Administration", desc: "Je gère la plateforme", icon: ShieldCheck },
];

// Encadrants et administrateurs confirment ensuite leur identité avec les identifiants de l'école
const nextPathFor = (role: SignupRole) => (role === "STUDENT" ? "/onboarding/welcome" : "/confirmation");

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<SignupRole>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await createClient().auth.signUp({
        email: cleanEmail,
        password,
        options: {
          // Si la confirmation d'email est activée dans Supabase, le lien reçu ouvre la session ici
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${nextPathFor(role)}`,
          data: {
            full_name: cleanName,
            name: cleanName,
            // Lu à la création du profil (lib/auth.ts) pour orienter vers le bon espace
            role,
          },
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Supabase n'a pas retourné l'utilisateur créé.");

      if (!authData.session) {
        setSuccess("Votre compte a bien été créé. Vérifiez votre adresse email pour confirmer votre compte.");
        setName("");
        setEmail("");
        setPassword("");
        setIsLoading(false);
        return;
      }

      // Étudiant : accueil ; encadrant et administration : confirmation avec les identifiants de l'école
      router.replace(nextPathFor(role));
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.";
      const normalized = message.toLowerCase();
      if (normalized.includes("already registered")) setError("Cette adresse email est déjà utilisée.");
      else if (normalized.includes("invalid email")) setError("Veuillez saisir une adresse email valide.");
      else if (normalized.includes("password")) setError("Le mot de passe doit contenir au moins 6 caractères.");
      else if (normalized.includes("rate limit")) setError("Trop de tentatives. Veuillez patienter quelques instants puis réessayer.");
      else setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const staff = role !== "STUDENT";

  return (
    <AuthShell
      maxWidth={480}
      eyebrow="Inscription"
      title="Créez votre compte"
      subtitle="Rejoignez la communauté des entrepreneurs de l'IAI et donnez vie à votre idée."
      footer={
        <p className="mt-8 text-center text-[14px] text-ink-muted">
          Déjà inscrit ? <Link href="/login" className="auth-link">Se connecter</Link>
        </p>
      }
    >
      <CurrentSessionBanner />
      {error && <div role="alert" className="auth-message auth-error">{error}</div>}
      {success && (
        <div role="status" className="auth-message auth-success">
          {success}
          <Link href="/login" className="mt-2 block font-semibold underline">Aller à la connexion</Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rôle */}
        <div>
          <span className="auth-label" id="role-label">Je suis</span>
          <div role="radiogroup" aria-labelledby="role-label" className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((option) => {
              const selected = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={isLoading}
                  onClick={() => setRole(option.value)}
                  className={`flex flex-col items-start gap-1.5 rounded-2xl border-[1.5px] p-3 text-left transition-all duration-150 ${
                    selected ? "border-brand bg-brand-soft shadow-card" : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <span className={`inline-flex size-8 items-center justify-center rounded-lg ${selected ? "bg-brand text-white" : "bg-surface-muted text-ink-muted"}`}>
                    <option.icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <span className={`text-[13.5px] font-semibold ${selected ? "text-brand-ink" : "text-ink"}`}>{option.label}</span>
                  <span className="text-[11.5px] leading-tight text-ink-subtle">{option.desc}</span>
                </button>
              );
            })}
          </div>
          {staff && (
            <p className="mt-2.5 flex gap-2 rounded-xl bg-gold-soft px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-muted ring-1 ring-gold/20 ring-inset">
              <KeyRound className="mt-0.5 size-3.5 shrink-0 text-brand" strokeWidth={2} />
              Après l&apos;inscription, vous confirmerez ce rôle avec le matricule et le code confidentiel remis par l&apos;école.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="auth-label">Nom complet</label>
          <input id="name" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom et nom" autoComplete="name" required disabled={isLoading} />
        </div>

        <div>
          <label htmlFor="email" className="auth-label">Adresse email</label>
          <input id="email" type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@iai-cameroun.com" autoComplete="email" required disabled={isLoading} />
        </div>

        <div>
          <label htmlFor="password" className="auth-label">Mot de passe</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="auth-input pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6 caractères minimum"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="auth-button">
          {isLoading ? <><Loader2 className="size-[18px] animate-spin" /> Création du compte…</> : <>Créer mon compte <ArrowRight className="size-[18px]" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
