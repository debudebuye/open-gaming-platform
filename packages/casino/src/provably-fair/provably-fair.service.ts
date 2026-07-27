import { randomBytes, createHash } from 'crypto';

export class ProvablyFairService {
  generateServerSeed(): string {
    return randomBytes(32).toString('hex');
  }

  hashServerSeed(seed: string): string {
    return createHash('sha256').update(seed).digest('hex');
  }

  deriveOutcome(serverSeed: string, clientSeed: string, nonce: number): string {
    const data = `${serverSeed}:${clientSeed}:${nonce}`;
    return createHash('sha256').update(data).digest('hex');
  }
}
