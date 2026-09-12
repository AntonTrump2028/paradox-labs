import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { LabShell } from "@/components/lab-shell";
import { RateRow } from "@/components/rate-row";
import { RunControls, SPEED_STEPS } from "@/components/run-controls";
import { Button } from "@/components/ui/button";
import {
  clampPeople, MAX_PEOPLE, MIN_PEOPLE, naiveCollision, runBirthdayBatch,
  theoreticalCollision, type BirthdayTrial,
} from "@/lib/birthday";
import { useLang } from "@/lib/use-lang";
import { cn } from "@/lib/utils";

const PEOPLE_PRESETS = [10, 23, 30, 50, 70] as const;
type Point = { i: number; hit: number };

function dayCounts(birthdays: number[]) {
  const m = new Map<number, number>();
  for (const b of birthdays) m.set(b, (m.get(b) ?? 0) + 1);
  return m;
}

export function BirthdayLab() {
  const { lang, toggle, copy } = useLang();
  const t = copy.birthday;
  const common = copy.common;
  const [n, setN] = useState(23);
  const [running, setRunning] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [games, setGames] = useState(0);
  const [hits, setHits] = useState(0);
  const [last, setLast] = useState<BirthdayTrial | null>(null);
  const [series, setSeries] = useState<Point[]>([]);
  const runningRef = useRef(running);
  const nRef = useRef(n);
  const speedRef = useRef(speedIdx);
  const gamesRef = useRef(0);
  const hitsRef = useRef(0);
  const frameRef = useRef(0);
  runningRef.current = running;
  nRef.current = n;
  speedRef.current = speedIdx;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (runningRef.current) {
        const batch = SPEED_STEPS[speedRef.current] ?? 250;
        const { hits: h, last: trial } = runBirthdayBatch(nRef.current, batch);
        gamesRef.current += batch;
        hitsRef.current += h;
        frameRef.current += 1;
        if (frameRef.current % 2 === 0) {
          const g = gamesRef.current;
          setGames(g);
          setHits(hitsRef.current);
          setLast(trial);
          if (frameRef.current % 16 === 0) {
            setSeries((prev) => {
              const next = [...prev, { i: g, hit: (hitsRef.current / g) * 100 }];
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

  function resetStats(nextN = n) {
    const people = clampPeople(nextN);
    gamesRef.current = 0;
    hitsRef.current = 0;
    frameRef.current = 0;
    setGames(0);
    setHits(0);
    setLast(null);
    setSeries([]);
    setN(people);
  }

  const pct = games ? (hits / games) * 100 : 0;
  const theory = theoreticalCollision(n) * 100;
  const gut = naiveCollision(n) * 100;
  const counts = last ? dayCounts(last.birthdays) : null;

  return (
    <LabShell lang={lang} onToggleLang={toggle} kicker={t.kicker} title={t.title} lead={t.lead}>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-fg">{t.last}</h2>
            <span className="font-mono text-xs text-subtle tabular-nums">{last?.collision ? t.hit : t.miss}</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {Array.from({ length: n }, (_, i) => {
              const day = last?.birthdays[i];
              const dup = day !== undefined && (counts?.get(day) ?? 0) > 1;
              return (
                <div key={i} className={cn("flex aspect-square items-center justify-center rounded-xs border font-mono text-[10px] tabular-nums", dup ? "border-prize/50 bg-elevated text-fg" : "border-border bg-bg text-subtle")}>
                  {day === undefined ? "·" : day + 1}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
          <RateRow label={t.collision} pct={pct} theory={theory} theoryLabel={common.theory} barClass="bg-switch" />
          <RateRow label={t.naive} pct={gut} theory={gut} theoryLabel="" barClass="bg-stay" />
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <YAxis domain={[0, 100]} hide />
                <Line type="monotone" dataKey="hit" stroke="var(--color-switch)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="font-mono text-xs text-subtle tabular-nums">{common.trials}: {games.toLocaleString(lang === "ru" ? "ru-RU" : "en-US")}</p>
        </div>
      </section>
      <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-fg">{t.people}</legend>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" aria-label="-" disabled={n <= MIN_PEOPLE} onClick={() => resetStats(n - 1)}><Minus /></Button>
              <span className="w-10 text-center font-mono text-lg tabular-nums text-fg">{n}</span>
              <Button variant="outline" size="icon" aria-label="+" disabled={n >= MAX_PEOPLE} onClick={() => resetStats(n + 1)}><Plus /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PEOPLE_PRESETS.map((d) => (
                <Button key={d} variant={n === d ? "default" : "outline"} size="sm" onClick={() => resetStats(d)}>{d}</Button>
              ))}
            </div>
          </div>
        </fieldset>
        <RunControls lang={lang} running={running} onToggle={() => setRunning((r) => !r)} onReset={() => resetStats(n)} speedIdx={speedIdx} onSpeed={setSpeedIdx} />
      </section>
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="mb-3 text-sm font-medium text-fg">{t.whyTitle}</h2>
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted">{t.whyBody}</p>
        <p className="font-mono text-xs text-fg">{t.formula}</p>
        <p className="mt-2 text-xs text-subtle">{t.formulaHint}</p>
      </section>
    </LabShell>
  );
}
