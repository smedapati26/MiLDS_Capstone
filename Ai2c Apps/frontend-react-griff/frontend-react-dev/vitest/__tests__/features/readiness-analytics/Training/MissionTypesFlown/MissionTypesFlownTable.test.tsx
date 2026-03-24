import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, waitFor } from '@testing-library/react';

import MissionFlownTable from '@features/readiness-analytics/Training/MissionTypesFlown/MissionTypesFlownTable';

import { IMissionsFlownDetailDataSet } from '@store/griffin_api/readiness/models';

describe('MissionFlownTable', () => {
  const theme = createTheme();
  const data: IMissionsFlownDetailDataSet[] = [
    {
      unit: 'Unit 1',
      flight_id: '0001',
      day_mission_hours: 10,
      night_mission_hours: 5,
      start_date: '2022-01-01',
      stop_date: '2022-01-02',
      mission_type: 'TEST',
      day_mission_flag: false,
      night_mission_flag: false,
    },
    {
      unit: 'Unit 2',
      flight_id: '0002',
      day_mission_hours: 8,
      night_mission_hours: 0,
      start_date: '2022-01-03',
      stop_date: '2022-01-04',
      mission_type: 'TEST',
      day_mission_flag: false,
      night_mission_flag: false,
    },
  ];

  it('renders the table with data', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <MissionFlownTable data={data} />
      </ThemeProvider>,
    );

    expect(getByText('Unit 1')).toBeInTheDocument();
    expect(getByText('Unit 2')).toBeInTheDocument();
  });

  it('renders the total hours correctly', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <MissionFlownTable data={data} />
      </ThemeProvider>,
    );

    expect(getByText('15')).toBeInTheDocument();
    expect(getByText('8')).toBeInTheDocument();
  });

  it('renders the start and stop dates correctly', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <MissionFlownTable data={data} />
      </ThemeProvider>,
    );

    expect(getByText('01JAN22')).toBeInTheDocument();
    expect(getByText('02JAN22')).toBeInTheDocument();
    expect(getByText('03JAN22')).toBeInTheDocument();
    expect(getByText('04JAN22')).toBeInTheDocument();
  });

  it('renders the mission type correctly', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <MissionFlownTable data={data} />
      </ThemeProvider>,
    );

    expect(getByText('Day / Night')).toBeInTheDocument();
  });

  it('sorts the data correctly', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <MissionFlownTable data={data} />
      </ThemeProvider>,
    );

    const unitHeader = getByRole('columnheader', { name: 'Unit' });
    fireEvent.click(unitHeader);

    await waitFor(() => {
      expect(getByText('Unit 2')).toBeInTheDocument();
      expect(getByText('Unit 1')).toBeInTheDocument();
    });
  });
});
