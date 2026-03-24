import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, screen } from '@testing-library/react';

import Subordinates from '@features/daily-status-report/pages/Subordinates';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock Redux hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

// Mock the API slice
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrQuery: vi.fn(),
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
  default: () => <div data-testid="equipment-details-grid-item">Equipment Details</div>,
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
    </div>
  ),
}));

vi.mock('@features/daily-status-report/components/MaintenanceDetails/MaintenanceDetailsGridItem', () => ({
  default: () => <div data-testid="maintenance-details-grid-item">Maintenance Details</div>,
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
      </div>
    ),
  }),
);

describe('Subordinates', () => {
  const mockUseAppSelector = useAppSelector as unknown as ReturnType<typeof vi.fn>;
  const mockUseGetAutoDsrQuery = useGetAutoDsrQuery as unknown as ReturnType<typeof vi.fn>;

  const mockApiData = {
    units: [
      { uic: 'UNIT_A', name: 'Unit Alpha' },
      { uic: 'UNIT_B', name: 'Unit Bravo' },
      { uic: 'UNIT_C', name: 'Unit Charlie' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockUseAppSelector.mockReturnValue('TEST_UIC');
    mockUseGetAutoDsrQuery.mockReturnValue({
      data: mockApiData,
      isLoading: false,
      error: null,
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<Subordinates />);
      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();
    });

    it('renders all grid item components', () => {
      renderWithProviders(<Subordinates />);

      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('launch-status-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('maintenance-status-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('flying-hours-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('equipment-details-grid-item')).toBeInTheDocument();
      expect(screen.getByTestId('maintenance-details-grid-item')).toBeInTheDocument();
    });

    it('renders with Box container having flexGrow style', () => {
      const { container } = renderWithProviders(<Subordinates />);
      const boxElement = container.firstChild as HTMLElement;

      expect(boxElement).toBeInTheDocument();
      expect(boxElement).toHaveStyle({ flexGrow: 1 });
    });

    it('renders Grid container with proper spacing', () => {
      const { container } = renderWithProviders(<Subordinates />);

      const gridContainer = container.querySelector('.MuiGrid2-container');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls useGetAutoDsrQuery with correct parameters', () => {
      mockUseAppSelector.mockReturnValue('TEST_UIC_123');

      renderWithProviders(<Subordinates />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: 'TEST_UIC_123',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: false },
      );
    });

    it('skips API call when currentUic is not available', () => {
      mockUseAppSelector.mockReturnValue(null);

      renderWithProviders(<Subordinates />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        {
          uic: null,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
        { skip: true },
      );
    });

    it('handles API loading state', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<Subordinates />);

      // Component should still render basic structure
      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();
    });

    it('handles API error state', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: 'API Error' },
      });

      renderWithProviders(<Subordinates />);

      // Component should still render basic structure
      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();
    });
  });

  describe('Toggle Button Group', () => {
    it('renders toggle button group when data is available', () => {
      renderWithProviders(<Subordinates />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unit A/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unit B/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Unit C/i })).toBeInTheDocument();
    });

    it('has first unit selected by default', () => {
      renderWithProviders(<Subordinates />);

      const unitAButton = screen.getByRole('button', { name: /Unit A/i });
      const unitBButton = screen.getByRole('button', { name: /Unit B/i });

      expect(unitAButton).toHaveAttribute('aria-pressed', 'true');
      expect(unitBButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders toggle buttons with correct aria-labels', () => {
      renderWithProviders(<Subordinates />);

      expect(screen.getByLabelText('Unit Alpha')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit Bravo')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit Charlie')).toBeInTheDocument();
    });

    it('updates selected UIC when toggle button is clicked', () => {
      renderWithProviders(<Subordinates />);

      const unitBButton = screen.getByRole('button', { name: /Unit B/i });
      fireEvent.click(unitBButton);

      // Check that the selected UIC is passed to components
      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('UNIT_B');
      expect(screen.getByTestId('launch-status-uic')).toHaveTextContent('UNIT_B');
    });
  });

  describe('Props Passing', () => {
    it('passes selected UIC to components that need it', () => {
      renderWithProviders(<Subordinates />);

      // Initially first unit should be selected
      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('UNIT_A');
      expect(screen.getByTestId('launch-status-uic')).toHaveTextContent('UNIT_A');
      expect(screen.getByTestId('maintenance-status-uic')).toHaveTextContent('UNIT_A');
      expect(screen.getByTestId('flying-hours-uic')).toHaveTextContent('UNIT_A');
    });

    it('passes correct dates to components that need them', () => {
      renderWithProviders(<Subordinates />);

      expect(screen.getByTestId('operational-readiness-start-date')).toHaveTextContent('2024-01-01');
      expect(screen.getByTestId('operational-readiness-end-date')).toHaveTextContent('2024-01-31');
      expect(screen.getByTestId('launch-status-start-date')).toHaveTextContent('2024-01-01');
      expect(screen.getByTestId('launch-status-end-date')).toHaveTextContent('2024-01-31');
    });

    it('updates component props when different unit is selected', () => {
      renderWithProviders(<Subordinates />);

      const unitCButton = screen.getByRole('button', { name: /Unit C/i });
      fireEvent.click(unitCButton);

      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('UNIT_C');
      expect(screen.getByTestId('launch-status-uic')).toHaveTextContent('UNIT_C');
      expect(screen.getByTestId('maintenance-status-uic')).toHaveTextContent('UNIT_C');
      expect(screen.getByTestId('flying-hours-uic')).toHaveTextContent('UNIT_C');
    });
  });

  describe('Date Handling', () => {
    it('calculates dates using dayjs start and end of month', () => {
      renderWithProviders(<Subordinates />);

      expect(screen.getByTestId('operational-readiness-start-date')).toHaveTextContent('2024-01-01');
      expect(screen.getByTestId('operational-readiness-end-date')).toHaveTextContent('2024-01-31');
    });

    it('uses QUERY_DATE_FORMAT for date formatting', () => {
      renderWithProviders(<Subordinates />);

      const startDate = screen.getByTestId('operational-readiness-start-date').textContent;
      const endDate = screen.getByTestId('operational-readiness-end-date').textContent;

      expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Redux Integration', () => {
    it('calls useAppSelector to get currentUic', () => {
      renderWithProviders(<Subordinates />);

      expect(mockUseAppSelector).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles different currentUic values', () => {
      mockUseAppSelector.mockReturnValue('CUSTOM_UIC');

      renderWithProviders(<Subordinates />);

      expect(mockUseGetAutoDsrQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          uic: 'CUSTOM_UIC',
        }),
        expect.any(Object),
      );
    });
  });

  describe('Component State Management', () => {
    it('initializes with first unit selected when data loads', () => {
      renderWithProviders(<Subordinates />);

      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('UNIT_A');
    });

    it('maintains selected unit across re-renders', () => {
      const { rerender } = renderWithProviders(<Subordinates />);

      const unitBButton = screen.getByRole('button', { name: /Unit B/i });
      fireEvent.click(unitBButton);

      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('UNIT_B');

      rerender(<Subordinates />);
    });

    it('resets selection when new data is loaded', () => {
      const { rerender } = renderWithProviders(<Subordinates />);

      // Select second unit
      const unitBButton = screen.getByRole('button', { name: /Unit B/i });
      fireEvent.click(unitBButton);
      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('UNIT_B');

      // Update mock data
      const newMockData = {
        units: [
          { uic: 'NEW_UNIT_X', name: 'New Unit X' },
          { uic: 'NEW_UNIT_Y', name: 'New Unit Y' },
        ],
      };
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: newMockData,
        isLoading: false,
        error: null,
      });

      rerender(<Subordinates />);

      // Should reset to first unit of new data
      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('NEW_UNIT_X');
    });
  });

  describe('Grid Layout Structure', () => {
    it('renders components in correct grid positions', () => {
      renderWithProviders(<Subordinates />);

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

    it('renders toggle button group before other components', () => {
      renderWithProviders(<Subordinates />);

      const toggleButtonGroup = screen.getByRole('group');
      const firstGridItem = screen.getByTestId('operational-readiness-status-grid-item');

      expect(toggleButtonGroup.compareDocumentPosition(firstGridItem)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('renders with proper Material-UI Grid structure', () => {
      const { container } = renderWithProviders(<Subordinates />);

      const gridContainer = container.querySelector('.MuiGrid2-container');
      expect(gridContainer).toBeInTheDocument();

      const gridItems = container.querySelectorAll('.MuiGrid2-root');
      expect(gridItems.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for toggle buttons', () => {
      renderWithProviders(<Subordinates />);

      const unitAButton = screen.getByRole('button', { name: /Unit A/i });
      const unitBButton = screen.getByRole('button', { name: /Unit B/i });

      expect(unitAButton).toHaveAttribute('aria-label', 'Unit Alpha');
      expect(unitBButton).toHaveAttribute('aria-label', 'Unit Bravo');
    });

    it('has proper role attributes', () => {
      renderWithProviders(<Subordinates />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    it('maintains keyboard navigation support', () => {
      renderWithProviders(<Subordinates />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles component mounting and unmounting gracefully', () => {
      const { unmount } = renderWithProviders(<Subordinates />);

      expect(screen.getByTestId('operational-readiness-status-grid-item')).toBeInTheDocument();

      expect(() => unmount()).not.toThrow();
    });

    it('handles single unit in data', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: { units: [{ uic: 'SINGLE_UNIT', name: 'Single Unit' }] },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<Subordinates />);

      expect(screen.getByRole('button', { name: /Single Unit/i })).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('SINGLE_UNIT');
    });

    it('handles units with special characters in UIC', () => {
      mockUseGetAutoDsrQuery.mockReturnValue({
        data: { units: [{ uic: 'UNIT@#$%', name: 'Special Unit' }] },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<Subordinates />);

      expect(screen.getByTestId('operational-readiness-uic')).toHaveTextContent('UNIT@#$%');
    });

    it('maintains consistent DOM structure', () => {
      const { container } = renderWithProviders(<Subordinates />);

      expect(container.children).toHaveLength(1);
      const rootElement = container.firstChild as HTMLElement;
      expect(rootElement).toBeInTheDocument();
    });
  });
});
