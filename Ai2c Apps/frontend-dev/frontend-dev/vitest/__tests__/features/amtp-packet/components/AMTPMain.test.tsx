/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SnackbarProvider, { useSnackbar } from '@context/SnackbarProvider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import AMTPMain from '@features/amtp-packet/components/AMTPMain';
import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { eventsApiSlice } from '@store/amap_ai';
import { readinessApiSlice } from '@store/amap_ai/readiness/slices/readinessApi';
import { soldierApiSlice } from '@store/amap_ai/soldier/slices/soldierApi';
import { tasksApiSlice } from '@store/amap_ai/tasks/slices/tasksApi';
import { userApiSlice } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';

// Mock the TabsLayout component
vi.mock('@ai2c/pmx-mui', () => ({
  TabsLayout: () => <div data-testid="mock-tabs-layout">Mock TabsLayout</div>,
  slugify: () => (value: string) => value.toLowerCase().replace(/\s+/g, '-'),
  Echelon: {
    TASK_FORCE: 'TASK_FORCE',
    BRIGADE: 'BRIGADE',
  },
}));

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@context/SnackbarProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useSnackbar: vi.fn(),
  };
});

// Configure the mock store
const mockStore = configureStore({
  reducer: {
    [readinessApiSlice.reducerPath]: readinessApiSlice.reducer,
    [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [soldierApiSlice.reducerPath]: soldierApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(readinessApiSlice.middleware)
      .concat(eventsApiSlice.middleware)
      .concat(tasksApiSlice.middleware)
      .concat(userApiSlice.middleware)
      .concat(soldierApiSlice.middleware),
});

const theme = createTheme({
  palette: {
    error: {
      light: '#ffcccc',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#ffffff',
    },
    layout: {
      base: '#FFFFFF',
      background5: '#F2F2F2',
      background7: '#EDEDED',
      background8: '#EBEBEB',
      background9: '#E8E8E8',
      background11: '#E3E3E3',
      background12: '#E0E0E0',
      background14: '#DBDBDB',
      background15: '#D9D9D9',
      background16: '#D6D6D6',
    },
    graph: {
      purple: '#6929C4',
      cyan: '#0072B1',
      teal: '#005D5D',
      pink: '#9F1853',
      green: '#117D31',
      blue: '#002D9C',
      magenta: '#CE0094',
      yellow: '#8C6900',
      teal2: '#1C7877',
      cyan2: '#012749',
      orange: '#8A3800',
      purple2: '#7C58B7',
    },
    stacked_bars: {
      magenta: '#CE0094',
      blue: '#002D9C',
      cyan2: '#012749',
      teal2: '#1C7877',
      purple: '#6929C4',
    },
    classification: {
      unclassified: '#007A33',
      cui: '#502B85',
      confidential: '#0033A0',
      secret: '#C8102E',
      top_secret: '#FF8C00',
      top_secret_sci: '#FCE83A',
    },
    operational_readiness_status: {
      fmc: '#007A00',
      pmcs: '#664300',
      pmcm: '#996500',
      nmcs: '#EC0000',
      nmcm: '#BD0000',
      dade: '#007892',
    },
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
    avatar: '#1976d2',
    badge: '#ff5722',
  },
});

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>,
  );
};

describe('AMTPMain', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useSnackbar as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
  });

  it('renders AMTPMain component correctly', () => {
    renderWithProviders(<AMTPMain />);

    // Verify the title is rendered
    expect(screen.getByText('AMTP Packet')).toBeInTheDocument();

    // Verify the DownloadPacketDialog is rendered
    expect(screen.getByText('Download Packet')).toBeInTheDocument();

    // Verify the SoldierInformation component is rendered
    expect(screen.getByText('Soldier Information')).toBeInTheDocument();

    // Verify the TabsLayout component is rendered
    expect(screen.getByTestId('tabs-section')).toBeInTheDocument();
  });
});
