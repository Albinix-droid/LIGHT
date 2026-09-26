// components/CurrentSessionBanner.tsx
// Affiché sur /login et /register quand une session est déjà ouverte :
// le formulaire reste utilisable (changer de compte, en créer un autre).

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div
      role="status"
      style={{
        marginBottom: "18px",
        padding: "12px 14px",
        borderRadius: "10px",
        background: "rgba(99, 102, 241, 0.08)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        color: "#A5B4FC",
        fontSize: "13px",
        lineHeight: 1.6,
      }}
    >
      Vous êtes déjà connecté en tant que <strong style={{ color: "#E8EDF5" }}>{email}</strong>.
      <span style={{ display: "flex", gap: "14px", marginTop: "6px", flexWrap: "wrap" }}>
        <Link href="/dashboard" style={{ color: "#F5D76E", fontWeight: 600, textDecoration: "none" }}>
          Aller à mon espace →
        </Link>
        <form action="/logout" method="post" style={{ display: "inline" }}>
          <button
            type="submit"
            style={{ background: "none", border: "none", padding: 0, color: "#F0928B", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}
          >
            Se déconnecter
          </button>
        </form>
      </span>
    </div>
  );
}
