import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react-hooks';

import type { ColumnConfig } from '@components/data-tables';
import type { AgseFilterSchemaType } from '@features/daily-status-report/components/EquipmentDetails/AGSE/schema';
import { useAgseTableFilter } from '@features/daily-status-report/components/EquipmentDetails/AGSE/useAgseTableFilter';

import type { IAGSE } from '@store/griffin_api/agse/models';

// Mock getBasicOrStatus
vi.mock('@models/OperationalReadinessStatusEnum', () => ({
  getBasicOrStatus: vi.fn((status: string) => status),
}));

// Sample columns for testing
const columns: Array<ColumnConfig<IAGSE>> = [
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'model', label: 'Model' },
  { key: 'currentUnit', label: 'Unit' },
  { key: 'lin', label: 'Location' },
  { key: 'condition', label: 'Status' },
];

// Sample data for testing
const sampleData: IAGSE[] = [
  {
    equipmentNumber: 'EQ1',
    lin: 'LOC1',
    serialNumber: 'SN1',
    condition: 'FMC',
    currentUnit: 'Unit1',
    currentUnitShortName: 'Unit1',
    nomenclature: 'Nomen1',
    displayName: 'Display1',
    earliestNmcStart: '2023-01-01',
    model: 'ModelA',
    daysNmc: 5,
    remarks: 'Remark1',
    location: null,
    status: 'FMC',
    earliestNmcStartCount: null,
  },
  {
    equipmentNumber: 'EQ2',
    lin: 'LOC2',
    serialNumber: 'SN2',
    condition: 'NMC',
    currentUnit: 'Unit2',
    currentUnitShortName: 'Unit2',
    nomenclature: 'Nomen2',
    displayName: 'Display2',
    earliestNmcStart: '2023-02-01',
    model: 'ModelB',
    daysNmc: 10,
    remarks: 'Remark2',
    location: null,
    status: 'NMC',
    earliestNmcStartCount: null,
  },
  {
    equipmentNumber: 'EQ3',
    lin: 'LOC1',
    serialNumber: 'SN3',
    condition: 'FMC',
    currentUnit: 'Unit1',
    currentUnitShortName: 'Unit1',
    nomenclature: 'Nomen3',
    displayName: 'Display3',
    earliestNmcStart: '2023-03-01',
    model: 'ModelA',
    daysNmc: 15,
    remarks: 'Remark3',
    location: null,
    status: 'FMC',
    earliestNmcStartCount: null,
  },
];

// Default empty filters
const emptyFilters: AgseFilterSchemaType = {
  conditions: null,
  serialNumbers: [],
  models: [],
  units: [],
  location: [],
};

describe('useAgseTableFilter', () => {
  it('returns empty array if tableData is undefined', () => {
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: undefined, searchQuery: '', filters: emptyFilters, columns }),
    );
    expect(result.current).toEqual([]);
  });

  it('returns all data if no search query and no filters', () => {
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: '', filters: emptyFilters, columns }),
    );
    expect(result.current).toEqual(sampleData);
  });

  it('filters by search query across columns (case-insensitive)', () => {
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: 'sn1', filters: emptyFilters, columns }),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].serialNumber).toBe('SN1');
  });

  it('filters by status', () => {
    const filters: AgseFilterSchemaType = { ...emptyFilters, conditions: 'FMC' };
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: '', filters, columns }),
    );
    expect(result.current.every((row) => row.condition === 'FMC')).toBe(true);
  });

  it('filters by serialNumbers', () => {
    const filters: AgseFilterSchemaType = { ...emptyFilters, serialNumbers: ['SN2'] };
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: '', filters, columns }),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].serialNumber).toBe('SN2');
  });

  it('filters by models', () => {
    const filters: AgseFilterSchemaType = { ...emptyFilters, models: ['ModelA'] };
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: '', filters, columns }),
    );
    expect(result.current.every((row) => row.model === 'ModelA')).toBe(true);
  });

  it('filters by units', () => {
    const filters: AgseFilterSchemaType = { ...emptyFilters, units: ['Unit1'] };
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: '', filters, columns }),
    );
    expect(result.current.every((row) => row.currentUnit === 'Unit1')).toBe(true);
  });

  it('filters by location', () => {
    const filters: AgseFilterSchemaType = { ...emptyFilters, location: ['LOC1'] };
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: '', filters, columns }),
    );
    expect(result.current.every((row) => row.lin === 'LOC1')).toBe(true);
  });

  it('filters by combined filters', () => {
    const filters: AgseFilterSchemaType = {
      conditions: 'FMC',
      serialNumbers: ['SN1', 'SN3'],
      models: ['ModelA'],
      units: ['Unit1'],
      location: ['LOC1'],
    };
    const { result } = renderHook(() =>
      useAgseTableFilter({ tableData: sampleData, searchQuery: '', filters, columns }),
    );
    expect(result.current).toHaveLength(2);
    expect(result.current.every((row) => row.condition === 'FMC')).toBe(true);
    expect(result.current.every((row) => ['SN1', 'SN3'].includes(row.serialNumber))).toBe(true);
    expect(result.current.every((row) => row.model === 'ModelA')).toBe(true);
    expect(result.current.every((row) => row.currentUnit === 'Unit1')).toBe(true);
    expect(result.current.every((row) => row.lin === 'LOC1')).toBe(true);
  });
});
