import { describe, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import CompanySamePhaseInsight from '@features/maintenance-schedule/components/PhaseFlow/Insights/CompanySamePhaseInsight';

describe('ClosePhaseInsight', () => {
  it('test rendering message correctly', () => {
    render(<CompanySamePhaseInsight company="test-company" serial1="test1" serial2="test2" />);

    const message = 'test-company aircraft test1 and test2 are predicted to enter phase at the same time.';
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
