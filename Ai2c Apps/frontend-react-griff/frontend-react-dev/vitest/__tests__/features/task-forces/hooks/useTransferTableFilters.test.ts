import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useTransferTableFilters } from '@features/task-forces/hooks/useTransferTableFilters';

describe('useTransferTableFilters', () => {
  const mockData = [
    { serial: '1', model: 'M1', unit: 'U1', status: 'active' },
    { serial: '2', model: 'M2', unit: 'U1', status: 'active' },
    { serial: '3', model: 'M1', unit: 'U2', status: 'active' },
  ];

  const mockLeftData = [...mockData];

  it('initializes modelOptions and unitOptions', () => {
    const { result } = renderHook(() => useTransferTableFilters(mockData, mockLeftData));

    expect(result.current.modelOptions).toEqual(['M1', 'M2']);
    expect(result.current.unitOptions).toEqual(['U1', 'U2']);
  });

  it('filters by selectedModel', () => {
    const { result } = renderHook(() => useTransferTableFilters(mockData, mockLeftData));

    act(() => {
      result.current.setSelectedModel('M1');
    });

    expect(result.current.filteredData).toEqual([
      { serial: '1', model: 'M1', unit: 'U1', status: 'active' },
      { serial: '3', model: 'M1', unit: 'U2', status: 'active' },
    ]);
  });

  it('filters by selectedUnit', () => {
    const { result } = renderHook(() => useTransferTableFilters(mockData, mockLeftData));

    act(() => {
      result.current.setSelectedUnit('U1');
    });

    expect(result.current.filteredData).toEqual([
      { serial: '1', model: 'M1', unit: 'U1', status: 'active' },
      { serial: '2', model: 'M2', unit: 'U1', status: 'active' },
    ]);
  });

  it('filters by both model and unit', () => {
    const { result } = renderHook(() => useTransferTableFilters(mockData, mockLeftData));

    act(() => {
      result.current.setSelectedModel('M1');
      result.current.setSelectedUnit('U2');
    });

    expect(result.current.filteredData).toEqual([{ serial: '3', model: 'M1', unit: 'U2', status: 'active' }]);
  });
});
