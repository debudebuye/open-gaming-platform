# @ogp/casino

Casino game plugin foundation. Provides the interfaces that all casino games must implement.

## Exports

- `ICasinoGame` — Core plugin interface every casino game must implement
- `RTPConfig` — Return-to-player configuration
- `ProvablyFairService` — Shared seed commit/reveal logic for provably fair games
- `RoundStatus` enum

## Adding a New Casino Game

1. Create a new package (e.g., `packages/slots-classic`)
2. Implement `ICasinoGame`:

```typescript
import { ICasinoGame, RoundInitResult, RoundResolveResult } from '@ogp/casino';

export class ClassicSlotsGame implements ICasinoGame {
  readonly gameId = 'slots-classic';
  readonly gameName = 'Classic Slots';
  readonly gameType = 'SLOTS';

  async initRound(params) { ... }
  async resolveRound(params) { ... }
  getRTPConfig() { return { rtp: 96.5, variance: 'MEDIUM' }; }
  validateBet(params) { ... }
}
```

3. Register the plugin in `gaming-api`:

```typescript
CasinoModule.forPlugins([new ClassicSlotsGame()])
```
