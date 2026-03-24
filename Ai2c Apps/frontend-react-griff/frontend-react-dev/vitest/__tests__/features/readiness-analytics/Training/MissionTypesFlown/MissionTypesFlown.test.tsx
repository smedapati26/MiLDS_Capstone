import { Provider } from 'react-redux';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import MissionTypesFlown from '@features/readiness-analytics/Training/MissionTypesFlown/MissionTypesFlown';

import { missionsFlownApi } from '@store/griffin_api/readiness/slices';

const mockStore = configureStore({
  reducer: {
    [missionsFlownApi.reducerPath]: missionsFlownApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(missionsFlownApi.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>
    </Provider>,
  );
};

describe('MissionTypesFlown Component', () => {
  const mockData = [
    {
      mission_type: 'TRAINING',
      amount_flown: 10,
      hours_flown: 20,
    },
    {
      mission_type: 'SERVICE',
      amount_flown: 5,
      hours_flown: 15,
    },
  ];

  it('renders the component with initial data', () => {
    renderWithProviders(
      <MissionTypesFlown
        data={mockData}
        uic="test-uic"
        start_date="2023-01-01"
        end_date="2023-12-31"
        validDateRange={true}
      />,
    );

    expect(screen.getByText('Amount Flown')).toBeInTheDocument();
    expect(screen.getByText('Hours Flown')).toBeInTheDocument();
    expect(screen.getByText('15 missions flown')).toBeInTheDocument();
  });

  it('switches between "missions" and "hours" view', () => {
    renderWithProviders(
      <MissionTypesFlown
        data={mockData}
        uic="test-uic"
        start_date="2023-01-01"
        end_date="2023-12-31"
        validDateRange={true}
      />,
    );

    const hoursButton = screen.getByText('Hours Flown');
    fireEvent.click(hoursButton);

    expect(screen.getByText('35 hours flown')).toBeInTheDocument();
  });
});
