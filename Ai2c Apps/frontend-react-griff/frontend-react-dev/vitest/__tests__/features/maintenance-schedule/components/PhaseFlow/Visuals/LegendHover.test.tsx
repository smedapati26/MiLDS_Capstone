import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import LegendHover from '@features/maintenance-schedule/components/PhaseFlow/Visuals/LegendHover';

import { useAppSelector } from '@store/hooks';

import { companyOption, mappedCompanyData } from '@vitest/mocks/griffin_api_handlers/aircraft/mock_data';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext', () => ({
  usePhaseFlowContext: vi.fn(),
}));

(useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');

describe('LegendHover rendering', () => {
  it('test simple legend', () => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      companyOption: companyOption,
      selectedFamily: ['OTHER'],
    });

    vi.useFakeTimers();
    render(
      <ThemedTestingComponent>
        <LegendHover companyInfo={mappedCompanyData} />
      </ThemedTestingComponent>,
    );

    const legend = screen.getByTestId('maintenance-schedule-legend-hover');
    expect(legend).toBeInTheDocument();
    expect(screen.queryByTestId('company-hover-legend')).not.toBeInTheDocument();

    fireEvent.mouseOver(legend);
    act(() => {
      vi.advanceTimersByTime(500); // advance past MUI's default delay (250ms)
    });

    expect(screen.getByTestId('company-hover-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('black-hawk-phase-pattern-legend')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chinook-320-phase-pattern-legend')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chinook-640-phase-pattern-legend')).not.toBeInTheDocument();
  });

  it('test black hawk legend', () => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      companyOption: companyOption,
      selectedFamily: ['BLACK HAWK'],
    });

    vi.useFakeTimers();
    render(
      <ThemedTestingComponent>
        <LegendHover companyInfo={mappedCompanyData} />
      </ThemedTestingComponent>,
    );

    const legend = screen.getByTestId('maintenance-schedule-legend-hover');
    fireEvent.mouseOver(legend);
    act(() => {
      vi.advanceTimersByTime(500); // advance past MUI's default delay (250ms)
    });

    expect(screen.getByTestId('company-hover-legend')).toBeInTheDocument();
    expect(screen.getByTestId('black-hawk-phase-pattern-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('chinook-320-phase-pattern-legend')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chinook-640-phase-pattern-legend')).not.toBeInTheDocument();
  });

  it('test test chinook 320 legend', () => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      companyOption: companyOption,
      selectedFamily: ['CHINOOK'],
      chinookPhase: '320',
      setChinookPhase: vi.fn(),
    });

    vi.useFakeTimers();
    render(
      <ThemedTestingComponent>
        <LegendHover companyInfo={mappedCompanyData} />
      </ThemedTestingComponent>,
    );

    const legend = screen.getByTestId('maintenance-schedule-legend-hover');
    fireEvent.mouseOver(legend);
    act(() => {
      vi.advanceTimersByTime(500); // advance past MUI's default delay (250ms)
    });

    expect(screen.getByTestId('company-hover-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('black-hawk-phase-pattern-legend')).not.toBeInTheDocument();
    expect(screen.getByTestId('chinook-320-phase-pattern-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('chinook-640-phase-pattern-legend')).not.toBeInTheDocument();
  });

  it('test test chinook 640 legend', () => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      companyOption: companyOption,
      selectedFamily: ['CHINOOK'],
      chinookPhase: '640',
      setChinookPhase: vi.fn(),
    });

    vi.useFakeTimers();
    render(
      <ThemedTestingComponent>
        <LegendHover companyInfo={mappedCompanyData} />
      </ThemedTestingComponent>,
    );

    const legend = screen.getByTestId('maintenance-schedule-legend-hover');
    fireEvent.mouseOver(legend);
    act(() => {
      vi.advanceTimersByTime(500); // advance past MUI's default delay (250ms)
    });

    expect(screen.getByTestId('company-hover-legend')).toBeInTheDocument();
    expect(screen.queryByTestId('black-hawk-phase-pattern-legend')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chinook-320-phase-pattern-legend')).not.toBeInTheDocument();
    expect(screen.getByTestId('chinook-640-phase-pattern-legend')).toBeInTheDocument();
  });
});
