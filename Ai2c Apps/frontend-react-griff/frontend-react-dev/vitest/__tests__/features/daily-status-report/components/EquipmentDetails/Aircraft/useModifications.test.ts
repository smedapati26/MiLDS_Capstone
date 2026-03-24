import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react-hooks';

import { TableOverrideType } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/AircraftTable';
import { useModifications } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/useModifications';

const mockTableDataEmpty: TableOverrideType[] = [];

const mockTableDataNoMods: TableOverrideType[] = [
  {
    serialNumber: 'SN001',
    owningUnitUic: 'UIC1',
    owningUnitName: 'Unit A',
    currentUnitUic: 'UIC1',
    currentUnitName: 'Unit A',
    location: 'Base 1',
    model: 'F-35',
    status: 'FMC',
    rtl: 'RTL',
    remarks: 'Remark 1',
    dateDown: '2023-01-01',
    dateDownCount: 1,
    ecd: '2023-12-31',
    hoursToPhase: 50,
    flyingHours: 100,
    lastSyncTime: '2023-01-01T00:00:00Z',
    lastExportUploadTime: '2023-01-01T00:00:00Z',
    lastUserEditTime: '2023-01-01T00:00:00Z',
    dataUpdateTime: '2023-01-01T00:00:00Z',
    modifications: [],
  },
];

const mockTableDataWithMods: TableOverrideType[] = [
  {
    ...mockTableDataNoMods[0],
    modifications: [
      {
        modType: 'Mod1',
        value: 'Mod1',
      },
      {
        modType: 'Mod2',
        value: 'Mod2',
      },
    ],
  },
  {
    serialNumber: 'SN002',
    owningUnitUic: 'UIC2',
    owningUnitName: 'Unit B',
    currentUnitUic: 'UIC2',
    currentUnitName: 'Unit B',
    location: 'Base 2',
    model: 'F-16',
    status: 'PMC',
    rtl: 'NRTL',
    remarks: 'Remark 2',
    dateDown: '2023-01-02',
    dateDownCount: 0,
    ecd: '2023-12-31',
    hoursToPhase: 30,
    flyingHours: 200,
    lastSyncTime: '2023-01-02T00:00:00Z',
    lastExportUploadTime: '2023-01-02T00:00:00Z',
    lastUserEditTime: '2023-01-02T00:00:00Z',
    dataUpdateTime: '2023-01-02T00:00:00Z',
    modifications: [
      {
        modType: 'Mod1',
        value: 'Mod1',
      },
      {
        modType: 'Mod2',
        value: 'Mod2',
      },
    ],
  },
];

const mockTableDataWithDuplicates: TableOverrideType[] = [
  {
    ...mockTableDataNoMods[0],
    modifications: [
      {
        modType: 'Mod1',
        value: 'Mod1',
      },
      {
        modType: 'Mod2',
        value: 'Mod2',
      },
    ],
  },
  {
    ...mockTableDataNoMods[1],
    modifications: [
      {
        modType: 'Mod1',
        value: 'Mod1',
      },
      {
        modType: 'Mod2',
        value: 'Mod2',
      },
    ],
  },
];

describe('useModifications', () => {
  it('returns an empty array when tableData is empty', () => {
    const { result } = renderHook(() => useModifications(mockTableDataEmpty));

    expect(result.current).toEqual([]);
  });

  it('returns an empty array when tableData has no modifications', () => {
    const { result } = renderHook(() => useModifications(mockTableDataNoMods));

    expect(result.current).toEqual([]);
  });

  it('returns unique modification types as options when tableData has modifications', () => {
    const { result } = renderHook(() => useModifications(mockTableDataWithMods));

    expect(result.current).toEqual([
      { label: 'Mod1', value: 'Mod1' },
      { label: 'Mod2', value: 'Mod2' },
    ]);
  });

  it('returns unique modification types without duplicates', () => {
    const { result } = renderHook(() => useModifications(mockTableDataWithDuplicates));

    expect(result.current).toEqual([
      { label: 'Mod1', value: 'Mod1' },
      { label: 'Mod2', value: 'Mod2' },
    ]);
  });

  it('memoizes the result correctly', () => {
    const { result, rerender } = renderHook(() => useModifications(mockTableDataWithMods));

    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult); // Same reference due to memoization
  });
});
