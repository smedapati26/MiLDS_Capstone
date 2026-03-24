import { describe, expect, it } from 'vitest';
import { mockPalette } from 'vitest/mocks/theme/mockPalette';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, waitFor } from '@testing-library/react';

import MissionsFlownGraph from '@features/readiness-analytics/Training/MissionsFlownGraph/MissionsFlownGraph';

import { IMissionsFlownDataSet } from '@store/griffin_api/readiness/models';

describe('MissionsFlownGraph', () => {
  const theme = createTheme({ palette: { ...mockPalette } });

  const data: IMissionsFlownDataSet[] = [
    {
      mission_type: 'type1',
      day_mission_count: 10,
      night_mission_count: 20,
      day_mission_hours: 100,
      night_mission_hours: 200,
    },
    {
      mission_type: 'type2',
      day_mission_count: 30,
      night_mission_count: 40,
      day_mission_hours: 300,
      night_mission_hours: 400,
    },
  ];

  it('renders the graph with the correct data', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <MissionsFlownGraph data={data} />
      </ThemeProvider>,
    );

    expect(getByText('Amount Flown')).toBeInTheDocument();
    expect(getByText('Hours Flown')).toBeInTheDocument();
    expect(getByText('Day Missions')).toBeInTheDocument();
    expect(getByText('Night Missions')).toBeInTheDocument();
  });

  it('switches between missions and hours views', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <MissionsFlownGraph data={data} />
      </ThemeProvider>,
    );

    const toggleButton = getByRole('button', { name: 'Hours Flown' });
    fireEvent.click(toggleButton);

    await waitFor(() => expect(getByText('Plot Component')).toBeInTheDocument());
  });
});
