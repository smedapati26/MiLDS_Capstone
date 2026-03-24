/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import EventDialog from '@features/amtp-packet/components/maintainer-record/EventDialog';
import { eventsApiSlice, useLazyGetEventByIdQuery } from '@store/amap_ai/events/slices';
import { tasksApiSlice } from '@store/amap_ai/tasks/slices/tasksApi';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { userApiSlice } from '@store/amap_ai/user/slices/userApi';
import { useAppDispatch, useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('@store/amap_ai/events/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    //@ts-expect-error
    ...actual,
    useLazyGetEventByIdQuery: vi.fn(),
    // useLazyGetEventByIdQuery: vi.fn().mockReturnValue({
    //   data: {
    //     id: 123,
    //     eventType: 'Training',
    //     date: '2023-09-25',
    //     trainingType: 'Type A',
    //     evaluationType: 'Evaluation B',
    //     totalMxHours: 15,
    //     goNogo: 'GO',
    //     comment: 'This is a test comment.',
    //   },
    //   isLoading: false,
    //   error: null,
    // }),
  };
});

// Configure the mock store
const mockStore = configureStore({
  reducer: {
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [tasksApiSlice.reducerPath]: tasksApiSlice.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(eventsApiSlice.middleware)
      .concat(tasksApiSlice.middleware)
      .concat(userApiSlice.middleware)
      .concat(unitsApiSlice.middleware),
});

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>{ui}</MemoryRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>,
  );
};

describe('EventDialog Component', () => {
  const mockHandleClose = vi.fn();

  const defaultProps = {
    open: true,
    handleClose: mockHandleClose,
    formSubmitted: mockHandleClose,
    title: 'Test Event Dialog',
    eventId: 123,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useLazyGetEventByIdQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      vi.fn(),
      {
        data: {
          id: 123,
          eventType: 'Training',
          date: '2023-09-25',
          trainingType: 'Type A',
          evaluationType: 'Evaluation B',
          totalMxHours: 15,
          goNogo: 'GO',
          comment: 'This is a test comment.',
        },
        isLoading: false,
        error: null,
      },
    ]);
  });

  const renderDialog = (props = {}) => {
    return renderWithProviders(<EventDialog dialogType={'edit'} {...defaultProps} {...props} />);
  };

  it('opens the dialog when "open" is true', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Event Dialog')).toBeInTheDocument();
  });

  it('does not render the dialog when "open" is false', () => {
    renderDialog({ open: false });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders AddEditEventForm correctly', async () => {
    renderDialog({
      open: true,
      dialogType: 'edit',
      eventId: 123,
    });
  });

  it('dispatches actions when dialog is closed', () => {
    const dispatchSpy = vi.fn();
    (useAppDispatch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(dispatchSpy);

    renderDialog();

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('renders correct instructions for initial upload', () => {
    renderWithProviders(
      <EventDialog
        open={true}
        title="Initial Upload"
        dialogType="initial_upload"
        eventId={undefined}
        handleClose={vi.fn()}
        formSubmitted={vi.fn()}
      />,
    );

    expect(screen.getByText(/Enter in events from oldest to newest/i)).toBeInTheDocument();
  });
});
