import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import PmxBarChart from '@components/PmxBarChart';

const mockData = [
  {
    data: [5, 10],
    label: 'Unit A',
    color: '#1976d2',
  },
  {
    data: [3, 7],
    label: 'Unit B',
    color: '#dc004e',
  },
];

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

describe('PmxBarChart', () => {
  it('renders the provided title', () => {
    renderWithTheme(<PmxBarChart data={mockData} title="Test Chart Title" />);
    expect(screen.getByText('Test Chart Title')).toBeInTheDocument();
  });

  it('renders all series labels', () => {
    renderWithTheme(<PmxBarChart data={mockData} />);
    expect(screen.getByText('Unit A')).toBeInTheDocument();
    expect(screen.getByText('Unit B')).toBeInTheDocument();
  });

  it('does not render title if not provided', () => {
    renderWithTheme(<PmxBarChart data={mockData} />);
    expect(screen.queryByText('Test Chart Title')).not.toBeInTheDocument();
  });
});
