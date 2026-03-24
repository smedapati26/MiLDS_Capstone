import { Provider } from 'react-redux';
import { useInitializeUnits } from 'src/hooks/useInitializeUnits';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { mapUnitsWithTaskforceHierarchy } from '@utils/helpers';

import type { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import type { IAppUser } from '@store/griffin_api/users/models';
import { useAppDispatch } from '@store/hooks';
import { setAllUnits, setCurrentUnit } from '@store/slices/appSettingsSlice';
import { store } from '@store/store';

// Mock the dependencies
vi.mock('@store/griffin_api/auto_dsr/slices');
vi.mock('@utils/helpers');
vi.mock('@store/hooks');

const mockUseGetUnitsQuery = useGetUnitsQuery as unknown as ReturnType<typeof vi.fn>;
const mockMapUnitsWithTaskforceHierarchy = mapUnitsWithTaskforceHierarchy as unknown as ReturnType<typeof vi.fn>;
const mockUseAppDispatch = useAppDispatch as unknown as ReturnType<typeof vi.fn>;

const mockDispatch = vi.fn();
mockUseAppDispatch.mockReturnValue(mockDispatch);

const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;

describe('useInitializeUnits', () => {
  const mockUnits: IUnitBrief[] = [
    {
      uic: 'UNIT1',
      name: 'Unit 1',
      echelon: 'test',
      component: 'test',
      level: 'test',
      displayName: 'test',
      shortName: 'test',
    } as unknown as IUnitBrief,
    {
      uic: 'TEST_UIC',
      name: 'Unit 2',
      echelon: 'test',
      component: 'test',
      level: 'test',
      displayName: 'test',
      shortName: 'test',
    } as unknown as IUnitBrief,
  ];
  const mockAppUser: IAppUser = { unit: mockUnits[1] }as IAppUser;
  const mockMappedUnits = [
    { uic: 'UNIT1', name: 'Mapped Unit 1' },
    { uic: 'TEST_UIC', name: 'Mapped Unit 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockMapUnitsWithTaskforceHierarchy.mockReturnValue(mockMappedUnits);
  });

  it('returns empty units and false isSuccess when query is not successful', () => {
    mockUseGetUnitsQuery.mockReturnValue({ data: undefined, isSuccess: false });

    const { result } = renderHook(() => useInitializeUnits(mockAppUser), { wrapper });

    expect(result.current.units).toEqual([]);
    expect(result.current.isSuccess).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('returns empty units when query is successful but no data', () => {
    mockUseGetUnitsQuery.mockReturnValue({ data: undefined, isSuccess: true });

    const { result } = renderHook(() => useInitializeUnits(mockAppUser), { wrapper });

    expect(result.current.units).toEqual([]);
    expect(result.current.isSuccess).toBe(true);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('sets all units but not current unit when no matching unit for appUser', () => {
    const nonMatchingUnits = [
      {
        uic: 'OTHER_UIC',
        name: 'Other Unit',
        echelon: 'test',
        component: 'test',
        level: 'test',
        displayName: 'test',
        shortName: 'test',
      } as unknown as IUnitBrief,
    ];
    mockUseGetUnitsQuery.mockReturnValue({ data: nonMatchingUnits, isSuccess: true });
    mockMapUnitsWithTaskforceHierarchy.mockReturnValue([{ uic: 'OTHER_UIC', name: 'Mapped Other' }]);

    const { result } = renderHook(() => useInitializeUnits(mockAppUser), { wrapper });

    expect(result.current.units).toEqual([{ uic: 'OTHER_UIC', name: 'Mapped Other' }]);
    expect(result.current.isSuccess).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(setAllUnits([{ uic: 'OTHER_UIC', name: 'Mapped Other' }]));
    expect(mockDispatch).not.toHaveBeenCalledWith(setCurrentUnit(expect.anything()));
  });

  it('sets all units and current unit when matching unit for appUser is found', () => {
    mockUseGetUnitsQuery.mockReturnValue({ data: mockUnits, isSuccess: true });

    const { result } = renderHook(() => useInitializeUnits(mockAppUser), { wrapper });

    expect(result.current.units).toEqual(mockMappedUnits);
    expect(result.current.isSuccess).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(setAllUnits(mockMappedUnits));
    expect(mockDispatch).toHaveBeenCalledWith(setCurrentUnit(mockUnits[1])); // The unit with uic 'TEST_UIC'
  });
});
