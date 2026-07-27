import { ProvablyFairService } from './provably-fair.service';

describe('ProvablyFairService', () => {
  let service: ProvablyFairService;

  beforeEach(() => {
    service = new ProvablyFairService();
  });

  it('should generate a server seed', () => {
    const seed = service.generateServerSeed();
    expect(seed).toBeDefined();
    expect(seed.length).toBe(64); // 32 bytes hex
  });

  it('should hash a server seed', () => {
    const seed = 'abc123';
    const hash = service.hashServerSeed(seed);
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 hex
  });

  it('should produce consistent hashes', () => {
    const seed = 'test-seed';
    const hash1 = service.hashServerSeed(seed);
    const hash2 = service.hashServerSeed(seed);
    expect(hash1).toBe(hash2);
  });

  it('should derive outcome deterministically', () => {
    const outcome1 = service.deriveOutcome('server', 'client', 1);
    const outcome2 = service.deriveOutcome('server', 'client', 1);
    expect(outcome1).toBe(outcome2);
  });

  it('should produce different outcomes for different nonces', () => {
    const outcome1 = service.deriveOutcome('server', 'client', 1);
    const outcome2 = service.deriveOutcome('server', 'client', 2);
    expect(outcome1).not.toBe(outcome2);
  });
});
