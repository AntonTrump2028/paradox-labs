import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/use-lang";

export function Hub() {
  const { lang, toggle, copy } = useLang();
  const h = copy.hub;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-8 sm:px-8 sm:py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">{h.kicker}</p>
          <h1 className="text-3xl font-medium tracking-tight text-fg sm:text-5xl">{h.title}</h1>
          <p className="text-sm leading-relaxed text-muted sm:text-base">{h.lead}</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggle} aria-label="Language">
          {copy.common.lang}
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {h.cards.map((card) => (
          <Link
            key={card.id}
            to={card.to as "/monty" | "/birthday" | "/bayes"}
            className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors duration-(--motion-fast) ease-(--ease-out) hover:border-primary/40 hover:bg-elevated"
          >
            <span className="font-mono text-xs text-subtle">{card.id}</span>
            <h2 className="mt-3 text-lg font-medium text-fg">{card.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{card.hook}</p>
            <p className="mt-4 font-mono text-xs text-fg">{card.punch}</p>
            <span className="mt-6 text-sm text-muted group-hover:text-fg">{h.open}</span>
          </Link>
        ))}
      </section>

      <p className="pb-6 text-center text-xs text-subtle">{copy.common.footnote}</p>
    </main>
  );
}
