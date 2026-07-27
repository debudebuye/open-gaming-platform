import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import type { JwtConfig, JwtPayload } from './jwt.types';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwt: NestJwtService,
    private readonly config: JwtConfig,
  ) {}

  async signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      expiresIn: this.config.accessTtl,
    });
  }

  async verifyAccessToken<T extends JwtPayload = JwtPayload>(token: string): Promise<T> {
    return this.jwt.verifyAsync<T>(token);
  }

  generateRefreshTokenId(): string {
    return crypto.randomUUID();
  }

  getRefreshTokenExpiryMs(): number {
    return this.config.refreshTtlDays * 24 * 60 * 60 * 1000;
  }
}
