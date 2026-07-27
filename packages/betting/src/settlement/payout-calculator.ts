export interface PayoutResult {
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  cappedPayout: number;
}

export function calculatePotentialPayout(
  stake: number,
  lines: { odds: number }[],
  maxPayout?: number,
): PayoutResult {
  const totalOdds = lines.reduce((acc, line) => acc * line.odds, 1);
  const potentialPayout = stake * totalOdds;
  const cappedPayout = maxPayout ? Math.min(potentialPayout, maxPayout) : potentialPayout;

  return { stake, totalOdds, potentialPayout, cappedPayout };
}

export function calculateActualPayout(
  stake: number,
  lines: { odds: number; status: 'WIN' | 'LOSS' | 'VOID' }[],
  maxPayout?: number,
): { payout: number; result: 'WIN' | 'LOSS' | 'VOID' } {
  let combinedOdds = 1;
  let hasVoid = false;

  for (const line of lines) {
    if (line.status === 'LOSS') {
      return { payout: 0, result: 'LOSS' };
    }
    if (line.status === 'VOID') {
      hasVoid = true;
    } else {
      combinedOdds *= line.odds;
    }
  }

  if (hasVoid && combinedOdds === 1) {
    return { payout: stake, result: 'VOID' };
  }

  const payout = stake * combinedOdds;
  const cappedPayout = maxPayout ? Math.min(payout, maxPayout) : payout;
  return { payout: cappedPayout, result: 'WIN' };
}
