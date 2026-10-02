// components/messagerie/ChatApp.tsx
// MESSAGERIE : messages privés, groupes de projet, canaux de filière GL / SR
// Commune aux espaces étudiant et encadrant. Rafraîchissement automatique toutes les 4 s (onglet visible).

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare, Users, Hash, Plus, Search, Send, Loader2, ArrowLeft, Info, PenSquare, Compass, Paperclip, FolderOpen, Upload,
} from "lucide-react";
import { openConversation, pollChat, sendMessage } from "@/lib/messagerie/actions";
import {
  ACCEPT_ATTACHMENTS, MAX_ATTACHMENTS_PER_MESSAGE, MAX_MESSAGE_LENGTH, TRACK_LABELS, messagePreview,
  type ChatAttachment, type ChatMessage, type ConversationDetail, type ConversationKind, type ConversationSummary, type Person,
} from "@/lib/messagerie/types";
import { Avatar, BrowseChannelsDialog, MembersDialog, NewChannelDialog, NewDirectDialog, NewGroupDialog } from "./Dialogs";
import { ImageLightbox, MessageAttachments, PendingTray, SharedFilesDialog, useAttachmentUploads } from "./Attachments";

const POLL_INTERVAL = 4000;
const TZ = "Africa/Douala";
const timeFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const dayFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
const dayKey = (iso: string) => new Intl.DateTimeFormat("fr-CA", { timeZone: TZ }).format(new Date(iso));

function dayLabel(iso: string) {
  const key = dayKey(iso);
  const today = dayKey(new Date().toISOString());
  const yesterday = dayKey(new Date(Date.now() - 86_400_000).toISOString());
  if (key === today) return "Aujourd'hui";
  if (key === yesterday) return "Hier";
  return dayFormat.format(new Date(iso));
}

function shortTime(iso: string) {
  return dayKey(iso) === dayKey(new Date().toISOString()) ? timeFormat.format(new Date(iso)) : dayLabel(iso).replace(/^(\w+) /, "");
}

type Tab = "ALL" | ConversationKind;
type DialogName = "direct" | "group" | "channel" | "browse" | "members" | "files" | null;

const TABS: { id: Tab; label: string; icon: typeof MessageSquare }[] = [
  { id: "ALL", label: "Tout", icon: MessageSquare },
  { id: "DIRECT", label: "Privés", icon: MessageSquare },
  { id: "GROUP", label: "Groupes", icon: Users },
  { id: "CHANNEL", label: "Canaux", icon: Hash },
];

export default function ChatApp({
  me,
  basePath,
  initialInbox,
  initialSelectedId,
  projects,
}: {
  me: Person;
  basePath: string;
  initialInbox: ConversationSummary[];
  initialSelectedId: string | null;
  projects: { id: string; title: string }[];
}) {
  const [inbox, setInbox] = useState(initialInbox);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("ALL");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<DialogName>(null);
  const [lightbox, setLightbox] = useState<{ images: ChatAttachment[]; index: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const uploads = useAttachmentUploads(selectedId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const selectedRef = useRef(selectedId);
  const messagesRef = useRef(messages);
  selectedRef.current = selectedId;
  messagesRef.current = messages;

  const isStudent = me.role === "STUDENT";
  const isEncadrant = me.role === "ENCADRANT";

  // ===== Ouverture d'une conversation =====
  const loadConversation = useCallback(async (id: string) => {
    setLoadingConversation(true);
    setError("");
    const result = await openConversation(id);
    if (selectedRef.current !== id) return; // l'utilisateur a changé de conversation entre-temps
    setLoadingConversation(false);
    if (!result.ok) {
      setError(result.error);
      setDetail(null);
      setMessages([]);
      return;
    }
    setDetail(result.detail);
    setMessages(result.messages);
    stickToBottom.current = true;
    // La conversation ouverte est lue
    setInbox((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setMessages([]);
      return;
    }
    loadConversation(selectedId);
  }, [selectedId, loadConversation]);

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      setDialog(null);
      // URL partageable, sans rechargement de la page
      window.history.replaceState(null, "", id ? `${basePath}?c=${id}` : basePath);
    },
    [basePath],
  );

  // ===== Rafraîchissement automatique =====
  const poll = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    const current = selectedRef.current;
    const last = messagesRef.current[messagesRef.current.length - 1];
    const result = await pollChat(current, last?.createdAt ?? null);
    if (!result.ok) return;
    setInbox(current ? result.inbox.map((c) => (c.id === current ? { ...c, unread: 0 } : c)) : result.inbox);
    if (current && current === selectedRef.current && result.messages.length > 0) {
      setMessages((prev) => {
        const known = new Set(prev.map((m) => m.id));
        const fresh = result.messages.filter((m) => !known.has(m.id));
        return fresh.length ? [...prev, ...fresh] : prev;
      });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(poll, POLL_INTERVAL);
    const onVisible = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll]);

  // ===== Défilement : rester en bas si l'utilisateur y était =====
  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // ===== Envoi =====
  const canSend = !!detail && !sending && !uploads.uploading && (draft.trim().length > 0 || uploads.ready.length > 0);

  const send = async () => {
    const text = draft.trim();
    if (!selectedId || !canSend) return;
    if (uploads.hasErrors) {
      setError("Retirez les fichiers en erreur avant d'envoyer.");
      return;
    }
    setSending(true);
    setError("");
    const result = await sendMessage(selectedId, text, uploads.ready);
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft("");
    uploads.reset();
    stickToBottom.current = true;
    setMessages((prev) => (prev.some((m) => m.id === result.message.id) ? prev : [...prev, result.message]));
    setInbox((prev) => {
      const updated = prev.map((c) =>
        c.id === selectedId
          ? { ...c, lastMessage: { content: messagePreview(text, result.message.attachments), senderName: me.name, mine: true }, lastMessageAt: result.message.createdAt }
          : c,
      );
      return updated.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
    });
  };

  // ===== Glisser-déposer de fichiers sur la conversation =====
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");
  const dropHandlers = detail
    ? {
        onDragEnter: (e: React.DragEvent) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        },
        onDragOver: (e: React.DragEvent) => {
          if (hasFiles(e)) e.preventDefault();
        },
        onDragLeave: () => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        },
        onDrop: (e: React.DragEvent) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          uploads.addFiles(e.dataTransfer.files);
        },
      }
    : {};

  // Après création / adhésion : recharger la liste puis ouvrir la conversation
  const openAfterChange = async (id: string) => {
    const result = await pollChat(null, null);
    if (result.ok) setInbox(result.inbox);
    select(id);
  };

  // ===== Liste filtrée =====
  const unreadTotal = (t: Tab) => inbox.filter((c) => t === "ALL" || c.type === t).reduce((n, c) => n + c.unread, 0);
  const visible = inbox.filter(
    (c) => (tab === "ALL" || c.type === tab) && c.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="msg-app">
      <style>{STYLES}</style>

      {/* ===================== LISTE DES CONVERSATIONS ===================== */}
      <aside className={`msg-sidebar ${selectedId ? "msg-hide-mobile" : ""}`}>
        <div style={{ padding: "18px 18px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>Messagerie</h1>
            <button className="msg-icon-btn" onClick={() => setDialog("direct")} aria-label="Nouveau message privé" title="Nouveau message privé">
              <PenSquare size={16} />
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
            {isStudent && (
              <button className="msg-btn msg-btn-small" onClick={() => setDialog("group")}>
                <Plus size={13} /> Groupe
              </button>
            )}
            {isEncadrant && (
              <button className="msg-btn msg-btn-small" onClick={() => setDialog("channel")}>
                <Plus size={13} /> Canal GL / SR
              </button>
            )}
            <button className="msg-btn msg-btn-small" onClick={() => setDialog("browse")}>
              <Compass size={13} /> Parcourir les canaux
            </button>
          </div>

          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--ink-subtle)" }} />
            <input className="msg-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une conversation" style={{ paddingLeft: "34px", padding: "9px 12px 9px 34px", fontSize: "13px" }} aria-label="Rechercher une conversation" />
          </div>

          <div style={{ display: "flex", gap: "2px", padding: "3px", borderRadius: "12px", background: "color-mix(in srgb, var(--line) 70%, transparent)" }} role="tablist">
            {TABS.map((t) => {
              const count = unreadTotal(t.id);
              return (
                <button key={t.id} role="tab" aria-selected={tab === t.id} className={`msg-tab ${tab === t.id ? "msg-tab-active" : ""}`} onClick={() => setTab(t.id)}>
                  {t.label}
                  {count > 0 && <span className="msg-count">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="msg-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 10px 12px" }}>
          {visible.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 18px", color: "var(--ink-subtle)", fontSize: "13px", lineHeight: 1.6 }}>
              {inbox.length === 0 ? (
                <>
                  Aucune conversation pour le moment.
                  <br />
                  <button className="msg-link" onClick={() => setDialog("direct")}>Écrire à quelqu&apos;un</button>
                  {" · "}
                  <button className="msg-link" onClick={() => setDialog("browse")}>Rejoindre un canal</button>
                </>
              ) : (
                "Aucune conversation ne correspond."
              )}
            </div>
          ) : (
            visible.map((c) => (
              <button key={c.id} className={`msg-conv ${c.id === selectedId ? "msg-conv-active" : ""}`} onClick={() => select(c.id)}>
                {c.type === "DIRECT" && c.otherUser ? (
                  <Avatar initials={c.otherUser.initials} role={c.otherUser.role} />
                ) : c.type === "CHANNEL" ? (
                  <span className="msg-track" style={{ width: 36, height: 36 }}>{c.track}</span>
                ) : (
                  <span className="msg-avatar" style={{ width: 36, height: 36, background: "var(--success-soft)", color: "var(--success)" }}><Users size={16} /></span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span className="msg-ellipsis" style={{ fontSize: "14px", fontWeight: c.unread ? 700 : 600, color: "var(--ink)" }}>{c.title}</span>
                    <span style={{ fontSize: "11px", color: c.unread ? "var(--brand)" : "var(--ink-subtle)", flexShrink: 0 }}>
                      {c.lastMessage ? shortTime(c.lastMessageAt) : ""}
                    </span>
                  </span>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginTop: "2px" }}>
                    <span className="msg-ellipsis" style={{ fontSize: "12px", color: c.unread ? "var(--ink)" : "var(--ink-subtle)" }}>
                      {c.lastMessage
                        ? `${c.lastMessage.mine ? "Vous" : c.type === "DIRECT" ? "" : c.lastMessage.senderName.split(" ")[0]}${c.lastMessage.mine || c.type !== "DIRECT" ? " : " : ""}${c.lastMessage.content}`
                        : c.subtitle}
                    </span>
                    {c.unread > 0 && <span className="msg-count">{c.unread}</span>}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ===================== CONVERSATION ===================== */}
      <section className={`msg-thread ${selectedId ? "" : "msg-hide-mobile"}`} {...dropHandlers} style={{ position: "relative" }}>
        {dragging && (
          <div className="msg-drop" aria-hidden>
            <Upload size={30} />
            <p style={{ margin: "10px 0 2px", fontSize: "16px", fontWeight: 700 }}>Déposez vos fichiers ici</p>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.7 }}>Images, PDF, Word, Excel, PowerPoint… · {MAX_ATTACHMENTS_PER_MESSAGE} fichiers max · 20 Mo chacun</p>
          </div>
        )}
        {!selectedId ? (
          <div className="msg-empty">
            <MessageSquare size={40} style={{ color: "var(--brand)", marginBottom: "14px" }} />
            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: "0 0 6px" }}>Sélectionnez une conversation</p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Écrivez en privé à un étudiant ou à un encadrant{isStudent ? ", créez un groupe pour votre projet" : ""}
              {isEncadrant ? ", créez un canal pour votre filière" : ""} ou rejoignez un canal GL / SR.
            </p>
          </div>
        ) : (
          <>
            {/* En-tête */}
            <header className="msg-thread-header">
              <button className="msg-icon-btn msg-show-mobile" onClick={() => select(null)} aria-label="Retour aux conversations">
                <ArrowLeft size={16} />
              </button>
              {detail?.type === "CHANNEL" ? (
                <span className="msg-track" style={{ width: 38, height: 38 }}>{detail.track}</span>
              ) : detail?.type === "GROUP" ? (
                <span className="msg-avatar" style={{ width: 38, height: 38, background: "var(--success-soft)", color: "var(--success)" }}><Users size={17} /></span>
              ) : detail ? (
                <Avatar initials={detail.members.find((m) => m.id !== me.id)?.initials ?? "?"} size={38} role={detail.members.find((m) => m.id !== me.id)?.role} />
              ) : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="msg-ellipsis" style={{ fontSize: "15px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>{detail?.title ?? "…"}</p>
                <p className="msg-ellipsis" style={{ fontSize: "12px", color: "var(--ink-muted)", margin: 0 }}>
                  {detail?.type === "CHANNEL" && detail.track ? `${TRACK_LABELS[detail.track]} · ` : ""}
                  {detail ? detail.subtitle.replace(/^Canal [^·]*· /, "") : ""}
                </p>
              </div>
              {detail && (
                <button className="msg-icon-btn" onClick={() => setDialog("files")} aria-label="Fichiers partagés" title="Fichiers partagés">
                  <FolderOpen size={16} />
                </button>
              )}
              {detail && detail.type !== "DIRECT" && (
                <button className="msg-icon-btn" onClick={() => setDialog("members")} aria-label="Membres et informations" title="Membres et informations">
                  <Info size={16} />
                </button>
              )}
            </header>

            {/* Messages */}
            <div ref={listRef} onScroll={onScroll} className="msg-scroll msg-messages">
              {loadingConversation && messages.length === 0 ? (
                <div className="msg-empty"><Loader2 size={22} className="animate-spin" style={{ color: "var(--brand)" }} /></div>
              ) : messages.length === 0 ? (
                <div className="msg-empty">
                  <p style={{ margin: 0 }}>
                    {detail?.type === "DIRECT" ? `Début de votre conversation avec ${detail.title}.` : "Aucun message pour le moment. Lancez la discussion !"}
                  </p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const prev = messages[i - 1];
                  const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
                  // Messages rapprochés d'un même auteur : regroupés
                  const grouped = !newDay && prev && prev.sender.id === m.sender.id && Date.parse(m.createdAt) - Date.parse(prev.createdAt) < 5 * 60_000;
                  const showAuthor = !m.mine && detail?.type !== "DIRECT" && !grouped;
                  return (
                    <div key={m.id}>
                      {newDay && <div className="msg-day"><span>{dayLabel(m.createdAt)}</span></div>}
                      <div className={`msg-line ${m.mine ? "msg-line-mine" : ""}`} style={{ marginTop: grouped ? "2px" : "10px" }}>
                        {!m.mine && detail?.type !== "DIRECT" && (
                          <span style={{ width: 30, flexShrink: 0 }}>{!grouped && <Avatar initials={m.sender.initials} size={30} role={m.sender.role} />}</span>
                        )}
                        <div style={{ maxWidth: "72%", minWidth: 0 }}>
                          {showAuthor && (
                            <p style={{ fontSize: "12px", fontWeight: 600, margin: "0 0 3px 4px", color: m.sender.role === "STUDENT" ? "var(--gold)" : "var(--brand-ink)" }}>
                              {m.sender.name}{m.sender.role === "ENCADRANT" ? " · Encadrant" : ""}
                            </p>
                          )}
                          {m.attachments.length > 0 && (
                            <div style={{ marginBottom: m.content ? "4px" : 0 }}>
                              <MessageAttachments attachments={m.attachments} mine={m.mine} onOpenImage={(images, index) => setLightbox({ images, index })} />
                            </div>
                          )}
                          {m.content ? (
                            <div className={`msg-bubble ${m.mine ? "msg-bubble-mine" : ""}`}>
                              {m.content}
                              <span className="msg-time">{timeFormat.format(new Date(m.createdAt))}</span>
                            </div>
                          ) : (
                            <span className="msg-time" style={{ color: "var(--ink-muted)", padding: "0 4px" }}>{timeFormat.format(new Date(m.createdAt))}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Saisie */}
            <footer className="msg-composer">
              {error && <p role="alert" style={{ color: "var(--danger)", fontSize: "12px", margin: "0 0 8px" }}>{error}</p>}
              {uploads.notice && <p role="status" style={{ color: "var(--warning)", fontSize: "12px", margin: "0 0 8px" }}>{uploads.notice}</p>}
              <PendingTray files={uploads.files} onRemove={uploads.remove} />
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPT_ATTACHMENTS}
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.length) uploads.addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <button
                  className="msg-attach"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!detail || uploads.files.length >= MAX_ATTACHMENTS_PER_MESSAGE}
                  aria-label="Joindre des images ou des documents"
                  title="Joindre des images ou des documents"
                >
                  <Paperclip size={18} />
                </button>
                <textarea
                  className="msg-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onPaste={(e) => {
                    // Coller une capture d'écran ou un fichier copié l'ajoute en pièce jointe
                    if (e.clipboardData.files.length > 0) {
                      e.preventDefault();
                      uploads.addFiles(e.clipboardData.files);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  maxLength={MAX_MESSAGE_LENGTH}
                  rows={1}
                  placeholder={detail ? `Écrire à ${detail.type === "DIRECT" ? detail.title : detail.type === "CHANNEL" ? "tout le canal" : "tout le groupe"}…` : "Écrire un message…"}
                  aria-label="Votre message"
                  disabled={!detail}
                  style={{ resize: "none", minHeight: "44px", maxHeight: "140px", fieldSizing: "content" } as React.CSSProperties}
                />
                <button className="msg-send" onClick={send} disabled={!canSend} aria-label="Envoyer" title={uploads.uploading ? "Envoi des fichiers en cours…" : undefined}>
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--ink-subtle)", margin: "6px 0 0" }}>Entrée pour envoyer · Maj + Entrée pour aller à la ligne · glissez ou collez des fichiers pour les joindre</p>
            </footer>
          </>
        )}
      </section>

      {/* ===================== FENÊTRES ===================== */}
      {dialog === "direct" && <NewDirectDialog onClose={() => setDialog(null)} onOpen={openAfterChange} />}
      {dialog === "group" && <NewGroupDialog projects={projects} onClose={() => setDialog(null)} onOpen={openAfterChange} />}
      {dialog === "channel" && <NewChannelDialog onClose={() => setDialog(null)} onOpen={openAfterChange} />}
      {dialog === "browse" && <BrowseChannelsDialog onClose={() => setDialog(null)} onOpen={openAfterChange} />}
      {dialog === "files" && selectedId && (
        <SharedFilesDialog conversationId={selectedId} onClose={() => setDialog(null)} onOpenImage={(images, index) => setLightbox({ images, index })} />
      )}
      {lightbox && <ImageLightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
      {dialog === "members" && detail && (
        <MembersDialog
          detail={detail}
          meId={me.id}
          onClose={() => setDialog(null)}
          onChanged={() => selectedId && loadConversation(selectedId)}
          onLeft={async () => {
            setDialog(null);
            const result = await pollChat(null, null);
            if (result.ok) setInbox(result.inbox);
            select(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// STYLES (bleu nuit & or, cohérents avec la plateforme)
// ============================================================
const STYLES = `
  .msg-app {
    display: flex; height: calc(100vh - 140px); min-height: 520px; color: var(--ink);
    border-radius: 24px; overflow: hidden; border: 1px solid var(--line); background: var(--surface); box-shadow: var(--shadow-card);
  }
  .msg-sidebar { width: 344px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid var(--line); background: var(--surface-muted); }
  .msg-thread { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--surface); }
  .msg-thread-header { display: flex; align-items: center; gap: 12px; padding: 14px 22px; border-bottom: 1px solid var(--line); }
  .msg-messages { flex: 1; overflow-y: auto; padding: 12px 22px 18px; background:
    radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ink-subtle) 18%, transparent) 1px, transparent 0) 0 0 / 22px 22px, var(--canvas); }
  .msg-composer { padding: 14px 22px 16px; border-top: 1px solid var(--line); background: var(--surface); }
  .msg-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 30px; color: var(--ink-muted); font-size: 13.5px; max-width: 420px; margin: 0 auto; line-height: 1.6; }

  .msg-conv {
    width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; border: none;
    background: none; cursor: pointer; text-align: left; font-family: inherit; transition: background-color 0.15s ease; margin-bottom: 2px;
  }
  .msg-conv:hover { background: var(--surface); }
  .msg-conv-active, .msg-conv-active:hover { background: var(--surface); box-shadow: var(--shadow-card), inset 3px 0 0 var(--brand); }
  .msg-row {
    width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; border: 1px solid var(--line);
    background: var(--surface); cursor: pointer; font-family: inherit; transition: border-color 0.15s ease, background-color 0.15s ease; color: var(--ink);
  }
  button.msg-row:hover { border-color: var(--line-strong); background: var(--surface-muted); }
  .msg-row-active { background: var(--brand-soft); border-color: var(--brand); }

  .msg-avatar { border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-family: var(--font-display); }
  .msg-track {
    border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 36px; height: 36px;
    font-size: 12px; font-weight: 800; letter-spacing: 0.04em; background: var(--brand-soft); color: var(--brand-ink);
  }
  .msg-count {
    min-width: 19px; height: 19px; padding: 0 6px; border-radius: 10px; background: var(--brand); color: #fff; font-size: 10.5px; font-weight: 700;
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; font-variant-numeric: tabular-nums;
  }
  .msg-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 50px; font-size: 11px; font-weight: 600; background: var(--gold-soft); color: var(--gold); }
  .msg-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }

  .msg-tab {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9px; font-size: 12.5px; font-weight: 600;
    border: none; background: transparent; color: var(--ink-muted); cursor: pointer; font-family: inherit; transition: background-color 0.15s ease, color 0.15s ease;
  }
  .msg-tab:hover { color: var(--ink); }
  .msg-tab-active, .msg-tab-active:hover { background: var(--surface); color: var(--ink); box-shadow: var(--shadow-card); }
  .msg-tab-active .msg-count { background: var(--brand); }

  .msg-day { display: flex; align-items: center; gap: 12px; margin: 20px 0 10px; color: var(--ink-subtle); font-size: 11.5px; font-weight: 600; text-transform: capitalize; }
  .msg-day span { padding: 3px 12px; border-radius: 50px; background: var(--surface); border: 1px solid var(--line); }
  .msg-day::before, .msg-day::after { content: ''; flex: 1; height: 1px; background: var(--line); }
  .msg-line { display: flex; gap: 8px; align-items: flex-end; }
  .msg-line-mine { justify-content: flex-end; }
  .msg-bubble {
    padding: 9px 14px 7px; border-radius: 18px 18px 18px 6px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-card);
    color: var(--ink); font-size: 14px; line-height: 1.55; white-space: pre-wrap; word-break: break-word;
  }
  .msg-bubble-mine { border-radius: 18px 18px 6px 18px; background: linear-gradient(135deg, #3a6cf5, #1f4fd8); color: #fff; border: none; box-shadow: 0 6px 16px -8px rgba(31,79,216,0.6); }
  .msg-time { display: block; text-align: right; font-size: 10.5px; margin-top: 2px; opacity: 0.6; font-variant-numeric: tabular-nums; }

  .msg-input {
    width: 100%; padding: 11px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface);
    color: var(--ink); font-size: 14px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .msg-input:hover { border-color: var(--line-strong); }
  .msg-input:focus { border-color: var(--brand); box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand) 12%, transparent); }
  .msg-input::placeholder { color: var(--ink-subtle); }
  .msg-label { display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }

  .msg-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 12px; font-size: 13px;
    font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid var(--line); background: var(--surface);
    color: var(--ink); box-shadow: var(--shadow-card); transition: all 0.15s ease; white-space: nowrap;
  }
  .msg-btn:hover:not(:disabled) { background: var(--surface-muted); border-color: var(--line-strong); }
  .msg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .msg-btn-small { height: 32px; padding: 0 11px; font-size: 12px; border-radius: 10px; }
  .msg-btn-primary { background: var(--brand); color: #fff; border-color: transparent; box-shadow: var(--shadow-brand); }
  .msg-btn-primary:hover:not(:disabled) { background: var(--brand-strong); border-color: transparent; }
  .msg-btn-danger { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 30%, var(--line)); }
  .msg-btn-danger:hover:not(:disabled) { background: var(--danger-soft); }
  .msg-icon-btn {
    width: 38px; height: 38px; border-radius: 12px; border: none; background: transparent; color: var(--ink-muted);
    display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background-color 0.15s ease, color 0.15s ease;
  }
  .msg-icon-btn:hover { background: var(--surface-muted); color: var(--ink); }
  .msg-send {
    width: 46px; height: 46px; border-radius: 14px; border: none; flex-shrink: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
    background: var(--brand); color: #fff; box-shadow: var(--shadow-brand); transition: transform 0.15s ease, background-color 0.15s ease;
  }
  .msg-send:hover:not(:disabled) { background: var(--brand-strong); transform: translateY(-1px); }
  .msg-attach {
    width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid var(--line); background: var(--surface); color: var(--ink-muted); transition: all 0.15s ease;
  }
  .msg-attach:hover:not(:disabled) { color: var(--brand); border-color: var(--brand); background: var(--brand-soft); }
  .msg-attach:disabled { opacity: 0.4; cursor: not-allowed; }
  .msg-file-card {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; border: 1px solid var(--line);
    background: var(--surface); text-decoration: none; width: min(320px, 100%); box-sizing: border-box; transition: border-color 0.15s ease; box-shadow: var(--shadow-card);
  }
  .msg-file-card:hover { border-color: var(--brand) !important; }
  .msg-image-btn { transition: opacity 0.15s ease; }
  .msg-image-btn:hover { opacity: 0.9; }
  .msg-drop {
    position: absolute; inset: 12px; z-index: 20; border-radius: 18px; border: 2px dashed var(--brand); background: color-mix(in srgb, var(--surface) 92%, transparent);
    display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--brand); pointer-events: none; text-align: center; padding: 20px;
  }
  .msg-send:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
  .msg-link { background: none; border: none; color: var(--brand); font-weight: 600; cursor: pointer; font-family: inherit; font-size: 13px; padding: 0; }
  .msg-chip {
    display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 600;
    background: var(--brand-soft); color: var(--brand-ink); border: 1px solid color-mix(in srgb, var(--brand) 25%, transparent); cursor: pointer; font-family: inherit;
  }
  .msg-choice {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 12px 14px; border-radius: 14px; cursor: pointer; font-family: inherit;
    border: 1.5px solid var(--line); background: var(--surface); color: var(--ink-muted); text-align: left; transition: border-color 0.15s ease;
  }
  .msg-choice:hover { border-color: var(--line-strong); }
  .msg-choice-active, .msg-choice-active:hover { border-color: var(--brand); background: var(--brand-soft); color: var(--brand-ink); }

  .msg-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(5,9,18,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
  .msg-modal { width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 26px; border-radius: 24px; background: var(--surface); color: var(--ink); border: 1px solid var(--line); box-shadow: var(--shadow-raised); animation: var(--animate-rise); }

  .msg-scroll::-webkit-scrollbar { width: 6px; }
  .msg-scroll::-webkit-scrollbar-thumb { background: var(--line-strong); border-radius: 3px; }

  .msg-show-mobile { display: none; }
  @media (max-width: 860px) {
    .msg-app { height: calc(100vh - 110px); border-radius: 20px; }
    .msg-sidebar { width: 100%; border-right: none; }
    .msg-hide-mobile { display: none !important; }
    .msg-show-mobile { display: inline-flex; }
  }
`;
