import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService, PasswordService, RefreshTokenService } from '@ogp/auth';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockPasswordService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockJwtService = {
    signAccessToken: jest.fn().mockResolvedValue('access-token'),
    generateRefreshTokenId: jest.fn().mockReturnValue('token-id-123'),
  };

  const mockRefreshTokens = {
    create: jest.fn(),
    validate: jest.fn(),
    rotate: jest.fn(),
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RefreshTokenService, useValue: mockRefreshTokens },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: 'hashed',
        isActive: true,
        kycStatus: 'pending',
        roles: ['PLAYER'],
      });
      mockPasswordService.compare.mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'pass' });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toContain('user-1');
      expect(result.expiresIn).toBe(900);
    });

    it('should throw on invalid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'x', password: 'y' })).rejects.toThrow();
    });

    it('should throw on inactive user', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', email: 'x', passwordHash: 'h', isActive: false, kycStatus: 'pending', roles: [] });
      mockPasswordService.compare.mockResolvedValue(true);
      await expect(service.login({ email: 'x', password: 'y' })).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      mockUsersService.create.mockResolvedValue({
        id: 'new-user',
        email: 'new@test.com',
        username: 'newuser',
        kycStatus: 'pending',
      });

      const result = await service.register({ email: 'new@test.com', username: 'newuser', password: 'password123' });
      expect(result.accessToken).toBe('access-token');
      expect(mockRefreshTokens.create).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke all tokens when no refresh token provided', async () => {
      await service.logout('user-1');
      expect(mockRefreshTokens.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });
  });
});
