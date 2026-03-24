import { describe, expect, it, vi } from 'vitest';

import { generateUniqueId } from '@utils/helpers';

describe('generateUniqueId', () => {
  it('should return a string', () => {
    const id = generateUniqueId();
    expect(typeof id).toBe('string');
  });

  it('should generate an ID in the format "timestamp-randomValue"', () => {
    // Mock Date.now to return a fixed timestamp
    const mockTimestamp = 1640995200000; // Example timestamp
    vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

    // Mock crypto.getRandomValues to return a fixed value
    const mockRandomValue = 123456789;
    const mockUint32Array = new Uint32Array([mockRandomValue]);
    vi.spyOn(crypto, 'getRandomValues').mockReturnValue(mockUint32Array);

    const id = generateUniqueId();
    expect(id).toBe(`${mockTimestamp}-${mockRandomValue}`);

    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should generate unique IDs on multiple calls', () => {
    // Mock Date.now to return different timestamps
    let callCount = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => 1640995200000 + callCount++);

    // Mock crypto.getRandomValues to return different values
    const mockValues = [111, 222, 333];
    let valueIndex = 0;
    vi.spyOn(crypto, 'getRandomValues').mockImplementation(() => {
      const value = mockValues[valueIndex % mockValues.length];
      valueIndex++;
      return new Uint32Array([value]);
    });

    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    const id3 = generateUniqueId();

    expect(id1).toBe('1640995200000-111');
    expect(id2).toBe('1640995200001-222');
    expect(id3).toBe('1640995200002-333');

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);

    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should use current timestamp and random value correctly', () => {
    // Spy on Date.now and crypto.getRandomValues
    const dateNowSpy = vi.spyOn(Date, 'now');
    const cryptoSpy = vi.spyOn(crypto, 'getRandomValues');

    generateUniqueId();

    expect(dateNowSpy).toHaveBeenCalledTimes(1);
    expect(cryptoSpy).toHaveBeenCalledTimes(1);
    const cryptoCallArg = cryptoSpy.mock.calls[0][0];
    expect(cryptoCallArg).toBeInstanceOf(Uint32Array);
    expect((cryptoCallArg as Uint32Array).length).toBe(1);

    // Restore mocks
    vi.restoreAllMocks();
  });
});
