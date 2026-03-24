import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { ProviderWrapper } from '@vitest/helpers/ProviderWrapper';

// Mock RTK Query hook
vi.mock('@store/griffin_api/uas/slices/uavApi', () => ({
  useGetUAVQuery: vi.fn(),
}));

// Mock custom hooks
vi.mock('@hooks/useTableSearchOptions', () => ({
  useTableSearchOptions: vi.fn(() => []),
}));

vi.mock('./useUAvTableFilter', () => ({
  useUavTableFilter: vi.fn(() => []),
}));

// Import after mocking
import { UAVTable } from '@features/daily-status-report/components/EquipmentDetails/UAS/UAV/UAVTable';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import type { IUAS } from '@store/griffin_api/uas/models/IUAS';
import { useGetUAVQuery } from '@store/griffin_api/uas/slices';

describe('UAVTable', () => {
  it('renders without crashing', () => {
    vi.mocked(useGetUAVQuery).mockReturnValue({ data: undefined, isLoading: false, refetch: vi.fn() });

    render(
      <ProviderWrapper>
        <UAVTable uic="test-uic" />
      </ProviderWrapper>,
    );

    expect(screen.getByText("UAV's")).toBeInTheDocument();
  });

  it('displays loading state', () => {
    vi.mocked(useGetUAVQuery).mockReturnValue({ data: undefined, isLoading: true, refetch: vi.fn() });

    render(
      <ProviderWrapper>
        <UAVTable uic="test-uic" />
      </ProviderWrapper>,
    );

    // Assuming PmxAccordion shows loading indicator
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders table with data', () => {
    const mockData: IUAS[] = [
      {
        serialNumber: 'SN001',
        model: 'Model1',
        displayStatus: OperationalReadinessStatusEnum.FMC,
        currentUnit: 'Unit1',
        locationCode: 'Loc1',
        remarks: 'Remark1',
        dateDownCount: 0,
        locationName: 'Location1',
        status: OperationalReadinessStatusEnum.FMC,
        rtl: 'RTL1',
        totalAirframeHours: 100,
        flightHours: 50,
        dateDown: '2023-01-01',
        ecd: 'ECD1',
        lastSyncTime: '2023-01-01T00:00:00Z',
        lastUpdateTime: '2023-01-01T00:00:00Z',
        shortName: '',
        shouldSync: false,
        fieldSyncStatus: {},
        id: 1,
      },
    ];

    vi.mocked(useGetUAVQuery).mockReturnValue({ data: mockData, isLoading: false, refetch: vi.fn() });

    render(
      <ProviderWrapper>
        <UAVTable uic="test-uic" />
      </ProviderWrapper>,
    );

    expect(screen.getByText("UAV's")).toBeInTheDocument();
    expect(screen.getByText('SN001')).toBeInTheDocument();
  });

  it('passes uic prop correctly', () => {
    vi.mocked(useGetUAVQuery).mockReturnValue({ data: undefined, isLoading: false, refetch: vi.fn() });

    render(
      <ProviderWrapper>
        <UAVTable uic="test-uic" />
      </ProviderWrapper>,
    );

    expect(useGetUAVQuery).toHaveBeenCalledWith({ uic: 'test-uic' }, { skip: false });
  });

  it('skips query when uic is undefined', () => {
    vi.mocked(useGetUAVQuery).mockReturnValue({ data: undefined, isLoading: false, refetch: vi.fn() });

    render(
      <ProviderWrapper>
        <UAVTable uic={undefined} />
      </ProviderWrapper>,
    );

    expect(useGetUAVQuery).toHaveBeenCalledWith({ uic: undefined }, { skip: true });
  });
});
