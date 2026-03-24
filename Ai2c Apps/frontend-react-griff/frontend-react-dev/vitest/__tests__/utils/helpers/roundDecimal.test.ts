import { describe, expect, it } from 'vitest';

import { roundDecimal } from '@utils/helpers';

describe('roundDecimal', () => {
  it('should handle whole numbers without adding decimals', () => {
    expect(roundDecimal(1200)).toBe('1200');
    expect(roundDecimal('1200')).toBe('1200');
  });

  it('should round decimal numbers to three decimal places if requested', () => {
    expect(roundDecimal(1200.56789, 3)).toBe('1200.568');
    expect(roundDecimal('1200.56789', 3)).toBe('1200.568');
    expect(roundDecimal(1200.000000000002, 3)).toBe('1200.000');
  });

  it('should round decimal numbers to one decimal place if requested', () => {
    expect(roundDecimal(1200.56789, 1)).toBe('1200.6');
    expect(roundDecimal('1200.56789', 1)).toBe('1200.6');
    expect(roundDecimal(1200.000000000002, 1)).toBe('1200.0');
  });

  it('should round decimal numbers to two decimal places by default', () => {
    expect(roundDecimal(1200.56789)).toBe('1200.57');
    expect(roundDecimal('1200.56789')).toBe('1200.57');
    expect(roundDecimal(1200.000000000002)).toBe('1200.00');
  });

  it('should handle rounding edge cases correctly', () => {
    expect(roundDecimal(1200.005)).toBe('1200.01'); // Round up
    expect(roundDecimal(1200.004)).toBe('1200.00'); // Round down
    expect(roundDecimal(-1200.005)).toBe('-1200.01'); // Negative round up
    expect(roundDecimal(-1200.004)).toBe('-1200.00'); // Negative round down
  });

  it('should handle null and undefined values', () => {
    expect(roundDecimal(null)).toBeUndefined();
    expect(roundDecimal(undefined)).toBeUndefined();
  });

  it('should handle non-numeric strings', () => {
    expect(roundDecimal('abc')).toBe('abc');
    expect(roundDecimal('123abc')).toBe('123abc');
  });

  it('should handle zero values correctly', () => {
    expect(roundDecimal(0)).toBe('0');
    expect(roundDecimal('0')).toBe('0');
    expect(roundDecimal(0.0)).toBe('0');
    expect(roundDecimal(0.001)).toBe('0.00');
  });

  it('should round to zero decimal places correctly', () => {
    expect(roundDecimal(1.5, 0)).toBe('2');
    expect(roundDecimal(1.4, 0)).toBe('1');
    expect(roundDecimal(-1.5, 0)).toBe('-1');
    expect(roundDecimal(-1.4, 0)).toBe('-1');
    expect(roundDecimal(123.456, 0)).toBe('123');
  });
});
