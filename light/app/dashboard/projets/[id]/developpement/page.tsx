// app/dashboard/projets/[id]/developpement/page.tsx
import { loadStep } from "../loadStep";
import DeveloppementForm, { type DevelopmentData } from "./DeveloppementForm";

export default async function DeveloppementPage({ params }: { params: Promise<{ id: string }> }) {
  const step = await loadStep<DevelopmentData>(params, "developpement");
  return <DeveloppementForm {...step} />;
}
