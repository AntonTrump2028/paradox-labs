import { createFileRoute } from "@tanstack/react-router";
import { BayesLab } from "@/components/bayes-lab";

export const Route = createFileRoute("/bayes")({ component: BayesPage });

function BayesPage() {
  return <BayesLab />;
}
