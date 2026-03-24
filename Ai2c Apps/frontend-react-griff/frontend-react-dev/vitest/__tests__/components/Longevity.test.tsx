import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Longevity } from '@components/Longevity/Longevity';
import type { PmxGaugeProps } from '@components/PmxGauge';

import { useGetLongevityQuery } from '@store/griffin_api/components/slices/componentsApi';

// Mock PmxModularGauge
vi.mock('@components/PmxGauge', () => ({
  PmxModularGauge: ({ value }: PmxGaugeProps) => <div data-testid="longevity-gauge">{value}</div>,
}));

// Mock the API slice
vi.mock('@store/griffin_api/components/slices/componentsApi', () => ({
  useGetLongevityQuery: vi.fn(),
}));

// Import the mocked function

describe('Longevity', () => {
  const baseProps = {
    tbo: 2608,
    flightHours: 1000,
    componentName: 'Test Component',
    selectedPart: 'TEST123',
    uic: 'WCEZFF',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton when loading', () => {
    (useGetLongevityQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });

    render(<Longevity {...baseProps} />);
    const skeleton = screen.getByTestId('longevity-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('shows error/no data state', () => {
    (useGetLongevityQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: true,
    });

    render(<Longevity {...baseProps} />);
    expect(screen.getByText(/No data has been found/i)).toBeInTheDocument();
  });

  it('shows "Good" when value is high', () => {
    (useGetLongevityQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { tbo: 1000, unit_average: 900, fleet_average: 800, value_type: 'maot' },
      isLoading: false,
      error: null,
    });

    render(<Longevity {...baseProps} />);
    expect(screen.getByTestId('longevity-gauge')).toHaveTextContent('0.9');
  });

  it('shows "Poor" when value is 0', () => {
    (useGetLongevityQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { tbo: 2608, unit_average: 0, fleet_average: 622065.7, value_type: 'maot' },
      isLoading: false,
      error: null,
    });

    render(<Longevity {...baseProps} />);
    expect(screen.getByTestId('longevity-gauge')).toHaveTextContent('0');
  });
});
