import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorCode, UnauthorizedException_ } from '@ogp/shared';
import { JwtService, PasswordService, RefreshTokenService } from '@ogp/auth';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import type { JwtPayload } from '@ogp/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException_(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException_(ErrorCode.USER_INACTIVE, 'Account is deactivated');
    }

    const valid = await this.passwordService.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException_(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
    }

    return this.issueTokens(user.id, user.email, user.roles ?? ['PLAYER'], user.kycStatus);
  }

  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      password: dto.password,
    });

    return this.issueTokens(user.id, user.email, ['PLAYER'], user.kycStatus);
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    const refreshTokenId = this.extractTokenId(refreshToken);
    if (!refreshTokenId) {
      throw new UnauthorizedException_(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Invalid refresh token');
    }

    // We need to find the session to get the userId
    // The refresh token is the raw token ID, we validate against Redis
    // For now, we use a simplified approach — the token contains userId:tokenId
    const parts = refreshToken.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException_(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Invalid refresh token');
    }

    const [userId, tokenId] = parts;
    const valid = await this.refreshTokens.validate(userId, tokenId);
    if (!valid) {
      throw new UnauthorizedException_(ErrorCode.AUTH_REFRESH_TOKEN_INVALID, 'Refresh token expired or revoked');
    }

    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException_(ErrorCode.USER_INACTIVE, 'Account is deactivated');
    }

    await this.refreshTokens.rotate(userId, tokenId, this.jwtService.generateRefreshTokenId());

    return this.issueTokens(user.id, user.email, ['PLAYER'], user.kycStatus);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const parts = refreshToken.split(':');
      if (parts.length === 2) {
        await this.refreshTokens.revoke(parts[0], parts[1]);
      }
    } else {
      await this.refreshTokens.revokeAllForUser(userId);
    }
  }

  private async issueTokens(
    userId: string,
    email: string,
    roles: string[],
    kycStatus: string,
  ): Promise<TokenResponseDto> {
    const payload: JwtPayload = { sub: userId, email, roles, kycStatus: kycStatus as JwtPayload['kycStatus'] };

    const [accessToken, tokenId] = await Promise.all([
      this.jwtService.signAccessToken(payload),
      Promise.resolve(this.jwtService.generateRefreshTokenId()),
    ]);

    const refreshToken = `${userId}:${tokenId}`;
    await this.refreshTokens.create(userId, tokenId);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private extractTokenId(refreshToken: string): string | null {
    const parts = refreshToken.split(':');
    return parts.length === 2 ? parts[1] : null;
  }
}
