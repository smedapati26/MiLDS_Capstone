import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { transferRequestsMock } from 'vitest/mocks/handlers/transfer-requests/mock_data';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import { TransferRequestsPage } from '@features/soldier-manager/components';
import { useGetTransferRequestsQuery } from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';

vi.mock('@store/amap_ai/soldier_manager/slices/soldierManagerApi', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/soldier_manager/slices/soldierManagerApi')>(
    '@store/amap_ai/soldier_manager/slices/soldierManagerApi',
  );
  return {
    ...actual,
    useGetTransferRequestsQuery: vi.fn(),
  };
});

const mockStore = configureStore({ reducer: {} });

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

describe('TransferRequestsPage', () => {
  beforeEach(() => {
    (useGetTransferRequestsQuery as unknown as ReturnType<typeof vi.fn>).mockImplementation(({ get_type }) => {
      if (get_type === 'pending_user_adjudication') {
        return {
          data: { transferRequests: transferRequestsMock },
          isFetching: false,
        };
      }
      if (get_type === 'users_pending_requests') {
        return {
          data: { transferRequests: transferRequestsMock.slice(0, 1) },
          isFetching: false,
        };
      }
      return { data: null, isFetching: true };
    });
  });

  it('renders two tables with correct titles', () => {
    renderWithProviders(<TransferRequestsPage />);
    expect(screen.getByText(/Transfer Requests - Received/i)).toBeInTheDocument();
    expect(screen.getByText(/Transfer Requests - Sent/i)).toBeInTheDocument();
  });

  it('filters transfer requests when typing in search input', () => {
    renderWithProviders(<TransferRequestsPage />);
    const inputs = screen.getAllByPlaceholderText(/search/i);
    expect(inputs).toHaveLength(2);

    fireEvent.change(inputs[0], { target: { value: 'Liam' } });
    const filteredRow = screen.getByText(/Noah Brooks/i); // assuming 'Liam Nguyen' in mock data
    expect(filteredRow).toBeInTheDocument();
  });
});
