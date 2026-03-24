import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import PhaseFlowTabContent from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowTabContent';

// Mock the child components
vi.mock('@features/maintenance-schedule/components/PhaseFlow/Component/PhaseFlowSelector', () => ({
  default: () => <div data-testid="phase-flow-selector" />,
}));
vi.mock('@features/maintenance-schedule/components/PhaseFlow/BankTime/PhaseFlowBankTime', () => ({
  default: () => <div data-testid="phase-flow-bank-time" />,
}));
vi.mock('@features/maintenance-schedule/components/PhaseFlow/Insights/PhaseFlowInsights', () => ({
  default: () => <div data-testid="phase-flow-insights" />,
}));
vi.mock('@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowVisuals', () => ({
  default: () => <div data-testid="phase-flow-visuals" />,
}));

describe('PhaseFlowTabContent', () => {
  it('renders the tab container', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowTabContent />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('ms-phase-flow-tab-container')).toBeInTheDocument();
  });

  it('renders the selector', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowTabContent />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('phase-flow-selector')).toBeInTheDocument();
  });

  it('renders the bank time', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowTabContent />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('phase-flow-bank-time')).toBeInTheDocument();
  });

  it('renders the insights', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowTabContent />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('phase-flow-insights')).toBeInTheDocument();
  });

  it('renders the visuals', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowTabContent />
      </ThemedTestingComponent>,
    );
    expect(screen.getByTestId('phase-flow-visuals')).toBeInTheDocument();
  });
});
