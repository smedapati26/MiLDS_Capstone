import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import SnackbarProvider from '@context/SnackbarProvider';
import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import RequestsTab from '@features/soldier-manager/components/tabs/RequestsTab';
import { mapToIUnitReceivedTransferRequest, mapToIUnitSentTransferRequest } from '@store/amap_ai/soldier_manager';
import { soldierManagerApiSlice } from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import {
  transferRequestsApiSlice,
  useGetPermissionRequestsQuery,
  useGetTransferRequestsQuery,
} from '@store/amap_ai/transfer_request/slices/transferRequestsApi';
import { mapToISoldierPermissionRequest, userRequestApiSlice } from '@store/amap_ai/user_request';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn().mockReturnValue({ userId: '123' }),
}));

vi.mock('@store/amap_ai/transfer_request/slices/transferRequestsApi', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/transfer_request/slices/transferRequestsApi')>(
    '@store/amap_ai/transfer_request/slices/transferRequestsApi',
  );
  return {
    ...actual,
    useGetTransferRequestsQuery: vi.fn(),
    useGetPermissionRequestsQuery: vi.fn(),
  };
});

const mockStore = configureStore({
  reducer: {
    [transferRequestsApiSlice.reducerPath]: transferRequestsApiSlice.reducer,
    [soldierManagerApiSlice.reducerPath]: soldierManagerApiSlice.reducer,
    [userRequestApiSlice.reducerPath]: userRequestApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(transferRequestsApiSlice.middleware)
      .concat(soldierManagerApiSlice.middleware)
      .concat(userRequestApiSlice.middleware),
});

const renderWithProviders = (ui: React.ReactElement) => {
  render(
    <Provider store={mockStore}>
      <ThemeProvider theme={createTheme()}>
        <ThemedTestingComponent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <SnackbarProvider>
              <MemoryRouter>{ui}</MemoryRouter>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemedTestingComponent>
      </ThemeProvider>
    </Provider>,
  );
};

describe('RequestsTab', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: '123',
    });
    (useGetTransferRequestsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        receivedRequests: [
          {
            current_unit: 'Test Unit Two',
            current_unit_uic: 'TSTUNITTWO',
            dod_id: '2345678901',
            name: 'Testest MeGeest',
            rank: 'GNL',
            request_id: 1,
            requested_by: 'CPT Test MeGee',
            requesting_unit: 'Test Unit',
            requesting_unit_uic: 'TSTUNIT',
          },
        ].map(mapToIUnitReceivedTransferRequest),
        sentRequests: [
          {
            current_unit: 'Test Unit',
            current_unit_uic: 'TSTUNIT',
            dod_id: '1234567890',
            name: 'CPT Testerest MeGeerest',
            pocs: [{ email: 'tstemail@email.com', name: 'GNL Testest MeGeest' }],
            rank: 'CPT',
            request_id: 2,
            requesting_unit: 'Test Unit Two',
            requesting_unit_uic: 'TSTUNITTWO',
          },
        ].map(mapToIUnitSentTransferRequest),
      },
      isFetching: false,
      error: null,
    });

    (useGetPermissionRequestsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        {
          requests: [
            {
              current_role: 'Viewer',
              dod_id: '1234567890',
              last_active: '01/01/2025',
              name: 'Permission Test MeGee',
              rank: 'CPT',
              request_id: 1,
              requested_role: 'Manager',
              unit: 'TSTUNIT',
            },
            {
              current_role: 'Approver',
              dod_id: '0123456789',
              last_active: '12/01/2025',
              name: 'Permission Tester MeGeer',
              rank: 'CTR',
              request_id: 2,
              requested_role: 'Maintainer',
              unit: 'TSTUNIT',
            },
          ].map(mapToISoldierPermissionRequest),
          unitName: 'Permission Unit',
          unitUic: 'PERMISSION',
        },
      ],
      isFetching: false,
      error: null,
    });
  });

  it('Renders the tab correctly', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <SnackbarProvider>
          <RequestsTab />
        </SnackbarProvider>{' '}
      </ThemedTestingComponent>,
    );
    expect(screen.getByText('Permission Requests')).toBeInTheDocument();
    expect(screen.getByText('Transfer Requests')).toBeInTheDocument();
  });

  it('Interacts with Permission Requests correctly', async () => {
    renderWithProviders(<RequestsTab />);

    // const permissionRequestTitle = screen.getByText('Permission Requests');

    // await waitFor(() => {
    //   const permissionCount = screen.getByText(permissionRequestsMock.flatMap((unit) => unit.requests).length);

    //   expect(permissionRequestTitle).toBeInTheDocument();
    //   expect(permissionCount).toBeInTheDocument();
    // });

    // fireEvent.click(permissionRequestTitle);

    // await waitFor(() => {
    //   const approveButton = screen.getByRole('button', { name: 'Approve' });
    //   const rejectButton = screen.getByRole('button', { name: 'Reject' });
    //   const unitAccordion = screen.getByText(permissionRequestsMock[0].unit_name);

    //   expect(approveButton).toBeInTheDocument();
    //   expect(rejectButton).toBeInTheDocument();
    //   expect(unitAccordion).toBeInTheDocument();

    //   fireEvent.click(unitAccordion);
    // });

    // const searchInput = screen.getAllByPlaceholderText('Search...')[0];
    // const unitAccordion = screen.getByText('Permission Unit');
    // const testMeGeeRow = screen.getByText("Permission Test MeGee")
    // const testerMeGeerRow = screen.getByText('Permission Tester MeGeer')

    // expect(searchInput).toBeInTheDocument();
    // expect(unitAccordion).toBeInTheDocument();

    // fireEvent.change(searchInput, { target: { value: 'NONE' } });

    // expect(unitAccordion).not.toBeInTheDocument();

    //   fireEvent.change(searchInput, {target: {value: "Permission Test MeGee"}})

    //   await waitFor(() => {
    //   expect(unitAccordion).toBeInTheDocument();
    //   })

    //   await waitFor(() => {
    //   expect(testMeGeeRow).toBeInTheDocument();
    //   expect(testerMeGeerRow).not.toBeInTheDocument();
    //   })

    //   fireEvent.change(searchInput, {target: {value: permissionRequestsMock[0].requests[1].rank}})

    //   await waitFor(() => {
    //   expect(testMeGeeRow).not.toBeInTheDocument();
    //   expect(testerMeGeerRow).toBeInTheDocument();
    //   })

    //   fireEvent.change(searchInput, {target: {value: permissionRequestsMock[0].requests[0].dod_id}})

    //   await waitFor(() =>{
    //   expect(testMeGeeRow).toBeInTheDocument();
    //   expect(testerMeGeerRow).not.toBeInTheDocument();
    //   })

    //   fireEvent.change(searchInput, {target: {value: permissionRequestsMock[0].requests[1].current_role}})

    //   await waitFor(() => {
    //   expect(testMeGeeRow).not.toBeInTheDocument();
    //   expect(testerMeGeerRow).toBeInTheDocument();
    //   })

    //   fireEvent.change(searchInput, {target: {value: permissionRequestsMock[0].requests[0].requested_role}})

    //   await waitFor(() => {
    //   expect(testMeGeeRow).toBeInTheDocument();
    //   expect(testerMeGeerRow).not.toBeInTheDocument();
    // })
  });

  // it('Interacts with Transfer Requests correctly', async () => {
  //   renderWithProviders(<RequestsTab />);

  //   const permissionRequestTitle = screen.getByText('Transfer Requests');

  //   await waitFor(() => {
  //     const permissionCount = screen.getByText(permissionRequestsMock.flatMap((unit) => unit.requests).length);

  //     expect(permissionRequestTitle).toBeInTheDocument();
  //     expect(permissionCount).toBeInTheDocument();
  //   });

  //   fireEvent.click(permissionRequestTitle);

  //   await waitFor(() => {
  //     const approveButton = screen.getByRole('button', { name: 'Approve' });
  //     const rejectButton = screen.getByRole('button', { name: 'Reject' });
  //     const sentButton = screen.getByRole('button', { name: 'Sent' });
  //     const receivedButton = screen.getByRole('button', { name: 'Received' });
  //     const unitAccordion = screen.getByText(permissionRequestsMock[0].unit_name);

  //     expect(approveButton).toBeInTheDocument();
  //     expect(rejectButton).toBeInTheDocument();
  //     expect(unitAccordion).toBeInTheDocument();
  //     expect(sentButton).toBeInTheDocument();
  //     expect(receivedButton).toBeInTheDocument();

  //     fireEvent.click(unitAccordion);
  //   });
  // });
});
