/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';

import { usePmxMuiTheme } from '@ai2c/pmx-mui';

import CreateAccount from '@pages/CreateAccount';
import { unitsApiSlice, useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useCreateUserMutation, userApiSlice } from '@store/amap_ai/user/slices/userApi';
import { appSettingsSlice } from '@store/slices/appSettingsSlice';

vi.mock('@store/amap_ai/units/slices/unitsApiSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetUnitsQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/user/slices/userApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useCreateUserMutation: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@ai2c/pmx-mui', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    usePmxMuiTheme: vi.fn(),
    AmapIcon: () => <div data-testid="amap-icon" />,
    titlecase: (s: string) => s?.charAt(0).toUpperCase() + s?.slice(1),
    Echelon: {
      UNKNOWN: 'UNKNOWN',
      TEAM: 'TEAM',
      COMPANY: 'COMPANY',
      BATTALION: 'BATTALION',
      BRIGADE: 'BRIGADE',
      DIVISION: 'DIVISION',
      CORPS: 'CORPS',
      ARMY: 'ARMY',
    },
    PmxThemeContextProvider: ({ children }: any) => <>{children}</>,
  };
});

vi.mock('../components/UnitSelect', () => ({
  UnitSelect: ({ onChange, value }: any) => (
    <div>
      <div data-testid="unit-select">{value?.uic || 'none'}</div>
      <button data-testid="select-unit" onClick={() => onChange({ uic: 'XYZ', displayName: 'Test Unit' })}>
        Select Unit
      </button>
    </div>
  ),
}));

const theme = createTheme({
  spacing: 2,
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

const ignoreSerialize = {
  serializableCheck: {
    ignoredActions: ['amtpPacketApi/executeMutation/rejected'],
    ignoredPaths: ['amtpPacketApi.mutations'],
    ignoredActionPaths: ['meta.signal', 'meta.baseQueryMeta.request', 'meta.baseQueryMeta.response'],
  },
};
const apiMiddlewares = [unitsApiSlice.middleware];

describe('CreateAccount Page', () => {
  const mockCreateUser = vi.fn();

  const mockStore = configureStore({
    reducer: {
      [appSettingsSlice.reducerPath]: appSettingsSlice.reducer,
      [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
      [userApiSlice.reducerPath]: userApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(ignoreSerialize).concat(...apiMiddlewares),
  });

  const renderComponent = () =>
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <CreateAccount />
            </LocalizationProvider>
          </ThemeProvider>
        </MemoryRouter>
      </Provider>,
    );

  beforeEach(() => {
    vi.resetAllMocks();

    (usePmxMuiTheme as any).mockReturnValue([{}, {}]);

    (useGetUnitsQuery as any).mockReturnValue({
      data: [{ uic: 'AAA', displayName: 'Alpha' }],
      isSuccess: true,
    });

    (useCreateUserMutation as any).mockReturnValue([mockCreateUser]);

    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          userId: '123',
          firstName: 'john',
          lastName: 'doe',
        }),
    });
  });

  it('loads user data from fetch(loginUrl)', async () => {
    renderComponent();
  });
});
