/* eslint-disable @typescript-eslint/ban-ts-comment */
import { jwtDecode } from 'jwt-decode';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { decodeJwt, getTokenExpiryTime, isTokenExpired } from '@utils/jwt';

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

describe('JWT Utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  it('decodeJwt returns decoded token when jwt exists', () => {
    const mockDecoded = { sub: '123', exp: 999999 };
    // @ts-expect-error
    (jwtDecode as unknown).mockReturnValue(mockDecoded);

    const result = decodeJwt('token123');

    expect(jwtDecode).toHaveBeenCalledWith('token123');
    expect(result).toEqual(mockDecoded);
  });

  it('decodeJwt returns undefined when jwt is null', () => {
    const result = decodeJwt(null);
    expect(result).toBeUndefined();
  });

  it('decodeJwt reads from sessionStorage when no argument passed', () => {
    sessionStorage.setItem('jwt', 'stored-token');

    const mockDecoded = { foo: 'bar' };
    // @ts-expect-error
    (jwtDecode as unknown).mockReturnValue(mockDecoded);

    const result = decodeJwt();

    expect(jwtDecode).toHaveBeenCalledWith('stored-token');
    expect(result).toEqual(mockDecoded);
  });

  it('getTokenExpiryTime returns exp when present', () => {
    const mockDecoded = { exp: 123456 };
    // @ts-expect-error
    (jwtDecode as unknown).mockReturnValue(mockDecoded);
    sessionStorage.setItem('jwt', 'abc');

    const result = getTokenExpiryTime();
    expect(result).toBe(123456);
  });

  it('getTokenExpiryTime returns current time when no exp', () => {
    const fakeNow = 1700000000000; // ms
    vi.spyOn(Date, 'now').mockReturnValue(fakeNow);

    // @ts-expect-error
    (jwtDecode as unknown).mockReturnValue({});
    sessionStorage.setItem('jwt', 'abc');

    const result = getTokenExpiryTime();
    expect(result).toBe(Math.floor(fakeNow / 1000));
  });

  it('isTokenExpired returns true when current time >= exp', () => {
    const fakeNow = 1700000000000;
    vi.spyOn(Date, 'now').mockReturnValue(fakeNow);

    const nowSec = Math.floor(fakeNow / 1000);
    // @ts-expect-error
    (jwtDecode as unknown).mockReturnValue({ exp: nowSec - 1 });
    sessionStorage.setItem('jwt', 'abc');

    expect(isTokenExpired()).toBe(true);
  });

  it('isTokenExpired returns false when current time < exp', () => {
    const fakeNow = 1700000000000;
    vi.spyOn(Date, 'now').mockReturnValue(fakeNow);

    const nowSec = Math.floor(fakeNow / 1000);
    // @ts-expect-error
    (jwtDecode as unknown).mockReturnValue({ exp: nowSec + 100 });
    sessionStorage.setItem('jwt', 'abc');

    expect(isTokenExpired()).toBe(false);
  });

  it('isTokenExpired respects minOffset (minutes)', () => {
    const fakeNow = 1700000000000;
    vi.spyOn(Date, 'now').mockReturnValue(fakeNow);

    const nowSec = Math.floor(fakeNow / 1000);
    // @ts-expect-error
    (jwtDecode as unknown).mockReturnValue({ exp: nowSec + 30 });
    sessionStorage.setItem('jwt', 'abc');

    expect(isTokenExpired(1)).toBe(true);
  });
});
