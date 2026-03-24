import { Provider } from 'react-redux';

import { createTheme, ThemeProvider } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import StatusOverTimeChart from '@features/readiness-analytics/Equipment/StatusOverTime/StatusOverTimeChart';

import { statusOverTimeApi } from '@store/griffin_api/readiness/slices';

import { mockStatusOverTimeData } from '@vitest/mocks/griffin_api_handlers/readiness/mock_data/mock_status_over_time_chart_data';
import { mockPalette } from '@vitest/mocks/theme/mockPalette';

const mockStore = configureStore({
  reducer: {
    [statusOverTimeApi.reducerPath]: statusOverTimeApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(statusOverTimeApi.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme({ palette: { ...mockPalette } });

  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </Provider>,
  );
};

describe('StatusOverTimeChart', () => {
  it('renders the StatusOverTimeChart component with data', () => {
    renderWithProviders(<StatusOverTimeChart data={mockStatusOverTimeData} unscheduledMaintenanceData={[]} />);
    expect(screen.getByText('Plot Component')).toBeInTheDocument();
  });
});
