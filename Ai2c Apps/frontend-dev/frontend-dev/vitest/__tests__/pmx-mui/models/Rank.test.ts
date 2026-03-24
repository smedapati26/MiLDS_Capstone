import { getRankOptions, Rank } from '@pmx-mui-models/Rank';

describe('getRankOptions', () => {
  it('should return an array of EnumOption objects', () => {
    const options = getRankOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBe(Object.keys(Rank).length);
    options.forEach((option) => {
      expect(option).toHaveProperty('label');
      expect(option).toHaveProperty('value');
      expect(typeof option.label).toBe('string');
      expect(typeof option.value).toBe('string');
    });
  });

  it('should return options with titlecased labels', () => {
    const options = getRankOptions();
    options.forEach((option) => {
      const expectedLabel = option.label
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      expect(option.label).toBe(expectedLabel);
    });
  });

  it('should return options with correct values from Rank enum', () => {
    const options = getRankOptions();
    options.forEach((option) => {
      expect(Object.values(Rank)).toContain(option.value);
    });
  });
});
