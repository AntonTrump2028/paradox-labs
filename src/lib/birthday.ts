export const DAYS = 365;
export const MIN_PEOPLE = 2;
export const MAX_PEOPLE = 80;

export function clampPeople(n: number): number {
  const v = Math.round(n);
  return Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, Number.isFinite(v) ? v : 23));
}

export function naiveCollision(n: number, days = DAYS): number {
  return Math.min(1, n / days);
}

export function theoreticalCollision(n: number, days = DAYS): number {
  const k = clampPeople(n);
  if (k > days) return 1;
  let unique = 1;
  for (let i = 1; i < k; i++) unique *= (days - i) / days;
  return 1 - unique;
}

export type BirthdayTrial = {
  n: number;
  birthdays: number[];
  collision: boolean;
};

export function runBirthdayTrial(n: number, days = DAYS): BirthdayTrial {
  const k = clampPeople(n);
  const birthdays: number[] = [];
  const seen = new Set<number>();
  let collision = false;
  for (let i = 0; i < k; i++) {
    const b = Math.floor(Math.random() * days);
    birthdays.push(b);
    if (seen.has(b)) collision = true;
    else seen.add(b);
  }
  return { n: k, birthdays, collision };
}

export function runBirthdayBatch(
  n: number,
  count: number,
): { hits: number; last: BirthdayTrial } {
  let hits = 0;
  let last: BirthdayTrial | null = null;
  for (let i = 0; i < count; i++) {
    last = runBirthdayTrial(n);
    if (last.collision) hits++;
  }
  return { hits, last: last! };
}
