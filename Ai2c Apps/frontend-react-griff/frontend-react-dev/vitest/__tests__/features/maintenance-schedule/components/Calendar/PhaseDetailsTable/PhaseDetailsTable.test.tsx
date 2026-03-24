import { Provider } from 'react-redux';

import { createTheme, ThemeProvider } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

import { PhaseDetailsTable } from '@features/maintenance-schedule/components/Calendar';

import { lanesApi, maintenanceApi } from '@store/griffin_api/events/slices';

import { mockUpcomingMaintenance } from '@vitest/mocks/griffin_api_handlers/events/mock_data';

vi.mock('src/store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const mockStore = configureStore({
  reducer: {
    [lanesApi.reducerPath]: lanesApi.reducer,
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(lanesApi.middleware, maintenanceApi.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>
    </Provider>,
  );
};

describe('PhaseDetailsTable', () => {
  it('renders the PhaseDetailsTable component', () => {
    expect(renderWithProviders(<PhaseDetailsTable data={[mockUpcomingMaintenance]} />)).toBeTruthy();
  });
});
