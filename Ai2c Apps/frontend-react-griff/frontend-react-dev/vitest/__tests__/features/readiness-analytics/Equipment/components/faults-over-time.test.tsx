import { describe, expect, it } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';

import FaultsOverTime from '@features/readiness-analytics/Equipment/FaultsOverTime/faults-over-time';

import { mockPalette } from '@vitest/mocks/theme/mockPalette';

const theme = createTheme({ palette: { ...mockPalette } });

const sampleData = [
  {
    reporting_period: '2023-01-01',
    deadline: 5,
    diagonal: 3,
    circle_x: 2,
    no_status: 0,
    cleared: 0,
    ti_cleared: 0,
    dash: 0,
    admin_deadline: 0,
    nuclear: 0,
    chemical: 0,
    biological: 0,
  },
];

describe('FaultsOverTime Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <FaultsOverTime data={sampleData} />
      </ThemeProvider>,
    );
    expect(container).toBeTruthy();
  });
});
