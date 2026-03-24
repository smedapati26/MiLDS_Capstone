/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import ReadinessImpacts from '@features/readiness-analytics/Equipment/readiness-impacts';

import { useGetInexperiencedPersonnelQuery, useGetUnavailablePersonnelQuery } from '@store/amap_api/personnel/slices';
import { useGetMaintenanceSchedulerQuery } from '@store/griffin_api/events/slices';

import { ThemedTestingComponent } from '@vitest/helpers';

// Mock the RTK Query hooks
vi.mock('@store/griffin_api/events/slices', () => ({
  useGetMaintenanceSchedulerQuery: vi.fn(),
}));
vi.mock('@store/amap_api/personnel/slices', () => ({
  useGetInexperiencedPersonnelQuery: vi.fn(),
  useGetUnavailablePersonnelQuery: vi.fn(),
}));

// Mock PmxAccordionItemTemplate
vi.mock('@components/PmxAccordionItemTemplate', () => ({
  __esModule: true,
  default: vi.fn(({ title, total, children, isError, isFetching, refetch: _refetch }) => (
    <div data-testid={`accordion-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div data-testid={`title-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</div>
      <div data-testid={`total-${title.replace(/\s+/g, '-').toLowerCase()}`}>{total}</div>
      <div data-testid={`error-${title.replace(/\s+/g, '-').toLowerCase()}`}>{isError ? 'error' : 'no-error'}</div>
      <div data-testid={`fetching-${title.replace(/\s+/g, '-').toLowerCase()}`}>
        {isFetching ? 'fetching' : 'not-fetching'}
      </div>
      <div data-testid={`children-${title.replace(/\s+/g, '-').toLowerCase()}`}>{children}</div>
    </div>
  )),
}));

describe('ReadinessImpacts', () => {
  const mockProps = {
    uic: 'U12345',
    start_date: '2023-01-01',
    end_date: '2023-01-31',
    validDateRange: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock hooks with default values
    (useGetMaintenanceSchedulerQuery as any).mockReturnValue({
      data: {
        scheduled: [
          { date: '2023-01-01', scheduled: 5 },
          { date: '2023-01-02', scheduled: 3 },
        ],
        unscheduled: [
          { date: '2023-01-01', unscheduled: 2 },
          { date: '2023-01-02', unscheduled: 1 },
        ],
      },
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    (useGetInexperiencedPersonnelQuery as any).mockReturnValue({
      data: [
        { name: 'Person1', count: 2 },
        { name: 'Person2', count: 3 },
      ],
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    (useGetUnavailablePersonnelQuery as any).mockReturnValue({
      data: [
        { name: 'Person3', count: 1 },
        { name: 'Person4', count: 4 },
      ],
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it('renders without crashing', () => {
    render(
      <ThemedTestingComponent>
        <ReadinessImpacts {...mockProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('accordion-scheduled-maintenance')).toBeInTheDocument();
    expect(screen.getByTestId('accordion-unscheduled-maintenance')).toBeInTheDocument();
    expect(screen.getByTestId('accordion-inexperienced-personnel')).toBeInTheDocument();
    expect(screen.getByTestId('accordion-unavailable-personnel')).toBeInTheDocument();
  });

  it('displays correct titles', () => {
    render(
      <ThemedTestingComponent>
        <ReadinessImpacts {...mockProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('title-scheduled-maintenance')).toHaveTextContent('Scheduled Maintenance');
    expect(screen.getByTestId('title-unscheduled-maintenance')).toHaveTextContent('Unscheduled Maintenance');
    expect(screen.getByTestId('title-inexperienced-personnel')).toHaveTextContent('Inexperienced Personnel');
    expect(screen.getByTestId('title-unavailable-personnel')).toHaveTextContent('Unavailable Personnel');
  });

  it('calculates totals correctly', () => {
    render(
      <ThemedTestingComponent>
        <ReadinessImpacts {...mockProps} />
      </ThemedTestingComponent>,
    );

    // Scheduled: 5 + 3 = 8
    expect(screen.getByTestId('total-scheduled-maintenance')).toHaveTextContent('8');
    // Unscheduled: 2 + 1 = 3
    expect(screen.getByTestId('total-unscheduled-maintenance')).toHaveTextContent('3');
    // Inexperienced: 2 + 3 = 5
    expect(screen.getByTestId('total-inexperienced-personnel')).toHaveTextContent('5');
    // Unavailable: 1 + 4 = 5
    expect(screen.getByTestId('total-unavailable-personnel')).toHaveTextContent('5');
  });

  it('passes correct data to children', () => {
    render(
      <ThemedTestingComponent>
        <ReadinessImpacts {...mockProps} />
      </ThemedTestingComponent>,
    );

    // Check if the data is rendered in the children
    // Since RenderData renders the data as Object.values(item).join(', ')
    expect(screen.getByTestId('children-scheduled-maintenance')).toHaveTextContent('2023-01-01, 52023-01-02, 3');
    expect(screen.getByTestId('children-unscheduled-maintenance')).toHaveTextContent('2023-01-01, 22023-01-02, 1');
    expect(screen.getByTestId('children-inexperienced-personnel')).toHaveTextContent('Person1, 2Person2, 3');
    expect(screen.getByTestId('children-unavailable-personnel')).toHaveTextContent('Person3, 1Person4, 4');
  });

  it('handles error states', () => {
    (useGetMaintenanceSchedulerQuery as any).mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(
      <ThemedTestingComponent>
        <ReadinessImpacts {...mockProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('error-scheduled-maintenance')).toHaveTextContent('error');
    expect(screen.getByTestId('error-unscheduled-maintenance')).toHaveTextContent('error');
  });

  it('handles fetching states', () => {
    (useGetInexperiencedPersonnelQuery as any).mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: true,
      refetch: vi.fn(),
    });

    render(
      <ThemedTestingComponent>
        <ReadinessImpacts {...mockProps} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('fetching-inexperienced-personnel')).toHaveTextContent('fetching');
  });

  it('skips queries when validDateRange is false', () => {
    render(
      <ThemedTestingComponent>
        <ReadinessImpacts {...mockProps} validDateRange={false} />
      </ThemedTestingComponent>,
    );

    expect(useGetMaintenanceSchedulerQuery).toHaveBeenCalledWith(
      { uic: 'U12345', start_date: '2023-01-01', end_date: '2023-01-31' },
      { skip: true },
    );
    expect(useGetInexperiencedPersonnelQuery).toHaveBeenCalledWith(
      { uic: 'U12345', start_date: '2023-01-01', end_date: '2023-01-31' },
      { skip: true },
    );
    expect(useGetUnavailablePersonnelQuery).toHaveBeenCalledWith(
      { uic: 'U12345', start_date: '2023-01-01', end_date: '2023-01-31' },
      { skip: true },
    );
  });
});
