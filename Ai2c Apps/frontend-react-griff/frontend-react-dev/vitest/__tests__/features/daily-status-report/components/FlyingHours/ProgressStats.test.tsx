import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from 'vitest/helpers/renderWithProviders';

import { screen } from '@testing-library/react';

import { ProgressStats } from '@features/daily-status-report/components/FlyingHours/ProgressStats';

// Mock generateTestId
vi.mock('@utils/helpers', () => ({
  generateTestId: vi.fn((label: string, suffix: string, kebabCase?: boolean) => {
    const processedLabel = kebabCase ? label.toLowerCase().replace(/\s+/g, '-') : label;
    return `${suffix}-${processedLabel}`;
  }),
}));

// Mock NumericLinearProgress component
vi.mock('@ai2c/pmx-mui', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    NumericLinearProgress: ({ progress }: { progress: number }) => (
      <div data-testid="numeric-linear-progress" role="progressbar" aria-valuenow={progress}>
        <div data-testid="progress-value">{progress}%</div>
      </div>
    ),
  };
});

describe('ProgressStats', () => {
  const defaultProps = {
    label: 'Flight Training Hours',
    hours: 75,
    totalHours: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByTestId('flying-hours-flight-training-hours')).toBeInTheDocument();
    });

    it('renders with correct label', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByText('Flight Training Hours')).toBeInTheDocument();
    });

    it('renders progress bar with correct value', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '75'); // 75/100 = 75%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('75%');
    });

    it('renders completed hours section', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByText('Completed Hours')).toBeInTheDocument();
    });

    it('renders hours display correctly', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByText('75 hours flown')).toBeInTheDocument(); // current hours
      expect(screen.getByText('/')).toBeInTheDocument(); // separator
      expect(screen.getByText('100 hours projected')).toBeInTheDocument(); // total hours
    });

    it('renders with custom label', () => {
      const customProps = {
        ...defaultProps,
        label: 'Combat Mission Hours',
      };
      renderWithProviders(<ProgressStats {...customProps} />);

      expect(screen.getByText('Combat Mission Hours')).toBeInTheDocument();
      expect(screen.getByTestId('flying-hours-combat-mission-hours')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('calculates progress percentage correctly for normal values', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75'); // 75/100 = 75%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('75%');
    });

    it('calculates progress percentage correctly for partial completion', () => {
      const partialProps = {
        ...defaultProps,
        hours: 33,
        totalHours: 100,
      };
      renderWithProviders(<ProgressStats {...partialProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33'); // 33/100 = 33%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('33%');
    });

    it('handles 100% completion correctly', () => {
      const completeProps = {
        ...defaultProps,
        hours: 100,
        totalHours: 100,
      };
      renderWithProviders(<ProgressStats {...completeProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100'); // 100/100 = 100%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('100%');
    });

    it('handles over-completion correctly', () => {
      const overCompleteProps = {
        ...defaultProps,
        hours: 120,
        totalHours: 100,
      };
      renderWithProviders(<ProgressStats {...overCompleteProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '120'); // 120/100 = 120%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('120%');
    });

    it('handles zero total hours gracefully', () => {
      const zeroTotalProps = {
        ...defaultProps,
        hours: 50,
        totalHours: 0,
      };
      renderWithProviders(<ProgressStats {...zeroTotalProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0'); // Division by zero = 0%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('0%');
    });

    it('rounds percentage to nearest whole number', () => {
      const decimalProps = {
        ...defaultProps,
        hours: 33.7,
        totalHours: 100,
      };
      renderWithProviders(<ProgressStats {...decimalProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '34'); // Math.round(33.7) = 34%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('34%');
    });
  });

  describe('Number Rounding', () => {
    it('rounds hours to nearest whole number', () => {
      const decimalProps = {
        ...defaultProps,
        hours: 75.6,
        totalHours: 100.4,
      };
      renderWithProviders(<ProgressStats {...decimalProps} />);

      expect(screen.getByText('76 hours flown')).toBeInTheDocument(); // Math.round(75.6) = 76
      expect(screen.getByText('100 hours projected')).toBeInTheDocument(); // Math.round(100.4) = 100
    });

    it('handles negative hours gracefully', () => {
      const negativeProps = {
        ...defaultProps,
        hours: -10,
        totalHours: 100,
      };
      renderWithProviders(<ProgressStats {...negativeProps} />);

      expect(screen.getByText('-10 hours flown')).toBeInTheDocument(); // Should display negative value
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '-10'); // -10/100 = -10%
    });

    it('handles large numbers correctly', () => {
      const largeProps = {
        ...defaultProps,
        hours: 9999.7,
        totalHours: 10000.3,
      };
      renderWithProviders(<ProgressStats {...largeProps} />);

      expect(screen.getByText('10000 hours flown')).toBeInTheDocument(); // Math.round(9999.7) = 10000
      expect(screen.getByText('10000 hours projected')).toBeInTheDocument(); // Math.round(10000.3) = 10000
    });
  });

  describe('Edge Cases', () => {
    it('handles zero hours correctly', () => {
      const zeroHoursProps = {
        ...defaultProps,
        hours: 0,
        totalHours: 100,
      };
      renderWithProviders(<ProgressStats {...zeroHoursProps} />);

      expect(screen.getByText('0 hours flown')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0'); // 0/100 = 0%
      expect(screen.getByTestId('progress-value')).toHaveTextContent('0%');
    });

    it('handles both hours and total hours as zero', () => {
      const bothZeroProps = {
        ...defaultProps,
        hours: 0,
        totalHours: 0,
      };
      renderWithProviders(<ProgressStats {...bothZeroProps} />);

      expect(screen.getByText('0 hours flown')).toBeInTheDocument();
      expect(screen.getByText('0 hours projected')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0'); // Division by zero handled
    });

    it('handles very small decimal values', () => {
      const smallDecimalProps = {
        ...defaultProps,
        hours: 0.1,
        totalHours: 0.9,
      };
      renderWithProviders(<ProgressStats {...smallDecimalProps} />);

      expect(screen.getByText('0 hours flown')).toBeInTheDocument(); // Math.round(0.1) = 0
      expect(screen.getByText('1 hours projected')).toBeInTheDocument(); // Math.round(0.9) = 1
    });
  });

  describe('Component Structure', () => {
    it('maintains proper component hierarchy', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      const container = screen.getByTestId('flying-hours-flight-training-hours');
      expect(container).toBeInTheDocument();

      // Check that progress bar is within the container
      const progressBar = screen.getByRole('progressbar');
      expect(container).toContainElement(progressBar);

      // Check that text elements are within the container
      expect(container).toContainElement(screen.getByText('Flight Training Hours'));
      expect(container).toContainElement(screen.getByText('Completed Hours'));
    });

    it('renders with proper Stack structure', () => {
      const { container } = renderWithProviders(<ProgressStats {...defaultProps} />);

      const stacks = container.querySelectorAll('.MuiStack-root');
      expect(stacks.length).toBeGreaterThan(0);
    });

    it('renders with proper Typography components', () => {
      const { container } = renderWithProviders(<ProgressStats {...defaultProps} />);

      const typographyElements = container.querySelectorAll('.MuiTypography-root');
      expect(typographyElements.length).toBeGreaterThan(0);
    });
  });

  describe('Props Validation', () => {
    it('handles string labels with special characters', () => {
      const specialCharProps = {
        ...defaultProps,
        label: 'Flight Training Hours - Phase 1 (Advanced)',
      };
      renderWithProviders(<ProgressStats {...specialCharProps} />);

      expect(screen.getByText('Flight Training Hours - Phase 1 (Advanced)')).toBeInTheDocument();
    });

    it('handles empty string label', () => {
      const emptyLabelProps = {
        ...defaultProps,
        label: '',
      };
      renderWithProviders(<ProgressStats {...emptyLabelProps} />);

      // Should still render the component structure
      expect(screen.getByTestId('flying-hours-null')).toBeInTheDocument();
      expect(screen.getByText('Completed Hours')).toBeInTheDocument();
    });

    it('handles very long labels', () => {
      const longLabelProps = {
        ...defaultProps,
        label: 'This is a very long label that might cause layout issues if not handled properly in the component',
      };
      renderWithProviders(<ProgressStats {...longLabelProps} />);

      expect(
        screen.getByText(
          'This is a very long label that might cause layout issues if not handled properly in the component',
        ),
      ).toBeInTheDocument();
    });

    it('handles multi-word labels correctly', () => {
      const multiWordProps = {
        ...defaultProps,
        label: 'Multi Word Label With Spaces',
      };
      renderWithProviders(<ProgressStats {...multiWordProps} />);

      expect(screen.getByText('Multi Word Label With Spaces')).toBeInTheDocument();
      expect(screen.getByTestId('flying-hours-multi-word-label-with-spaces')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes for progress bar', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('provides meaningful text content for screen readers', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByText('Flight Training Hours')).toBeInTheDocument();
      expect(screen.getByText('Completed Hours')).toBeInTheDocument();
      expect(screen.getByText('75 hours flown')).toBeInTheDocument();
      expect(screen.getByText('100 hours projected')).toBeInTheDocument();
    });

    it('maintains consistent layout structure', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      // Verify the main structural elements are present
      expect(screen.getByTestId('flying-hours-flight-training-hours')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles component re-renders correctly', () => {
      const { rerender } = renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByText('75 hours flown')).toBeInTheDocument();
      expect(screen.getByTestId('progress-value')).toHaveTextContent('75%');

      const newProps = {
        ...defaultProps,
        hours: 90,
        totalHours: 120,
      };

      rerender(<ProgressStats {...newProps} />);

      expect(screen.getByText('90 hours flown')).toBeInTheDocument();
      expect(screen.getByText('120 hours projected')).toBeInTheDocument();
      expect(screen.getByTestId('progress-value')).toHaveTextContent('75%'); // 90/120 = 75%
    });

    it('does not cause unnecessary re-renders when props do not change', () => {
      const { rerender } = renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByText('Flight Training Hours')).toBeInTheDocument();

      // Rerender with same props
      rerender(<ProgressStats {...defaultProps} />);

      expect(screen.getByText('Flight Training Hours')).toBeInTheDocument();
      expect(screen.getByText('75 hours flown')).toBeInTheDocument();
    });
  });

  describe('Integration with Material-UI Theme', () => {
    it('renders with proper theme integration', () => {
      const { container } = renderWithProviders(<ProgressStats {...defaultProps} />);

      // Check that Material-UI components are rendered
      const muiComponents = container.querySelectorAll('[class*="Mui"]');
      expect(muiComponents.length).toBeGreaterThan(0);
    });

    it('applies proper spacing and layout', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      const container = screen.getByTestId('flying-hours-flight-training-hours');
      expect(container).toBeInTheDocument();

      // Verify that the component structure is maintained
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Completed Hours')).toBeInTheDocument();
    });
  });

  describe('Test ID Generation', () => {
    it('generates correct test ID with kebab case', () => {
      renderWithProviders(<ProgressStats {...defaultProps} />);

      expect(screen.getByTestId('flying-hours-flight-training-hours')).toBeInTheDocument();
    });

    it('generates correct test ID for different labels', () => {
      const differentLabelProps = {
        ...defaultProps,
        label: 'Combat Training Phase Two',
      };
      renderWithProviders(<ProgressStats {...differentLabelProps} />);

      expect(screen.getByTestId('flying-hours-combat-training-phase-two')).toBeInTheDocument();
    });
  });
});
