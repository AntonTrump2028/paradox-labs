import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { COPY, type Lang } from "@/lib/copy";

export function LabShell({
  lang,
  onToggleLang,
  kicker,
  title,
  lead,
  children,
}: {
  lang: Lang;
  onToggleLang: () => void;
  kicker: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  const common = COPY[lang].common;
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="text-sm text-muted transition-colors duration-(--motion-quick) hover:text-fg"
        >
          {common.back}
        </Link>
        <Button variant="outline" size="sm" onClick={onToggleLang} aria-label="Language">
          {common.lang}
        </Button>
      </div>
      <header className="max-w-xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{kicker}</p>
        <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-4xl">{title}</h1>
        <p className="text-sm leading-relaxed text-muted sm:text-base">{lead}</p>
      </header>
      {children}
      <p className="pb-6 text-center text-xs text-subtle">{common.footnote}</p>
    </main>
  );
}
