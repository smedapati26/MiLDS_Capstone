import { MaintDetailFilterSchemaType } from 'src/features/daily-status-report/components/MaintenanceDetails/MaintDetailsFilterForm';
import { useMaintDetailsTableFilter } from 'src/features/daily-status-report/components/MaintenanceDetails/useMaintDetailsTableFilter';
import { describe, expect, it } from 'vitest';

import { renderHook } from '@testing-library/react-hooks';

import { ColumnConfig } from '@components/data-tables';

import { IMaintenanceDetailsDto } from '@store/griffin_api/events/models';

// Mock data
const mockTableData: IMaintenanceDetailsDto[] = [
  {
    serial: 'ABC123',
    model: 'ModelA',
    inspection_name: 'Inspection1',
    status: 0.5,
    lane_name: 'Lane1',
    responsible_unit: 'Unit1',
    start_date: '01/15/2023',
    end_date: '01/20/2023',
    current_upcoming: 'current',
  },
  {
    serial: 'DEF456',
    model: 'ModelB',
    inspection_name: 'Inspection2',
    status: 0.8,
    lane_name: 'Lane2',
    responsible_unit: 'Unit2',
    start_date: '02/10/2023',
    end_date: '02/15/2023',
    current_upcoming: 'upcoming',
  },
  {
    serial: 'GHI789',
    model: 'ModelA',
    inspection_name: 'Inspection1',
    status: 0.3,
    lane_name: 'Lane1',
    responsible_unit: 'Unit1',
    start_date: '03/05/2023',
    end_date: '03/10/2023',
    current_upcoming: 'current',
  },
];

const mockColumns: Array<ColumnConfig<IMaintenanceDetailsDto>> = [
  { key: 'serial', label: 'Serial' },
  { key: 'model', label: 'Model' },
  { key: 'inspection_name', label: 'Inspection' },
  { key: 'lane_name', label: 'Lane' },
  { key: 'responsible_unit', label: 'Unit' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
];

const defaultFilters: MaintDetailFilterSchemaType = {
  serialNumbers: [],
  models: [],
  inspections: [],
  lanes: [],
  units: [],
  startDateRange: {
    startDate: null,
    endDate: null,
  },
  endDateRange: {
    startDate: null,
    endDate: null,
  },
  isCompletionStatusChecked: false,
  completionStatus: [0, 100],
};

describe('useMaintDetailsTableFilter', () => {
  it('returns empty array when tableData is undefined', () => {
    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: undefined,
        searchQuery: '',
        filters: defaultFilters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toEqual([]);
  });

  it('returns all data when no filters and no search query', () => {
    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters: defaultFilters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toEqual(mockTableData);
  });

  it('filters by search query case-insensitively across columns', () => {
    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: 'abc',
        filters: defaultFilters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].serial).toBe('ABC123');
  });

  it('filters by serial numbers', () => {
    const filters = { ...defaultFilters, serialNumbers: ['ABC123', 'GHI789'] };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.map((item) => item.serial)).toEqual(['ABC123', 'GHI789']);
  });

  it('filters by models', () => {
    const filters = { ...defaultFilters, models: ['ModelA'] };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.model === 'ModelA')).toBe(true);
  });

  it('filters by inspections', () => {
    const filters = { ...defaultFilters, inspections: ['Inspection1'] };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.inspection_name === 'Inspection1')).toBe(true);
  });

  it('filters by lanes', () => {
    const filters = { ...defaultFilters, lanes: ['Lane1'] };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.lane_name === 'Lane1')).toBe(true);
  });

  it('filters by responsible units', () => {
    const filters = { ...defaultFilters, units: ['Unit1'] };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.responsible_unit === 'Unit1')).toBe(true);
  });

  it('filters by start date range', () => {
    const filters = { ...defaultFilters, startDateRange: { startDate: '01/10/2023', endDate: '02/20/2023' } };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.map((item) => item.serial)).toEqual(['ABC123', 'DEF456']);
  });

  it('filters by end date range', () => {
    const filters = { ...defaultFilters, endDateRange: { startDate: '01/10/2023', endDate: '02/20/2023' } };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.map((item) => item.serial)).toEqual(['ABC123', 'DEF456']);
  });

  it('filters by completion status when checked', () => {
    const filters = {
      ...defaultFilters,
      isCompletionStatusChecked: true,
      completionStatus: [40, 90] as [number, number],
    };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.map((item) => item.serial)).toEqual(['ABC123', 'DEF456']);
  });

  it('combines multiple filters', () => {
    const filters = {
      ...defaultFilters,
      models: ['ModelA'],
      lanes: ['Lane1'],
      startDateFrom: '01/01/2023',
      startDateTo: '03/31/2023',
    };

    const { result } = renderHook(() =>
      useMaintDetailsTableFilter({
        tableData: mockTableData,
        searchQuery: '',
        filters,
        columns: mockColumns,
      }),
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.every((item) => item.model === 'ModelA' && item.lane_name === 'Lane1')).toBe(true);
  });
});
