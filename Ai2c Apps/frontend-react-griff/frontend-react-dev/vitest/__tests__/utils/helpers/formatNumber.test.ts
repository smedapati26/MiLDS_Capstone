import { describe, expect, it } from 'vitest';

import { Theme } from '@mui/material/styles';

import { getNumberColor } from '@utils/helpers/formatNumber';

describe('getNumberColor', () => {
  const mockTheme: Theme = {
    palette: {
      error: {
        light: '#FF6C6C',
      },
    },
  } as Theme;

  it('should return undefined for null value', () => {
    const result = getNumberColor(null, 10, mockTheme);
    expect(result).toBeUndefined();
  });

  it('should return undefined for undefined value', () => {
    const result = getNumberColor(undefined, 10, mockTheme);
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-numeric string', () => {
    const result = getNumberColor('abc', 10, mockTheme);
    expect(result).toBeUndefined();
  });

  it('should return undefined for NaN', () => {
    const result = getNumberColor(NaN, 10, mockTheme);
    expect(result).toBeUndefined();
  });

  it('should return error light color for number below threshold', () => {
    const result = getNumberColor(5, 10, mockTheme);
    expect(result).toBe('#FF6C6C');
  });

  it('should return undefined for number at threshold', () => {
    const result = getNumberColor(10, 10, mockTheme);
    expect(result).toBeUndefined();
  });

  it('should return undefined for number above threshold', () => {
    const result = getNumberColor(15, 10, mockTheme);
    expect(result).toBeUndefined();
  });

  it('should handle string numbers correctly', () => {
    const result = getNumberColor('5', 10, mockTheme);
    expect(result).toBe('#FF6C6C');
  });

  it('should handle string numbers at threshold', () => {
    const result = getNumberColor('10', 10, mockTheme);
    expect(result).toBeUndefined();
  });

  it('should handle string numbers above threshold', () => {
    const result = getNumberColor('15', 10, mockTheme);
    expect(result).toBeUndefined();
  });
});
