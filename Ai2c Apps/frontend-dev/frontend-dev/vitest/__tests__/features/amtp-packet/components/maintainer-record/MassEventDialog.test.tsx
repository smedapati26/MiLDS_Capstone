/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, it, vi } from 'vitest';

import SnackbarProvider from '@context/SnackbarProvider';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import MassEventDialog from '@features/amtp-packet/components/maintainer-record/MassEventDialog';
import { eventsApiSlice, useCreateMassEventMutation } from '@store/amap_ai/events/slices';
import { unitsApiSlice, useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppSelector } from '@store/hooks';
import { appSettingsSlice } from '@store/slices';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/amap_ai/events/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useCreateMassEventMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

vi.mock('@store/amap_ai/units/slices/unitsApiSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useGetUnitsQuery: vi.fn(),
  };
});

const mockStore = configureStore({
  reducer: {
    [appSettingsSlice.reducerPath]: appSettingsSlice.reducer,
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(eventsApiSlice.middleware).concat(unitsApiSlice.middleware),
});

const renderWithProviders = (ui: React.ReactNode) =>
  render(
    <Provider store={mockStore}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </SnackbarProvider>
      </LocalizationProvider>
    </Provider>,
  );

const defaultProps = {
  open: true,
  handleClose: vi.fn(),
  formSubmitted: vi.fn(),
  eventType: 'Training' as 'Training' | 'Award' | 'TCS',
};

describe('MassEventDialog Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockImplementation((selectorFn) =>
      selectorFn({
        appSettings: {
          appUser: {
            rank: 'Sgt',
            firstName: 'Test',
            lastName: 'User',
            unitRoles: {
              viewer: ['UIC123'],
              manager: ['UIC456'],
            },
          },
          maintainer: {
            rank: 'Cpt',
            firstName: 'Maintainer',
            lastName: 'User',
            unitRoles: {
              viewer: ['UIC123'],
              manager: ['UIC456'],
            },
          },
          currentUic: 'UIC123',
        },
      }),
    );
    (useGetUnitsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        {
          uic: 'ABC123',
          echelon: 'Brigade',
          component: 'Active',
          level: 2,
          displayName: 'Test Unit',
          shortName: 'TstUnit',
          nickName: 'Warriors',
          state: 'CA',
          parentUic: 'XYZ789',
        },
      ],
      isLoading: false,
    });
    (useCreateMassEventMutation as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      vi.fn(), // Mock function for API trigger
      { isLoading: false }, // Mock metadata object
    ]);
  });

  it('renders MassEventDialog with title', () => {
    renderWithProviders(<MassEventDialog {...defaultProps} />);
    expect(screen.getByText('Add Mass Training Event')).toBeInTheDocument();
  });

  it('navigates between steps', async () => {
    renderWithProviders(<MassEventDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Associated Tasks')).toBeInTheDocument();
    });
  });

  it('disables next button when required fields are missing', () => {
    renderWithProviders(<MassEventDialog {...defaultProps} />);

    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('prevents advancing when required fields are missing', async () => {
    renderWithProviders(<MassEventDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('submit button disabled if signature is not checked', async () => {
    renderWithProviders(<MassEventDialog {...defaultProps} />);

    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Save Event')).toBeDisabled();
  });
});
