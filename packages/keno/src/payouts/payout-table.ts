export interface PayoutTableRow {
  spotsPicked: number;
  matches: number;
  multiplier: number;
}

export const DEFAULT_PAYOUT_TABLE: PayoutTableRow[] = [
  { spotsPicked: 1, matches: 1, multiplier: 3 },
  { spotsPicked: 2, matches: 2, multiplier: 9 },
  { spotsPicked: 3, matches: 3, multiplier: 27 },
  { spotsPicked: 4, matches: 4, multiplier: 75 },
  { spotsPicked: 5, matches: 5, multiplier: 300 },
  { spotsPicked: 6, matches: 6, multiplier: 750 },
  { spotsPicked: 7, matches: 7, multiplier: 2500 },
  { spotsPicked: 8, matches: 8, multiplier: 5000 },
  { spotsPicked: 9, matches: 9, multiplier: 7500 },
  { spotsPicked: 10, matches: 10, multiplier: 10000 },
];

export function getMultiplier(spotsPicked: number, matches: number, table: PayoutTableRow[] = DEFAULT_PAYOUT_TABLE): number {
  const row = table.find((r) => r.spotsPicked === spotsPicked && r.matches === matches);
  return row?.multiplier ?? 0;
}

export function calculatePayout(stake: number, spotsPicked: number, matches: number, table?: PayoutTableRow[]): number {
  const multiplier = getMultiplier(spotsPicked, matches, table);
  return stake * multiplier;
}
