import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { PhaseFlowProvider } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import UnitPhaseFlowChart from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowBarChartPlotly';

import { useAppSelector } from '@store/hooks';

import { mappedTestAircraftPhaseFlow } from '@vitest/mocks/griffin_api_handlers/aircraft/mock_data';
import { mockPalette } from '@vitest/mocks/theme/mockPalette';

// Mocking the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));
(useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');

describe('PhaseFlowBarChart', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  beforeEach(() => {
    render(
      <ThemeProvider theme={theme}>
        <PhaseFlowProvider>
          <UnitPhaseFlowChart data={mappedTestAircraftPhaseFlow} title="test" companyInfo={undefined} />
        </PhaseFlowProvider>
      </ThemeProvider>,
    );
  });

  it('render phase flow bar chart', () => {
    const element = screen.getByTestId('test-pf-bar-chart-container');
    expect(element).toBeInTheDocument();
  });
});
