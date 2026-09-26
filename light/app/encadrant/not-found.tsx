// app/encadrant/not-found.tsx
// PAGE 404 DE L'ESPACE ENCADRANT (dans le layout)

import Link from "next/link";
import { Compass } from "lucide-react";

export default function EncadrantNotFound() {
  return (
    <div className="enc-page enc-empty" style={{ maxWidth: "520px", paddingTop: "70px" }}>
      <Compass size={40} style={{ color: "#F5D76E", marginBottom: "16px" }} />
      <h1 className="enc-h1" style={{ fontSize: "22px" }}>Page introuvable</h1>
      <p className="enc-sub" style={{ margin: "8px 0 24px" }}>
        Cette page n&apos;existe pas, ou ce projet n&apos;est pas suivi par vous.
      </p>
      <Link href="/encadrant" className="enc-btn enc-btn-primary">Retour au tableau de bord</Link>
    </div>
  );
}
