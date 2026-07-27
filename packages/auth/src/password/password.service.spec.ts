import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('should hash a password', async () => {
    const hash = await service.hash('password123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('password123');
    expect(hash.length).toBeGreaterThan(50);
  });

  it('should return true for matching password', async () => {
    const hash = await service.hash('password123');
    const result = await service.compare('password123', hash);
    expect(result).toBe(true);
  });

  it('should return false for non-matching password', async () => {
    const hash = await service.hash('password123');
    const result = await service.compare('wrongpassword', hash);
    expect(result).toBe(false);
  });
});
