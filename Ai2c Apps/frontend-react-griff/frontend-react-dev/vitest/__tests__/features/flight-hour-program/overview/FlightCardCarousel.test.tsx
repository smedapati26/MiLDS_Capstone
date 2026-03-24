import { describe, expect, it, vi } from 'vitest';

import { act, screen } from '@testing-library/react';

import { DateRangeObj } from '@components/inputs/PmxDateRangeTabHeader';
import FlightCardCarousel from '@features/flight-hour-program/overview/FlightCardCarousel';

import { useGetFhpSummaryQuery } from '@store/griffin_api/fhp/slices';
import { useAppSelector } from '@store/hooks';

import { renderWithProviders } from '@vitest/helpers';

// Mock the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/fhp/slices', () => ({
  useGetFhpSummaryQuery: vi.fn(),
  useGetFhpProgressQuery: vi.fn(),
}));

describe('FlightCardCarousel Component', () => {
  const mockDateRange: DateRangeObj = {
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    valid: true,
  };

  it('renders the loading skeleton when data is loading', async () => {
    // Mock the hooks
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetFhpSummaryQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: true,
    });

    await act(async () => {
      renderWithProviders(<FlightCardCarousel dateRange={mockDateRange} />);
    });

    // Assert that the skeleton is rendered
    const skeleton = screen.getByTestId('skeleton-fhp-card-carousel-loading');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders the fallback message when no data is available', async () => {
    // Mock the hooks
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('mock-uic');
    (useGetFhpSummaryQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
    });

    await act(async () => {
      renderWithProviders(<FlightCardCarousel dateRange={mockDateRange} />);
    });

    // Assert that the fallback message is rendered
    const fallbackMessage = screen.getByText(/No Flight Hours Program data found/i);
    expect(fallbackMessage).toBeInTheDocument();
  });

  it('renders FlightCard components when data is available', async () => {
    // Mock the hooks
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('mock-uic');
    (useGetFhpSummaryQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        day: { fiscalYearToDate: 100, reportingPeriod: 50, models: [] },
        night: { fiscalYearToDate: 80, reportingPeriod: 40, models: [] },
      },
      isLoading: false,
    });

    await act(async () => {
      renderWithProviders(<FlightCardCarousel dateRange={mockDateRange} />);
    });
    // Assert that FlightCard components are rendered
    const flightCards = screen.getAllByTestId('fhp-flight-summary-card');
    expect(flightCards).toHaveLength(2); // Two FlightCards: "day" and "night"
  });
});
