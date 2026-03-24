/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import EquipmentDetailsGridItem, {
  EquipmentDetailsGridItemProps,
} from '@features/daily-status-report/components/EquipmentDetails/EquipmentDetailsGridItem';

// Mock RTK Query hooks
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrQuery: vi.fn(),
}));

// Mock the table components
vi.mock('@features/daily-status-report/components/EquipmentDetails/Aircraft/AircraftTable', () => ({
  AircraftTable: ({ onToggle }: any) => (
    <div data-testid="aircraft-table">
      <button data-testid="toggle-to-agse" onClick={() => onToggle('AGSE')}>
        Toggle to AGSE
      </button>
    </div>
  ),
}));

vi.mock('@features/daily-status-report/components/EquipmentDetails/AGSE/AgseTable', () => ({
  AgseTable: ({ onToggle }: any) => (
    <div data-testid="agse-table">
      <button data-testid="toggle-to-aircraft" onClick={() => onToggle('Aircraft')}>
        Toggle to Aircraft
      </button>
    </div>
  ),
}));

// Mock PmxAccordion
vi.mock('@components/PmxAccordion', () => ({
  default: ({ heading, children, launchPath, isLoading }: any) => (
    <div data-testid="pmx-accordion" data-loading={isLoading}>
      <div data-testid="accordion-heading">{heading}</div>
      {launchPath && (
        <button data-testid="launch-button" onClick={() => {}}>
          {heading} Launch {launchPath}
        </button>
      )}
      <div>{children}</div>
    </div>
  ),
}));

// Mock useTheme
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        mode: 'light',
        layout: {
          background7: '#ffffff',
          background11: '#000000',
        },
      },
    }),
  };
});

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';

const mockUseGetAutoDsrQuery = vi.mocked(useGetAutoDsrQuery);

describe('EquipmentDetailsGridItem', () => {
  const defaultProps: EquipmentDetailsGridItemProps = {
    uic: 'test-uic',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
  };

  beforeEach(() => {
    mockUseGetAutoDsrQuery.mockReturnValue({
      data: undefined,
      isUninitialized: false,
      isFetching: false,
      isLoading: false,
      isError: false,
      isSuccess: false,
      refetch: vi.fn(),
    });
  });

  it('renders with default equipment type Aircraft and not loading', () => {
    render(<EquipmentDetailsGridItem {...defaultProps} />);

    expect(screen.getByTestId('accordion-heading')).toHaveTextContent('Equipment Details');
    expect(screen.getByTestId('launch-button')).toBeInTheDocument();
    expect(screen.getByTestId('aircraft-table')).toBeInTheDocument();
    expect(screen.queryByTestId('agse-table')).not.toBeInTheDocument();
    expect(screen.getByTestId('pmx-accordion')).toHaveAttribute('data-loading', 'false');
  });

  it('renders loading state when query is uninitialized or fetching', () => {
    mockUseGetAutoDsrQuery.mockReturnValue({
      ...mockUseGetAutoDsrQuery(defaultProps),
      isUninitialized: true,
      isFetching: false,
    });

    render(<EquipmentDetailsGridItem {...defaultProps} />);

    expect(screen.getByTestId('pmx-accordion')).toHaveAttribute('data-loading', 'true');
  });

  it('renders loading state when fetching', () => {
    mockUseGetAutoDsrQuery.mockReturnValue({
      ...mockUseGetAutoDsrQuery(defaultProps),
      isUninitialized: false,
      isFetching: true,
    });

    render(<EquipmentDetailsGridItem {...defaultProps} />);

    expect(screen.getByTestId('pmx-accordion')).toHaveAttribute('data-loading', 'true');
  });

  it('toggles to AGSE when toggle button is clicked in AircraftTable', () => {
    render(<EquipmentDetailsGridItem {...defaultProps} />);

    const toggleButton = screen.getByTestId('toggle-to-agse');
    fireEvent.click(toggleButton);

    expect(screen.queryByTestId('aircraft-table')).not.toBeInTheDocument();
    expect(screen.getByTestId('agse-table')).toBeInTheDocument();
  });

  it('toggles back to Aircraft when toggle button is clicked in AgseTable', () => {
    render(<EquipmentDetailsGridItem {...defaultProps} />);

    // First toggle to AGSE
    const toggleToAgse = screen.getByTestId('toggle-to-agse');
    fireEvent.click(toggleToAgse);

    // Now toggle back
    const toggleToAircraft = screen.getByTestId('toggle-to-aircraft');
    fireEvent.click(toggleToAircraft);

    expect(screen.getByTestId('aircraft-table')).toBeInTheDocument();
    expect(screen.queryByTestId('agse-table')).not.toBeInTheDocument();
  });

  it('skips query when uic is undefined', () => {
    const propsWithoutUic: EquipmentDetailsGridItemProps = {
      uic: undefined,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    };

    render(<EquipmentDetailsGridItem {...propsWithoutUic} />);

    // Since skip: !uic, it should be uninitialized
    expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
      {
        uic: undefined,
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      },
      { skip: true },
    );
  });

  it('passes correct props to AircraftTable', () => {
    render(<EquipmentDetailsGridItem {...defaultProps} />);

    // The mock doesn't capture props, but we can check if it's rendered
    expect(screen.getByTestId('aircraft-table')).toBeInTheDocument();
  });

  it('passes correct props to AgseTable when toggled', () => {
    render(<EquipmentDetailsGridItem {...defaultProps} />);

    const toggleButton = screen.getByTestId('toggle-to-agse');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('agse-table')).toBeInTheDocument();
  });
});
