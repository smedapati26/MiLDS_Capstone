import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { fireEvent, render, screen } from '@testing-library/react';

import PhaseFlowBankTime from '@features/maintenance-schedule/components/PhaseFlow/BankTime/PhaseFlowBankTime';
import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

import { useGetAircraftBankPercentageQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

// Mocking the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext', () => ({
  usePhaseFlowContext: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftBankPercentageQuery: vi.fn(),
  };
});

vi.mock('@features');

const sampleUnitBankTimeData = [
  {
    key: 'test',
    bank_percentage: 0.54,
  },
];

const sampleAllBankTimeData = [
  {
    key: 'test uic',
    bank_percentage: 0.84,
  },
];

const sampleOtherBankTimeData = [
  {
    key: 'test',
    bank_percentage: 0.54,
  },
  {
    key: 'test1',
    bank_percentage: 0.55,
  },
  {
    key: 'test2',
    bank_percentage: 0.64,
  },
];

describe('PhaseFlowBankTime', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');

    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedFamily: ['BLACK HAWK'],
      selectedModels: ['UH-60L', 'HH-60M'],
    });

    vi.mocked(useGetAircraftBankPercentageQuery).mockImplementation((params) => {
      if (Array.isArray(params)) {
        const [, returnBy] = params;
        if (returnBy === 'unit') {
          return {
            data: sampleUnitBankTimeData,
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: undefined,
            refetch: vi.fn(),
            status: 'fulfilled',
          };
        } else {
          return {
            data: sampleOtherBankTimeData,
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: undefined,
            refetch: vi.fn(),
            status: 'fulfilled',
          };
        }
      }
      return {
        data: sampleAllBankTimeData,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: undefined,
        refetch: vi.fn(),
        status: 'fulfilled',
      };
    });

    render(
      <ThemedTestingComponent>
        <PhaseFlowBankTime />
      </ThemedTestingComponent>,
    );
  });

  it('test component renders', () => {
    const element = screen.getByTestId('bank-time-component');
    expect(element).toBeInTheDocument();

    // toggle renders
    const elementToggle = screen.getByTestId('bank-time-toggle');
    expect(elementToggle).toBeInTheDocument();

    // unit gauge renders
    const elementGauge = screen.getByTestId('phase-flow-unit-bank-time');
    expect(elementGauge).toBeInTheDocument();

    const elementTable = screen.queryByTestId('bank-time-table');
    expect(elementTable).not.toBeInTheDocument();
  });

  it('test selecting another', () => {
    const toggleModel = screen.getByRole('button', { name: /mds/i });
    fireEvent.click(toggleModel);

    const elementTable = screen.getByTestId('bank-time-table');
    expect(elementTable).toBeInTheDocument();
  });
});
