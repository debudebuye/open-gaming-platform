import { validateSlip, calculatePayout } from './slip-validator';

describe('SlipValidator', () => {
  const validLines = [
    { selectionId: 'sel-1', odds: 1.95 },
    { selectionId: 'sel-2', odds: 2.1 },
  ];

  describe('validateSlip', () => {
    it('should pass for valid slip', () => {
      expect(() => validateSlip({ lines: validLines, stake: 10 })).not.toThrow();
    });

    it('should throw for empty lines', () => {
      expect(() => validateSlip({ lines: [], stake: 10 })).toThrow();
    });

    it('should throw for stake below minimum', () => {
      expect(() => validateSlip({ lines: validLines, stake: 0.5, minStake: 1 })).toThrow();
    });

    it('should throw for stake above maximum', () => {
      expect(() => validateSlip({ lines: validLines, stake: 200000, maxStake: 100000 })).toThrow();
    });

    it('should throw for duplicate selections', () => {
      expect(() => validateSlip({
        lines: [{ selectionId: 'sel-1', odds: 1.95 }, { selectionId: 'sel-1', odds: 2.1 }],
        stake: 10,
      })).toThrow();
    });

    it('should throw for invalid odds', () => {
      expect(() => validateSlip({
        lines: [{ selectionId: 'sel-1', odds: 1.0 }],
        stake: 10,
      })).toThrow();
    });
  });

  describe('calculatePayout', () => {
    it('should calculate single bet payout', () => {
      expect(calculatePayout(10, [{ odds: 2.0 }])).toBe(20);
    });

    it('should calculate accumulator payout', () => {
      expect(calculatePayout(10, [{ odds: 2.0 }, { odds: 1.5 }])).toBe(30);
    });
  });
});
