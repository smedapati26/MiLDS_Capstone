import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import PhaseFlowSelector from '@features/maintenance-schedule/components/PhaseFlow/Component/PhaseFlowSelector';
import { PhaseFlowProvider } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

// Mocking the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftByUicQuery: vi.fn(),
  };
});

const sampleAircraftData = [
  { aircraftModel: 'Model A', aircraftFamily: 'Family 1', serial: 'SN123' },
  { aircraftModel: 'Model B', aircraftFamily: 'Family 1', serial: 'SN456' },
  { aircraftModel: 'Model C', aircraftFamily: 'Family 2', serial: 'SN789' },
];

describe('PhaseFlowSelector', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('WDYFAA');
    (useGetAircraftByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: sampleAircraftData,
      isLoading: false,
    });

    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowSelector />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );
  });

  it('renders two dropdowns', async () => {
    const comboBoxes = screen.getAllByRole('combobox');
    expect(comboBoxes).toHaveLength(2);
  });
});
