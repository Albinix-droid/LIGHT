// app/dashboard/projets/[id]/tests/page.tsx
import { loadStep } from "../loadStep";
import TestsForm, { type TestsData } from "./TestsForm";

export default async function TestsPage({ params }: { params: Promise<{ id: string }> }) {
  const step = await loadStep<TestsData>(params, "tests");
  return <TestsForm {...step} />;
}
