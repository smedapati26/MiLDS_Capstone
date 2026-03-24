import { describe, expect, it } from 'vitest';

import { Theme } from '@mui/material/styles';

import { getChartColors, getVariant } from '@utils/helpers/chartHelpers';

const mockTheme: Theme = {
  palette: {
    graph: {
      purple: '#purple',
      cyan: '#cyan',
      teal: '#teal',
      pink: '#pink',
      green: '#green',
      blue: '#blue',
      magenta: '#magenta',
      yellow: '#yellow',
      teal2: '#teal2',
      cyan2: '#cyan2',
      orange: '#orange',
      purple2: '#purple2',
    },
  },
} as Theme;

describe('getVariant', () => {
  it('should return "top" for view "highest"', () => {
    const result = getVariant('highest');
    expect(result).toBe('top');
  });

  it('should return "bottom" for view "lowest"', () => {
    const result = getVariant('lowest');
    expect(result).toBe('bottom');
  });

  it('should return undefined for other views', () => {
    const result = getVariant('other');
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    const result = getVariant('');
    expect(result).toBeUndefined();
  });
});

describe('getChartColors', () => {
  it('should return purple for index 0', () => {
    const result = getChartColors(0, mockTheme);
    expect(result).toBe('#purple');
  });

  it('should return cyan for index 1', () => {
    const result = getChartColors(1, mockTheme);
    expect(result).toBe('#cyan');
  });

  it('should return teal for index 2', () => {
    const result = getChartColors(2, mockTheme);
    expect(result).toBe('#teal');
  });

  it('should return pink for index 3', () => {
    const result = getChartColors(3, mockTheme);
    expect(result).toBe('#pink');
  });

  it('should return green for index 4', () => {
    const result = getChartColors(4, mockTheme);
    expect(result).toBe('#green');
  });

  it('should return blue for index 5', () => {
    const result = getChartColors(5, mockTheme);
    expect(result).toBe('#blue');
  });

  it('should return magenta for index 6', () => {
    const result = getChartColors(6, mockTheme);
    expect(result).toBe('#magenta');
  });

  it('should return yellow for index 7', () => {
    const result = getChartColors(7, mockTheme);
    expect(result).toBe('#yellow');
  });

  it('should return teal2 for index 8', () => {
    const result = getChartColors(8, mockTheme);
    expect(result).toBe('#teal2');
  });

  it('should return cyan2 for index 9', () => {
    const result = getChartColors(9, mockTheme);
    expect(result).toBe('#cyan2');
  });

  it('should return orange for index 10', () => {
    const result = getChartColors(10, mockTheme);
    expect(result).toBe('#orange');
  });

  it('should return purple2 for index 11', () => {
    const result = getChartColors(11, mockTheme);
    expect(result).toBe('#purple2');
  });

  it('should cycle back to purple for index 12', () => {
    const result = getChartColors(12, mockTheme);
    expect(result).toBe('#purple');
  });

  it('should return cyan for index 13', () => {
    const result = getChartColors(13, mockTheme);
    expect(result).toBe('#cyan');
  });

  it('should return undefined for out of range indices', () => {
    const result = getChartColors(-1, mockTheme);
    expect(result).toBeUndefined();
  });
});
