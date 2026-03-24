import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import { PhaseFlowProvider } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import PhaseFlowVisuals from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowVisuals';

import { useGetAircraftCompanyQuery, useGetAircraftPhaseFlowByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

// Mock the hooks
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

// Mock the child components
vi.mock('@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowBarChart', () => ({
  default: () => <div data-testid="phase-flow-bar-chart" />,
}));
vi.mock('@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/PhaseFlowActions', () => ({
  default: () => <div data-testid="phase-flow-actions" />,
}));
vi.mock('@features/maintenance-schedule/components/PhaseFlow/Component/PhaseFlowToggle', () => ({
  default: () => <div data-testid="phase-flow-toggle" />,
}));
vi.mock('@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowLowerVisuals', () => ({
  default: () => <div data-testid="phase-flow-lower-visuals" />,
}));

describe('PhaseFlowVisuals', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('WDYFAA');
    (useGetAircraftPhaseFlowByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isUninitialized: false,
    });
    (useGetAircraftCompanyQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isUninitialized: false,
    });
  });

  it('renders the phase flow visuals container', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowVisuals />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('phase-flow-grid-item')).toBeInTheDocument();
  });

  it('renders the bar chart', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowVisuals />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('phase-flow-bar-chart')).toBeInTheDocument();
  });

  it('renders the actions', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowVisuals />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('phase-flow-actions')).toBeInTheDocument();
  });

  it('renders the toggle', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowVisuals />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('phase-flow-toggle')).toBeInTheDocument();
  });

  it('renders the lower visuals', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowProvider>
          <PhaseFlowVisuals />
        </PhaseFlowProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('phase-flow-lower-visuals')).toBeInTheDocument();
  });
});
