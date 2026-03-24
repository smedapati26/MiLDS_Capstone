import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import PhaseFlowInsights from '@features/maintenance-schedule/components/PhaseFlow/Insights/PhaseFlowInsights';
import * as PhaseFlowContext from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

import { useGetAircraftCompanyQuery, useGetAircraftPhaseFlowByUicQuery } from '@store/griffin_api/aircraft/slices';

import { mappedCompanyData, mappedTestAircraftPhaseFlow } from '@vitest/mocks/griffin_api_handlers/aircraft/mock_data';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftPhaseFlowByUicQuery: vi.fn(),
    useGetAircraftCompanyQuery: vi.fn(),
  };
});

describe('PhaseFlowInsight', () => {
  beforeEach(() => {
    const compOpt = [
      { uic: 'TEST_UIC1', color: '#ff0000', selected: true },
      { uic: 'TEST_UIC2', color: '#00ff00', selected: true },
    ];
    const selModels = ['Model A', 'Model B', 'Model C'];
    const mockedValues = {
      companyOption: compOpt,
      selectedModels: selModels,
      selectedFamily: ['BLACK HAWK'] as unknown as PhaseFlowContext.PhaseFamilies[],
      setSelectedFamily: () => {},
      setSelectedModels: () => {},
      initializeCompany: () => {},
      toggleCompanyOption: () => {},
      setChinookPhase: () => {},
      chinookPhase: '640',
      getFamilyPhaseHours: vi.fn(() => 500),
    };

    vi.mock('features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext', () => ({
      usePhaseFlowContext: vi.fn().mockReturnValue(mockedValues),
    }));

    vi.spyOn(PhaseFlowContext, 'usePhaseFlowContext').mockReturnValue(mockedValues);

    (useGetAircraftPhaseFlowByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mappedTestAircraftPhaseFlow,
      isLoading: false,
      isSuccess: true,
      isUninitialized: false,
      isError: false,
    });
    (useGetAircraftCompanyQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mappedCompanyData,
      isLoading: false,
    });
  });

  it('check rendering of insights', async () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowInsights />
      </ThemedTestingComponent>,
    );

    const scheduleInsight = screen.getAllByTestId('schedule-phase-insight');
    const closeInsight = screen.getAllByTestId('close-phase-insight');
    const closeCompInsight = screen.getAllByTestId('close-phase-for-comp-insight');

    expect(scheduleInsight.length).toBe(3);
    expect(closeInsight.length).toBe(1);
    expect(closeCompInsight.length).toBe(1);
  });
});
