import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { FaultRecordDetailDialog } from '@features/amtp-packet/components/fault-records';
import { faultsApiSlice, useLazyGetFaultByIdQuery } from '@store/amap_ai/faults/slices/faultsApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@store/amap_ai/faults/slices/faultsApi', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/faults/slices/faultsApi')>(
    '@store/amap_ai/faults/slices/faultsApi',
  );
  return {
    ...actual,
    useLazyGetFaultByIdQuery: vi.fn(),
  };
});

const mockStore = configureStore({
  reducer: {
    [faultsApiSlice.reducerPath]: faultsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(faultsApiSlice.middleware),
});

const theme = createTheme({
  palette: {
    mode: 'light',
    stacked_bars: {
      magenta: '#D81B60',
      blue: '#1E88E5',
      cyan2: '#00ACC1',
      teal2: '#00897B',
      purple: '#8E24AA',
    },
    classification: {
      unclassified: '#9E9E9E',
      cui: '#4CAF50',
      confidential: '#2196F3',
      secret: '#FF9800',
      top_secret: '#F44336',
      top_secret_sci: '#6A1B9A',
    },
    operational_readiness_status: {
      fmc: '#4CAF50',
      pmcs: '#FFEB3B',
      pmcm: '#FFC107',
      nmcs: '#FF5722',
      nmcm: '#F44336',
      dade: '#9C27B0',
    },
    graph: {
      purple: '#800080',
      cyan: '#00FFFF',
      teal: '#008080',
      pink: '#FFC0CB',
      green: '#008000',
      blue: '#0000FF',
      magenta: '#FF00FF',
      yellow: '#FFFF00',
      teal2: '#005D5D',
      cyan2: '#0072B1',
      orange: '#FFA500',
      purple2: '#9370DB',
    },
    layout: {
      base: '#ffffff',
      background5: '#f5f5f5',
      background7: '#eeeeee',
      background8: '#e0e0e0',
      background9: '#d6d6d6',
      background11: 'rgba(224, 224, 224, 1)',
      background12: '#cccccc',
      background14: '#bdbdbd',
      background15: '#a9a9a9',
      background16: '#999999',
    },
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>{ui}</MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );
};

describe('FaultRecordDetailDialog Tests', () => {
  const mockHandleClose = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());

    (useLazyGetFaultByIdQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      vi.fn(), // fetchFaultDetails
      {
        isFetching: false,
        error: null,
        data: {
          faultId: 'F123',
          discovererName: 'John Doe',
          aircraft: 'F-16',
          discoveredOn: '2025-08-27T13:42:27.417Z',
          correctedOn: '2025-08-28T10:15:00.000Z',
          unitName: 'Unit A',
          faultWorkUnitCode: 'WUC-001',
          totalManHours: 12,
          remarks: 'Routine inspection',
          faultActions: [
            {
              faultActionId: 'A1',
              discoveredOn: '2025-08-27T13:42:27.417Z',
              closedOn: '2025-08-28T10:15:00.000Z',
              closerName: 'Jane Smith',
              maintenanceAction: 'Replaced valve',
              actionStatus: 'Completed',
              inspectorName: 'Inspector X',
              manHours: 4,
              faultWorkUnitCode: 'WUC-001',
              maintainers: [{ userId: 'U1', name: 'Tech A', manHours: 4 }],
            },
          ],
        },
      },
    ]);
  });

  it('renders fault details when data is available', () => {
    renderWithProviders(<FaultRecordDetailDialog open={true} faultId="F123" handleClose={mockHandleClose} />);

    expect(screen.getByText('13-1: F123')).toBeInTheDocument();
    expect(screen.getByText('Fault ID: F123')).toBeInTheDocument();
    expect(screen.getByText('Discoverer: John Doe')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    renderWithProviders(<FaultRecordDetailDialog open={false} faultId="F123" handleClose={mockHandleClose} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders skeletons when loading', () => {
    (useLazyGetFaultByIdQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      vi.fn(),
      {
        isFetching: true,
        error: null,
        data: undefined,
      },
    ]);

    renderWithProviders(<FaultRecordDetailDialog open={true} faultId="F123" handleClose={mockHandleClose} />);

    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });
});
