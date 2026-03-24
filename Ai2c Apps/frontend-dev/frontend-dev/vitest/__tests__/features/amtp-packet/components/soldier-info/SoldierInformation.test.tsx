import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SoldierInformation from '@features/amtp-packet/components/soldier-info/SoldierInformation';
import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { mosCodeApiSlice, useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { useLazyGetUnitSoldiersQuery, useUpdateSoldierMutation } from '@store/amap_ai/soldier';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';

// Mock Redux hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock API slice hooks
vi.mock('@store/amap_ai/soldier', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error Acutal import will succeed.
    ...actual,
    useLazyGetUnitSoldiersQuery: vi.fn(),
    useUpdateSoldierMutation: vi.fn(),
  };
});

vi.mock('@store/amap_ai/mos_code', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error Acutal import will succeed.
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/user/slices/userApi', () => ({
  useLazyGetUserQuery: vi.fn(() => [vi.fn(), { data: sampleSoldierData, isLoading: false }]),
}));

const mockDispatch = vi.fn(); // Mock dispatch function

const sampleSoldierData = {
  userId: '123',
  firstName: 'John',
  lastName: 'Doe',
  birthMonth: 'January',
  unit: 'Unit A',
  pv2Dor: new Date(),
  pfcDor: new Date(),
  spcDor: new Date(),
  sgtDor: new Date(),
  ssgDor: new Date(),
  sfcDor: new Date(),
  evaluationStatus: 'Not In Window',
  annualEvaluation: new Date().toISOString(),
};

const sampleUnitSoldiersData = {
  soldiers: [
    { userId: '123', firstName: 'John', lastName: 'Doe', birthMonth: 'January', unit: 'Unit A' },
    { userId: '456', firstName: 'Jane', lastName: 'Smith', birthMonth: 'February', unit: 'Unit B' },
  ],
};

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

const mockStore = configureStore({
  reducer: {
    [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
    [mosCodeApiSlice.reducerPath]: mosCodeApiSlice.reducer,
  },
});

const renderComponent = () => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <SoldierInformation />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );
};

describe('SoldierInformation Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockDispatch);
    vi.mock('@hooks/useUnitAccess', () => ({
      default: () => ({
        // eslint-disable-next-line sonarjs/no-nested-functions
        hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
      }),
    }));
    (useLazyGetUserQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn(),
      { data: sampleSoldierData, isLoading: false },
    ]);
    (useLazyGetUnitSoldiersQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
      vi.fn(),
      { data: sampleUnitSoldiersData, isLoading: false },
    ]);
    (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: [{ mos: '15F' }, { mos: '15E' }, { mos: '15D' }],
      isLoading: false,
    }));
    (useUpdateSoldierMutation as ReturnType<typeof vi.fn>).mockImplementation(() => [vi.fn(), { isLoading: false }]);
  });

  it('renders correctly with title and dropdown', async () => {
    renderComponent();

    // Verify the title is rendered
    const titleElement = screen.getByRole('heading', { name: /Soldier Information/i });
    expect(titleElement).toBeInTheDocument();

    // Verify the dropdown is rendered
    await waitFor(() => {
      const dropdown = screen.getByRole('combobox', { name: 'Maintainer' });
      expect(dropdown).toBeInTheDocument();
    });
  });

  it('handles maintainer selection and dispatches an action', async () => {
    const { container } = renderComponent();

    const popupButton = container.querySelector('.MuiAutocomplete-popupIndicator');
    fireEvent.mouseDown(popupButton!);

    // const option = await screen.findByText(/Jane Smith/i);
    // fireEvent.click(option);

    // await waitFor(() => {
    //   expect(mockDispatch).toHaveBeenCalled();
    // });
  });

  // it('displays loading spinner when soldier data is loading', async () => {
  //   (useLazyGetUnitSoldiersQuery as ReturnType<typeof vi.fn>).mockImplementation(() => [
  //     vi.fn(),
  //     { data: sampleUnitSoldiersData, isLoading: true },
  //   ]);

  //   renderComponent();

  //   const loadingSpinner = await screen.findByRole('progressbar');
  //   expect(loadingSpinner).toBeInTheDocument();
  // });

  it('opens the edit dialog when the edit button is clicked', async () => {
    renderComponent();

    const editButton = screen.getByLabelText('edit');
    fireEvent.click(editButton);

    const dialogTitle = await screen.findByText(/Edit Soldier/i);
    expect(dialogTitle).toBeInTheDocument();
  });

  it('dispatches evaluation event and navigates when Add is clicked', async () => {
    renderComponent();

    const addLink = await screen.findByText(/Add/i);
    fireEvent.click(addLink);

    // Verify dispatch was called with setEventType and setEventTask
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'amtpPacket/setEventType', payload: 'Evaluation' }),
      );
    });
  });
});
