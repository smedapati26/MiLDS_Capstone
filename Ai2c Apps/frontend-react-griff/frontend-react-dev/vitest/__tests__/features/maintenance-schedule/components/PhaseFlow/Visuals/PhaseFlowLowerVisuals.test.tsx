import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import {
  PhaseFamilies,
  usePhaseFlowContext,
} from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import PhaseFlowLowerVisuals from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowLowerVisuals';

import {
  useGetAircraftCompanyQuery,
  useGetAircraftPhaseFlowModelsQuery,
  useGetAircraftPhaseFlowSubordinatesQuery,
} from '@store/griffin_api/aircraft/slices';
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

vi.mock('@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext', () => ({
  usePhaseFlowContext: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftCompanyQuery: vi.fn(),
    useGetAircraftPhaseFlowSubordinatesQuery: vi.fn(),
    useGetAircraftPhaseFlowModelsQuery: vi.fn(),
  };
});

describe('PhaseFlowLowerVisuals', () => {
  beforeEach(() => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedModels: ['model 1', 'model 2'],
      selectedFamily: ['BLACK HAWK'] as unknown as PhaseFamilies[],
      getFamilyPhaseHours: vi.fn(() => 500),
    });
    (useGetAircraftCompanyQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mappedCompanyData,
      isLoading: false,
    });
    (useGetAircraftPhaseFlowSubordinatesQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mappedTestAircraftPhaseFlowSubordinates,
      isLoading: false,
    });
    (useGetAircraftPhaseFlowModelsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mappedTestAircraftPhaseFlowModels,
      isLoading: false,
    });

    render(
      <ThemedTestingComponent>
        <PhaseFlowLowerVisuals toggleReturnBy="subordinates" />
      </ThemedTestingComponent>,
    );
  });

  it('check rendered', () => {
    const carousels = screen.getAllByTestId('carousel-pf-lower-visual');
    const plots = screen.getAllByTestId(/name-\d-pf-bar-chart-container/);

    expect(carousels.length).toBe(1);
    expect(plots.length).toBe(3);
  });
});
