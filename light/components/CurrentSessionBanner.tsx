// components/CurrentSessionBanner.tsx
// Affiché sur /login et /register quand une session est déjà ouverte :
// le formulaire reste utilisable (changer de compte, en créer un autre).

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CurrentSessionBanner() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => {});
  }, []);

  if (!email) return null;

  return (
    <div role="status" className="mb-6 flex gap-3 rounded-2xl bg-brand-soft px-4 py-3.5 text-[13px] leading-relaxed ring-1 ring-brand/15 ring-inset">
      <UserRound className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2} />
      <div className="min-w-0 text-ink-muted">
        Vous êtes déjà connecté en tant que <strong className="font-semibold text-ink">{email}</strong>.
        <span className="mt-1.5 flex flex-wrap gap-4">
          <Link href="/dashboard" className="font-semibold text-brand hover:text-brand-strong">Aller à mon espace →</Link>
          <form action="/logout" method="post" className="inline">
            <button type="submit" className="font-semibold text-danger hover:underline">Se déconnecter</button>
          </form>
        </span>
      </div>
    </div>
  );
}
