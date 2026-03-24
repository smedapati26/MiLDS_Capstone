import { screen } from '@testing-library/react';

import FhpDashedBarChart from '@features/flight-hour-program/overview/components/FhpDashedBarChart';

import { renderWithProviders } from '@vitest/helpers';

describe('FhpDashedBarChart', () => {
  const mockSeries = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Test Dataset',
        data: [10, 20, 30],
        isDashed: [true, false, true],
        dashedBorder: '#ff0000',
        dashedBackground: '#ffeeee',
        backgroundColor: '#ffeeee',
        borderColor: '#ff0000',
        type: 'bar' as const,
      },
    ],
  };

  it('renders the chart and legend', () => {
    renderWithProviders(<FhpDashedBarChart series={mockSeries} title="Test Chart" height={400} dashed={true} />);

    // Check for the legend
    expect(screen.getByText(/Test Dataset/i)).toBeInTheDocument();

    // Check for the chart container
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
