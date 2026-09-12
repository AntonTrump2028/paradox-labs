import { createFileRoute } from "@tanstack/react-router";
import { BirthdayLab } from "@/components/birthday-lab";

export const Route = createFileRoute("/birthday")({ component: BirthdayPage });

function BirthdayPage() {
  return <BirthdayLab />;
}
