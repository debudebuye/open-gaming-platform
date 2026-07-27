import { ErrorCode, ValidationException } from '@ogp/shared';

interface BetLineInput {
  selectionId: string;
  odds: number;
}

export interface SlipValidationInput {
  lines: BetLineInput[];
  stake: number;
  maxSelections?: number;
  minStake?: number;
  maxStake?: number;
  maxPayout?: number;
}

const DEFAULT_MAX_SELECTIONS = 20;
const DEFAULT_MIN_STAKE = 1;
const DEFAULT_MAX_STAKE = 100000;
const DEFAULT_MAX_PAYOUT = 1000000;

export function validateSlip(input: SlipValidationInput): void {
  const {
    lines,
    stake,
    maxSelections = DEFAULT_MAX_SELECTIONS,
    minStake = DEFAULT_MIN_STAKE,
    maxStake = DEFAULT_MAX_STAKE,
    maxPayout = DEFAULT_MAX_PAYOUT,
  } = input;

  if (!lines || lines.length === 0) {
    throw new ValidationException(ErrorCode.BET_SLIP_INVALID, 'Bet slip must have at least one selection');
  }

  if (lines.length > maxSelections) {
    throw new ValidationException(ErrorCode.BET_SLIP_INVALID, `Maximum ${maxSelections} selections allowed`);
  }

  if (stake < minStake) {
    throw new ValidationException(ErrorCode.BET_STAKE_BELOW_MINIMUM, `Minimum stake is ${minStake}`);
  }

  if (stake > maxStake) {
    throw new ValidationException(ErrorCode.BET_STAKE_ABOVE_MAXIMUM, `Maximum stake is ${maxStake}`);
  }

  const selectionIds = lines.map((l) => l.selectionId);
  const unique = new Set(selectionIds);
  if (unique.size !== selectionIds.length) {
    throw new ValidationException(ErrorCode.BET_DUPLICATE_MARKET, 'Duplicate selections not allowed');
  }

  for (const line of lines) {
    if (line.odds < 1.01) {
      throw new ValidationException(ErrorCode.BET_SLIP_INVALID, 'Invalid odds');
    }
  }

  const potentialPayout = calculatePayout(stake, lines);
  if (potentialPayout > maxPayout) {
    throw new ValidationException(ErrorCode.BET_SLIP_INVALID, `Maximum payout is ${maxPayout}`);
  }
}

export function calculatePayout(stake: number, lines: BetLineInput[]): number {
  if (lines.length === 1) {
    return stake * lines[0].odds;
  }

  const combinedOdds = lines.reduce((acc, line) => acc * line.odds, 1);
  return stake * combinedOdds;
}
