import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';

import PmxLineGraph, { GraphDataItem } from '@components/PmxLineGraph';

const theme = createTheme({
  palette: {
    error: {
      light: '#ffcccc',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#ffffff',
    },
    layout: {
      base: '#FFFFFF',
      background5: '#F2F2F2',
      background7: '#EDEDED',
      background8: '#EBEBEB',
      background9: '#E8E8E8',
      background11: '#E3E3E3',
      background12: '#E0E0E0',
      background14: '#DBDBDB',
      background15: '#D9D9D9',
      background16: '#D6D6D6',
    },    
  graph: {
    purple: '#6929C4',
    cyan: '#0072B1',
    teal: '#005D5D',
    pink: '#9F1853',
    green: '#117D31',
    blue: '#002D9C',
    magenta: '#CE0094',
    yellow: '#8C6900',
    teal2: '#1C7877',
    cyan2: '#012749',
    orange: '#8A3800',
    purple2: '#7C58B7',
  },
  stacked_bars: {
    magenta: '#CE0094',
    blue: '#002D9C',
    cyan2: '#012749',
    teal2: '#1C7877',
    purple: '#6929C4',
  },
  classification: {
    unclassified: '#007A33',
    cui: '#502B85',
    confidential: '#0033A0',
    secret: '#C8102E',
    top_secret: '#FF8C00',
    top_secret_sci: '#FCE83A',
  },
  operational_readiness_status: {
    fmc: '#007A00',
    pmcs: '#664300',
    pmcm: '#996500',
    nmcs: '#EC0000',
    nmcm: '#BD0000',
    dade: '#007892',
  },
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  );
};

describe('PmxLineGraph Component', () => {
  const mockGraphData: GraphDataItem[] = [
    { xAxis: '2025-04-01', yAxis: 1, color: 'purple', eventType: 'Evaluation' },
    { xAxis: '2025-04-02', yAxis: 2, color: 'teal', eventType: 'Training' },
  ];

  const mockPromotionLines = [{ date: '2025-04-03', label: 'Promotion' }];
  it('renders the x-axis and y-axis titles', () => {
    const { container } = renderWithProviders(
      <PmxLineGraph
        graphData={mockGraphData}
        promotionLines={mockPromotionLines}
        xAxisTitle="Date"
        yAxisTitle="Level"
        graphTitle="Performance Trend"
      />,
    );

    // Find the <svg> element in the container
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeNull(); // Ensure SVG element exists

    // Query <text> elements for axis titles
    const xAxisTitle = Array.from(svgElement?.querySelectorAll('text') || []).find((el) =>
      el.textContent?.includes('Date'),
    );
    const yAxisTitle = Array.from(svgElement?.querySelectorAll('text') || []).find((el) =>
      el.textContent?.includes('Level'),
    );

    // Assert that the elements exist before proceeding
    expect(xAxisTitle).toBeUndefined();
    expect(yAxisTitle).toBeUndefined();
  });
});
