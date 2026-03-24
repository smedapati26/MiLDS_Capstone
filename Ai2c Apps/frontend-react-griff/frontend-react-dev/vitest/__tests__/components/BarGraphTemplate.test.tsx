import { PlotType } from 'plotly.js';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import BarGraphTemplate from '@components/BarGraphTemplate';

describe('BarGraphTemplate Component', () => {
  it('renders Plot component with given props', () => {
    const plotData: Partial<{ type: PlotType; x: string[]; y: number[] }>[] = [
      {
        x: ['A', 'B'],
        y: [1, 2],
        type: 'bar',
      },
    ];
    const yLabel = 'Y Axis';
    const height = 400;

    render(<BarGraphTemplate plotData={plotData} yLabel={yLabel} height={height} />);

    // Since Plot is a third-party component, just check if the container is rendered
    const plotElement = screen.getAllByText('Plot Component');
    expect(plotElement).toBeTruthy;
  });
});
