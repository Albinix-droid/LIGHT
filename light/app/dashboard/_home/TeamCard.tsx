// app/dashboard/_home/TeamCard.tsx
// Encadrant et membres de l'équipe, avec accès direct à la messagerie

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Mail, UserPlus } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { startDirectConversation } from "@/lib/messagerie/actions";
import type { HomeContact } from "@/lib/dashboard/queries";

export default function TeamCard({ contacts, projectId }: { contacts: HomeContact[]; projectId: string }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const hasSupervisor = contacts.some((c) => c.isSupervisor);

  const write = (contact: HomeContact) => {
    setError("");
    setPendingId(contact.id);
    startTransition(async () => {
      const result = await startDirectConversation(contact.id);
      if (!result.ok) {
        setError(result.error);
        setPendingId(null);
        return;
      }
      router.push(`/dashboard/messagerie?c=${result.id}`);
    });
  };

  return (
    <section className="rounded-[22px] border border-line bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[16px] font-semibold text-ink">Mon équipe</h2>
        <Link href={`/dashboard/projets/${projectId}`} className="text-[12px] font-semibold text-brand hover:text-brand-strong">
          Gérer
        </Link>
      </div>

      <ul className="flex flex-col gap-2.5">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-line p-2.5 pr-3 transition-colors hover:border-line-strong">
            <div className="relative">
              <Avatar name={c.name} url={c.avatarUrl} size="lg" />
              {c.isSupervisor && (
                <span className="absolute -right-1 -bottom-1 inline-flex size-5 items-center justify-center rounded-full bg-brand text-white ring-2 ring-surface" title="Encadrant">
                  <GraduationCap className="size-3" strokeWidth={2.25} />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{c.name}</p>
              <p className="truncate text-[12px] text-ink-muted">{c.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => write(c)}
              disabled={pendingId !== null}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink transition-colors duration-150 hover:bg-brand hover:text-white disabled:opacity-60"
              aria-label={`Écrire à ${c.name}`}
              title={`Écrire à ${c.name}`}
            >
              {pendingId === c.id ? <Loader2 className="size-[18px] animate-spin" /> : <Mail className="size-[18px]" strokeWidth={1.75} />}
            </button>
          </li>
        ))}

        {!hasSupervisor && (
          <li>
            <Link
              href={`/dashboard/projets/${projectId}`}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-gold/50 bg-gold-soft/50 p-3 transition-colors hover:border-gold"
            >
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold">
                <GraduationCap className="size-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-ink">Choisir un encadrant</span>
                <span className="block text-[12px] text-ink-muted">Indispensable pour faire valider vos étapes</span>
              </span>
            </Link>
          </li>
        )}

        {contacts.filter((c) => !c.isSupervisor).length === 0 && (
          <li>
            <Link
              href={`/dashboard/projets/${projectId}`}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-3 transition-colors hover:border-brand"
            >
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-ink-muted">
                <UserPlus className="size-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-ink">Inviter un coéquipier</span>
                <span className="block text-[12px] text-ink-muted">Constituez l&apos;équipe du projet</span>
              </span>
            </Link>
          </li>
        )}
      </ul>
      {error && <p role="alert" className="mt-3 text-[12px] text-danger">{error}</p>}
    </section>
  );
}
