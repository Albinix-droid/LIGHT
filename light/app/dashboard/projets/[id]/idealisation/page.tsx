// app/dashboard/projets/[id]/idealisation/page.tsx
import { loadStep } from "../loadStep";
import IdealisationForm, { type IdeationData } from "./IdealisationForm";

export default async function IdealisationPage({ params }: { params: Promise<{ id: string }> }) {
  const step = await loadStep<IdeationData>(params, "idealisation");
  return <IdealisationForm {...step} />;
}
