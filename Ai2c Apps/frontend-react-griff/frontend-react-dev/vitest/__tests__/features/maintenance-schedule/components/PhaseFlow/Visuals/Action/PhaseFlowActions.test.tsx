import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { fireEvent, render, screen } from '@testing-library/react';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import PhaseFlowActions from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/PhaseFlowActions';

import {
  useGetAircraftCompanyQuery,
  useGetAircraftPhaseFlowByUicQuery,
  useGetAircraftPhaseFlowModelsQuery,
  useGetAircraftPhaseFlowSubordinatesQuery,
} from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

import {
  companyOption,
  mappedCompanyData,
  mappedTestAircraftPhaseFlow,
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
    useGetAircraftPhaseFlowByUicQuery: vi.fn(),
    useGetAircraftCompanyQuery: vi.fn(),
    useGetAircraftPhaseFlowSubordinatesQuery: vi.fn(),
    useGetAircraftPhaseFlowModelsQuery: vi.fn(),
  };
});

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
(useGetAircraftPhaseFlowSubordinatesQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  data: mappedTestAircraftPhaseFlowSubordinates,
  isLoading: false,
});
(useGetAircraftPhaseFlowModelsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  data: mappedTestAircraftPhaseFlowModels,
  isLoading: false,
});

describe('Mocking chinook phase rendering', () => {
  let Wrapper: React.FC;

  beforeEach(() => {
    // eslint-disable-next-line react/display-name
    Wrapper = () => {
      const [testChinookPhase, setTestChinookPhase] = useState<string>('640');

      (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        companyOption: companyOption,
        selectedFamily: ['CHINOOK'],
        selectedModels: ['Model A', 'Model B', 'Model C'],
        initializeCompany: vi.fn(),
        chinookPhase: testChinookPhase,
        setChinookPhase: setTestChinookPhase,
      });

      return (
        <ThemedTestingComponent>
          <PhaseFlowActions />
        </ThemedTestingComponent>
      );
    };
  });

  it('test different rendering: 320', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('chinook-phase-pattern-group')).toBeInTheDocument();
    expect(screen.queryByTestId('chinook-320-phase-pattern-legend')).not.toBeInTheDocument();
    expect(screen.getByTestId('chinook-640-phase-pattern-legend')).toBeInTheDocument();
    const button320 = screen.getByTestId('chinook-320');

    fireEvent.click(button320);

    expect(screen.getByTestId('chinook-320-phase-pattern-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('chinook-640-phase-pattern-legend')).not.toBeInTheDocument();
  });
});
