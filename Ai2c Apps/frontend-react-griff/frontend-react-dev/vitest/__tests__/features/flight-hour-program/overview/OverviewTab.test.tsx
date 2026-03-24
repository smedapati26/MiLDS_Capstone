/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { screen } from '@testing-library/react';

import OverviewTab from '@features/flight-hour-program/overview/OverviewTab';

import { mapToAutoDsrSingleUnitInfo } from '@store/griffin_api/auto_dsr/models';
import { useGetAutoDsrSingleUnitInfoQuery } from '@store/griffin_api/auto_dsr/slices';
import { mapToIFhpProgressMulti } from '@store/griffin_api/fhp/models';
import {
  useGetFhpProgressMultipleUnitsQuery,
  useGetFhpProgressQuery,
  useGetFhpSummaryQuery,
} from '@store/griffin_api/fhp/slices';
import { useAppSelector } from '@store/hooks';

import { renderWithProviders } from '@vitest/helpers';
import { mockAutoDsrSingleUnitInfoDto } from '@vitest/mocks/griffin_api_handlers/auto_dsr/mock_data';
import { mockFhpProgress, mockFhpProgressMultiDtoArray } from '@vitest/mocks/griffin_api_handlers/fhp/mock_data';

// Mock the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/slices', () => ({
  selectCurrentUic: (state: any) => state,
}));

vi.mock('@store/griffin_api/fhp/slices', () => ({
  useGetFhpSummaryQuery: vi.fn(),
  useGetFhpProgressQuery: vi.fn(),
  useGetFhpProgressMultipleUnitsQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrSingleUnitInfoQuery: vi.fn(),
}));

describe('OverviewTab', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('mock-uic');
    (useGetFhpSummaryQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        day: { fiscalYearToDate: 100, reportingPeriod: 50, models: [] },
        night: { fiscalYearToDate: 80, reportingPeriod: 40, models: [] },
      },
      isLoading: false,
    });
    (useGetFhpProgressQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockFhpProgress,
      isLoading: false,
    });
    (useGetFhpProgressMultipleUnitsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockFhpProgressMultiDtoArray.map(mapToIFhpProgressMulti),
      isLoading: false,
    });
    (useGetAutoDsrSingleUnitInfoQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mapToAutoDsrSingleUnitInfo(mockAutoDsrSingleUnitInfoDto),
      isLoading: false,
    });
  });

  it('render Overview tab correctly', () => {
    renderWithProviders(<OverviewTab />);
    expect(screen.getByTestId('fhp-overview-tab'));
  });
});
