import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../jwt/jwt.types';
import { ErrorCode } from '@ogp/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(options: { secret: string }) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException({ code: ErrorCode.AUTH_TOKEN_INVALID, message: 'Invalid token' });
    }
    return payload;
  }
}
