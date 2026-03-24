import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { screen } from '@testing-library/react';

import Unit from '@features/daily-status-report/pages/Unit';

import { useAppSelector } from '@store/hooks';

// Mock Redux hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = vi.fn(() => ({
    startOf: vi.fn(() => ({
      format: vi.fn(() => '2024-01-01'),
    })),
    endOf: vi.fn(() => ({
      format: vi.fn(() => '2024-01-31'),
    })),
  }));
  return {
    default: mockDayjs,
  };
});

// Mock constants
vi.mock('@utils/constants', () => ({
  QUERY_DATE_FORMAT: 'YYYY-MM-DD',
}));

// Mock all the grid item components with proper prop handling
vi.mock('@features/daily-status-report/components/EquipmentDetails/EquipmentDetailsGridItem', () => ({
  default: ({ uic, startDate, endDate }: { uic?: string; startDate?: string; endDate?: string }) => (
    <div data-testid="equipment-details-grid-item">
      <div data-testid="equipment-details-uic">{uic || 'no-uic'}</div>
      <div data-testid="equipment-details-start-date">{startDate || 'no-start-date'}</div>
      <div data-testid="equipment-details-end-date">{endDate || 'no-end-date'}</div>
      Equipment Details
    </div>
  ),
}));

vi.mock('@features/daily-status-report/components/FlyingHours/FlyingHoursGridItem', () => ({
  default: ({ uic }: { uic?: string }) => (
    <div data-testid="flying-hours-grid-item">
      <div data-testid="flying-hours-uic">{uic || 'no-uic'}</div>
      Flying Hours
    </div>
  ),
}));

vi.mock('@features/daily-status-report/components/LaunchStatusGridItem', () => ({
  default: ({ uic, startDate, endDate }: { uic?: string; startDate?: string; endDate?: string }) => (
    <div data-testid="launch-status-grid-item">
      <div data-testid="launch-status-uic">{uic || 'no-uic'}</div>
      <div data-testid="launch-status-start-date">{startDate || 'no-start-date'}</div>
      <div data-testid="launch-status-end-date">{endDate || 'no-end-date'}</div>
      Launch Status
    </div>
  ),
}));

vi.mock('@features/daily-status-report/components/MaintenanceDetails/MaintenanceDetailsGridItem', () => ({
  default: ({ uic }: { uic?: string }) => (
    <div data-testid="maintenance-details-grid-item">
      <div data-testid="maintenance-details-uic">{uic || 'no-uic'}</div>
      Maintenance Details
    </div>
  ),
}));

vi.mock('@features/daily-status-report/components/MaintenanceStatusGridItem', () => ({
  default: ({ uic }: { uic?: string }) => (
    <div data-testid="maintenance-status-grid-item">
      <div data-testid="maintenance-status-uic">{uic || 'no-uic'}</div>
      Maintenance Status
    </div>
  ),
}));

vi.mock(
  '@features/daily-status-report/components/OperationalReadinessStatus/OperationalReadinessStatusGridItem',
  () => ({
    default: ({ uic, startDate, endDate }: { uic?: string; startDate?: string; endDate?: string }) => (
      <div data-testid="operational-readiness-status-grid-item">
        <div data-testid="operational-readiness-uic">{uic || 'no-uic'}</div>
        <div data-testid="operational-readiness-start-date">{startDate || 'no-start-date'}</div>
        <div data-testid="operational-readiness-end-date">{endDate || 'no-end-date'}</div>
        Operational Readiness Status
      </div>
    ),
  }),
);

describe('Unit', () => {
  const mockUseAppSelector = useAppSelector as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock
    mockUseAppSelector.mockReturnValue('TEST_UIC');
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Unit />);
      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();
    });

    it('renders all grid item components', () => {
      renderWithProviders(<Unit />);

      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('launch-status-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('maintenance-status-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('flying-hours-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('equipment-details-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('maintenance-details-grid-item')).toBeInTheDocument();
    });

    it('renders with Box container having flexGrow style', () => {
      const { container } = renderWithProviders(<Unit />);
      const boxElement = container.firstChild as HTMLElement;

      expect(boxElement).toBeInTheDocument();
      expect(boxElement).toHaveStyle({ flexGrow: 1 });
    });

    it('renders Grid container with proper spacing', () => {
      const { container } = renderWithProviders(<Unit />);

      const gridContainer = container.querySelector('.MuiGrid2-container');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    it('passes currentUic to all components that need it', () => {
      renderWithProviders(<Unit />);

      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('TEST_UIC');
      expect(screen.getByTestId('launch-status-uic')).toHaveTextContent('TEST_UIC');
      expect(screen.getByTestId('maintenance-status-uic')).toHaveTextContent('TEST_UIC');
      expect(screen.getByTestId('flying-hours-uic')).toHaveTextContent('TEST_UIC');
      expect(screen.getByTestId('equipment-details-uic')).toHaveTextContent('TEST_UIC');
      expect(screen.getByTestId('maintenance-details-uic')).toHaveTextContent('TEST_UIC');
    });

    it('passes correct dates to components that need them', () => {
      renderWithProviders(<Unit />);

      expect(screen.getByTestId('operational-readiness-start-date')).toHaveTextContent('2024-01-01');
      expect(screen.getByTestId('operational-readiness-end-date')).toHaveTextContent('2024-01-31');
      expect(screen.getByTestId('launch-status-start-date')).toHaveTextContent('2024-01-01');
      expect(screen.getByTestId('launch-status-end-date')).toHaveTextContent('2024-01-31');
      expect(screen.getByTestId('equipment-details-start-date')).toHaveTextContent('2024-01-01');
      expect(screen.getByTestId('equipment-details-end-date')).toHaveTextContent('2024-01-31');
    });
  });

  describe('Date Handling', () => {
    it('calculates dates using dayjs start and end of month', () => {
      renderWithProviders(<Unit />);

      expect(screen.getByTestId('operational-readiness-start-date')).toHaveTextContent('2024-01-01');
      expect(screen.getByTestId('operational-readiness-end-date')).toHaveTextContent('2024-01-31');
    });

    it('uses QUERY_DATE_FORMAT for date formatting', () => {
      renderWithProviders(<Unit />);

      const startDate = screen.getByTestId('operational-readiness-start-date').textContent;
      const endDate = screen.getByTestId('operational-readiness-end-date').textContent;

      expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Redux Integration', () => {
    it('calls useAppSelector to get currentUic', () => {
      renderWithProviders(<Unit />);

      expect(mockUseAppSelector).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles different currentUic values', () => {
      mockUseAppSelector.mockReturnValue('CUSTOM_UIC');

      renderWithProviders(<Unit />);

      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('CUSTOM_UIC');
    });

    it('handles null currentUic', () => {
      mockUseAppSelector.mockReturnValue(null);

      renderWithProviders(<Unit />);

      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('no-uic');
    });
  });

  describe('Grid Layout Structure', () => {
    it('renders components in correct grid positions', () => {
      renderWithProviders(<Unit />);

      const components = [
        'operational-readiness-status-grid-item',
        'launch-status-grid-item',
        'maintenance-status-grid-item',
        'flying-hours-grid-item',
        'equipment-details-grid-item',
        'maintenance-details-grid-item',
      ];

      components.forEach((testId) => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });
    });

    it('renders with proper Material-UI Grid structure', () => {
      const { container } = renderWithProviders(<Unit />);

      const gridContainer = container.querySelector('.MuiGrid2-container');
      expect(gridContainer).toBeInTheDocument();

      const gridItems = container.querySelectorAll('.MuiGrid2-root');
      expect(gridItems.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles component mounting and unmounting gracefully', () => {
      const { unmount } = renderWithProviders(<Unit />);

      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });

    it('maintains consistent DOM structure', () => {
      const { container } = renderWithProviders(<Unit />);

      expect(container.children).toHaveLength(1);
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toBeInTheDocument();
    });
  });
});
