import React from 'react';
import { describe, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui/models';

import {
  EquipmentManagerProvider,
  useEquipmentManagerContext,
} from '@features/equipment-manager/EquipmentManagerContext';

import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

describe('useEquipmentManagerContext', () => {
  beforeEach(() => (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test'));
  it('provides and updates context value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <EquipmentManagerProvider>{children}</EquipmentManagerProvider>
    );
    const { result } = renderHook(() => useEquipmentManagerContext(), { wrapper });
    const initial = {
      uic: '',
      component: '',
      displayName: '',
      level: 0,
      echelon: Echelon.ACTIVITY,
      shortName: '',
    };

    expect(result.current.filteredUnit).toStrictEqual(initial);

    act(() => {
      result.current.setFilteredUnit({
        uic: 'test_uic',
        component: 'test 1',
        displayName: 'test 1 display',
        level: 5,
        echelon: Echelon.ACTIVITY,
        shortName: 'short name',
      });
    });

    expect(result.current.filteredUnit).toStrictEqual({
      uic: 'test_uic',
      component: 'test 1',
      displayName: 'test 1 display',
      level: 5,
      echelon: Echelon.ACTIVITY,
      shortName: 'short name',
    });

    act(() => {
      result.current.resetFilteredUnit();
    });

    expect(result.current.filteredUnit).toStrictEqual(initial);
  });

  it('Throws error if used outside of EquipmentManagerProvider', () => {
    expect(() => {
      renderHook(() => useEquipmentManagerContext());
    }).toThrow('useEquipmentManager context must be within EquipmentManagerProvider');
  });
});
