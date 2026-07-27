export type OddsFormat = 'decimal' | 'fractional' | 'american';

export function decimalToFractional(decimal: number): string {
  const fractional = decimal - 1;
  const gcd = computeGcd(Math.round(fractional * 100), 100);
  const numerator = Math.round(fractional * 100) / gcd;
  const denominator = 100 / gcd;
  return `${numerator}/${denominator}`;
}

export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  }
  return Math.round(-100 / (decimal - 1));
}

export function americanToDecimal(american: number): number {
  if (american > 0) {
    return american / 100 + 1;
  }
  return 100 / Math.abs(american) + 1;
}

export function fractionalToDecimal(fractional: string): number {
  const [num, den] = fractional.split('/').map(Number);
  return num / den + 1;
}

export function toDecimal(odds: number, format: OddsFormat): number {
  switch (format) {
    case 'decimal': return odds;
    case 'fractional': return fractionalToDecimal(String(odds));
    case 'american': return americanToDecimal(odds);
    default: return odds;
  }
}

function computeGcd(a: number, b: number): number {
  return b === 0 ? a : computeGcd(b, a % b);
}
