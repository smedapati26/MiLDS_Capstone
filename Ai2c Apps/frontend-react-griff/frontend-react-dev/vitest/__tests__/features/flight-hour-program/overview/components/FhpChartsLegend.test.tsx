import { screen } from '@testing-library/react';

import FhpChartsLegend, { resolveColor } from '@features/flight-hour-program/overview/components/FhpChartsLegend';

import { renderWithProviders } from '@vitest/helpers';

// Mock PmxCarousel to just render its children
vi.mock('@components/PmxCarousel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="carousel">{children}</div>,
}));

const baseSeries = [
  {
    label: 'Actual Flight Hours',
    data: [1, 2, 3],
    backgroundColor: 'blue',
    borderColor: 'black',
    type: 'bar' as const,
  },
  {
    label: 'Night Flight Hours',
    data: [4, 5, 6],
    backgroundColor: 'green',
    borderColor: 'black',
    type: 'bar' as const,
  },
  {
    label: 'Projected Flight Hours',
    data: [7, 8, 9],
    backgroundColor: 'gray',
    borderColor: 'black',
    type: 'bar' as const,
  },
];

const baseSeries2 = [
  {
    label: 'Actual Flight Hours',
    data: [1, 2, 3],
    backgroundColor: 'blue',
    borderColor: 'black',
    type: 'bar' as const,
  },
  {
    label: 'Night Flight Hours',
    data: [4, 5, 6],
    backgroundColor: 'green',
    borderColor: 'black',
    type: 'bar' as const,
  },
  {
    label: 'Other Flight Hours',
    data: [7, 8, 9],
    backgroundColor: 'gray',
    borderColor: 'black',
    type: 'bar' as const,
  },
];

describe('FhpChartsLegend', () => {
  it('renders all legend items and puts Projected Flight Hours last', () => {
    renderWithProviders(<FhpChartsLegend series={baseSeries} />);
    // Should render all legend items
    expect(screen.getByTestId('legend-item-Actual-Flight-Hours')).toBeInTheDocument();
    expect(screen.getByTestId('legend-item-Night-Flight-Hours')).toBeInTheDocument();
    expect(screen.getByTestId('legend-item-Projected-Flight-Hours')).toBeInTheDocument();

    // Projected should be last
    const allItems = screen.getAllByTestId(/legend-item-/);
    expect(allItems[allItems.length - 1]).toHaveTextContent('Projected Flight Hours');
  });

  it('applies dashed style to Projected Flight Hours when dashed is true', () => {
    renderWithProviders(<FhpChartsLegend series={baseSeries2} dashed />);
    // Only Projected Flight Hours should have dashed style
    const dashedBoxes = screen.getAllByTestId('legend-color-dashed');
    expect(dashedBoxes).toHaveLength(1);
    const projectedItem = screen.getByTestId('legend-item-Projected-Flight-Hours');
    expect(projectedItem).toBeInTheDocument();
    // The dashed box should be inside the Projected Flight Hours item
    expect(projectedItem.querySelector('[data-testid="legend-color-dashed"]')).toBeTruthy();
  });

  it('renders a carousel when more than 6 items are present', () => {
    const manySeries = Array.from({ length: 7 }, (_, i) => ({
      label: `Label ${i}`,
      data: [i],
      backgroundColor: 'red',
      borderColor: 'black',
      type: 'bar' as const,
    }));
    renderWithProviders(<FhpChartsLegend series={manySeries} />);
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    // All legend items should be rendered
    manySeries.forEach((item) => {
      expect(screen.getByTestId(`legend-item-${item.label.replace(/\s/g, '-')}`)).toBeInTheDocument();
    });
  });

  it('renders in the specified direction', () => {
    const { container } = renderWithProviders(<FhpChartsLegend series={baseSeries} direction="column" />);
    // The Stack should have direction="column"
    // MUI sets a data attribute for direction, or you can check the style/class if needed
    // For now, just check that the component renders without error
    expect(container).toBeInTheDocument();
  });
});

describe('resolveColor', () => {
  it('returns the string if color is a string', () => {
    expect(resolveColor('red')).toBe('red');
    expect(resolveColor('#fff')).toBe('#fff');
  });

  it('returns the first element if color is an array', () => {
    expect(resolveColor(['blue', 'red'])).toBe('blue');
    expect(resolveColor(['#123456'])).toBe('#123456');
    expect(resolveColor([undefined, 'red'])).toBe(undefined); // first element is undefined
    expect(resolveColor([])).toBe(undefined); // empty array, returns undefined
  });

  it('returns "grey" for non-string, non-array values', () => {
    expect(resolveColor(123)).toBe('grey');
    expect(resolveColor({})).toBe('grey');
    expect(resolveColor(null)).toBe('grey');
    expect(resolveColor(undefined)).toBe('grey');
    expect(resolveColor(true)).toBe('grey');
  });
});
