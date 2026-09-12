import { cn } from "@/lib/utils";

export function RateRow({
  label,
  pct,
  theory,
  theoryLabel,
  barClass,
}: {
  label: string;
  pct: number;
  theory: number;
  theoryLabel: string;
  barClass: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm text-fg">{label}</span>
        <span className="font-mono text-sm tabular-nums text-fg">{pct.toFixed(2)}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-xs bg-elevated">
        <div
          className={cn("h-full transition-[width] duration-(--motion-fast)", barClass)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        <div
          className="absolute top-0 h-full w-px bg-fg/40"
          style={{ left: `${Math.min(theory, 100)}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-xs text-subtle tabular-nums">
        {theoryLabel ? `${theoryLabel} ${theory.toFixed(2)}%` : "\u00a0"}
      </p>
    </div>
  );
}
