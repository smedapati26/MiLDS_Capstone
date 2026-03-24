import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react';

import { ColumnConfig } from '@components/data-tables';
import {
  uacFilterDefaultValues,
  UACFilterSchemaType,
} from '@features/daily-status-report/components/EquipmentDetails/UAS/Components/schema';
import { useUacTableFilter } from '@features/daily-status-report/components/EquipmentDetails/UAS/Components/useUACTableFilter';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';

// Mock data for IUAS
const mockUASData: IUAS[] = [
  {
    locationCode: 'LOC1',
    locationName: 'Location 1',
    serialNumber: 'SN001',
    model: 'ModelA',
    status: OperationalReadinessStatusEnum.FMC,
    displayStatus: OperationalReadinessStatusEnum.FMC,
    rtl: 'RTL1',
    currentUnit: 'Unit1',
    totalAirframeHours: 100,
    flightHours: 50,
    remarks: 'Remark1',
    dateDown: '2023-01-01',
    dateDownCount: 10,
    ecd: 'ECD1',
    lastSyncTime: '2023-01-01T00:00:00Z',
    lastUpdateTime: '2023-01-01T00:00:00Z',
    shortName: '',
    shouldSync: false,
    fieldSyncStatus: {},
    id: 1,
  },
  {
    locationCode: 'LOC2',
    locationName: 'Location 2',
    serialNumber: 'SN002',
    model: 'ModelB',
    status: OperationalReadinessStatusEnum.NMC,
    displayStatus: OperationalReadinessStatusEnum.NMC,
    rtl: 'RTL2',
    currentUnit: 'Unit2',
    totalAirframeHours: 200,
    flightHours: 75,
    remarks: 'Remark2',
    dateDown: '2023-02-01',
    dateDownCount: 5,
    ecd: 'ECD2',
    lastSyncTime: '2023-02-01T00:00:00Z',
    lastUpdateTime: '2023-02-01T00:00:00Z',
    shortName: '',
    shouldSync: false,
    fieldSyncStatus: {},
    id: 2,
  },
  {
    locationCode: 'LOC1',
    locationName: 'Location 1',
    serialNumber: 'SN003',
    model: 'ModelA',
    status: OperationalReadinessStatusEnum.NMCM,
    displayStatus: OperationalReadinessStatusEnum.NMC,
    rtl: 'RTL3',
    currentUnit: 'Unit1',
    totalAirframeHours: 150,
    flightHours: 60,
    remarks: 'Remark3',
    dateDown: '2023-03-01',
    dateDownCount: 2,
    ecd: 'ECD3',
    lastSyncTime: '2023-03-01T00:00:00Z',
    lastUpdateTime: '2023-03-01T00:00:00Z',
    shortName: '',
    shouldSync: false,
    fieldSyncStatus: {},
    id: 3,
  },
];

// Mock columns
const mockColumns: ColumnConfig<IUAS>[] = [
  { key: 'serialNumber', label: 'Serial Number', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'locationCode', label: 'Location', sortable: true },
];

describe('useUacTableFilter', () => {
  it('returns empty array when tableData is undefined', () => {
    const props = {
      tableData: undefined,
      searchQuery: '',
      filters: uacFilterDefaultValues,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toEqual([]);
  });

  it('returns all data when no search query and no filters applied', () => {
    const props = {
      tableData: mockUASData,
      searchQuery: '',
      filters: uacFilterDefaultValues,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toEqual(mockUASData);
  });

  it('filters data based on search query (case-insensitive)', () => {
    const props = {
      tableData: mockUASData,
      searchQuery: 'sn001',
      filters: uacFilterDefaultValues,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].serialNumber).toBe('SN001');
  });

  it('filters data based on status filter', () => {
    const filters: UACFilterSchemaType = {
      ...uacFilterDefaultValues,
      status: OperationalReadinessStatusEnum.FMC,
    };

    const props = {
      tableData: mockUASData,
      searchQuery: '',
      filters,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].displayStatus).toBe(OperationalReadinessStatusEnum.FMC);
  });

  it('filters data based on serial numbers filter', () => {
    const filters: UACFilterSchemaType = {
      ...uacFilterDefaultValues,
      serialNumbers: ['SN001', 'SN003'],
    };

    const props = {
      tableData: mockUASData,
      searchQuery: '',
      filters,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toHaveLength(2);
    expect(result.current.map((item) => item.serialNumber)).toEqual(['SN001', 'SN003']);
  });

  it('filters data based on models filter', () => {
    const filters: UACFilterSchemaType = {
      ...uacFilterDefaultValues,
      models: ['ModelA'],
    };

    const props = {
      tableData: mockUASData,
      searchQuery: '',
      filters,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.model === 'ModelA')).toBe(true);
  });

  it('filters data based on units filter', () => {
    const filters: UACFilterSchemaType = {
      ...uacFilterDefaultValues,
      units: ['Unit1'],
    };

    const props = {
      tableData: mockUASData,
      searchQuery: '',
      filters,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.currentUnit === 'Unit1')).toBe(true);
  });

  it('filters data based on location filter', () => {
    const filters: UACFilterSchemaType = {
      ...uacFilterDefaultValues,
      location: ['LOC1'],
    };

    const props = {
      tableData: mockUASData,
      searchQuery: '',
      filters,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.locationCode === 'LOC1')).toBe(true);
  });

  it('combines search query and filters correctly', () => {
    const filters: UACFilterSchemaType = {
      ...uacFilterDefaultValues,
      models: ['ModelA'],
    };

    const props = {
      tableData: mockUASData,
      searchQuery: 'SN001',
      filters,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].serialNumber).toBe('SN001');
    expect(result.current[0].model).toBe('ModelA');
  });

  it('returns empty array when no items match the filters', () => {
    const filters: UACFilterSchemaType = {
      ...uacFilterDefaultValues,
      status: OperationalReadinessStatusEnum.NMC,
      serialNumbers: ['SN999'], // Non-existent
    };

    const props = {
      tableData: mockUASData,
      searchQuery: '',
      filters,
      columns: mockColumns,
    };

    const { result } = renderHook(() => useUacTableFilter(props));

    expect(result.current).toEqual([]);
  });
});
