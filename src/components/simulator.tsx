import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { LabShell } from "@/components/lab-shell";
import { RateRow } from "@/components/rate-row";
import { RunControls, SPEED_STEPS } from "@/components/run-controls";
import { Button } from "@/components/ui/button";
import {
  clampHostOpens,
  clampRooms,
  maxHostOpens,
  MAX_ROOMS,
  MIN_ROOMS,
  runBatch,
  theoreticalStay,
  theoreticalSwitch,
  type Trial,
} from "@/lib/monty";
import { useLang } from "@/lib/use-lang";
import { cn } from "@/lib/utils";

const DOOR_OPTIONS = [3, 4, 5, 6, 8] as const;

type Point = { i: number; stay: number; sw: number };

function Door({
  index,
  trial,
  pick,
  prize,
  opened,
  alt,
}: {
  index: number;
  trial: Trial | null;
  pick: string;
  prize: string;
  opened: string;
  alt: string;
}) {
  const isPick = trial?.pick === index;
  const isOpened = trial?.opened.includes(index) ?? false;
  const isPrize = trial?.prize === index;
  const isSwitch = trial?.switched === index;

  let caption = "";
  if (isPick) caption = pick;
  else if (isOpened) caption = opened;
  else if (isSwitch) caption = alt;
  else if (isPrize) caption = prize;

  return (
    <div
      className={cn(
        "relative flex h-28 min-w-10 flex-1 flex-col items-center justify-between rounded-md border px-1 py-2 transition-colors duration-(--motion-fast) ease-(--ease-out) sm:h-36",
        isOpened && "border-border bg-bg opacity-45",
        !isOpened && isPrize && "border-prize/50 bg-elevated",
        !isOpened && !isPrize && "border-border bg-surface",
        isPick && "ring-1 ring-primary",
      )}
    >
      <span className="font-mono text-xs text-subtle tabular-nums">{index + 1}</span>
      <span className="font-mono text-lg text-fg">
        {isOpened ? "×" : isPrize ? "★" : "·"}
      </span>
      <span className="min-h-4 text-center font-mono text-xs uppercase tracking-wide text-muted">
        {caption}
      </span>
    </div>
  );
}

export function Simulator() {
  const { lang, toggle, copy } = useLang();
  const t = copy.monty;
  const common = copy.common;

  const [n, setN] = useState(4);
  const [hostOpens, setHostOpens] = useState(1);
  const [running, setRunning] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [games, setGames] = useState(0);
  const [stayW, setStayW] = useState(0);
  const [swW, setSwW] = useState(0);
  const [last, setLast] = useState<Trial | null>(null);
  const [series, setSeries] = useState<Point[]>([]);

  const runningRef = useRef(running);
  const nRef = useRef(n);
  const kRef = useRef(hostOpens);
  const speedRef = useRef(speedIdx);
  const gamesRef = useRef(0);
  const stayRef = useRef(0);
  const swRef = useRef(0);
  const frameRef = useRef(0);

  runningRef.current = running;
  nRef.current = n;
  kRef.current = hostOpens;
  speedRef.current = speedIdx;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (runningRef.current) {
        const batch = SPEED_STEPS[speedRef.current] ?? 250;
        const { stayWins, switchWins, last: trial } = runBatch(
          nRef.current,
          kRef.current,
          batch,
        );
        gamesRef.current += batch;
        stayRef.current += stayWins;
        swRef.current += switchWins;
        frameRef.current += 1;
        if (frameRef.current % 2 === 0) {
          const g = gamesRef.current;
          setGames(g);
          setStayW(stayRef.current);
          setSwW(swRef.current);
          setLast(trial);
          if (frameRef.current % 16 === 0) {
            setSeries((prev) => {
              const next = [
                ...prev,
                {
                  i: g,
                  stay: (stayRef.current / g) * 100,
                  sw: (swRef.current / g) * 100,
                },
              ];
              return next.length > 48 ? next.slice(-48) : next;
            });
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function resetStats(nextN = n, nextK = hostOpens) {
    const rooms = clampRooms(nextN);
    const k = clampHostOpens(rooms, nextK);
    gamesRef.current = 0;
    stayRef.current = 0;
    swRef.current = 0;
    frameRef.current = 0;
    setGames(0);
    setStayW(0);
    setSwW(0);
    setLast(null);
    setSeries([]);
    setN(rooms);
    setHostOpens(k);
  }

  const k = clampHostOpens(n, hostOpens);
  const stayPct = games ? (stayW / games) * 100 : 0;
  const swPct = games ? (swW / games) * 100 : 0;
  const tStay = theoreticalStay(n) * 100;
  const tSw = theoreticalSwitch(n, k) * 100;
  const maxK = maxHostOpens(n);

  return (
    <LabShell lang={lang} onToggleLang={toggle} kicker={t.kicker} title={t.title} lead={t.lead}>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-fg">{t.last}</h2>
            <span className="font-mono text-xs text-subtle tabular-nums">n={n} · k={k}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: n }, (_, i) => (
              <Door key={i} index={i} trial={last} pick={t.pick} prize={t.prize} opened={t.opened} alt={t.alt} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
          <RateRow label={t.stay} pct={stayPct} theory={tStay} theoryLabel={common.theory} barClass="bg-stay" />
          <RateRow label={t.switch} pct={swPct} theory={tSw} theoryLabel={common.theory} barClass="bg-switch" />
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <YAxis domain={[0, 100]} hide />
                <Line type="monotone" dataKey="stay" stroke="var(--color-stay)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="sw" stroke="var(--color-switch)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="font-mono text-xs text-subtle tabular-nums">
            {common.trials}: {games.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")}
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-fg">{t.doors}</legend>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" aria-label="-" disabled={n <= MIN_ROOMS} onClick={() => resetStats(n - 1, hostOpens)}>
                <Minus />
              </Button>
              <span className="w-10 text-center font-mono text-lg tabular-nums text-fg">{n}</span>
              <Button variant="outline" size="icon" aria-label="+" disabled={n >= MAX_ROOMS} onClick={() => resetStats(n + 1, hostOpens)}>
                <Plus />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {DOOR_OPTIONS.map((d) => (
                <Button key={d} variant={n === d ? "default" : "outline"} size="sm" onClick={() => resetStats(d, hostOpens)}>
                  {d}
                </Button>
              ))}
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-fg">{t.hostOpens}</legend>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: maxK }, (_, i) => i + 1).map((kOpt) => (
              <Button key={kOpt} variant={k === kOpt ? "default" : "outline"} size="sm" onClick={() => resetStats(n, kOpt)}>
                {kOpt}
              </Button>
            ))}
          </div>
        </fieldset>
        <RunControls lang={lang} running={running} onToggle={() => setRunning((r) => !r)} onReset={() => resetStats(n, k)} speedIdx={speedIdx} onSpeed={setSpeedIdx} />
      </section>
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="mb-3 text-sm font-medium text-fg">{t.whyTitle}</h2>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted">{t.whyBody}</p>
        <div className="space-y-1 font-mono text-xs text-fg">
          <p>{t.formulaStay}</p>
          <p>{t.formulaSwitch}</p>
        </div>
        <p className="mt-2 text-xs text-subtle">{t.formulaHint}</p>
      </section>
    </LabShell>
  );
}
