import { randomInt } from 'crypto';

export function drawNumbers(count: number, max: number): number[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  const drawn: number[] = [];

  while (drawn.length < count) {
    const idx = randomInt(0, pool.length);
    drawn.push(pool.splice(idx, 1)[0]);
  }

  return drawn.sort((a, b) => a - b);
}

export function countMatches(selected: number[], drawn: number[]): number {
  const drawnSet = new Set(drawn);
  return selected.filter((n) => drawnSet.has(n)).length;
}
