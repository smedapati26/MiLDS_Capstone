import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import PhaseFlowTab from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowTab';

// Mock the child component
vi.mock('@features/maintenance-schedule/components/PhaseFlow/PhaseFlowTabContent', () => ({
  default: () => <div data-testid="phase-flow-tab-content" />,
}));

describe('PhaseFlowTab', () => {
  it('renders the PhaseFlowTabContent within the PhaseFlowProvider', () => {
    render(
      <ThemedTestingComponent>
        <PhaseFlowTab />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('phase-flow-tab-content')).toBeInTheDocument();
  });
});
