import { createFileRoute } from "@tanstack/react-router";
import { Simulator } from "@/components/simulator";

export const Route = createFileRoute("/monty")({ component: MontyPage });

function MontyPage() {
  return <Simulator />;
}
