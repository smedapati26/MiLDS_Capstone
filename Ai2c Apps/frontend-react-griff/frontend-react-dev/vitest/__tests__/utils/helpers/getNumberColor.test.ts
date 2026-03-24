import { describe, expect, it } from 'vitest';

import { Theme } from '@mui/material/styles';

import { getNumberColor } from '@utils/helpers';

const mockTheme = {
  palette: {
    error: {
      light: '#ff0000'
    }
  }
} as Theme;

describe('getNumberColor', () => {
  const threshold = 100;

  it('should return error color for values below threshold', () => {
    expect(getNumberColor(50, threshold, mockTheme)).toBe('#ff0000');
    expect(getNumberColor('75', threshold, mockTheme)).toBe('#ff0000');
    expect(getNumberColor(-10, threshold, mockTheme)).toBe('#ff0000');
  });

  it('should handle negative thresholds correctly', () => {
    const negativeThreshold = -50;
    expect(getNumberColor(-100, negativeThreshold, mockTheme)).toBe('#ff0000');
    expect(getNumberColor('-75', negativeThreshold, mockTheme)).toBe('#ff0000');
    expect(getNumberColor(-200, negativeThreshold, mockTheme)).toBe('#ff0000');
  });

  it('should handle negative to positive threshold comparisons', () => {
    expect(getNumberColor(-50, 0, mockTheme)).toBe('#ff0000');
    expect(getNumberColor('-25', 0, mockTheme)).toBe('#ff0000');
    expect(getNumberColor(25, 0, mockTheme)).toBeUndefined();
  });

  it('should return undefined for values above threshold', () => {
    expect(getNumberColor(150, threshold, mockTheme)).toBeUndefined();
    expect(getNumberColor('200', threshold, mockTheme)).toBeUndefined();
    expect(getNumberColor(1000, threshold, mockTheme)).toBeUndefined();
  });

  it('should return undefined for values equal to threshold', () => {
    expect(getNumberColor(100, threshold, mockTheme)).toBeUndefined();
    expect(getNumberColor('100', threshold, mockTheme)).toBeUndefined();
    expect(getNumberColor(-50, -50, mockTheme)).toBeUndefined();
  });

  it('should handle invalid inputs', () => {
    expect(getNumberColor(null, threshold, mockTheme)).toBeUndefined();
    expect(getNumberColor(undefined, threshold, mockTheme)).toBeUndefined();
    expect(getNumberColor('abc', threshold, mockTheme)).toBeUndefined();
    expect(getNumberColor('123abc', threshold, mockTheme)).toBeUndefined();
  });
});