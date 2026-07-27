import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateWalletDto {
  @IsString() userId!: string;
  @IsString() currency!: string;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
