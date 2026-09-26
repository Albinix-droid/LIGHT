// app/dashboard/projets/nouveau/page.tsx
// CRÉATION D'UN PROJET : charge la liste des encadrants disponibles

import { listEncadrants, fullName } from "@/lib/projects";
import NewProjectForm from "./NewProjectForm";

export default async function NewProjectPage() {
  const encadrants = await listEncadrants();
  return <NewProjectForm encadrants={encadrants.map((e) => ({ id: e.id, name: fullName(e) }))} />;
}
