// components/assistant/AssistantApp.tsx
// ASSISTANT IA : mentor entrepreneurial qui analyse le projet de l'étudiant et le conseille

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles, Plus, Send, Square, Trash2, Globe, Loader2, MessageSquare, FolderKanban, AlertCircle, ExternalLink,
  Search, TrendingUp, Wallet, Rocket, CheckCircle2, Presentation, Menu, X,
} from "lucide-react";
import { deleteAssistantThread, getAssistantThread } from "@/lib/assistant/actions";
import { QUICK_PROMPTS } from "@/lib/assistant/prompt";
import { ASSISTANT_MAX_MESSAGE_LENGTH } from "@/lib/assistant/limits";
import type { AssistantChatMessage, AssistantSource, AssistantThreadSummary } from "@/lib/assistant/types";

const QUICK_ICONS: Record<string, typeof Search> = {
  analyse: Search, marche: TrendingUp, modele: Wallet, lancement: Rocket, etape: CheckCircle2, pitch: Presentation,
};

type Status = "idle" | "thinking" | "search" | "writing";

export interface AssistantProject {
  id: string;
  title: string;
  stageLabel: string;
  progress: number;
}

export default function AssistantApp({
  firstName,
  projects,
  initialThreads,
  initialThreadId,
  initialMessages,
  initialProjectId,
  initialRemaining,
}: {
  firstName: string;
  projects: AssistantProject[];
  initialThreads: AssistantThreadSummary[];
  initialThreadId: string | null;
  initialMessages: AssistantChatMessage[];
  initialProjectId: string | null;
  initialRemaining: number;
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [messages, setMessages] = useState<AssistantChatMessage[]>(initialMessages);
  const [projectId, setProjectId] = useState<string | null>(initialProjectId ?? projects[0]?.id ?? null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const busy = status !== "idle";
  const project = projects.find((p) => p.id === projectId) ?? null;

  // ===== Défilement automatique pendant l'écriture =====
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const setUrl = (id: string | null) => window.history.replaceState(null, "", id ? `/dashboard/assistant?t=${id}` : "/dashboard/assistant");

  // ===== Conversations =====
  const openThread = useCallback(async (id: string) => {
    if (busy) return;
    setError("");
    setHistoryOpen(false);
    const result = await getAssistantThread(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setThreadId(id);
    setMessages(result.messages);
    if (result.projectId) setProjectId(result.projectId);
    stickToBottom.current = true;
    setUrl(id);
  }, [busy]);

  const newConversation = () => {
    if (busy) return;
    setThreadId(null);
    setMessages([]);
    setError("");
    setHistoryOpen(false);
    setUrl(null);
  };

  const removeThread = async (id: string) => {
    const result = await deleteAssistantThread(id);
    setConfirmDelete(null);
    if (!result.ok) return setError(result.error);
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (id === threadId) newConversation();
  };

  // ===== Envoi et lecture du flux =====
  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setError("");
    setInput("");
    stickToBottom.current = true;

    const pendingId = `pending-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: text, sources: [] },
      { id: pendingId, role: "assistant", content: "", sources: [] },
    ]);
    setStatus("thinking");

    const controller = new AbortController();
    abortRef.current = controller;
    const updatePending = (fn: (m: AssistantChatMessage) => AssistantChatMessage) =>
      setMessages((prev) => prev.map((m) => (m.id === pendingId ? fn(m) : m)));
    const dropPendingIfEmpty = () =>
      setMessages((prev) => prev.filter((m) => m.id !== pendingId || m.content.trim()));

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId, projectId: threadId ? undefined : projectId }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        dropPendingIfEmpty();
        setError(data.error ?? "L'assistant n'a pas pu répondre. Réessayez.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as
            | { type: "thread"; threadId: string; title: string }
            | { type: "status"; value: "search" }
            | { type: "text"; delta: string }
            | { type: "done"; messageId: string | null; sources: AssistantSource[] }
            | { type: "error"; message: string };

          if (event.type === "thread") {
            setThreadId(event.threadId);
            setUrl(event.threadId);
            setThreads((prev) => {
              const existing = prev.find((t) => t.id === event.threadId);
              const summary: AssistantThreadSummary = existing
                ? { ...existing, updatedAt: new Date().toISOString() }
                : { id: event.threadId, title: event.title, projectId: threadId ? null : projectId, projectTitle: threadId ? null : project?.title ?? null, updatedAt: new Date().toISOString() };
              return [summary, ...prev.filter((t) => t.id !== event.threadId)];
            });
            setRemaining((r) => Math.max(0, r - 1));
          } else if (event.type === "status") {
            setStatus("search");
          } else if (event.type === "text") {
            setStatus("writing");
            updatePending((m) => ({ ...m, content: m.content + event.delta }));
          } else if (event.type === "done") {
            updatePending((m) => ({ ...m, id: event.messageId ?? m.id, sources: event.sources }));
          } else if (event.type === "error") {
            setError(event.message);
          }
        }
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError("La connexion a été interrompue. Réessayez.");
      }
    } finally {
      dropPendingIfEmpty();
      abortRef.current = null;
      setStatus("idle");
    }
  };

  const stop = () => abortRef.current?.abort();

  const empty = messages.length === 0;

  return (
    <div className="ai-app">
      <style>{STYLES}</style>

      {/* ===================== HISTORIQUE ===================== */}
      <aside className={`ai-sidebar ${historyOpen ? "ai-sidebar-open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: 700, color: "#E8EDF5" }}>
            <Sparkles size={17} style={{ color: "#F5D76E" }} /> Assistant IA
          </span>
          <button className="ai-icon-btn ai-mobile-only" onClick={() => setHistoryOpen(false)} aria-label="Fermer l'historique"><X size={15} /></button>
        </div>

        <button className="ai-btn ai-btn-primary" onClick={newConversation} disabled={busy} style={{ width: "100%", marginBottom: "18px" }}>
          <Plus size={15} /> Nouvelle conversation
        </button>

        <p className="ai-section-title">Historique</p>
        <div className="ai-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", margin: "0 -6px", padding: "0 6px" }}>
          {threads.length === 0 ? (
            <p style={{ fontSize: "12px", color: "rgba(200,215,235,0.4)", lineHeight: 1.6 }}>Vos conversations avec le mentor apparaîtront ici.</p>
          ) : (
            threads.map((t) => (
              <div key={t.id} className={`ai-thread ${t.id === threadId ? "ai-thread-active" : ""}`}>
                <button onClick={() => openThread(t.id)} disabled={busy} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
                  <span className="ai-ellipsis" style={{ fontSize: "13px", color: "#E8EDF5", fontWeight: t.id === threadId ? 600 : 500 }}>{t.title}</span>
                  {t.projectTitle && <span className="ai-ellipsis" style={{ fontSize: "11px", color: "rgba(200,215,235,0.45)" }}>{t.projectTitle}</span>}
                </button>
                {confirmDelete === t.id ? (
                  <span style={{ display: "flex", gap: "4px" }}>
                    <button className="ai-mini ai-mini-danger" onClick={() => removeThread(t.id)}>Supprimer</button>
                    <button className="ai-mini" onClick={() => setConfirmDelete(null)}>Non</button>
                  </span>
                ) : (
                  <button className="ai-icon-btn ai-thread-delete" onClick={() => setConfirmDelete(t.id)} aria-label={`Supprimer « ${t.title} »`} title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.35)", margin: "12px 0 0", lineHeight: 1.5 }}>
          {remaining} message{remaining > 1 ? "s" : ""} restant{remaining > 1 ? "s" : ""} sur 24 h
        </p>
      </aside>

      {/* ===================== CONVERSATION ===================== */}
      <section className="ai-main">
        <header className="ai-header">
          <button className="ai-icon-btn ai-mobile-only" onClick={() => setHistoryOpen(true)} aria-label="Ouvrir l'historique"><Menu size={16} /></button>
          <FolderKanban size={16} style={{ color: "#F5D76E", flexShrink: 0 }} />
          <label htmlFor="ai-project" style={{ fontSize: "12px", color: "rgba(200,215,235,0.5)", flexShrink: 0 }}>Projet analysé</label>
          {threadId ? (
            <span className="ai-ellipsis" style={{ fontSize: "13px", color: "#E8EDF5", fontWeight: 600 }}>
              {threads.find((t) => t.id === threadId)?.projectTitle ?? project?.title ?? "Aucun projet"}
            </span>
          ) : (
            <select id="ai-project" className="ai-select" value={projectId ?? ""} onChange={(e) => setProjectId(e.target.value || null)} disabled={busy}>
              <option value="">Aucun projet (question générale)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title} · {p.stageLabel} · {p.progress} %</option>
              ))}
            </select>
          )}
        </header>

        <div ref={listRef} onScroll={onScroll} className="ai-scroll ai-messages">
          {empty ? (
            <div className="ai-welcome">
              <div className="ai-orb"><Sparkles size={28} /></div>
              <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#E8EDF5", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                Bonjour {firstName}, je suis votre mentor entrepreneurial
              </h1>
              <p style={{ fontSize: "14px", color: "rgba(200,215,235,0.6)", margin: "0 auto 26px", maxWidth: "560px", lineHeight: 1.7 }}>
                {project
                  ? <>J&apos;ai accès au dossier de <strong style={{ color: "#F5D76E" }}>{project.title}</strong> : contenu des 5 étapes et retours de votre encadrant. Posez-moi vos questions ou choisissez un point de départ.</>
                  : projects.length > 0
                    ? "Choisissez le projet à analyser en haut de la page pour des conseils personnalisés, ou posez une question générale sur l'entrepreneuriat."
                    : "Créez votre projet pour que je puisse l'analyser. En attendant, posez-moi n'importe quelle question sur l'entrepreneuriat."}
              </p>
              <div className="ai-quick-grid">
                {QUICK_PROMPTS.map((q) => {
                  const Icon = QUICK_ICONS[q.id] ?? Sparkles;
                  return (
                    <button key={q.id} className="ai-quick" onClick={() => send(q.prompt)} disabled={busy || remaining === 0}>
                      <Icon size={17} style={{ color: "#F5D76E", flexShrink: 0 }} />
                      <span>{q.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`ai-row ${m.role === "user" ? "ai-row-user" : ""}`}>
                {m.role === "assistant" && <div className="ai-avatar"><Sparkles size={15} /></div>}
                <div className={m.role === "user" ? "ai-bubble-user" : "ai-bubble-assistant"}>
                  {m.role === "user" ? (
                    m.content
                  ) : m.content ? (
                    <div className="ai-md">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="ai-status">
                      {status === "search" ? <Globe size={14} /> : <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                      {status === "search" ? "Recherche d'informations sur le web…" : project && !threadId ? `Analyse du dossier ${project.title}…` : "Réflexion en cours…"}
                    </span>
                  )}
                  {m.role === "assistant" && m.content && status === "search" && m.id.startsWith("pending") && (
                    <span className="ai-status" style={{ marginTop: "10px" }}><Globe size={14} /> Recherche d&apos;informations sur le web…</span>
                  )}
                  {m.sources.length > 0 && (
                    <div className="ai-sources">
                      <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "rgba(200,215,235,0.45)" }}>
                        Sources consultées
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {m.sources.slice(0, 8).map((s) => (
                          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="ai-source" title={s.url}>
                            <ExternalLink size={11} /> <span className="ai-ellipsis" style={{ maxWidth: "220px" }}>{s.title || new URL(s.url).hostname}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="ai-composer">
          {error && (
            <p role="alert" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F0928B", fontSize: "13px", margin: "0 0 10px" }}>
              <AlertCircle size={15} /> {error}
            </p>
          )}
          <div className="ai-input-wrap">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              maxLength={ASSISTANT_MAX_MESSAGE_LENGTH}
              rows={1}
              placeholder={remaining === 0 ? "Quota quotidien atteint, revenez un peu plus tard." : project ? `Posez une question sur ${project.title}…` : "Posez votre question au mentor…"}
              disabled={remaining === 0}
              aria-label="Votre question"
              className="ai-textarea"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            {busy ? (
              <button className="ai-send ai-send-stop" onClick={stop} aria-label="Arrêter la réponse" title="Arrêter"><Square size={15} /></button>
            ) : (
              <button className="ai-send" onClick={() => send(input)} disabled={!input.trim() || remaining === 0} aria-label="Envoyer"><Send size={17} /></button>
            )}
          </div>
          <p style={{ fontSize: "11px", color: "rgba(200,215,235,0.3)", margin: "8px 0 0", textAlign: "center" }}>
            <MessageSquare size={10} style={{ verticalAlign: "-1px" }} /> Le mentor IA peut se tromper : vérifiez les chiffres importants et discutez de vos décisions avec votre encadrant.
          </p>
        </footer>
      </section>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================
const STYLES = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes aiPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.35); } 50% { box-shadow: 0 0 0 14px rgba(212,175,55,0); } }
  @keyframes aiFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .ai-app { display: flex; height: calc(100vh - 150px); min-height: 540px; font-family: 'Inter', -apple-system, sans-serif; border-radius: 20px; overflow: hidden; border: 1px solid rgba(180,200,230,0.08); background: rgba(10,22,40,0.75); position: relative; }
  .ai-sidebar { width: 270px; flex-shrink: 0; display: flex; flex-direction: column; padding: 18px; border-right: 1px solid rgba(180,200,230,0.08); background: rgba(255,255,255,0.02); }
  .ai-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .ai-header { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-bottom: 1px solid rgba(180,200,230,0.08); min-width: 0; }
  .ai-messages { flex: 1; overflow-y: auto; padding: 22px 24px; }
  .ai-composer { padding: 14px 20px 14px; border-top: 1px solid rgba(180,200,230,0.08); }

  .ai-section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.7px; text-transform: uppercase; color: rgba(200,215,235,0.4); margin: 0 0 8px; }
  .ai-thread { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; }
  .ai-thread:hover { background: rgba(255,255,255,0.04); }
  .ai-thread-active { background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.2); }
  .ai-thread-delete { opacity: 0; width: 26px !important; height: 26px !important; }
  .ai-thread:hover .ai-thread-delete, .ai-thread-delete:focus { opacity: 1; }
  .ai-mini { font-size: 11px; padding: 3px 8px; border-radius: 50px; border: 1px solid rgba(180,200,230,0.2); background: none; color: rgba(200,215,235,0.8); cursor: pointer; font-family: inherit; }
  .ai-mini-danger { border-color: rgba(228,115,107,0.4); color: #F0928B; }
  .ai-ellipsis { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .ai-select { flex: 1; min-width: 0; max-width: 460px; padding: 7px 12px; border-radius: 10px; border: 1px solid rgba(180,200,230,0.14); background: rgba(255,255,255,0.04); color: #E8EDF5; font-size: 13px; outline: none; font-family: inherit; }
  .ai-select option { background: #0A1628; }

  .ai-welcome { max-width: 760px; margin: 0 auto; text-align: center; padding: 24px 8px; animation: aiFade 0.5s ease both; }
  .ai-orb { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; animation: aiPulse 2.8s ease-in-out infinite; }
  .ai-quick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; text-align: left; }
  .ai-quick { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 14px; border: 1px solid rgba(180,200,230,0.1); background: rgba(255,255,255,0.03); color: #E8EDF5; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; text-align: left; transition: all 0.2s ease; }
  .ai-quick:hover:not(:disabled) { border-color: rgba(212,175,55,0.35); background: rgba(212,175,55,0.08); transform: translateY(-2px); }
  .ai-quick:disabled { opacity: 0.5; cursor: not-allowed; }

  .ai-row { display: flex; gap: 12px; margin-bottom: 20px; animation: aiFade 0.3s ease both; max-width: 860px; margin-left: auto; margin-right: auto; }
  .ai-row-user { justify-content: flex-end; }
  .ai-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; }
  .ai-bubble-user { max-width: 75%; padding: 11px 15px; border-radius: 18px 18px 5px 18px; background: rgba(212,175,55,0.14); border: 1px solid rgba(212,175,55,0.25); color: #E8EDF5; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .ai-bubble-assistant { flex: 1; min-width: 0; color: rgba(232,237,245,0.92); font-size: 14px; line-height: 1.7; padding-top: 4px; }
  .ai-status { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: #F5D76E; }

  .ai-md > *:first-child { margin-top: 0; }
  .ai-md > *:last-child { margin-bottom: 0; }
  .ai-md h1, .ai-md h2, .ai-md h3, .ai-md h4 { color: #E8EDF5; line-height: 1.3; margin: 20px 0 8px; }
  .ai-md h1 { font-size: 20px; } .ai-md h2 { font-size: 17px; } .ai-md h3 { font-size: 15px; color: #F5D76E; } .ai-md h4 { font-size: 14px; }
  .ai-md p { margin: 0 0 12px; }
  .ai-md ul, .ai-md ol { margin: 0 0 12px; padding-left: 22px; }
  .ai-md li { margin: 4px 0; }
  .ai-md li::marker { color: #D4AF37; }
  .ai-md strong { color: #FFFFFF; }
  .ai-md a { color: #A5B4FC; }
  .ai-md blockquote { margin: 0 0 12px; padding: 8px 14px; border-left: 3px solid #D4AF37; background: rgba(212,175,55,0.06); border-radius: 0 10px 10px 0; }
  .ai-md code { background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 5px; font-size: 13px; }
  .ai-md pre { background: rgba(0,0,0,0.3); padding: 12px 14px; border-radius: 10px; overflow-x: auto; }
  .ai-md pre code { background: none; padding: 0; }
  .ai-md hr { border: none; border-top: 1px solid rgba(180,200,230,0.12); margin: 18px 0; }
  .ai-md table { width: 100%; border-collapse: collapse; margin: 0 0 14px; font-size: 13px; display: block; overflow-x: auto; }
  .ai-md th { text-align: left; background: rgba(212,175,55,0.1); color: #F5D76E; font-weight: 700; }
  .ai-md th, .ai-md td { padding: 8px 12px; border: 1px solid rgba(180,200,230,0.1); }

  .ai-sources { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(180,200,230,0.08); }
  .ai-source { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 50px; font-size: 12px; color: #A5B4FC; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); text-decoration: none; }
  .ai-source:hover { background: rgba(99,102,241,0.2); }

  .ai-input-wrap { display: flex; align-items: flex-end; gap: 10px; max-width: 860px; margin: 0 auto; padding: 8px 8px 8px 16px; border-radius: 18px; border: 1px solid rgba(180,200,230,0.14); background: rgba(255,255,255,0.04); transition: border-color 0.2s ease; }
  .ai-input-wrap:focus-within { border-color: rgba(212,175,55,0.45); }
  .ai-textarea { flex: 1; resize: none; border: none; outline: none; background: none; color: #E8EDF5; font-size: 14px; line-height: 1.5; font-family: inherit; min-height: 24px; max-height: 180px; padding: 8px 0; }
  .ai-textarea::placeholder { color: rgba(200,215,235,0.35); }
  .ai-send { width: 40px; height: 40px; border-radius: 50%; border: none; flex-shrink: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; transition: transform 0.2s ease; }
  .ai-send:hover:not(:disabled) { transform: scale(1.06); }
  .ai-send:disabled { opacity: 0.4; cursor: not-allowed; }
  .ai-send-stop { background: rgba(228,115,107,0.2); color: #F0928B; border: 1px solid rgba(228,115,107,0.4); }

  .ai-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 16px; border-radius: 50px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; border: 1px solid rgba(180,200,230,0.15); background: rgba(255,255,255,0.03); color: rgba(200,215,235,0.8); }
  .ai-btn-primary { background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0A1628; border: none; }
  .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ai-icon-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.05); color: rgba(200,215,235,0.7); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .ai-icon-btn:hover { background: rgba(212,175,55,0.14); color: #F5D76E; }

  .ai-scroll::-webkit-scrollbar { width: 5px; }
  .ai-scroll::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.25); border-radius: 3px; }

  .ai-mobile-only { display: none; }
  @media (max-width: 860px) {
    .ai-app { height: calc(100vh - 120px); }
    .ai-mobile-only { display: inline-flex; }
    .ai-sidebar { position: absolute; inset: 0 auto 0 0; z-index: 20; width: 280px; background: #0B1A30; transform: translateX(-100%); transition: transform 0.25s ease; }
    .ai-sidebar-open { transform: translateX(0); box-shadow: 20px 0 60px rgba(0,0,0,0.5); }
    .ai-messages { padding: 18px 14px; }
    .ai-bubble-user { max-width: 88%; }
  }
`;
