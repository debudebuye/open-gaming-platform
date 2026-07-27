import { IsString } from 'class-validator';

export class TokenResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}
