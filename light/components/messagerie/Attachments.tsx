// components/messagerie/Attachments.tsx
// PIÈCES JOINTES DE LA MESSAGERIE : dépôt des fichiers, aperçus, affichage dans les messages,
// visionneuse d'images et fichiers partagés d'une conversation

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X, Download, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, FileArchive, Presentation, File as FileIcon,
  Loader2, AlertCircle, ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchSharedFiles, prepareAttachmentUploads } from "@/lib/messagerie/actions";
import {
  ATTACHMENTS_BUCKET, MAX_ATTACHMENT_SIZE, MAX_ATTACHMENTS_PER_MESSAGE, IMAGE_MIME_TYPES,
  formatFileSize, resolveMimeType,
  type ChatAttachment, type SharedFile, type UploadedAttachment,
} from "@/lib/messagerie/types";
import { Modal } from "./Dialogs";

// ============================================================
// DÉPÔT DES FICHIERS (avant l'envoi du message)
// ============================================================
export interface PendingFile {
  localId: string;
  name: string;
  size: number;
  mimeType: string;
  previewUrl: string | null;
  status: "uploading" | "ready" | "error";
  error?: string;
  path?: string;
  width?: number | null;
  height?: number | null;
}

let counter = 0;

// Dimensions d'une image, pour réserver sa place dans la conversation
function imageSize(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function useAttachmentUploads(conversationId: string | null) {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [notice, setNotice] = useState("");
  const filesRef = useRef(files);
  filesRef.current = files;

  const patch = (localId: string, data: Partial<PendingFile>) =>
    setFiles((prev) => prev.map((f) => (f.localId === localId ? { ...f, ...data } : f)));

  const reset = useCallback(() => {
    filesRef.current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setNotice("");
  }, []);

  // Changement de conversation : les fichiers en attente sont abandonnés
  useEffect(() => reset, [conversationId, reset]);

  const addFiles = useCallback(async (list: FileList | File[]) => {
    if (!conversationId) return;
    setNotice("");
    const incoming = Array.from(list);
    const room = MAX_ATTACHMENTS_PER_MESSAGE - filesRef.current.length;
    if (room <= 0) return setNotice(`${MAX_ATTACHMENTS_PER_MESSAGE} fichiers maximum par message.`);

    const accepted: { file: File; mimeType: string }[] = [];
    const rejected: string[] = [];
    for (const file of incoming.slice(0, room)) {
      const mimeType = resolveMimeType(file.name, file.type);
      if (!mimeType) rejected.push(`« ${file.name} » : type non autorisé`);
      else if (file.size === 0) rejected.push(`« ${file.name} » est vide`);
      else if (file.size > MAX_ATTACHMENT_SIZE) rejected.push(`« ${file.name} » dépasse ${formatFileSize(MAX_ATTACHMENT_SIZE)}`);
      else accepted.push({ file, mimeType });
    }
    if (incoming.length > room) rejected.push(`${MAX_ATTACHMENTS_PER_MESSAGE} fichiers maximum par message`);
    if (rejected.length) setNotice(rejected.join(" · "));
    if (accepted.length === 0) return;

    const pending: PendingFile[] = accepted.map(({ file, mimeType }) => ({
      localId: `f${++counter}`,
      name: file.name,
      size: file.size,
      mimeType,
      previewUrl: IMAGE_MIME_TYPES.includes(mimeType) ? URL.createObjectURL(file) : null,
      status: "uploading",
    }));
    setFiles((prev) => [...prev, ...pending]);

    const prepared = await prepareAttachmentUploads(
      conversationId,
      accepted.map(({ file, mimeType }) => ({ name: file.name, size: file.size, type: mimeType })),
    );
    if (!prepared.ok) {
      pending.forEach((p) => patch(p.localId, { status: "error", error: prepared.error }));
      return;
    }

    const storage = createClient().storage.from(ATTACHMENTS_BUCKET);
    await Promise.all(
      accepted.map(async ({ file, mimeType }, i) => {
        const p = pending[i];
        const { path, token } = prepared.uploads[i];
        const [upload, dims] = await Promise.all([
          storage.uploadToSignedUrl(path, token, file, { contentType: mimeType, upsert: false }),
          p.previewUrl ? imageSize(p.previewUrl) : Promise.resolve(null),
        ]);
        if (upload.error) patch(p.localId, { status: "error", error: "Échec de l'envoi du fichier" });
        else patch(p.localId, { status: "ready", path, width: dims?.width ?? null, height: dims?.height ?? null });
      }),
    );
  }, [conversationId]);

  const remove = (localId: string) => {
    const file = filesRef.current.find((f) => f.localId === localId);
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    setFiles((prev) => prev.filter((f) => f.localId !== localId));
  };

  const ready: UploadedAttachment[] = files
    .filter((f) => f.status === "ready" && f.path)
    .map((f) => ({ path: f.path!, name: f.name, width: f.width, height: f.height }));

  return {
    files,
    notice,
    addFiles,
    remove,
    reset,
    ready,
    uploading: files.some((f) => f.status === "uploading"),
    hasErrors: files.some((f) => f.status === "error"),
  };
}

// ============================================================
// ICÔNES DE DOCUMENTS
// ============================================================
export function fileVisual(name: string, mimeType: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (mimeType === "application/pdf") return { Icon: FileText, color: "#F87171", label: "PDF" };
  if (["doc", "docx", "odt"].includes(ext)) return { Icon: FileText, color: "#60A5FA", label: ext.toUpperCase() };
  if (["xls", "xlsx", "ods", "csv"].includes(ext)) return { Icon: FileSpreadsheet, color: "var(--success)", label: ext.toUpperCase() };
  if (["ppt", "pptx", "odp"].includes(ext)) return { Icon: Presentation, color: "#FB923C", label: ext.toUpperCase() };
  if (ext === "zip") return { Icon: FileArchive, color: "#C4B5FD", label: "ZIP" };
  if (IMAGE_MIME_TYPES.includes(mimeType)) return { Icon: ImageIcon, color: "var(--brand)", label: ext.toUpperCase() };
  return { Icon: FileIcon, color: "var(--ink-muted)", label: ext.toUpperCase() || "FICHIER" };
}

// ============================================================
// FICHIERS EN ATTENTE AU-DESSUS DE LA ZONE DE SAISIE
// ============================================================
export function PendingTray({ files, onRemove }: { files: PendingFile[]; onRemove: (id: string) => void }) {
  if (files.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "4px" }} className="msg-scroll">
      {files.map((f) => {
        const visual = fileVisual(f.name, f.mimeType);
        return (
          <div key={f.localId} title={f.error ?? f.name} style={{
            position: "relative", flexShrink: 0, width: f.previewUrl ? 76 : 190, height: 76, borderRadius: 12, overflow: "hidden",
            background: "var(--surface-muted)", border: `1px solid ${f.status === "error" ? "var(--danger)" : "var(--line)"}`,
            display: "flex", alignItems: "center", gap: 10, padding: f.previewUrl ? 0 : "0 12px",
          }}>
            {f.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.previewUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: f.status === "ready" ? 1 : 0.55 }} />
            ) : (
              <>
                <visual.Icon size={24} style={{ color: visual.color, flexShrink: 0 }} />
                <span style={{ minWidth: 0 }}>
                  <span className="msg-ellipsis" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: f.status === "error" ? "var(--danger)" : "var(--ink-subtle)" }}>
                    {f.status === "error" ? f.error : formatFileSize(f.size)}
                  </span>
                </span>
              </>
            )}
            {f.status === "uploading" && (
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,22,40,0.45)" }}>
                <Loader2 size={18} style={{ color: "var(--brand)", animation: "spin 1s linear infinite" }} />
              </span>
            )}
            {f.status === "error" && f.previewUrl && (
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,22,40,0.55)" }}>
                <AlertCircle size={18} style={{ color: "var(--danger)" }} />
              </span>
            )}
            <button onClick={() => onRemove(f.localId)} aria-label={`Retirer ${f.name}`} style={{
              position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", border: "none", cursor: "pointer",
              background: "rgba(10,22,40,0.8)", color: "var(--ink)", display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// PIÈCES JOINTES DANS UN MESSAGE
// ============================================================
export function MessageAttachments({
  attachments,
  mine,
  onOpenImage,
}: {
  attachments: ChatAttachment[];
  mine: boolean;
  onOpenImage: (images: ChatAttachment[], index: number) => void;
}) {
  const images = attachments.filter((a) => a.isImage);
  const docs = attachments.filter((a) => !a.isImage);
  if (attachments.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: mine ? "flex-end" : "flex-start" }}>
      {images.length > 0 && (
        <div style={{
          display: "grid", gap: "4px", width: images.length === 1 ? "auto" : "min(320px, 100%)",
          gridTemplateColumns: images.length === 1 ? "1fr" : "1fr 1fr",
        }}>
          {images.map((img, i) => {
            const single = images.length === 1;
            const ratio = img.width && img.height ? img.width / img.height : 4 / 3;
            return (
              <button key={img.id} onClick={() => onOpenImage(images, i)} aria-label={`Agrandir ${img.name}`} className="msg-image-btn" style={{
                padding: 0, border: "none", cursor: "zoom-in", borderRadius: 14, overflow: "hidden", background: "var(--surface-muted)",
                ...(single
                  ? { width: `min(300px, 60vw, ${Math.max(120, Math.round(260 * ratio))}px)`, aspectRatio: String(Math.min(Math.max(ratio, 0.6), 2)) }
                  : { aspectRatio: "1", gridColumn: images.length === 3 && i === 0 ? "span 2" : undefined }),
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            );
          })}
        </div>
      )}
      {docs.map((doc) => {
        const visual = fileVisual(doc.name, doc.mimeType);
        return (
          <a key={doc.id} href={doc.url} className="msg-file-card" download={doc.name} title={`Télécharger ${doc.name}`} style={{
            background: mine ? "var(--brand-soft)" : "var(--surface)",
            borderColor: mine ? "var(--brand)" : "var(--line)",
          }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(10,22,40,0.35)" }}>
              <visual.Icon size={19} style={{ color: visual.color }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="msg-ellipsis" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{doc.name}</span>
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{visual.label} · {formatFileSize(doc.size)}</span>
            </span>
            <Download size={16} style={{ color: "var(--ink-muted)", flexShrink: 0 }} />
          </a>
        );
      })}
    </div>
  );
}

// ============================================================
// VISIONNEUSE D'IMAGES
// ============================================================
export function ImageLightbox({ images, index, onClose }: { images: ChatAttachment[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);
  const image = images[current];
  const many = images.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  if (!image) return null;
  const navBtn: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none",
    background: "rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={image.name} onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 3000, background: "rgba(3,8,18,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 16px 24px",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", color: "var(--ink)" }}>
        <span className="msg-ellipsis" style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
          {image.name} <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}>· {formatFileSize(image.size)}{many ? ` · ${current + 1}/${images.length}` : ""}</span>
        </span>
        <a href={`${image.url}?telecharger=1`} className="msg-btn msg-btn-small" style={{ textDecoration: "none" }}><Download size={14} /> Télécharger</a>
        <button className="msg-icon-btn" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={image.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
      {many && (
        <>
          <button style={{ ...navBtn, left: 16 }} onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)} aria-label="Image précédente"><ChevronLeft size={22} /></button>
          <button style={{ ...navBtn, right: 16 }} onClick={() => setCurrent((c) => (c + 1) % images.length)} aria-label="Image suivante"><ChevronRight size={22} /></button>
        </>
      )}
    </div>
  );
}

// ============================================================
// FICHIERS PARTAGÉS D'UNE CONVERSATION
// ============================================================
const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Douala" });

export function SharedFilesDialog({
  conversationId,
  onClose,
  onOpenImage,
}: {
  conversationId: string;
  onClose: () => void;
  onOpenImage: (images: ChatAttachment[], index: number) => void;
}) {
  const [files, setFiles] = useState<SharedFile[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"images" | "docs">("images");

  useEffect(() => {
    let alive = true;
    fetchSharedFiles(conversationId).then((result) => {
      if (!alive) return;
      if (result.ok) {
        setFiles(result.files);
        if (!result.files.some((f) => f.isImage) && result.files.length) setTab("docs");
      } else setError(result.error);
    });
    return () => { alive = false; };
  }, [conversationId]);

  const images = files?.filter((f) => f.isImage) ?? [];
  const docs = files?.filter((f) => !f.isImage) ?? [];

  return (
    <Modal title="Fichiers partagés" onClose={onClose}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }} role="tablist">
        <button role="tab" aria-selected={tab === "images"} className={`msg-tab ${tab === "images" ? "msg-tab-active" : ""}`} onClick={() => setTab("images")}>
          Images {files && <span style={{ opacity: 0.7 }}>{images.length}</span>}
        </button>
        <button role="tab" aria-selected={tab === "docs"} className={`msg-tab ${tab === "docs" ? "msg-tab-active" : ""}`} onClick={() => setTab("docs")}>
          Documents {files && <span style={{ opacity: 0.7 }}>{docs.length}</span>}
        </button>
      </div>

      {error ? (
        <p role="alert" style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>
      ) : files === null ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 30 }}><Loader2 size={20} style={{ color: "var(--brand)", animation: "spin 1s linear infinite" }} /></div>
      ) : tab === "images" ? (
        images.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--ink-subtle)", fontSize: 13, padding: "24px 0" }}>Aucune image partagée dans cette conversation.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {images.map((img, i) => (
              <button key={img.id} onClick={() => onOpenImage(images, i)} className="msg-image-btn" title={`${img.name} · ${img.senderName}`} aria-label={`Agrandir ${img.name}`}
                style={{ padding: 0, border: "none", cursor: "zoom-in", aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: "var(--surface-muted)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
        )
      ) : docs.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--ink-subtle)", fontSize: 13, padding: "24px 0" }}>Aucun document partagé dans cette conversation.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {docs.map((doc) => {
            const visual = fileVisual(doc.name, doc.mimeType);
            return (
              <a key={doc.id} href={doc.url} download={doc.name} className="msg-file-card" style={{ maxWidth: "none" }}>
                <visual.Icon size={20} style={{ color: visual.color, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="msg-ellipsis" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{doc.name}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                    {formatFileSize(doc.size)} · {doc.senderName} · {dateFormat.format(new Date(doc.createdAt))}
                  </span>
                </span>
                <Download size={15} style={{ color: "var(--ink-muted)", flexShrink: 0 }} />
              </a>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
