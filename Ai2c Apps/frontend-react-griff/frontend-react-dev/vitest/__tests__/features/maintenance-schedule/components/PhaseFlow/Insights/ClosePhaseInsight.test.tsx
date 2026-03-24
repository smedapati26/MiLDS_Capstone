import { describe, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import ClosePhaseInsight from '@features/maintenance-schedule/components/PhaseFlow/Insights/ClosePhaseInsight';

describe('ClosePhaseInsight', () => {
  it('test rendering message correctly', () => {
    render(<ClosePhaseInsight serial1="test1" serial2="test2" />);

    const message =
      'test1 and test2 are predicted to go into phase within 5 flight hours of each other. Recommend staggering aircraft.';
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
