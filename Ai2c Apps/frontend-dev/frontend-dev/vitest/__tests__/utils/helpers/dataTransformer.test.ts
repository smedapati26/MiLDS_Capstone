import { describe, expect, it } from 'vitest';

import {
  convertToSnakeCase,
  determineEvaluationStatus,
  getFullMonthName,
  mapResponseData,
  toCamelCase,
} from '@utils/helpers/dataTransformer';

describe('toCamelCase', () => {
  it('should convert snake_case to camelCase', () => {
    expect(toCamelCase('snake_case')).toBe('snakeCase');
  });

  it('should convert kebab-case to camelCase', () => {
    expect(toCamelCase('kebab-case')).toBe('kebabCase');
  });

  it('should handle strings with no delimiters', () => {
    expect(toCamelCase('simple')).toBe('simple');
  });

  it('should handle empty strings', () => {
    expect(toCamelCase('')).toBe('');
  });
});

describe('convertToSnakeCase', () => {
  it('should convert spaces to underscores and lowercase the string', () => {
    expect(convertToSnakeCase('Hello World')).toBe('hello_world');
  });

  it('should remove special characters except underscores', () => {
    expect(convertToSnakeCase('Hello, World!')).toBe('hello_world');
  });

  it('should handle strings with multiple spaces', () => {
    expect(convertToSnakeCase('Hello     World')).toBe('hello_world');
  });

  it('should handle strings with no spaces or special characters', () => {
    expect(convertToSnakeCase('HelloWorld')).toBe('helloworld');
  });

  it('should handle empty strings', () => {
    expect(convertToSnakeCase('')).toBe('');
  });

  it('should handle strings with numbers', () => {
    expect(convertToSnakeCase('Hello World 123')).toBe('hello_world_123');
  });

  it('should handle strings with only special characters', () => {
    expect(convertToSnakeCase('!@#$%^&*()')).toBe('');
  });

  it('should handle strings with multiple underscores', () => {
    expect(convertToSnakeCase('Hello_World')).toBe('hello_world');
  });
});

describe('mapResponseData', () => {
  it('should convert object keys to camelCase', () => {
    const input = {
      first_name: 'John',
      last_name: 'Doe',
    };

    const expected = {
      firstName: 'John',
      lastName: 'Doe',
    };

    expect(mapResponseData<typeof expected>(input)).toEqual(expected);
  });

  it('should convert keys in nested objects to camelCase', () => {
    const input = {
      user_data: {
        first_name: 'John',
        last_name: 'Doe',
      },
    };

    const expected = {
      userData: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    expect(mapResponseData<typeof expected>(input)).toEqual(expected);
  });

  it('should convert keys in arrays of objects to camelCase', () => {
    const input = [
      { first_name: 'John', last_name: 'Doe' },
      { first_name: 'Jane', last_name: 'Smith' },
    ];

    const expected = [
      { firstName: 'John', lastName: 'Doe' },
      { firstName: 'Jane', lastName: 'Smith' },
    ];

    expect(mapResponseData<typeof expected>(input)).toEqual(expected);
  });

  it('should handle non-object values gracefully', () => {
    expect(mapResponseData<string>('string')).toBe('string');
    expect(mapResponseData<number>(42)).toBe(42);
    expect(mapResponseData<null>(null)).toBe(null);
  });
});

describe('getFullMonthName', () => {
  it('should return the full month name for valid abbreviations', () => {
    expect(getFullMonthName('JAN')).toBe('January');
    expect(getFullMonthName('FEB')).toBe('February');
    expect(getFullMonthName('MAR')).toBe('March');
    expect(getFullMonthName('DEC')).toBe('December');
  });

  it('should return "Unknown" for "UNK"', () => {
    expect(getFullMonthName('UNK')).toBe('Unknown');
  });

  it('should return "Invalid month abbreviation" for invalid abbreviations', () => {
    expect(getFullMonthName('ABC')).toBe('Invalid month abbreviation');
    expect(getFullMonthName('XYZ')).toBe('Invalid month abbreviation');
  });
});

describe('determineEvaluationStatus', () => {
  it('returns Birth Month Not Set', () => {
    expect(determineEvaluationStatus('Birth Month Not Set', '2024-01-01')).toEqual({
      status: 'info',
      label: 'Birth Month Not Set',
    });
  });

  it('returns Met for "In Window - Complete"', () => {
    expect(determineEvaluationStatus('In Window - Complete', '2024-01-01')).toEqual({
      status: 'Met',
      label: 'Met',
    });
  });

  it('returns warning with days remaining for "In Window - X Days Remaining"', () => {
    expect(determineEvaluationStatus('In Window - 5 Days Remaining', '2024-01-01')).toEqual({
      status: 'warning',
      label: 'Due in 5 days',
    });
  });

  it('returns warning with fallback label when days remaining cannot be parsed', () => {
    expect(determineEvaluationStatus('In Window - Days Remaining', '2024-01-01')).toEqual({
      status: 'warning',
      label: 'Due Soon',
    });
  });

  it('returns Met for "Not in Window - Complete"', () => {
    expect(determineEvaluationStatus('Not In Window - Complete', '2024-01-01')).toEqual({
      status: 'Met',
      label: 'Met',
    });
  });

  it('returns error with correct overdue day count', () => {
    const mockToday = new Date('2024-02-10');
    vi.setSystemTime(mockToday);

    const result = determineEvaluationStatus('Overdue', '2024-02-05');

    expect(result).toEqual({
      status: 'error',
      label: 'Overdue by 5 days',
    });

    vi.useRealTimers();
  });

  it('returns fallback info status for unknown statuses', () => {
    expect(determineEvaluationStatus('Some Random Status', '2024-01-01')).toEqual({
      status: 'info',
      label: 'Some Random Status',
    });
  });
});
