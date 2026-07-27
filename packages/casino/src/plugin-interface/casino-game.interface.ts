export enum RoundStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type GameType = 'SLOTS' | 'TABLE' | 'LIVE' | 'VIRTUAL';

export interface RTPConfig {
  rtp: number;
  variance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RoundInitParams {
  userId: string;
  stake: number;
  clientSeed?: string;
}

export interface RoundInitResult {
  roundId: string;
  clientSeed?: string;
  serverSeedHash?: string;
}

export interface RoundResolveParams {
  roundId: string;
  serverSeed?: string;
  clientSeed?: string;
  nonce?: number;
}

export interface GameOutcome {
  result: string;
  multiplier: number;
  metadata?: Record<string, unknown>;
}

export interface RoundResolveResult {
  outcome: GameOutcome;
  payout: number;
  serverSeed?: string;
}

export interface BetValidationParams {
  userId: string;
  stake: number;
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ICasinoGame {
  readonly gameId: string;
  readonly gameName: string;
  readonly gameType: GameType;

  initRound(params: RoundInitParams): Promise<RoundInitResult>;
  resolveRound(params: RoundResolveParams): Promise<RoundResolveResult>;
  getRTPConfig(): RTPConfig;
  validateBet(params: BetValidationParams): ValidationResult;
}
