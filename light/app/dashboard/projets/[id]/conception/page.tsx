// app/dashboard/projets/[id]/conception/page.tsx
import { loadStep } from "../loadStep";
import ConceptionForm, { type ConceptionData } from "./ConceptionForm";

export default async function ConceptionPage({ params }: { params: Promise<{ id: string }> }) {
  const step = await loadStep<ConceptionData>(params, "conception");
  return <ConceptionForm {...step} />;
}
