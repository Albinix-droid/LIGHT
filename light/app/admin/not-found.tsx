// app/admin/not-found.tsx
// PAGE 404 DE L'ADMINISTRATION (dans le layout)

import Link from "next/link";
import { Compass } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="enc-page enc-empty" style={{ maxWidth: "520px", paddingTop: "70px" }}>
      <Compass size={40} style={{ color: "#F5D76E", marginBottom: "16px" }} />
      <h1 className="enc-h1" style={{ fontSize: "22px" }}>Page introuvable</h1>
      <p className="enc-sub" style={{ margin: "8px 0 24px" }}>Cette page n&apos;existe pas dans l&apos;espace d&apos;administration.</p>
      <Link href="/admin" className="enc-btn enc-btn-primary">Retour à la vue d&apos;ensemble</Link>
    </div>
  );
}
