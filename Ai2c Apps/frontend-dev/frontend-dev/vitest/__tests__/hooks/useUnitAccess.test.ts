import { describe, expect, it, vi } from 'vitest';

import useUnitAccess from '@hooks/useUnitAccess';
import { renderHook } from '@testing-library/react';

import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

describe('useUnitAccess', () => {
  beforeEach(() => {
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
  });
  it('returns true when user has the role for currentUic', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockImplementation((selectorFn) =>
      selectorFn({
        appSettings: {
          appUser: {
            unitRoles: {
              viewer: ['UIC123'],
              manager: ['UIC456'],
            },
          },
          currentUic: 'UIC123',
        },
      }),
    );

    const { result } = renderHook(() => useUnitAccess());
    expect(result.current.hasRole('viewer')).toBe(true);
    expect(result.current.hasRole('manager')).toBe(false);
  });

  it('returns false when role array is missing or does not include currentUic', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockImplementation((selectorFn) =>
      selectorFn({
        appSettings: {
          appUser: {
            unitRoles: {
              viewer: [],
            },
          },
          currentUic: 'UIC999',
        },
      }),
    );

    const { result } = renderHook(() => useUnitAccess());
    expect(result.current.hasRole('viewer')).toBe(false);
  });

  it('returns false when appUser is undefined', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockImplementation((selectorFn) =>
      selectorFn({
        appSettings: {
          appUser: undefined,
          currentUic: 'UIC123',
        },
      }),
    );

    const { result } = renderHook(() => useUnitAccess());
    expect(result.current.hasRole('viewer')).toBe(false);
  });
});
