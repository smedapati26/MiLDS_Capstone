import { beforeEach, describe, expect, it, vi } from 'vitest';

import useInitializeUser from '@hooks/useInitializeUser';
import { renderHook } from '@testing-library/react';

import { Unit } from '@ai2c/pmx-mui';

import { IAppUser } from '@store/amap_ai/user/models';
import { useAppDispatch } from '@store/hooks';
import { setAllUnits, setAppUser, setCurrentUnit } from '@store/slices/appSettingsSlice';

vi.mock('@store/hooks', () => ({
  useAppDispatch: vi.fn(),
}));

vi.mock('@store/slices/appSettingsSlice', () => ({
  setAppUser: vi.fn(),
  setAllUnits: vi.fn(),
  setCurrentUnit: vi.fn(),
}));

describe('useInitializeUser', () => {
  let dispatchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();

    dispatchMock = vi.fn();
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(dispatchMock);
  });

  it('dispatches setAppUser and initializes units correctly', () => {
    const appUser = {
      uic: 'UIC1',
      unit: undefined,
    };

    const units = [
      { uic: 'UIC1', level: 1 },
      { uic: 'ROOT', level: 0 },
    ];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    renderHook(() => useInitializeUser(appUser as IAppUser, units as Unit[], true));

    expect(dispatchMock).toHaveBeenCalledWith(setAppUser(appUser));
    expect(dispatchMock).toHaveBeenCalledWith(setCurrentUnit(units[0]));
    expect(dispatchMock).toHaveBeenCalledWith(setAllUnits(expect.any(Array)));
  });

  it('uses defaultUnit when appUser.unit is an object', () => {
    const defaultUnit = { uic: 'DEF', level: 2 };

    const appUser = {
      uic: 'UIC1',
      unit: defaultUnit,
    };

    const units = [
      { uic: 'UIC1', level: 1 },
      { uic: 'ROOT', level: 0 },
    ];

    renderHook(() => useInitializeUser(appUser as IAppUser, units as Unit[], true));

    expect(dispatchMock).toHaveBeenCalledWith(setCurrentUnit(defaultUnit));
  });

  it('falls back to level 0 unit when no match found', () => {
    const appUser = {
      uic: 'UNKNOWN',
      unit: undefined,
    };

    const units = [
      { uic: 'A', level: 1 },
      { uic: 'ROOT', level: 0 },
    ];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    renderHook(() => useInitializeUser(appUser, units as Unit[], true));

    expect(dispatchMock).toHaveBeenCalledWith(setCurrentUnit(units[1]));
  });

  it('does nothing when isSuccess is false', () => {
    const appUser = { uic: 'UIC1' };
    const units = [{ uic: 'UIC1', level: 1 }];

    renderHook(() => useInitializeUser(appUser as IAppUser, units as Unit[], false));

    expect(dispatchMock).toHaveBeenCalledWith(setAppUser(appUser));
  });
});
