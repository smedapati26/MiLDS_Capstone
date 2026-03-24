import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import AirframeCrewStat from '@features/readiness-analytics/Personnel/StatCards/AirframeCrewStat';

describe('AirframeCrewStat', () => {
  it('renders loading skeleton when isLoading is true', () => {
    render(<AirframeCrewStat isLoading={true} title="" rateChange={0} rate={0} authorizedCrew={0} totalCrew={0} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders the correct content when isLoading is false', () => {
    render(
      <AirframeCrewStat
        isLoading={false}
        title="Test Title"
        rateChange={5}
        rate={10}
        authorizedCrew={15}
        totalCrew={20}
      />,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('15 / 20')).toBeInTheDocument();
  });
});
