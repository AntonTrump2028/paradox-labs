import { useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { LabShell } from "@/components/lab-shell";
import { RateRow } from "@/components/rate-row";
import { RunControls, SPEED_STEPS } from "@/components/run-controls";
import { Button } from "@/components/ui/button";
import {
  ACCURACY, PREVALENCE, naivePpv, ppvFromCounts, runBayesBatch, theoreticalPpv, type Patient,
} from "@/lib/bayes";
import { useLang } from "@/lib/use-lang";
import { cn } from "@/lib/utils";

type Point = { i: number; ppv: number };

function fmtPct(p: number): string {
  const v = p * 100;
  if (v < 1) return `${v.toFixed(1)}%`;
  if (Number.isInteger(v)) return `${v.toFixed(0)}%`;
  return `${v.toFixed(1)}%`;
}

export function BayesLab() {
  const { lang, toggle, copy } = useLang();
  const t = copy.bayes;
  const common = copy.common;
  const [prev, setPrev] = useState(0.01);
  const [acc, setAcc] = useState(0.99);
  const [running, setRunning] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [games, setGames] = useState(0);
  const [tp, setTp] = useState(0);
  const [fp, setFp] = useState(0);
  const [last, setLast] = useState<Patient[]>([]);
  const [series, setSeries] = useState<Point[]>([]);
  const runningRef = useRef(running);
  const prevRef = useRef(prev);
  const accRef = useRef(acc);
  const speedRef = useRef(speedIdx);
  const gamesRef = useRef(0);
  const tpRef = useRef(0);
  const fpRef = useRef(0);
  const frameRef = useRef(0);
  runningRef.current = running;
  prevRef.current = prev;
  accRef.current = acc;
  speedRef.current = speedIdx;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (runningRef.current) {
        const batch = SPEED_STEPS[speedRef.current] ?? 250;
        const a = accRef.current;
        const { n, tp: tpc, fp: fpc, last: patients } = runBayesBatch(prevRef.current, a, a, batch);
        gamesRef.current += n;
        tpRef.current += tpc;
        fpRef.current += fpc;
        frameRef.current += 1;
        if (frameRef.current % 2 === 0) {
          const g = gamesRef.current;
          setGames(g);
          setTp(tpRef.current);
          setFp(fpRef.current);
          setLast(patients);
          if (frameRef.current % 16 === 0) {
            setSeries((s) => {
              const next = [...s, { i: g, ppv: ppvFromCounts(tpRef.current, fpRef.current) * 100 }];
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

  function resetStats(nextPrev = prev, nextAcc = acc) {
    gamesRef.current = 0;
    tpRef.current = 0;
    fpRef.current = 0;
    frameRef.current = 0;
    setGames(0);
    setTp(0);
    setFp(0);
    setLast([]);
    setSeries([]);
    setPrev(nextPrev);
    setAcc(nextAcc);
  }

  const emp = ppvFromCounts(tp, fp) * 100;
  const theory = theoreticalPpv(prev, acc, acc) * 100;
  const gut = naivePpv(acc) * 100;
  const loc = lang === "ru" ? "ru-RU" : "en-US";

  return (
    <LabShell lang={lang} onToggleLang={toggle} kicker={t.kicker} title={t.title} lead={t.lead}>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-fg">{t.last}</h2>
            <span className="font-mono text-xs text-subtle tabular-nums">{t.tp} {tp.toLocaleString(loc)} · {t.fp} {fp.toLocaleString(loc)}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(last.length ? last : Array.from({ length: 80 }, () => null)).map((p, i) => (
              <span
                key={i}
                className={cn(
                  "size-3 rounded-xs border",
                  !p && "border-border bg-bg",
                  p?.sick && p.positive && "border-prize bg-prize/40",
                  p?.sick && !p.positive && "border-prize/40 bg-bg",
                  p && !p.sick && p.positive && "border-switch bg-switch/30",
                  p && !p.sick && !p.positive && "border-border bg-elevated",
                )}
                title={p ? `${p.sick ? t.sick : t.well} ${p.positive ? t.pos : t.neg}` : undefined}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
          <RateRow label={t.ppv} pct={emp} theory={theory} theoryLabel={common.theory} barClass="bg-switch" />
          <RateRow label={t.naive} pct={gut} theory={gut} theoryLabel="" barClass="bg-stay" />
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <YAxis domain={[0, 100]} hide />
                <Line type="monotone" dataKey="ppv" stroke="var(--color-switch)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="font-mono text-xs text-subtle tabular-nums">{common.trials}: {games.toLocaleString(loc)}</p>
        </div>
      </section>
      <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-fg">{t.prev}</legend>
          <div className="flex flex-wrap gap-2">
            {PREVALENCE.map((p) => (
              <Button key={p} variant={prev === p ? "default" : "outline"} size="sm" onClick={() => resetStats(p, acc)}>{fmtPct(p)}</Button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-fg">{t.acc}</legend>
          <div className="flex flex-wrap gap-2">
            {ACCURACY.map((a) => (
              <Button key={a} variant={acc === a ? "default" : "outline"} size="sm" onClick={() => resetStats(prev, a)}>{fmtPct(a)}</Button>
            ))}
          </div>
        </fieldset>
        <RunControls lang={lang} running={running} onToggle={() => setRunning((r) => !r)} onReset={() => resetStats(prev, acc)} speedIdx={speedIdx} onSpeed={setSpeedIdx} />
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
