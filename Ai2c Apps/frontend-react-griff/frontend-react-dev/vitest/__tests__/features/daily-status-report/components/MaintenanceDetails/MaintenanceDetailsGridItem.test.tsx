/* eslint-disable @typescript-eslint/no-explicit-any */
import MaintenanceDetailsGridItem from 'src/features/daily-status-report/components/MaintenanceDetails/MaintenanceDetailsGridItem';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { screen } from '@testing-library/react';

// Mock the RTK Query hook
vi.mock('@store/griffin_api/events/slices', () => ({
  useGetMaintenanceDetailsQuery: vi.fn(() => ({
    data: [],
    isFetching: false,
    isUninitialized: false,
    isLoading: false,
  })),
}));

// Mock the table search options hook
vi.mock('@hooks/useTableSearchOptions', () => ({
  useTableSearchOptions: vi.fn(() => []),
}));

// Mock the filter hook
vi.mock('src/features/daily-status-report/components/MaintenanceDetails/useMaintDetailsTableFilter', () => ({
  useMaintDetailsTableFilter: vi.fn(() => []),
}));

// Mock PmxLaunchButton
vi.mock('@components/inputs/PmxLaunchButton', () => ({
  PmxLaunchButton: ({ path }: { path: string }) => <button data-testid="launch-button">Launch {path}</button>,
}));

// Mock the filter form
vi.mock(
  'src/features/daily-status-report/components/MaintenanceDetails/MaintDetailsFilterForm',
  async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      MaintDetailsFilterForm: () => <div data-testid="filter-form" />,
    };
  },
);

describe('MaintenanceDetailsGridItem', () => {
  it('renders the component with heading', () => {
    renderWithProviders(<MaintenanceDetailsGridItem uic="test-uic" />);

    expect(screen.getByText('Maintenance Details')).toBeInTheDocument();
  });

  it('renders toggle buttons', () => {
    renderWithProviders(<MaintenanceDetailsGridItem uic="test-uic" />);

    expect(screen.getByText('current')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
  });
});
