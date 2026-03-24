/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import XMLUploadDialog from '@features/amtp-packet/components/maintainer-record/XMLUploadDialog';
import { eventsApiSlice } from '@store/amap_ai/events/slices';
import { unitsApiSlice } from '@store/amap_ai/units/slices/unitsApiSlice';
import { userApiSlice } from '@store/amap_ai/user/slices/userApi';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/amap_ai/events/slices', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    // @ts-expect-error
    ...actual,
    useUploadXMLFileMutation: vi.fn(() => [
      vi.fn(() =>
        Promise.resolve({
          data: {
            soldierRecords: [
              {
                type: 'Training',
                eventDate: '2024-01-01',
                eventRemarks: 'Completed training',
              },
              {
                type: 'Evaluation',
                eventDate: '2024-02-01',
                eventRemarks: 'Passed evaluation',
              },
            ],
            soldierInfo: {
              ML: '123456',
              DOD_ID: '654321',
              rank_progression: [{ rank: 'SGT', date: '2023-12-01' }],
            },
          },
        }),
      ),
      { isLoading: false },
    ]),
  };
});

const mockStore = configureStore({
  reducer: {
    [eventsApiSlice.reducerPath]: eventsApiSlice.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [unitsApiSlice.reducerPath]: unitsApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(eventsApiSlice.middleware)
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
describe('XMLUploadDialog', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
  });

  it('renders dialog with stepper and initial step', () => {
    renderWithProviders(<XMLUploadDialog open={true} handleClose={handleClose} />);

    expect(screen.getByLabelText(/xml upload dialog/i)).toBeInTheDocument();
    expect(screen.getByText(/select file/i)).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByText(/next/i)).toBeDisabled();
  });

  it('enables Next button after file is uploaded', async () => {
    renderWithProviders(<XMLUploadDialog open={true} handleClose={handleClose} />);

    const file = new File(['dummy content'], 'test.xml', { type: 'text/xml' });
    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/next/i)).not.toBeDisabled();
    });
  });

  it('advances to Verify step after clicking Next', async () => {
    renderWithProviders(<XMLUploadDialog open={true} handleClose={handleClose} />);

    const file = new File(['dummy content'], 'test.xml', { type: 'text/xml' });
    const fileInput = screen.getByTestId('file-input');

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/next/i)).not.toBeDisabled();
    });

    fireEvent.click(screen.getByText(/next/i));
  });

  it('calls handleClose when Cancel is clicked', () => {
    renderWithProviders(<XMLUploadDialog open={true} handleClose={handleClose} />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders AddEditEventForm after successful XML upload', async () => {
    renderWithProviders(<XMLUploadDialog open={true} handleClose={handleClose} />);

    const file = new File(['<xml></xml>'], 'test.xml', { type: 'text/xml' });
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText(/next/i)).not.toBeDisabled());

    fireEvent.click(screen.getByText(/next/i));
  });
});
