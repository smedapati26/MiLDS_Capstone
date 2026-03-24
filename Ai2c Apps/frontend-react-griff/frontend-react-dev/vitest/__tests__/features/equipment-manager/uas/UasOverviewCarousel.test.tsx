import { vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';
import UasOverviewCarousel, { aggregateOverviewData } from '@features/equipment-manager/uas/UasOverviewCarousel';

import { mapToUas } from '@store/griffin_api/uas/models/IUAS';
import { useGetUACQuery, useGetUAVQuery } from '@store/griffin_api/uas/slices';
import { useAppSelector } from '@store/hooks';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockUacData, mockUavData } from '@vitest/mocks/griffin_api_handlers/uas/mock_data';
import { mockUasData } from '@vitest/mocks/griffin_api_handlers/uas/mock_data';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/uas/slices', () => ({
  useGetUAVQuery: vi.fn(),
  useGetUACQuery: vi.fn(),
}));

describe('UasOverviewCarousel', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
  });
  it('shows loading skeleton when loading', () => {
    // Override the hook to simulate loading
    (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
    });
    (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
    });
    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <UasOverviewCarousel />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('em-carousel-loading')).toBeInTheDocument();
  });

  it('shows "No UAV found" when aggregatedData is empty', () => {
    // Override the hook to simulate empty data
    (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    });

    (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    });

    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <UasOverviewCarousel />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('em-empty-data')).toBeInTheDocument();
  });

  it('renders carousel and UasPaper for aggregated data', () => {
    (useGetUAVQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockUavData,
      isLoading: false,
      isFetching: false,
    });
    (useGetUACQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockUacData,
      isLoading: false,
      isFetching: false,
    });

    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <UasOverviewCarousel />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('em-uas-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('pmx-carousel')).toBeInTheDocument();
    // Should render two UasPaper components (one for each id)
    const papers = screen.getAllByTestId('em-uas-paper');
    expect(papers.length).toBe(2);
    expect(papers[0]).toHaveTextContent('Model 1');
    expect(papers[1]).toHaveTextContent('Model 2');
  });
});

describe('aggregateOverviewData', () => {
  it('returns empty object if data is undefined', () => {
    expect(aggregateOverviewData(undefined)).toEqual({});
  });

  it('aggregates data by model and status', () => {
    const result = aggregateOverviewData(mockUasData.map(mapToUas));

    expect(result).toEqual({
      'UH-60': {
        model: 'UH-60',
        rtl: 1,
        nrtl: 0,
        inPhase: 0,
        total: 1,
        fmc: 1,
        pmc: 0,
        nmc: 0,
        dade: 0,
      },
    });
  });
});
