import { describe, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import InsightCard from '@features/maintenance-schedule/components/PhaseFlow/Insights/InsightCard';

describe('InsightCard', () => {
  it('test rendering of Card component', () => {
    render(<InsightCard message="test message" title="test" insightNumber={1} data-testid="test-insight-card" />);

    const card = screen.getByTestId('test-insight-card');
    expect(card).toBeInTheDocument();
  });

  it('test messaging', () => {
    const message = 'test message';
    const title = 'test';
    const insight = 1;

    render(<InsightCard message={message} title={title} insightNumber={insight} data-testid="test-insight-card" />);

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(insight)).toBeInTheDocument();
  });
});
