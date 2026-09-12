export const PREVALENCE = [0.001, 0.005, 0.01, 0.05, 0.1] as const;
export const ACCURACY = [0.9, 0.95, 0.99, 0.999] as const;

export function clampUnit(p: number): number {
  if (!Number.isFinite(p)) return 0.01;
  return Math.min(0.999, Math.max(0.0001, p));
}

export function naivePpv(sens: number): number {
  return clampUnit(sens);
}

export function theoreticalPpv(prev: number, sens: number, spec: number): number {
  const p = clampUnit(prev);
  const se = clampUnit(sens);
  const sp = clampUnit(spec);
  const tp = se * p;
  const fp = (1 - sp) * (1 - p);
  const den = tp + fp;
  return den <= 0 ? 0 : tp / den;
}

export type Patient = {
  sick: boolean;
  positive: boolean;
};

export function runPatient(prev: number, sens: number, spec: number): Patient {
  const sick = Math.random() < clampUnit(prev);
  const se = clampUnit(sens);
  const sp = clampUnit(spec);
  const positive = sick ? Math.random() < se : Math.random() < 1 - sp;
  return { sick, positive };
}

export type BayesBatch = {
  n: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  last: Patient[];
};

export function runBayesBatch(
  prev: number,
  sens: number,
  spec: number,
  count: number,
  keepLast = 80,
): BayesBatch {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  const last: Patient[] = [];
  for (let i = 0; i < count; i++) {
    const x = runPatient(prev, sens, spec);
    if (x.sick && x.positive) tp++;
    else if (!x.sick && x.positive) fp++;
    else if (!x.sick && !x.positive) tn++;
    else fn++;
    last.push(x);
  }
  return { n: count, tp, fp, tn, fn, last: last.slice(-keepLast) };
}

export function ppvFromCounts(tp: number, fp: number): number {
  const den = tp + fp;
  return den <= 0 ? 0 : tp / den;
}
