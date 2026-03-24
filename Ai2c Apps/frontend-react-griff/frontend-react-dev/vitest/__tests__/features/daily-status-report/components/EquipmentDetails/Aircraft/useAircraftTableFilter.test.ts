import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react-hooks';

import { ColumnConfig } from '@components/data-tables';
import { TableOverrideType } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/AircraftTable';
import { AircraftFilterSchemaType } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/schema';
import { useAircraftTableFilter } from '@features/daily-status-report/components/EquipmentDetails/Aircraft/useAircraftTableFilter';
import { getBasicOrStatus, OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

const mockColumns: Array<ColumnConfig<TableOverrideType>> = [
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'model', label: 'Model' },
  { key: 'owningUnitName', label: 'Unit' },
  { key: 'currentUnitName', label: 'Unit' },
  { key: 'location', label: 'Location' },
];

const mockData: TableOverrideType[] = [
  {
    rtl: 'Ready',
    status: 'operational',
    serialNumber: 'SN001',
    model: 'ModelA',
    owningUnitName: 'Unit1',
    currentUnitName: 'Unit1',
    location: 'Loc1',
    modifications: [],
    flyingHours: '100',
    hoursToPhase: '50',
    owningUnitUic: 'UIC1',
    currentUnitUic: 'UIC1',
    remarks: 'Remark1',
    dateDown: '2023-01-01',
    dateDownCount: 0,
    ecd: '2023-12-31',
    lastSyncTime: '2023-01-01T00:00:00Z',
    lastExportUploadTime: '2023-01-01T00:00:00Z',
    lastUserEditTime: '2023-01-01T00:00:00Z',
    dataUpdateTime: '2023-01-01T00:00:00Z',
  },
  {
    rtl: 'Not Ready',
    status: 'non-operational',
    serialNumber: 'SN002',
    model: 'ModelB',
    owningUnitName: 'Unit2',
    currentUnitName: 'Unit2',
    location: 'Loc2',
    modifications: [],
    flyingHours: '200',
    hoursToPhase: '150',
    owningUnitUic: 'UIC2',
    currentUnitUic: 'UIC2',
    remarks: 'Remark2',
    dateDown: '2023-01-02',
    dateDownCount: 1,
    ecd: '2023-12-30',
    lastSyncTime: '2023-01-02T00:00:00Z',
    lastExportUploadTime: '2023-01-02T00:00:00Z',
    lastUserEditTime: '2023-01-02T00:00:00Z',
    dataUpdateTime: '2023-01-02T00:00:00Z',
  },
];

const defaultFilters: AircraftFilterSchemaType = {
  launchStatus: null,
  orStatus: null,
  serialNumbers: [],
  models: [],
  units: [],
  location: [],
  modifications: [],
  isHoursFlownChecked: false,
  hoursFlown: [0, 0],
  isHoursToPhaseChecked: false,
  hoursToPhase: [0, 0],
};

describe('useAircraftTableFilter', () => {
  it('returns empty array if no data provided', () => {
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: undefined,
        searchQuery: '',
        filters: defaultFilters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([]);
  });

  it('returns all data if no search query and no filters', () => {
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters: defaultFilters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual(mockData);
  });

  it('filters data by search query across columns', () => {
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: 'sn001',
        filters: defaultFilters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[0]]);
  });

  it('filters data by launchStatus filter', () => {
    const filters = { ...defaultFilters, launchStatus: 'Ready' };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[0]]);
  });

  it('filters data by orStatus filter', () => {
    // The orStatus filter expects an OperationalReadinessStatusEnum value
    // The mockData status values are strings like 'operational' which do not match enum values
    // So we need to use a valid enum value for the filter and adjust mockData accordingly
    const orStatusValue = getBasicOrStatus(OperationalReadinessStatusEnum.FMC);
    const filters = { ...defaultFilters, orStatus: orStatusValue };
    // Adjust mockData to have status matching enum for this test
    const adjustedMockData = mockData.map((item) => ({
      ...item,
      status: OperationalReadinessStatusEnum.FMC,
    }));
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: adjustedMockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual(adjustedMockData);
  });

  it('filters data by serialNumbers filter', () => {
    const filters = { ...defaultFilters, serialNumbers: ['SN002'] };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[1]]);
  });

  it('filters data by models filter', () => {
    const filters = { ...defaultFilters, models: ['ModelA'] };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[0]]);
  });

  it('filters data by units filter', () => {
    const filters = { ...defaultFilters, units: ['Unit2'] };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[1]]);
  });

  it('filters data by location filter', () => {
    const filters = { ...defaultFilters, location: ['Loc1'] };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[0]]);
  });

  it('filters data by flying hours range when checked', () => {
    const filters: AircraftFilterSchemaType = {
      ...defaultFilters,
      isHoursFlownChecked: true,
      hoursFlown: [50, 150],
    };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[0]]);
  });

  it('filters data by hours to phase range when checked', () => {
    const filters: AircraftFilterSchemaType = {
      ...defaultFilters,
      isHoursToPhaseChecked: true,
      hoursToPhase: [40, 60],
    };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[0]]);
  });

  it('filters data by combined filters and search query', () => {
    const filters: AircraftFilterSchemaType = {
      ...defaultFilters,
      launchStatus: 'Ready',
      serialNumbers: ['SN001'],
      models: ['ModelA'],
      units: ['Unit1'],
      location: ['Loc1'],
      modifications: [],
      isHoursFlownChecked: true,
      hoursFlown: [50, 150],
      isHoursToPhaseChecked: true,
      hoursToPhase: [40, 60],
    };
    const { result } = renderHook(() =>
      useAircraftTableFilter({
        tableData: mockData,
        searchQuery: 'modela',
        filters,
        columns: mockColumns,
      }),
    );
    expect(result.current).toEqual([mockData[0]]);
  });
});
