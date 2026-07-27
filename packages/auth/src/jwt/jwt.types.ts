export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  kycStatus: 'pending' | 'approved' | 'rejected';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtConfig {
  secret: string;
  accessTtl: string;
  refreshTtlDays: number;
}
