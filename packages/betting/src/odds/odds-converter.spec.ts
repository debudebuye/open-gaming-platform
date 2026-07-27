import {
  decimalToFractional,
  decimalToAmerican,
  americanToDecimal,
  fractionalToDecimal,
} from './odds-converter';

describe('OddsConverter', () => {
  describe('decimalToFractional', () => {
    it('should convert 1.95 to 19/20', () => {
      expect(decimalToFractional(1.95)).toBe('19/20');
    });

    it('should convert 2.0 to 1/1', () => {
      expect(decimalToFractional(2.0)).toBe('1/1');
    });

    it('should convert 3.5 to 5/2', () => {
      expect(decimalToFractional(3.5)).toBe('5/2');
    });
  });

  describe('decimalToAmerican', () => {
    it('should convert 2.0 to +100', () => {
      expect(decimalToAmerican(2.0)).toBe(100);
    });

    it('should convert 1.5 to -200', () => {
      expect(decimalToAmerican(1.5)).toBe(-200);
    });

    it('should convert 3.0 to +200', () => {
      expect(decimalToAmerican(3.0)).toBe(200);
    });
  });

  describe('americanToDecimal', () => {
    it('should convert +100 to 2.0', () => {
      expect(americanToDecimal(100)).toBe(2.0);
    });

    it('should convert -200 to 1.5', () => {
      expect(americanToDecimal(-200)).toBe(1.5);
    });
  });

  describe('fractionalToDecimal', () => {
    it('should convert 1/1 to 2.0', () => {
      expect(fractionalToDecimal('1/1')).toBe(2.0);
    });

    it('should convert 19/20 to 1.95', () => {
      expect(fractionalToDecimal('19/20')).toBeCloseTo(1.95);
    });
  });
});
