import { createFileRoute } from "@tanstack/react-router";
import { Hub } from "@/components/hub";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Hub />;
}
