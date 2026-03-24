/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from 'vitest';

import { AMTPFilterProvider, useAMTPFilterContext } from '@context/AMTPFilterProvider';
import { act, renderHook } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

describe('AMTPFilterProvider Context', () => {
  it('provides default values', () => {
    const { result } = renderHook(() => useAMTPFilterContext(), { wrapper: AMTPFilterProvider });

    expect(result.current.selectedFilterMOS).toEqual([]);
    expect(result.current.skillLevel).toEqual([]);
    expect(result.current.daysUntilDue).toBe('');
    expect(result.current.isCheckboxChecked).toBe(false);
    expect(result.current.selectedUnit).toBeUndefined();
  });

  it('updates selectedFilterMOS state', () => {
    const { result } = renderHook(() => useAMTPFilterContext(), { wrapper: AMTPFilterProvider });

    act(() => {
      result.current.setSelectedFilterMOS([{ label: 'MOS 1', value: 'MOS1' }]);
    });

    expect(result.current.selectedFilterMOS).toEqual([{ label: 'MOS 1', value: 'MOS1' }]);
  });

  it('updates skillLevel state', () => {
    const { result } = renderHook(() => useAMTPFilterContext(), { wrapper: AMTPFilterProvider });

    act(() => {
      result.current.setSkillLevel([{ label: 'SL1', value: 'SL1' }]);
    });

    expect(result.current.skillLevel).toEqual([{ label: 'SL1', value: 'SL1' }]);
  });

  it('updates daysUntilDue state', () => {
    const { result } = renderHook(() => useAMTPFilterContext(), { wrapper: AMTPFilterProvider });

    act(() => {
      result.current.setDaysUntilDue('30');
    });

    expect(result.current.daysUntilDue).toBe('30');
  });

  it('updates isCheckboxChecked state', () => {
    const { result } = renderHook(() => useAMTPFilterContext(), { wrapper: AMTPFilterProvider });

    act(() => {
      result.current.setIsCheckboxChecked(true);
    });

    expect(result.current.isCheckboxChecked).toBe(true);
  });

  it('updates selectedUnit state', () => {
    const mockUnit = {
      uic: '123ABC',
      shortName: 'Unit 123',
      displayName: 'Unit 123 Display',
      echelon: 1,
      parentUic: 'Parent123',
      nickName: 'Nick 123',
      component: 'Component A',
      state: 'CA',
      level: 1,
    };

    const { result } = renderHook(() => useAMTPFilterContext(), { wrapper: AMTPFilterProvider });

    act(() => {
      // @ts-expect-error
      result.current.setSelectedUnit(mockUnit);
    });

    expect(result.current.selectedUnit).toEqual(mockUnit);
  });

  it('clears all filters correctly', () => {
    const { result } = renderHook(() => useAMTPFilterContext(), { wrapper: AMTPFilterProvider });

    act(() => {
      result.current.setSelectedFilterMOS([{ label: 'MOS 1', value: 'MOS1' }]);
      result.current.setSkillLevel([{ label: 'SL1', value: 'SL1' }]);
      result.current.setDaysUntilDue('30');
      result.current.setIsCheckboxChecked(true);
      result.current.setSelectedUnit({
        uic: '123ABC',
        shortName: 'Unit 123',
        displayName: 'Unit 123 Display',
        echelon: Echelon.UNKNOWN,
        parentUic: 'Parent123',
        nickName: 'Nick 123',
        component: 'Component A',
        state: 'CA',
        level: 1,
      });
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.selectedFilterMOS).toEqual([]);
    expect(result.current.skillLevel).toEqual([]);
    expect(result.current.daysUntilDue).toBe('');
    expect(result.current.isCheckboxChecked).toBe(false);
    expect(result.current.selectedUnit).toEqual({
      uic: '',
      shortName: '',
      displayName: '',
      echelon: Echelon.UNKNOWN,
      parentUic: '',
      nickName: '',
      component: '',
      state: '',
      level: -1,
    });
  });
});
