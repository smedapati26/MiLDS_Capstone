import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import { PhaseFlowProvider } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import PhaseFlowCarousel from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowCarousel';

import { useAppSelector } from '@store/hooks';

import {
  mappedCompanyData,
  mappedTestAircraftPhaseFlowModels,
  mappedTestAircraftPhaseFlowSubordinates,
} from '@vitest/mocks/griffin_api_handlers/aircraft/mock_data';

// Mocking the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));
(useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');

vi.mock('@store/griffin_api/aircraft/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftCompanyQuery: vi.fn(),
    useGetAircraftPhaseFlowSubordinatesQuery: vi.fn(),
  };
});

describe('PhaseFlowCarousel loading', () => {
  it('test loading', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowCarousel data={[]} isLoading={true} companyInfo={[]} />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    const skeleton = screen.getByTestId('carousel-pf-chart-loading');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('PhaseFlowCarousel rendering', () => {
  it('test rendering subordinates.', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowCarousel
            data={mappedTestAircraftPhaseFlowSubordinates}
            isLoading={false}
            companyInfo={mappedCompanyData}
          />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    const plots = screen.getAllByTestId(/name-\d-pf-bar-chart-container/);
    expect(plots.length).toBe(3);
  });

  it('test rendering models.', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowCarousel
            data={mappedTestAircraftPhaseFlowModels}
            isLoading={false}
            companyInfo={mappedCompanyData}
          />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    const plots = screen.getAllByTestId(/^.*-pf-bar-chart-container/);
    expect(plots.length).toBe(3);
  });
});
