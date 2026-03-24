import { describe, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import ScheduleConflictInsight from '@features/maintenance-schedule/components/PhaseFlow/Insights/ScheduleConflictInsight';
import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';

vi.mock('@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext', () => ({
  usePhaseFlowContext: vi.fn(),
}));

describe('ClosePhaseInsight', () => {
  beforeEach(() => {
    (usePhaseFlowContext as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      getFamilyPhaseHours: vi.fn(() => 500),
    });
  });
  it('test rendering message close to phase rendered correctly', () => {
    render(<ScheduleConflictInsight serial="test" hoursToPhase={40} />);

    const message = 'test is due for phase in 40 flight hours and needs to be scheduled.';
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('test rendering message grace period rendered correctly', () => {
    render(<ScheduleConflictInsight serial="test" hoursToPhase={-40} />);

    const message = 'test is due for phase in 10 flight hours and needs to be scheduled.';
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('test rendering message overdue phase rendered correctly', () => {
    render(<ScheduleConflictInsight serial="test" hoursToPhase={-60} />);

    const message = 'test is overdue for phase by 10 flight hours and needs to be scheduled.';
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
