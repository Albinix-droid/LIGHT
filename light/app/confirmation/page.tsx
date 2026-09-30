// app/confirmation/page.tsx
// CONFIRMATION D'UN COMPTE ENCADRANT OU ADMINISTRATEUR
// Deuxième formulaire après l'inscription : matricule et code confidentiel remis par l'école,
// puis informations professionnelles. Le rôle n'est attribué qu'après vérification.

import { redirect } from "next/navigation";
import { homeFor, requireUser } from "@/lib/auth";
import { isStaffRole } from "@/lib/staff";
import AuthShell from "@/components/AuthShell";
import ConfirmationForm from "./ConfirmationForm";

export const metadata = { title: "Confirmation du compte" };

export default async function ConfirmationPage() {
  const user = await requireUser();
  if (!isStaffRole(user.pendingRole)) redirect(homeFor(user));
  const role = user.pendingRole;

  return (
    <AuthShell
      maxWidth={560}
      title={role === "ADMIN" ? "Confirmez votre compte administrateur" : "Confirmez votre compte encadrant"}
      subtitle="Pour protéger les étudiants et leurs projets, ce rôle est réservé au personnel de l'école. Saisissez les identifiants qui vous ont été remis, puis complétez votre profil."
      footer={
        <form action="/logout" method="post" style={{ textAlign: "center", margin: "22px 0 0" }}>
          <button type="submit" className="auth-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontFamily: "inherit" }}>
            Se déconnecter
          </button>
        </form>
      }
    >
      <ConfirmationForm role={role} email={user.email} fullName={`${user.firstName} ${user.lastName}`.trim()} />
    </AuthShell>
  );
}
