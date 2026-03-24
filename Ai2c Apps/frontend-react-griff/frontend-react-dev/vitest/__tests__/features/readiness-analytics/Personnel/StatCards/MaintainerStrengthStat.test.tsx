import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import MaintainerStrengthStat from '@features/readiness-analytics/Personnel/StatCards/MaintainerStrengthStat';

describe('MaintainerStrengthStat', () => {
  it('renders skeleton when loading', () => {
    render(<MaintainerStrengthStat isLoading={true} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders stat card when not loading', () => {
    render(<MaintainerStrengthStat isLoading={false} />);
    const statCard = screen.getByText('Maintainer Strength Stats');
    expect(statCard).toBeInTheDocument();
  });
});
