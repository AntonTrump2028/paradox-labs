import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY, type Lang } from "@/lib/copy";

export const SPEED_STEPS = [20, 80, 250, 800] as const;

export function RunControls({
  lang,
  running,
  onToggle,
  onReset,
  speedIdx,
  onSpeed,
}: {
  lang: Lang;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  speedIdx: number;
  onSpeed: (idx: number) => void;
}) {
  const copy = COPY[lang].common;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        <Button variant="default" onClick={onToggle}>
          {running ? <Pause /> : <Play />}
          {running ? copy.pause : copy.resume}
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw />
          {copy.reset}
        </Button>
      </div>
      <label className="flex items-center gap-3 text-sm text-muted">
        <span>{copy.speed}</span>
        <input
          type="range"
          min={0}
          max={SPEED_STEPS.length - 1}
          value={speedIdx}
          onChange={(e) => onSpeed(Number(e.target.value))}
          className="h-11 w-36 accent-primary"
          suppressHydrationWarning
        />
      </label>
    </div>
  );
}
