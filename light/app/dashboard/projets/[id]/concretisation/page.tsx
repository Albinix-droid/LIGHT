// app/dashboard/projets/[id]/concretisation/page.tsx
import { loadStep } from "../loadStep";
import ConcretisationForm, { type ConcretisationData } from "./ConcretisationForm";

export default async function ConcretisationPage({ params }: { params: Promise<{ id: string }> }) {
  const step = await loadStep<ConcretisationData>(params, "concretisation");
  return <ConcretisationForm {...step} />;
}
