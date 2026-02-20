/** Golden Ratio constant */
export const PHI = 1.618033988749895;

/** Raise φ to the nth power (negative n → φ⁻ⁿ) */
export function phi(n: number): number {
  return Math.pow(PHI, n);
}

/** φⁿ as a rem string (base 16px) */
export function phiRem(n: number): string {
  const px = 4 * Math.pow(PHI, n - 1);
  return `${(Math.round(px * 16) / 16 / 16).toFixed(4)}rem`;
}

/**
 * Split a value into φ-weighted parts.
 * Returns [major, minor] where major/minor ≈ φ.
 */
export function phiSplit(total: number): [number, number] {
  const major = total / PHI;
  return [total - major, major];
}
