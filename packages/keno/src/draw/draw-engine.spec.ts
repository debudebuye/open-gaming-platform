import { drawNumbers, countMatches } from './draw-engine';

describe('DrawEngine', () => {
  describe('drawNumbers', () => {
    it('should draw 20 numbers from 1-80', () => {
      const drawn = drawNumbers(20, 80);
      expect(drawn).toHaveLength(20);
      expect(new Set(drawn).size).toBe(20);
      for (const num of drawn) {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(80);
      }
    });

    it('should return sorted numbers', () => {
      const drawn = drawNumbers(20, 80);
      for (let i = 1; i < drawn.length; i++) {
        expect(drawn[i]).toBeGreaterThanOrEqual(drawn[i - 1]);
      }
    });

    it('should not have duplicates', () => {
      const drawn = drawNumbers(20, 80);
      expect(new Set(drawn).size).toBe(20);
    });
  });

  describe('countMatches', () => {
    it('should count matches correctly', () => {
      expect(countMatches([1, 2, 3, 4, 5], [3, 4, 5, 6, 7])).toBe(3);
    });

    it('should return 0 for no matches', () => {
      expect(countMatches([1, 2, 3], [4, 5, 6])).toBe(0);
    });

    it('should return all matched', () => {
      expect(countMatches([1, 2, 3], [1, 2, 3])).toBe(3);
    });
  });
});
