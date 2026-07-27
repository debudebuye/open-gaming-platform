import { IsString, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';

export class DebitDto {
  @IsString() walletId!: string;
  @IsNumber() @IsPositive() amount!: number;
  @IsString() referenceId!: string;
  @IsString() referenceType!: string;
  @IsOptional() @IsString() reason?: string;
}

export class CreditDto {
  @IsString() walletId!: string;
  @IsNumber() @IsPositive() amount!: number;
  @IsString() referenceId!: string;
  @IsString() referenceType!: string;
  @IsOptional() @IsString() reason?: string;
}

export class HoldDto {
  @IsString() walletId!: string;
  @IsNumber() @IsPositive() amount!: number;
  @IsString() referenceId!: string;
  @IsString() reason!: string;
}

export class SettleHoldDto {
  @IsString() holdId!: string;
  @IsString() outcome!: 'WIN' | 'LOSS' | 'CANCEL';
  @IsNumber() @Min(0) payoutAmount!: number;
}
