/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';

import { createTheme, ThemeProvider } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';

import FaultRecordsTab from '@features/amtp-packet/components/tabs/FaultRecordsTab';
import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { faultsApiSlice, useLazyGetSoldierFaultsHistoryQuery } from '@store/amap_ai/faults/slices/faultsApi';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { readinessApiSlice } from '@store/amap_ai/readiness';
import { useAppDispatch, useAppSelector } from '@store/hooks';

// Mock Redux hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@store/amap_ai/mos_code', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/mos_code')>('@store/amap_ai/mos_code');
  return {
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});

// Mock RTK Query hook
vi.mock('@store/amap_ai/faults/slices/faultsApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useLazyGetSoldierFaultsHistoryQuery: vi.fn(),
  };
});

// Create a mock store
const store = configureStore({
  reducer: {
    [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
    [faultsApiSlice.reducerPath]: faultsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(readinessApiSlice.middleware).concat(faultsApiSlice.middleware),
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
  return render(
    <ProviderWrapper store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </ProviderWrapper>,
  );
};
describe('FaultRecordsTab Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useGetAllMOSQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ mos: '91B' }, { mos: '15F' }],
      isLoading: false,
    });
    (useLazyGetSoldierFaultsHistoryQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn(),
      {
        data: [
          {
            faultActionId: 'FA001',
            role: 'maintainer',
            discoveredOn: '2025-08-01',
            closedOn: '2025-08-03',
            maintenanceAction: 'Replaced hydraulic pump',
            statusCode: 'CLOSED',
            correctiveAction: 'Installed new part and tested system',
            faultWorkUnitCode: 'WU123',
            manHours: 5,
            faultDetails: {
              faultId: 'F001',
              aircraft: 'F-16',
              unit: 'Alpha',
              discoverer: 'Tech Sgt. Ray',
              discoverDate: '2025-08-01',
              correctiveDate: '2025-08-03',
              faultWorkUnitCode: 'WU123',
              totalManHours: 5,
              inspector: 'Lt. Gomez',
              closer: 'Capt. Lee',
              remarks: 'Resolved without incident',
            },
          },
        ],
        isFetching: false,
      },
    ]);
  });

  it('renders fault records table when data is available', async () => {
    renderWithProviders(<FaultRecordsTab />);

    await waitFor(() => {
      const tableTitle = screen.getByText(/Fault Records/i);
      expect(tableTitle).toBeInTheDocument();

      const faultTask = screen.getByText(/Replaced hydraulic pump/i);
      expect(faultTask).toBeInTheDocument();
    });
  });
});
