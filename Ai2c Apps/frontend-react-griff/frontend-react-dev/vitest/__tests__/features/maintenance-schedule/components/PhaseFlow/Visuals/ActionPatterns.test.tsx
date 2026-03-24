import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import ActionPatterns from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/ActionPatterns';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.resetAllMocks();
});
vi.mock('@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext', () => ({
  usePhaseFlowContext: vi.fn(),
}));

describe('ActionPatterns Black Hawk', () => {
  it('test rendering of Black Hawk patterns', () => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedFamily: ['BLACK HAWK'],
      setSelectedFamily: vi.fn(),
    });

    render(
      <ThemedTestingComponent>
        <ActionPatterns />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('black-hawk-action-patterns')).toBeInTheDocument();
    expect(screen.getByText('PMI-1')).toBeInTheDocument();
    expect(screen.getByText('PMI-2')).toBeInTheDocument();
  });
});

describe('ActionPatterns Chinook', () => {
  it('test rendering of Chinook patterns', () => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedFamily: ['CHINOOK'],
      setSelectedFamily: vi.fn(),
    });

    render(
      <ThemedTestingComponent>
        <ActionPatterns />
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('chinook-action-patterns')).toBeInTheDocument();
  });
});
