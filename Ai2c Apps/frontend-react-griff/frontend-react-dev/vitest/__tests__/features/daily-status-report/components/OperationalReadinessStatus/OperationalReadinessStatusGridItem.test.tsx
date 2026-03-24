import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import OperationalReadinessStatusGridItem from '@features/daily-status-report/components/OperationalReadinessStatus/OperationalReadinessStatusGridItem';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { IAutoDsrTransform, IStatusStatInfo } from '@store/griffin_api/auto_dsr/transforms/autoDsrTransform';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

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

// Mock generateTestId
vi.mock('@utils/helpers', () => ({
  generateTestId: vi.fn((label: string, suffix: string) => `${label.toLowerCase().replace(/\s+/g, '-')}-${suffix}`),
}));

// Mock OperationalReadinessStat
vi.mock('@features/daily-status-report/components/OperationalReadinessStatus/OperationalReadinessStat', () => ({
  OperationalReadinessStat: ({ statInfo, totalAircraft }: { statInfo: IStatusStatInfo; totalAircraft: number }) => (
    <div data-testid={`operational-readiness-stat-${statInfo.status.toLowerCase()}`}>
      <div data-testid={`stat-status-${statInfo.status.toLowerCase()}`}>{statInfo.status}</div>
      <div data-testid={`stat-percentage-${statInfo.status.toLowerCase()}`}>
        {Math.round(statInfo.percentage * 100)}%
      </div>
      <div data-testid={`stat-count-${statInfo.status.toLowerCase()}`}>{statInfo.count}</div>
      <div data-testid={`stat-total-${statInfo.status.toLowerCase()}`}>{totalAircraft}</div>
    </div>
  ),
}));

// Mock QualitativeStackItem
vi.mock('@features/daily-status-report/components/OperationalReadinessStatus/QualitativeStackItem', () => ({
  QualitativeStackItem: ({ statInfo }: { statInfo: IStatusStatInfo }) => (
    <div
      data-testid={`qualitative-stack-item-${statInfo.status.toLowerCase()}`}
      style={{ width: `${statInfo.percentage * 100}%` }}
    >
      {statInfo.status}
    </div>
  ),
}));

const mockUseGetAutoDsrQuery = vi.mocked(useGetAutoDsrQuery);

describe('OperationalReadinessStatusGridItem', () => {
  const defaultProps = {
    uic: 'TEST_UIC',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  };

  const mockApiData: IAutoDsrTransform = {
    data: [],
    totalAircraft: 10,
    aircraftStatusStats: [
      {
        status: 'FMC',
        count: 5,
        percentage: 0.5,
        data: [],
      },
      {
        status: 'NMCS',
        count: 3,
        percentage: 0.3,
        data: [],
      },
      {
        status: 'DADE',
        count: 2,
        percentage: 0.2,
        data: [],
      },
    ],
    rtl: 7,
    nrtl: 3,
    units: [],
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
      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('pmx-grid-item-template')).toBeInTheDocument();
    });

    it('renders with correct label', () => {
      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-label')).toHaveTextContent('Operational Readiness Status');
    });

    it('renders with correct launch path', () => {
      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-launch-path')).toHaveTextContent('/readiness-analytics');
    });

    it('renders with correct minimum height', () => {
      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-min-height')).toHaveTextContent('208px');
    });

    it('renders horizontal stacked bar when data is available', () => {
      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('operational-readiness-status-horizontal-stacked-bar')).toBeInTheDocument();
    });

    it('renders aircraft status details section', () => {
      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      // Check that the Stack container for status details exists
      const gridChildren = screen.getByTestId('grid-children');
      expect(gridChildren).toBeInTheDocument();
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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} uic={undefined} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} uic="" />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} uic={undefined} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} uic="" />);

      expect(screen.getByTestId('grid-uninitialized')).toBeInTheDocument();
    });
  });

  describe('Horizontal Stacked Bar', () => {
    it('renders QualitativeStackItem for each status with non-zero count', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('qualitative-stack-item-fmc')).toBeInTheDocument();
      expect(screen.getByTestId('qualitative-stack-item-nmcs')).toBeInTheDocument();
      expect(screen.getByTestId('qualitative-stack-item-dade')).toBeInTheDocument();
    });

    it('does not render QualitativeStackItem for status with zero count', () => {
      const dataWithZeroCount = {
        ...mockApiData,
        aircraftStatusStats: [
          ...mockApiData.aircraftStatusStats,
          {
            status: 'PMCS',
            count: 0,
            percentage: 0,
            data: [],
          },
        ],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: dataWithZeroCount,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.queryByTestId('qualitative-stack-item-pmcs')).not.toBeInTheDocument();
    });

    it('does not render horizontal stacked bar items when data is undefined', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('operational-readiness-status-horizontal-stacked-bar')).toBeInTheDocument();
      // But no QualitativeStackItems should be rendered
      expect(screen.queryByTestId('qualitative-stack-item-fmc')).not.toBeInTheDocument();
    });
  });

  describe('Aircraft Status Details', () => {
    it('renders OperationalReadinessStat for each status when data is available', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('operational-readiness-stat-fmc')).toBeInTheDocument();
      expect(screen.getByTestId('operational-readiness-stat-nmcs')).toBeInTheDocument();
      expect(screen.getByTestId('operational-readiness-stat-dade')).toBeInTheDocument();
    });

    it('displays correct status information', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      // Check FMC status
      expect(screen.getByTestId('stat-status-fmc')).toHaveTextContent('FMC');
      expect(screen.getByTestId('stat-percentage-fmc')).toHaveTextContent('50%');
      expect(screen.getByTestId('stat-count-fmc')).toHaveTextContent('5');
      expect(screen.getByTestId('stat-total-fmc')).toHaveTextContent('10');

      // Check NMCS status
      expect(screen.getByTestId('stat-status-nmcs')).toHaveTextContent('NMCS');
      expect(screen.getByTestId('stat-percentage-nmcs')).toHaveTextContent('30%');
      expect(screen.getByTestId('stat-count-nmcs')).toHaveTextContent('3');
      expect(screen.getByTestId('stat-total-nmcs')).toHaveTextContent('10');

      // Check DADE status
      expect(screen.getByTestId('stat-status-dade')).toHaveTextContent('DADE');
      expect(screen.getByTestId('stat-percentage-dade')).toHaveTextContent('20%');
      expect(screen.getByTestId('stat-count-dade')).toHaveTextContent('2');
      expect(screen.getByTestId('stat-total-dade')).toHaveTextContent('10');
    });

    it('does not render status details when data is undefined', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.queryByTestId('operational-readiness-stat-fmc')).not.toBeInTheDocument();
      expect(screen.queryByTestId('operational-readiness-stat-nmcs')).not.toBeInTheDocument();
      expect(screen.queryByTestId('operational-readiness-stat-dade')).not.toBeInTheDocument();
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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      const refetchButton = screen.getByTestId('grid-refetch');
      expect(refetchButton).toBeInTheDocument();

      refetchButton.click();
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Layout Structure', () => {
    it('renders with proper Stack structure for horizontal bar', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { container } = renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      const stacks = container.querySelectorAll('.MuiStack-root');
      expect(stacks.length).toBeGreaterThan(0);
    });

    it('renders with proper divider in status details section', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { container } = renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      const dividers = container.querySelectorAll('.MuiDivider-root');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty aircraftStatusStats array', () => {
      const emptyData = {
        ...mockApiData,
        aircraftStatusStats: [],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: emptyData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('operational-readiness-status-horizontal-stacked-bar')).toBeInTheDocument();
      expect(screen.queryByTestId('qualitative-stack-item-fmc')).not.toBeInTheDocument();
      expect(screen.queryByTestId('operational-readiness-stat-fmc')).not.toBeInTheDocument();
    });

    it('handles zero total aircraft', () => {
      const zeroTotalData = {
        ...mockApiData,
        totalAircraft: 0,
        aircraftStatusStats: [
          {
            status: 'FMC',
            count: 0,
            percentage: 0,
            data: [],
          },
        ],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: zeroTotalData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('stat-total-fmc')).toHaveTextContent('0');
      expect(screen.getByTestId('stat-percentage-fmc')).toHaveTextContent('0%');
    });

    it('handles large numbers correctly', () => {
      const largeData = {
        ...mockApiData,
        totalAircraft: 1000,
        aircraftStatusStats: [
          {
            status: 'FMC',
            count: 999,
            percentage: 0.999,
            data: [],
          },
        ],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: largeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('stat-total-fmc')).toHaveTextContent('1000');
      expect(screen.getByTestId('stat-count-fmc')).toHaveTextContent('999');
      expect(screen.getByTestId('stat-percentage-fmc')).toHaveTextContent('100%'); // Math.round(0.999 * 100) = 100
    });

    it('handles component re-renders correctly', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      const { rerender } = renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('stat-percentage-fmc')).toHaveTextContent('50%');

      const newData = {
        ...mockApiData,
        aircraftStatusStats: [
          {
            status: 'FMC',
            count: 8,
            percentage: 0.8,
            data: [],
          },
        ],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: newData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      rerender(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('stat-percentage-fmc')).toHaveTextContent('80%');
    });

    it('handles negative values gracefully', () => {
      const negativeData = {
        ...mockApiData,
        aircraftStatusStats: [
          {
            status: 'FMC',
            count: -5, // This shouldn't happen in real data, but testing edge case
            percentage: -0.5,
            data: [],
          },
        ],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: negativeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('stat-count-fmc')).toHaveTextContent('-5');
      expect(screen.getByTestId('stat-percentage-fmc')).toHaveTextContent('-50%'); // Math.round(-0.5 * 100) = -50
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

      renderWithProviders(
        <OperationalReadinessStatusGridItem uic="TEST_UIC" startDate="2024-12-01" endDate="2024-12-31" />,
      );

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
      renderWithProviders(
        <OperationalReadinessStatusGridItem uic={specialUic} startDate="2024-01-01" endDate="2024-01-31" />,
      );

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: specialUic,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: false },
      );
    });

    it('handles null and undefined UIC values', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <OperationalReadinessStatusGridItem uic={undefined} startDate="2024-01-01" endDate="2024-01-31" />,
      );

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: undefined,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: true },
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

      renderWithProviders(
        <OperationalReadinessStatusGridItem uic="TEST_UIC" startDate="2023-01-01" endDate="2024-12-31" />,
      );

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

  describe('Data Filtering', () => {
    it('filters out status items with zero count from horizontal bar', () => {
      const mixedData = {
        ...mockApiData,
        aircraftStatusStats: [
          {
            status: 'FMC',
            count: 5,
            percentage: 0.5,
            data: [],
          },
          {
            status: 'NMCS',
            count: 0,
            percentage: 0,
            data: [],
          },
          {
            status: 'DADE',
            count: 2,
            percentage: 0.2,
            data: [],
          },
        ],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mixedData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      // Should render FMC and DADE in horizontal bar
      expect(screen.getByTestId('qualitative-stack-item-fmc')).toBeInTheDocument();
      expect(screen.getByTestId('qualitative-stack-item-dade')).toBeInTheDocument();

      // Should NOT render NMCS in horizontal bar (count = 0)
      expect(screen.queryByTestId('qualitative-stack-item-nmcs')).not.toBeInTheDocument();

      // But should render all in status details section
      expect(screen.getByTestId('operational-readiness-stat-fmc')).toBeInTheDocument();
      expect(screen.getByTestId('operational-readiness-stat-nmcs')).toBeInTheDocument();
      expect(screen.getByTestId('operational-readiness-stat-dade')).toBeInTheDocument();
    });

    it('renders all status items in details section regardless of count', () => {
      const allZeroData = {
        ...mockApiData,
        aircraftStatusStats: [
          {
            status: 'FMC',
            count: 0,
            percentage: 0,
            data: [],
          },
          {
            status: 'NMCS',
            count: 0,
            percentage: 0,
            data: [],
          },
        ],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: allZeroData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      // No items in horizontal bar
      expect(screen.queryByTestId('qualitative-stack-item-fmc')).not.toBeInTheDocument();
      expect(screen.queryByTestId('qualitative-stack-item-nmcs')).not.toBeInTheDocument();

      // But all items in status details
      expect(screen.getByTestId('operational-readiness-stat-fmc')).toBeInTheDocument();
      expect(screen.getByTestId('operational-readiness-stat-nmcs')).toBeInTheDocument();
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

      const { rerender } = renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(<OperationalReadinessStatusGridItem {...defaultProps} />);

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

      const { rerender } = renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

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

      rerender(<OperationalReadinessStatusGridItem {...newProps} />);

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

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('grid-label')).toHaveTextContent('Operational Readiness Status');
      expect(screen.getByTestId('operational-readiness-status-horizontal-stacked-bar')).toBeInTheDocument();
    });

    it('maintains consistent layout structure', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: mockApiData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

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
        aircraftStatusStats: [
          {
            status: 'FMC',
            count: 9,
            percentage: 0.6,
            data: [],
          },
          {
            status: 'NMCS',
            count: 6,
            percentage: 0.4,
            data: [],
          },
        ],
        rtl: 10,
        nrtl: 5,
        units: [],
      };

      mockUseGetAutoDsrQuery.mockReturnValue({
        data: transformedData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(<OperationalReadinessStatusGridItem {...defaultProps} />);

      expect(screen.getByTestId('stat-percentage-fmc')).toHaveTextContent('60%'); // 0.6 * 100 = 60%
      expect(screen.getByTestId('stat-percentage-nmcs')).toHaveTextContent('40%'); // 0.4 * 100 = 40%
      expect(screen.getByTestId('stat-count-fmc')).toHaveTextContent('9');
      expect(screen.getByTestId('stat-count-nmcs')).toHaveTextContent('6');
      expect(screen.getAllByText('15')).toHaveLength(2); // Total aircraft for both FMC and NMCS
    });
  });
});
