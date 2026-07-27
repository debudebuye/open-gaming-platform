import { getMultiplier, calculatePayout } from './payout-table';

describe('PayoutTable', () => {
  describe('getMultiplier', () => {
    it('should return 3x for 1/1', () => {
      expect(getMultiplier(1, 1)).toBe(3);
    });

    it('should return 300x for 5/5', () => {
      expect(getMultiplier(5, 5)).toBe(300);
    });

    it('should return 0 for no match', () => {
      expect(getMultiplier(5, 3)).toBe(0);
    });

    it('should return 10000x for 10/10', () => {
      expect(getMultiplier(10, 10)).toBe(10000);
    });
  });

  describe('calculatePayout', () => {
    it('should calculate 5-spot payout', () => {
      expect(calculatePayout(10, 5, 5)).toBe(3000);
    });

    it('should return 0 for losing ticket', () => {
      expect(calculatePayout(10, 5, 2)).toBe(0);
    });
  });
});
