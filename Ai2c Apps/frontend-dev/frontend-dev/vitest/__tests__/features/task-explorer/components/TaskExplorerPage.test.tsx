import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { TaskExplorerPage } from '@features/task-explorer';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { readinessApiSlice } from '@store/amap_ai/readiness';
import { tasksApiSlice, useGetAllTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';

// Mock RTK query hook
vi.mock('@store/amap_ai/tasks/slices/tasksApi', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/tasks/slices/tasksApi')>(
    '@store/amap_ai/tasks/slices/tasksApi',
  );
  return {
    ...actual,
    useGetAllTasksQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/mos_code', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/mos_code')>('@store/amap_ai/mos_code');
  return {
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});

const mockStore = configureStore({
  reducer: {
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(readinessApiSlice.middleware).concat(tasksApiSlice.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>{ui}</MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );
};

describe('TaskExplorerPage Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (useGetAllTasksQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        data: [
          {
            taskNumber: '001',
            taskTitle: 'Engine Maintenance',
            trainingLocation: 'Fort Liberty',
            frequency: 'Monthly',
            subjectArea: 'Mechanical',
            proponent: 'Ordnance',
            skillLevel: 'SL3',
            mosCode: '91B',
            unit: 'Alpha Company',
          },
        ],
        totalCount: 1,
      },
      isFetching: false,
      error: null,
    });
    (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ mos: 'MOS1' }, { mos: 'MOS2' }],
      isLoading: false,
    });
  });

  it('renders task data when available', () => {
    renderWithProviders(<TaskExplorerPage />);
    expect(screen.getByText('Task Explorer')).toBeInTheDocument();
    expect(screen.getByText('Engine Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Alpha Company')).toBeInTheDocument();
  });
});
