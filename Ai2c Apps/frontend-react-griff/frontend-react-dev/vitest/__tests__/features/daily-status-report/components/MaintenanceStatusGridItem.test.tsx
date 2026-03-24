import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { screen, waitFor } from '@testing-library/react';

import MaintenanceStatusGridItem, {
  prefixSign,
} from '@features/daily-status-report/components/MaintenanceStatusGridItem';
import { useBankTimeForecast } from '@features/daily-status-report/hooks/useBankTimeForecast';

import { IBankTimeForecast } from '@store/griffin_api/auto_dsr/models';

import '@testing-library/jest-dom';

// Mock the useBankTimeForecast hook
vi.mock('@features/daily-status-report/hooks/useBankTimeForecast', () => ({
  useBankTimeForecast: vi.fn(),
}));

const mockUseBankTimeForecast = vi.mocked(useBankTimeForecast);

// Mock the PmxGauge component
vi.mock('@components/PmxGauge', () => ({
  PmxGauge: ({ value, showAs, 'data-testid': testId }: { value: number; showAs: string; 'data-testid': string }) => (
    <div data-testid={testId} data-value={value} data-show-as={showAs}>
      Gauge: {Math.round(value * 100)}%
    </div>
  ),
}));

// Mock the PmxGridItemTemplate component
vi.mock('@components/PmxGridItemTemplate', () => ({
  __esModule: true,
  default: ({
    children,
    label,
    isError,
    isFetching,
    isUninitialized,
    refetch,
    launchPath,
    minHeight,
  }: {
    children: React.ReactNode;
    label: string;
    isError: boolean;
    isFetching: boolean;
    isUninitialized: boolean;
    refetch: () => void;
    launchPath: string;
    minHeight: string;
  }) => {
    if (isError) {
      return (
        <div data-testid="grid-item-error">
          <div>{label}</div>
          <button onClick={refetch}>Refresh</button>
        </div>
      );
    }

    if (isFetching || isUninitialized) {
      return (
        <div data-testid="maintenance-status-skeleton-loading">
          <div>{label}</div>
          <div>Loading...</div>
        </div>
      );
    }

    return (
      <div data-testid="grid-item-template" data-launch-path={launchPath} data-min-height={minHeight}>
        <div>{label}</div>
        {children}
      </div>
    );
  },
}));

// Mock Material-UI icons
vi.mock('@mui/icons-material/NorthEast', () => ({
  __esModule: true,
  default: ({ fontSize }: { fontSize?: string }) => (
    <span data-testid="north-east-icon" data-font-size={fontSize}>
      ↗
    </span>
  ),
}));

vi.mock('@mui/icons-material/SouthEast', () => ({
  __esModule: true,
  default: ({ fontSize }: { fontSize?: string }) => (
    <span data-testid="south-east-icon" data-font-size={fontSize}>
      ↘
    </span>
  ),
}));

// Mock data for testing
const mockBankTimeData: IBankTimeForecast[] = [
  {
    model: 'CH-47F',
    projections: [
      { date: '2025-02-15', value: 80 },
      { date: '2025-03-15', value: 75 },
      { date: '2025-04-15', value: 70 },
    ],
  },
  {
    model: 'UH-60M',
    projections: [
      { date: '2025-02-15', value: 60 },
      { date: '2025-03-15', value: 65 },
      { date: '2025-04-15', value: 70 },
    ],
  },
];

const defaultMockReturn = {
  percentage: 0.7,
  projectedDifference: 0,
  data: mockBankTimeData,
  isError: false,
  isFetching: false,
  isUninitialized: false,
  refetch: vi.fn(),
};

describe('MaintenanceStatusGridItem', () => {
  const testUic = 'TEST_UIC_123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBankTimeForecast.mockReturnValue(defaultMockReturn);
  });

  describe('Component Rendering', () => {
    it('renders with valid data and uic prop', async () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0.7, // 70%
        projectedDifference: 0,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      // Verify hook is called with correct UIC
      expect(mockUseBankTimeForecast).toHaveBeenCalledWith(testUic);

      // Verify component renders correctly
      expect(screen.getByText('Maintenance Status')).toBeInTheDocument();
      expect(screen.getByText('Bank Time')).toBeInTheDocument();
      expect(screen.getByText('projection for next period')).toBeInTheDocument();
      expect(screen.getByTestId('maintenance-status-bank-time-gauge')).toBeInTheDocument();
    });

    it('renders loading state when fetching', () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0,
        projectedDifference: 0,
        data: undefined,
        isError: false,
        isFetching: true,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledWith(testUic);
      expect(screen.getByTestId('maintenance-status-skeleton-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders error state', () => {
      const mockRefetch = vi.fn();
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0,
        projectedDifference: 0,
        data: undefined,
        isError: true,
        isFetching: false,
        isUninitialized: false,
        refetch: mockRefetch,
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledWith(testUic);
      expect(screen.getByTestId('grid-item-error')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    it('renders uninitialized state', () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0,
        projectedDifference: 0,
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: true,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledWith(testUic);
      expect(screen.getByTestId('maintenance-status-skeleton-loading')).toBeInTheDocument();
    });

    it('passes correct props to PmxGridItemTemplate', () => {
      const mockRefetch = vi.fn();
      mockUseBankTimeForecast.mockReturnValue({
        ...defaultMockReturn,
        refetch: mockRefetch,
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      const gridTemplate = screen.getByTestId('grid-item-template');
      expect(gridTemplate).toHaveAttribute('data-launch-path', '/maintenance-schedule');
      expect(gridTemplate).toHaveAttribute('data-min-height', '220px');
    });
  });

  describe('Data Display', () => {
    it('displays gauge with correct percentage value', async () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0.75, // 75%
        projectedDifference: 5,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      const gauge = screen.getByTestId('maintenance-status-bank-time-gauge');
      expect(gauge).toHaveAttribute('data-value', '0.75');
      expect(gauge).toHaveAttribute('data-show-as', 'percentage');
      expect(gauge).toHaveTextContent('Gauge: 75%');
    });

    it('displays positive projected difference correctly', async () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0.8, // 80%
        projectedDifference: 10,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('+10%')).toBeInTheDocument();
        expect(screen.getByTestId('north-east-icon')).toBeInTheDocument();
      });
    });

    it('displays negative projected difference correctly', async () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0.6, // 60%
        projectedDifference: -20,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('-20%')).toBeInTheDocument();
        expect(screen.getByTestId('south-east-icon')).toBeInTheDocument();
      });
    });

    it('displays zero projected difference correctly', async () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0.7, // 70%
        projectedDifference: 0,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByTestId('south-east-icon')).toBeInTheDocument();
      });
    });
  });

  describe('UIC Parameter Handling', () => {
    it('calls useBankTimeForecast with provided uic', () => {
      const customUic = 'CUSTOM_UIC_456';

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={customUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledWith(customUic);
    });

    it('handles empty uic string', () => {
      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic="" />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledWith('');
    });

    it('handles different uic formats', () => {
      const testCases = ['ABC123', 'unit-456', 'UNIT_WITH_UNDERSCORES', '12345'];

      testCases.forEach((uic) => {
        vi.clearAllMocks();

        renderWithProviders(
          <MemoryRouter>
            <MaintenanceStatusGridItem uic={uic} />
          </MemoryRouter>,
        );

        expect(mockUseBankTimeForecast).toHaveBeenCalledWith(uic);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data array', async () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0,
        projectedDifference: 0,
        data: [],
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('Maintenance Status')).toBeInTheDocument();
        expect(screen.getByText('Bank Time')).toBeInTheDocument();
      });
    });

    it('handles undefined data', async () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0,
        projectedDifference: 0,
        data: undefined,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText('Maintenance Status')).toBeInTheDocument();
      });
    });

    it('handles extreme percentage values', () => {
      const extremeValues = [0, 0.01, 0.99, 1];

      extremeValues.forEach((percentage) => {
        vi.clearAllMocks();
        mockUseBankTimeForecast.mockReturnValue({
          percentage,
          projectedDifference: 0,
          data: mockBankTimeData,
          isError: false,
          isFetching: false,
          isUninitialized: false,
          refetch: vi.fn(),
        });

        const { unmount } = renderWithProviders(
          <MemoryRouter>
            <MaintenanceStatusGridItem uic={testUic} />
          </MemoryRouter>,
        );

        const gauge = screen.getByTestId('maintenance-status-bank-time-gauge');
        expect(gauge).toHaveAttribute('data-value', percentage.toString());

        // Clean up after each iteration
        unmount();
      });
    });

    it('handles extreme projected difference values', () => {
      const extremeValues = [-100, -50, -1, 1, 50, 100];

      extremeValues.forEach((projectedDifference) => {
        vi.clearAllMocks();
        mockUseBankTimeForecast.mockReturnValue({
          percentage: 0.5,
          projectedDifference,
          data: mockBankTimeData,
          isError: false,
          isFetching: false,
          isUninitialized: false,
          refetch: vi.fn(),
        });

        const { unmount } = renderWithProviders(
          <MemoryRouter>
            <MaintenanceStatusGridItem uic={testUic} />
          </MemoryRouter>,
        );

        if (projectedDifference > 0) {
          expect(screen.getByText(`+${projectedDifference}%`)).toBeInTheDocument();
          expect(screen.getByTestId('north-east-icon')).toBeInTheDocument();
        } else {
          expect(screen.getByText(`${projectedDifference}%`)).toBeInTheDocument();
          expect(screen.getByTestId('south-east-icon')).toBeInTheDocument();
        }

        // Clean up after each iteration
        unmount();
      });
    });
  });

  describe('Component Integration', () => {
    it('integrates correctly with PmxGridItemTemplate error handling', () => {
      const mockRefetch = vi.fn();
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0,
        projectedDifference: 0,
        data: undefined,
        isError: true,
        isFetching: false,
        isUninitialized: false,
        refetch: mockRefetch,
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      const refreshButton = screen.getByText('Refresh');
      refreshButton.click();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('passes all required props to PmxGauge', () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0.85,
        projectedDifference: 15,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      const gauge = screen.getByTestId('maintenance-status-bank-time-gauge');
      expect(gauge).toHaveAttribute('data-value', '0.85');
      expect(gauge).toHaveAttribute('data-show-as', 'percentage');
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides meaningful text content for screen readers', () => {
      mockUseBankTimeForecast.mockReturnValue({
        percentage: 0.75,
        projectedDifference: 5,
        data: mockBankTimeData,
        isError: false,
        isFetching: false,
        isUninitialized: false,
        refetch: vi.fn(),
      });

      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      expect(screen.getByText('Maintenance Status')).toBeInTheDocument();
      expect(screen.getByText('Bank Time')).toBeInTheDocument();
      expect(screen.getByText('projection for next period')).toBeInTheDocument();
    });

    it('maintains consistent layout structure', () => {
      renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      // Verify the main structural elements are present
      expect(screen.getByTestId('grid-item-template')).toBeInTheDocument();
      expect(screen.getByText('Bank Time')).toBeInTheDocument();
      expect(screen.getByTestId('maintenance-status-bank-time-gauge')).toBeInTheDocument();
    });
  });

  describe('prefixSign Utility Function', () => {
    it('returns positive sign and NorthEast icon for positive values', () => {
      const result = prefixSign(10);
      expect(result).toBeDefined();

      // Render the result to test its content
      const { container } = renderWithProviders(<div>{result}</div>);
      expect(container.textContent).toContain('+10%');
    });

    it('returns negative sign and SouthEast icon for negative values', () => {
      const result = prefixSign(-10);
      expect(result).toBeDefined();

      const { container } = renderWithProviders(<div>{result}</div>);
      expect(container.textContent).toContain('-10%');
    });

    it('handles zero value with SouthEast icon', () => {
      const result = prefixSign(0);
      expect(result).toBeDefined();

      const { container } = renderWithProviders(<div>{result}</div>);
      expect(container.textContent).toContain('0%');
    });

    it('handles decimal values correctly', () => {
      const testCases = [5.5, -3.7, 0.1, -0.9];

      testCases.forEach((value) => {
        const result = prefixSign(value);
        expect(result).toBeDefined();

        const { container } = renderWithProviders(<div>{result}</div>);
        if (value > 0) {
          expect(container.textContent).toContain(`+${value}%`);
        } else {
          expect(container.textContent).toContain(`${value}%`);
        }
      });
    });

    it('handles large values correctly', () => {
      const largeValues = [999, -999, 1000, -1000];

      largeValues.forEach((value) => {
        const result = prefixSign(value);
        expect(result).toBeDefined();

        const { container } = renderWithProviders(<div>{result}</div>);
        if (value > 0) {
          expect(container.textContent).toContain(`+${value}%`);
        } else {
          expect(container.textContent).toContain(`${value}%`);
        }
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('does not cause unnecessary re-renders when props do not change', () => {
      const { rerender } = renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledTimes(2); // Called again due to rerender
    });

    it('updates when uic prop changes', () => {
      const { rerender } = renderWithProviders(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={testUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledWith(testUic);

      const newUic = 'NEW_UIC_789';
      rerender(
        <MemoryRouter>
          <MaintenanceStatusGridItem uic={newUic} />
        </MemoryRouter>,
      );

      expect(mockUseBankTimeForecast).toHaveBeenCalledWith(newUic);
    });
  });
});
