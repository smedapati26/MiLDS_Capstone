/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import { UserPermissionsTabs } from '@pages/components/UserPermissionsTabs';
import { unitsApiSlice, userRequestApiSlice } from '@store/amap_ai';
import { IUnitBrief } from '@store/amap_ai/units';

const mockShowAlert = vi.fn();
vi.mock('@context/SnackbarProvider', () => ({
  useSnackbar: () => ({ showAlert: mockShowAlert }),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(() => ({
    appUser: { userId: 'USER123' },
  })),
}));

const mockUnits = [{ uic: 'A1', displayName: 'Unit A1' }];
vi.mock('@store/amap_ai/units', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetUnitsQuery: vi.fn(() => ({
      data: mockUnits,
      isSuccess: true,
    })),
  };
});

const mockCreatePermissionRequest = vi.fn();
const mockFetchMyPermissions = vi.fn();
const mockFetchMyRequestedPermissions = vi.fn();
const mockDeletePermissionRequest = vi.fn();

vi.mock('@store/amap_ai/user_request', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useCreatePermissionRequestMutation: vi.fn(() => [mockCreatePermissionRequest, { isLoading: false }]),
    useLazyGetMyPermissionsQuery: vi.fn(() => [mockFetchMyPermissions, { data: [], isLoading: false }]),
    useLazyGetMyRequestedPermissionsQuery: vi.fn(() => [
      mockFetchMyRequestedPermissions,
      { data: [], isLoading: false },
    ]),
    useDeletePermissionRequestMutation: vi.fn(() => [mockDeletePermissionRequest]),
  };
});

vi.mock('@components/UnitSelect', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    UnitSelect: ({ onChange }: { onChange: (e: IUnitBrief) => void }) => (
      <button
        onClick={() =>
          onChange({
            uic: 'A1',
            echelon: Echelon.BRIGADE,
            component: 'Active',
            level: 3,
            displayName: 'Unit A1',
            shortName: 'Unit A1',
          })
        }
      >
        Select Unit
      </button>
    ),
  };
});

const mockStore = configureStore({
  reducer: {
    [userRequestApiSlice.reducerPath]: userRequestApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userRequestApiSlice.middleware).concat(unitsApiSlice.middleware),
});

const theme = createTheme({
  palette: {
    operational_readiness_status: {
      fmc: '#007A00',
      pmcs: '#664300',
      pmcm: '#996500',
      nmcs: '#EC0000',
      nmcm: '#BD0000',
      dade: '#007892',
    },
    avatar: '#1976d2',
    badge: '#ff5722',
    stacked_bars: {
      magenta: '#CE0094',
      blue: '#002D9C',
      cyan2: '#012749',
      teal2: '#1C7877',
      purple: '#6929C4',
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
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
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
    classification: {
      unclassified: '',
      cui: '',
      confidential: '',
      secret: '',
      top_secret: '',
      top_secret_sci: '',
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
};

describe('UserPermissionsTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a permission request successfully', async () => {
    renderWithProviders(<UserPermissionsTabs />);

    fireEvent.click(screen.getByRole('tab', { name: 'Requests' }));
    fireEvent.click(screen.getByText('Select Unit'));
    fireEvent.click(screen.getByLabelText('Manager'));
    fireEvent.click(screen.getByRole('button', { name: 'REQUEST' }));

    expect(mockCreatePermissionRequest).toHaveBeenCalledWith({
      user_id: 'USER123',
      unit_id: 'A1',
      role: 'manager',
    });
  });
});
