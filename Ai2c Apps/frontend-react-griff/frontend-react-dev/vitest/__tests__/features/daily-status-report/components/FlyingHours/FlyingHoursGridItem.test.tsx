import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import FlyingHoursGridItem from '@features/daily-status-report/components/FlyingHours/FlyingHoursGridItem';

import { useGetFlyingHoursQuery } from '@store/griffin_api/auto_dsr/slices';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

import '@testing-library/jest-dom';

// Mock the API hook
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetFlyingHoursQuery: vi.fn(),
}));

// Mock PmxGridItemTemplate
vi.mock('@components/PmxGridItemTemplate', () => ({
  __esModule: true,
  default: ({
    label,
    isError,
    isFetching,
    isUninitialized,
    refetch,
    launchPath,
    minHeight,
    children,
  }: {
    label: string;
    isError: boolean;
    isFetching: boolean;
    isUninitialized: boolean;
    refetch: () => void;
    launchPath: string;
    minHeight: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="pmx-grid-item-template">
      <div data-testid="grid-label">{label}</div>
      <div data-testid="grid-launch-path">{launchPath}</div>
      <div data-testid="grid-min-height">{minHeight}</div>
      {isError && <div data-testid="grid-error">Error State</div>}
      {isFetching && <div data-testid="grid-fetching">Fetching State</div>}
      {isUninitialized && <div data-testid="grid-uninitialized">Uninitialized State</div>}
      {refetch && (
        <button data-testid="grid-refetch" onClick={refetch}>
          Refetch
        </button>
      )}
      <div data-testid="grid-children">{children}</div>
    </div>
  ),
}));

// Mock ProgressStats component
vi.mock('@features/daily-status-report/components/FlyingHours/ProgressStats', () => ({
  ProgressStats: ({ label, hours, totalHours }: { label: string; hours: number; totalHours: number }) => {
    const processedLabel = label.trim().toLowerCase().replace(/\s+/g, '-');
    return (
      <div data-testid={`progress-stats-${processedLabel}`}>
        <div data-testid={`progress-label-${processedLabel}`}>{label}</div>
        <div data-testid={`progress-hours-${processedLabel}`}>{hours}</div>
        <div data-testid={`progress-total-${processedLabel}`}>{totalHours}</div>
        <div data-testid={`progress-display-${processedLabel}`}>
          {label}: {hours}/{totalHours}
        </div>
      </div>
    );
  },
}));

const mockUseGetFlyingHoursQuery = vi.mocked(useGetFlyingHoursQuery);

describe('FlyingHoursGridItem', () => {
  const defaultProps = {
    uic: 'TEST_UIC',
  };

  const mockFlyingHoursData = {
    monthlyHoursFlown: 45,
    monthlyHoursTotal: 60,
    yearlyHoursFlown: 480,
    yearlyHoursTotal: 720,
  };

  const mockHigherEchelonData = {
    monthlyHoursFlown: 200,
    monthlyHoursTotal: 300,
    yearlyHoursFlown: 2000,
    yearlyHoursTotal: 3600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and shows loading states correctly', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: true,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(screen.getByTestId('pmx-grid-item-template')).toBeInTheDocument();
    expect(screen.getByTestId('grid-fetching')).toBeInTheDocument();
  });

  it('renders error state when isError is true', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: undefined,
        isError: true,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(screen.getByTestId('grid-error')).toBeInTheDocument();
  });

  it('renders uninitialized state when isUninitialized is true', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(screen.getByTestId('grid-uninitialized')).toBeInTheDocument();
  });

  it('renders uninitialized state when uic is missing', () => {
    mockUseGetFlyingHoursQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<FlyingHoursGridItem uic="" />);

    expect(screen.getByTestId('grid-uninitialized')).toBeInTheDocument();
  });

  it('renders progress stats correctly without higher echelon data', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: mockFlyingHoursData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(screen.getByTestId('progress-label-monthly-requirements')).toHaveTextContent('Monthly Requirements');
    expect(screen.getByTestId('progress-label-yearly-requirements')).toHaveTextContent('Yearly Requirements');
    expect(screen.getByTestId('progress-hours-monthly-requirements')).toHaveTextContent('45');
    expect(screen.getByTestId('progress-total-monthly-requirements')).toHaveTextContent('60');
    expect(screen.getByTestId('progress-hours-yearly-requirements')).toHaveTextContent('480');
    expect(screen.getByTestId('progress-total-yearly-requirements')).toHaveTextContent('720');
  });

  it('renders progress stats correctly with higher echelon data', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: mockFlyingHoursData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockHigherEchelonData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem uic="TEST_UIC" higherEchelonUic="HIGHER_UIC" />);

    expect(screen.getByTestId('progress-label-monthly')).toHaveTextContent('Monthly');
    expect(screen.getByTestId('progress-label-yearly')).toHaveTextContent('Yearly');
    expect(screen.getByTestId('progress-hours-monthly')).toHaveTextContent('45');
    expect(screen.getByTestId('progress-total-monthly')).toHaveTextContent('300');
    expect(screen.getByTestId('progress-hours-yearly')).toHaveTextContent('480');
    expect(screen.getByTestId('progress-total-yearly')).toHaveTextContent('3600');
  });

  it('calls useGetFlyingHoursQuery with correct parameters', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: mockFlyingHoursData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(mockUseGetFlyingHoursQuery).toHaveBeenCalledTimes(2);
    expect(mockUseGetFlyingHoursQuery).toHaveBeenNthCalledWith(1, { uic: 'TEST_UIC' }, { skip: false });
    expect(mockUseGetFlyingHoursQuery).toHaveBeenNthCalledWith(2, { uic: undefined }, { skip: true });
  });

  it('skips API call when uic is not provided', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem uic="" />);

    expect(mockUseGetFlyingHoursQuery).toHaveBeenNthCalledWith(1, { uic: '' }, { skip: true });
  });

  it('passes refetch function to PmxGridItemTemplate and triggers on click', () => {
    const mockRefetch = vi.fn();
    mockUseGetFlyingHoursQuery.mockReturnValue({
      data: mockFlyingHoursData,
      isError: false,
      isFetching: false,
      isUninitialized: false,
      refetch: mockRefetch,
    });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    const refetchButton = screen.getByTestId('grid-refetch');
    expect(refetchButton).toBeInTheDocument();

    refetchButton.click();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders with correct PmxGridItemTemplate props', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: mockFlyingHoursData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(screen.getByTestId('grid-label')).toHaveTextContent('Flying Hours');
    expect(screen.getByTestId('grid-launch-path')).toHaveTextContent('/flight-hour-program');
    expect(screen.getByTestId('grid-min-height')).toHaveTextContent('240px');
  });

  it('does not render progress stats when data is null', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: null,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(screen.queryByTestId('progress-stats-monthly-requirements')).not.toBeInTheDocument();
    expect(screen.queryByTestId('progress-stats-yearly-requirements')).not.toBeInTheDocument();
  });

  it('handles edge case with zero values', () => {
    const zeroData = {
      monthlyHoursFlown: 0,
      monthlyHoursTotal: 0,
      yearlyHoursFlown: 0,
      yearlyHoursTotal: 0,
    };

    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: zeroData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(screen.getByTestId('progress-hours-monthly-requirements')).toHaveTextContent('0');
    expect(screen.getByTestId('progress-total-monthly-requirements')).toHaveTextContent('0');
    expect(screen.getByTestId('progress-hours-yearly-requirements')).toHaveTextContent('0');
    expect(screen.getByTestId('progress-total-yearly-requirements')).toHaveTextContent('0');
  });

  it('calls both API hooks when higherEchelonUic is provided', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: mockFlyingHoursData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockHigherEchelonData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem uic="TEST_UIC" higherEchelonUic="HIGHER_UIC" />);

    expect(mockUseGetFlyingHoursQuery).toHaveBeenCalledTimes(2);
    expect(mockUseGetFlyingHoursQuery).toHaveBeenNthCalledWith(1, { uic: 'TEST_UIC' }, { skip: false });
    expect(mockUseGetFlyingHoursQuery).toHaveBeenNthCalledWith(2, { uic: 'HIGHER_UIC' }, { skip: false });
  });

  it('skips higher echelon API call when higherEchelonUic is not provided', () => {
    mockUseGetFlyingHoursQuery
      .mockReturnValueOnce({
        data: mockFlyingHoursData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

    renderWithProviders(<FlyingHoursGridItem {...defaultProps} />);

    expect(mockUseGetFlyingHoursQuery).toHaveBeenCalledTimes(2);
    expect(mockUseGetFlyingHoursQuery).toHaveBeenNthCalledWith(1, { uic: 'TEST_UIC' }, { skip: false });
    expect(mockUseGetFlyingHoursQuery).toHaveBeenNthCalledWith(2, { uic: undefined }, { skip: true });
  });
});
