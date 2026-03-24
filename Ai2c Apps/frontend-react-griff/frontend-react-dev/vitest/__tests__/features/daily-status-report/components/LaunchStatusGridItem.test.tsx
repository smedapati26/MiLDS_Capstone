import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import LaunchStatusGridItem, { LaunchStatus } from '@features/daily-status-report/components/LaunchStatusGridItem';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';

import { renderWithProviders } from '@vitest/helpers';

import '@testing-library/jest-dom';

// Mock the API hook
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrQuery: vi.fn(),
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

const mockUseGetAutoDsrQuery = vi.mocked(useGetAutoDsrQuery);

describe('LaunchStatus', () => {
  describe('Component Rendering', () => {
    it('renders with basic props', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={7} totalAircraft={10} />);

      expect(screen.getByText('RTL')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('# of aircraft')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('/')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders with default values when count and totalAircraft are not provided', () => {
      renderWithProviders(<LaunchStatus label="NRTL" />);

      expect(screen.getByText('NRTL')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('/')).toBeInTheDocument();
      expect(screen.getAllByText('0')).toHaveLength(2); // count and totalAircraft both 0
    });

    it('renders with partial props', () => {
      renderWithProviders(<LaunchStatus label="Test" count={5} />);

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument(); // 5/0 = 0% (division by zero handled)
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // totalAircraft defaults to 0
    });
  });

  describe('Percentage Calculations', () => {
    it('calculates percentage correctly for normal values', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={7} totalAircraft={10} />);
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('calculates percentage correctly for edge cases', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={1} totalAircraft={3} />);
      expect(screen.getByText('33%')).toBeInTheDocument(); // Math.round(1/3 * 100) = 33
    });

    it('handles zero total aircraft gracefully', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={5} totalAircraft={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles 100% correctly', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={10} totalAircraft={10} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles values greater than total correctly', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={15} totalAircraft={10} />);
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('rounds percentage to nearest integer', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={1} totalAircraft={6} />);
      expect(screen.getByText('17%')).toBeInTheDocument(); // Math.round(1/6 * 100) = 17
    });
  });

  describe('Typography and Styling', () => {
    it('renders label with correct typography variant', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={7} totalAircraft={10} />);

      const label = screen.getByText('RTL');
      expect(label).toHaveClass('MuiTypography-body1');
    });

    it('renders percentage with correct typography variant', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={7} totalAircraft={10} />);

      const percentage = screen.getByText('70%');
      expect(percentage).toHaveClass('MuiTypography-h4');
    });

    it('renders aircraft count with correct typography variants', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={7} totalAircraft={10} />);

      const count = screen.getByText('7');
      expect(count).toHaveClass('MuiTypography-h6');

      const divider = screen.getByText('/');
      expect(divider).toHaveClass('MuiTypography-h7');

      const total = screen.getByText('10');
      expect(total).toHaveClass('MuiTypography-h7');
    });

    it('renders "# of aircraft" label with secondary color', () => {
      renderWithProviders(<LaunchStatus label="RTL" count={7} totalAircraft={10} />);

      const aircraftLabel = screen.getByText('# of aircraft');
      expect(aircraftLabel).toHaveClass('MuiTypography-body3');
    });
  });

  describe('Stack Layout', () => {
    it('renders with proper Stack structure', () => {
      const { container } = renderWithProviders(<LaunchStatus label="RTL" count={7} totalAircraft={10} />);

      const stacks = container.querySelectorAll('.MuiStack-root');
      expect(stacks.length).toBeGreaterThan(0);
    });
  });
});

describe('LaunchStatusGridItem', () => {
  const defaultProps = {
    uic: 'TEST_UIC',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  const mockApiData = {
    rtl: 7,
    nrtl: 3,
    totalAircraft: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });
    });

    it('renders without crashing', () => {
      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('pmx-grid-item-template')).toBeInTheDocument();
    });

    it('renders with correct label', () => {
      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-label')).toHaveTextContent('Launch Status');
    });

    it('renders with correct launch path', () => {
      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-launch-path')).toHaveTextContent('/equipment-manager');
    });

    it('renders with correct minimum height', () => {
      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-min-height')).toHaveTextContent('208px');
    });

    it('renders both RTL and NRTL components when data is available', () => {
      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('RTL')).toBeInTheDocument();
      expect(screen.getByText('NRTL')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls useGetAutoDsrQuery with correct parameters', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: 'TEST_UIC',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: false },
      );
    });

    it('skips API call when uic is not provided', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} uic={undefined} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: undefined,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: true },
      );
    });

    it('skips API call when uic is empty string', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} uic="" />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: '',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: true },
      );
    });

    it('does not skip API call when uic is provided', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: 'TEST_UIC',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: false },
      );
    });
  });

  describe('Loading States', () => {
    it('passes isUninitialized state to PmxGridItemTemplate', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-uninitialized')).toBeInTheDocument();
    });

    it('passes isFetching state to PmxGridItemTemplate', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: true,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-fetching')).toBeInTheDocument();
    });

    it('passes isError state to PmxGridItemTemplate', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: true,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-error')).toBeInTheDocument();
    });

    it('treats missing uic as uninitialized', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} uic={undefined} />);

      expect(screen.getByTestId('grid-uninitialized')).toBeInTheDocument();
    });

    it('treats empty uic as uninitialized', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} uic="" />);

      expect(screen.getByTestId('grid-uninitialized')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays correct RTL data', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('RTL')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument(); // 7/10 = 70%
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays correct NRTL data', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('NRTL')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument(); // 3/10 = 30%
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays total aircraft count for both RTL and NRTL', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      const totalCounts = screen.getAllByText('10');
      expect(totalCounts).toHaveLength(2); // One for RTL, one for NRTL
    });

    it('handles undefined data gracefully', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('RTL')).toBeInTheDocument();
      expect(screen.getByText('NRTL')).toBeInTheDocument();
      // Should show 0% for both when data is undefined
      expect(screen.getAllByText('0%')).toHaveLength(2);
    });

    it('handles partial data gracefully', () => {
      const partialData = {
        rtl: 5,
        // nrtl is missing
        totalAircraft: 8,
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: partialData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('RTL')).toBeInTheDocument();
      expect(screen.getByText('NRTL')).toBeInTheDocument();
      expect(screen.getByText('63%')).toBeInTheDocument(); // 5/8 = 62.5% rounded to 63%
      expect(screen.getByText('0%')).toBeInTheDocument(); // NRTL defaults to 0
    });

    it('handles zero values correctly', () => {
      const zeroData = {
        rtl: 0,
        nrtl: 0,
        totalAircraft: 0,
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: zeroData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getAllByText('0%')).toHaveLength(2); // Both RTL and NRTL should be 0%
      expect(screen.getAllByText('0')).toHaveLength(4); // count and total for both RTL and NRTL (4 total: 2 counts + 2 totals)
    });
  });

  describe('Refetch Functionality', () => {
    it('passes refetch function to PmxGridItemTemplate', () => {
      const mockRefetch = vi.fn();
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: true,
        isFetching: false,
        isUninitialized: false,
        refetch: mockRefetch,
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      const refetchButton = screen.getByTestId('grid-refetch');
      expect(refetchButton).toBeInTheDocument();

      refetchButton.click();
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Layout Structure', () => {
    it('renders Stack with correct divider', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { container } = renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      const dividers = container.querySelectorAll('.MuiDivider-root');
      expect(dividers.length).toBeGreaterThan(0);
    });

    it('renders with proper spacing and justification', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { container } = renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      const stacks = container.querySelectorAll('.MuiStack-root');
      expect(stacks.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles large numbers correctly', () => {
      const largeData = {
        rtl: 999,
        nrtl: 1,
        totalAircraft: 1000,
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: largeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('100%')).toBeInTheDocument(); // 999/1000 = 99.9% rounded to 100%
      expect(screen.getByText('0%')).toBeInTheDocument(); // 1/1000 = 0.1% rounded to 0%
      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('handles component re-renders correctly', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { rerender } = renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('70%')).toBeInTheDocument();

      const newData = {
        rtl: 8,
        nrtl: 2,
        totalAircraft: 10,
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: newData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      rerender(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('80%')).toBeInTheDocument(); // 8/10 = 80%
      expect(screen.getByText('20%')).toBeInTheDocument(); // 2/10 = 20%
    });

    it('handles negative values gracefully', () => {
      const negativeData = {
        rtl: -5, // This shouldn't happen in real data, but testing edge case
        nrtl: 15,
        totalAircraft: 10,
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: negativeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('-50%')).toBeInTheDocument(); // -5/10 = -50%
      expect(screen.getByText('150%')).toBeInTheDocument(); // 15/10 = 150%
    });
  });

  describe('Props Validation', () => {
    it('handles different date formats', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem uic="TEST_UIC" startDate="2024-12-01" endDate="2024-12-31" />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: 'TEST_UIC',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
        },
        { skip: false },
      );
    });

    it('handles special characters in UIC', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const specialUic = 'UIC-123@#$';
      renderWithProviders(<LaunchStatusGridItem uic={specialUic} startDate="2024-01-01" endDate="2024-01-31" />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: specialUic,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: false },
      );
    });

    it('handles long date ranges', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem uic="TEST_UIC" startDate="2023-01-01" endDate="2024-12-31" />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: 'TEST_UIC',
          start_date: '2023-01-01',
          end_date: '2024-12-31',
        },
        { skip: false },
      );
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders when props do not change', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { rerender } = renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(<LaunchStatusGridItem {...defaultProps} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledTimes(2); // Called again due to rerender
    });

    it('updates when props change', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { rerender } = renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: 'TEST_UIC',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: false },
      );

      const newProps = {
        uic: 'NEW_UIC',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
      };

      rerender(<LaunchStatusGridItem {...newProps} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: 'NEW_UIC',
          start_date: '2024-02-01',
          end_date: '2024-02-28',
        },
        { skip: false },
      );
    });
  });

  describe('Accessibility', () => {
    it('provides meaningful text content for screen readers', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('Launch Status')).toBeInTheDocument();
      expect(screen.getByText('RTL')).toBeInTheDocument();
      expect(screen.getByText('NRTL')).toBeInTheDocument();
      expect(screen.getAllByText('# of aircraft')).toHaveLength(2);
    });

    it('maintains consistent layout structure', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      // Verify the main structural elements are present
      expect(screen.getByTestId('pmx-grid-item-template')).toBeInTheDocument();
      expect(screen.getByTestId('grid-children')).toBeInTheDocument();
    });
  });

  describe('Integration with Transform Data', () => {
    it('correctly uses transformed data structure', () => {
      const transformedData = {
        data: [],
        totalAircraft: 15,
        aircraftStatusStats: [],
        rtl: 9,
        nrtl: 6,
        units: [],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: transformedData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<LaunchStatusGridItem {...defaultProps} />);

      expect(screen.getByText('60%')).toBeInTheDocument(); // 9/15 = 60%
      expect(screen.getByText('40%')).toBeInTheDocument(); // 6/15 = 40%
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getAllByText('15')).toHaveLength(2); // One for RTL, one for NRTL
    });
  });
});
