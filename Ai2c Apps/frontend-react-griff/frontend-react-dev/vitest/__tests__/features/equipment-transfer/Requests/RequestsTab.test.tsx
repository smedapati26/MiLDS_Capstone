import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RequestsTab from '@features/equipment-transfer/Requests/RequestsTab';

import { TransferObjectType, TransferStatus } from '@store/griffin_api/auto_dsr/models/ITransferRequest';
import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers';

import '@testing-library/jest-dom';

// Mock the adjudicate mutation
const mockAdjudicateTransfer = vi.fn();

// Mock the API hooks
vi.mock('@store/griffin_api/users/slices', () => ({
    useGetUserElevatedRolesQuery: vi.fn(() => ({
        data: { admin: ['WAYCB0', 'WGDQA0'], write: [] },
    })),
}));

vi.mock('@store/griffin_api/auto_dsr/slices/transferRequestsApi', () => ({
    useGetTransferRequestsQuery: vi.fn(() => ({
        data: [
            {
                id: 537,
                aircraft: '1120518',
                model: 'UH-60M',
                uac: null,
                uav: null,
                originatingUic: 'WAYCB0',
                originatingName: 'B CO, 2-25 AHB',
                destinationUic: 'TF-000249',
                destinationName: 'Diamondhead Rear Detachment',
                requestedByUser: {
                    userId: '1021004460',
                    rank: 'CW3',
                    firstName: 'Andrew',
                    lastName: 'Thomas',
                    email: null,
                },
                requestedObjectType: TransferObjectType.AIRCRAFT,
                originatingUnitApproved: true,
                destinationUnitApproved: false,
                permanentTransfer: false,
                dateRequested: '2025-02-28',
                status: TransferStatus.NEW,
                lastUpdatedDatetime: '2025-02-28T23:21:09.674Z',
            },
            {
                id: 538,
                aircraft: '2303508',
                model: 'AH-64EV6',
                uac: null,
                uav: null,
                originatingUic: 'WGDQA0',
                originatingName: 'A CO, 1-82 ARB',
                destinationUic: 'WAYCB0',
                destinationName: 'B CO, 2-25 AHB',
                requestedByUser: {
                    userId: '1602547180',
                    rank: 'PVT',
                    firstName: 'Aaron',
                    lastName: 'Johnston',
                    email: null,
                },
                requestedObjectType: TransferObjectType.AIRCRAFT,
                originatingUnitApproved: false,
                destinationUnitApproved: false,
                permanentTransfer: true,
                dateRequested: '2025-02-27',
                status: TransferStatus.NEW,
                lastUpdatedDatetime: '2025-02-27T20:08:37.516Z',
            },
        ],
        isLoading: false,
        error: undefined,
    })),
    useAdjudicateTransferRequestMutation: vi.fn(() => [
        mockAdjudicateTransfer,
        { isLoading: false },
    ]),
}));

const renderTestingComponent = () => {
    return render(
        <Provider store={store}>
            <ThemedTestingComponent>
                <RequestsTab />
            </ThemedTestingComponent>
        </Provider>
    );
};

describe('RequestsTab', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAdjudicateTransfer.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({
                user_permission: [],
                adjudicated: [],
                partial: [],
            }),
        });
    });

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            renderTestingComponent();
            expect(screen.getByTestId('requests-tab-content')).toBeInTheDocument();
        });

        it('should display toggle buttons for requested and received', () => {
            renderTestingComponent();
            expect(screen.getByText(/Requested - Transfer requests you personally initiated/i)).toBeInTheDocument();
        });

        it('should display filter chips for Aircraft, UAS, and AGSE', () => {
            renderTestingComponent();
            expect(screen.getByTestId('filter-aircraft-button')).toBeInTheDocument();
            expect(screen.getByTestId('filter-uas-button')).toBeInTheDocument();
            expect(screen.getByTestId('filter-agse-button')).toBeInTheDocument();
        });

        it('should display search input', () => {
            renderTestingComponent();
            expect(screen.getByPlaceholderText('Search requests')).toBeInTheDocument();
        });

        it('should have AGSE filter disabled', () => {
            renderTestingComponent();
            const agseButton = screen.getByTestId('filter-agse-button');
            expect(agseButton).toHaveClass('Mui-disabled');
        });
    });

    describe('Table Display - Requested Tab', () => {
        it('should display table with correct headers on requested tab', () => {
            renderTestingComponent();
            expect(screen.getByText('Serial Number')).toBeInTheDocument();
            expect(screen.getByText('Model')).toBeInTheDocument();
            expect(screen.getByText('Losing Unit')).toBeInTheDocument();
            expect(screen.getByText('Gaining Unit')).toBeInTheDocument();
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByText('Requested Date')).toBeInTheDocument();
            expect(screen.getByText('POC')).toBeInTheDocument();
        });

        it('should NOT display Actions column on requested tab', () => {
            renderTestingComponent();
            expect(screen.queryByText('Actions')).not.toBeInTheDocument();
        });

        it('should NOT display checkboxes on requested tab', () => {
            renderTestingComponent();
            const checkboxes = screen.queryAllByRole('checkbox');
            expect(checkboxes).toHaveLength(0);
        });

        it('should NOT display bulk action buttons on requested tab', () => {
            renderTestingComponent();
            expect(screen.queryByText('ACCEPT')).not.toBeInTheDocument();
            expect(screen.queryByText('REJECT')).not.toBeInTheDocument();
        });

        it('should display transfer request data in table', () => {
            renderTestingComponent();
            expect(screen.getByText('1120518')).toBeInTheDocument();
            expect(screen.getByText('UH-60M')).toBeInTheDocument();
            // Use getAllByText since this appears in multiple rows
            expect(screen.getAllByText('B CO, 2-25 AHB').length).toBeGreaterThan(0);
            expect(screen.getByText('Diamondhead Rear Detachment')).toBeInTheDocument();
            expect(screen.getByText(/CW3/)).toBeInTheDocument();
            expect(screen.getByText(/Thomas/)).toBeInTheDocument();
        });
    });

    describe('Table Display - Received Tab', () => {
        it('should display Actions column on received tab', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Click the "received" toggle button
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            expect(screen.getByText('Actions')).toBeInTheDocument();
        });

        it('should display checkboxes on received tab', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Click the "received" toggle button
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Should have checkboxes (1 in header + 1 per row)
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes.length).toBeGreaterThan(0);
        });

        it('should display bulk action buttons on received tab', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Click the "received" toggle button
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            expect(screen.getByText('ACCEPT')).toBeInTheDocument();
            expect(screen.getByText('REJECT')).toBeInTheDocument();
        });

        it('should have bulk action buttons disabled when no items selected', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Click the "received" toggle button
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            const acceptButton = screen.getByText('ACCEPT').closest('button');
            const rejectButton = screen.getByText('REJECT').closest('button');

            expect(acceptButton).toBeDisabled();
            expect(rejectButton).toBeDisabled();
        });

        it('should display approve and reject icon buttons for each row', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Click the "received" toggle button
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            const approveButtons = screen.getAllByLabelText('approve-button');
            const rejectButtons = screen.getAllByLabelText('reject-button');

            expect(approveButtons.length).toBeGreaterThan(0);
            expect(rejectButtons.length).toBeGreaterThan(0);
        });
    });

    describe('Individual Approve/Reject Actions', () => {
        it('should show snackbar when approve button is clicked', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Click approve button on first row
            const approveButtons = screen.getAllByLabelText('approve-button');
            await user.click(approveButtons[0]);

            // Check for snackbar message
            await waitFor(() => {
                expect(screen.getByText(/was approved/i)).toBeInTheDocument();
            });
        });

        it('should show snackbar when reject button is clicked', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Click reject button on first row
            const rejectButtons = screen.getAllByLabelText('reject-button');
            await user.click(rejectButtons[0]);

            // Check for snackbar message
            await waitFor(() => {
                expect(screen.getByText(/was rejected/i)).toBeInTheDocument();
            });
        });

        it('should display undo button in snackbar', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Click approve button
            const approveButtons = screen.getAllByLabelText('approve-button');
            await user.click(approveButtons[0]);

            // Check for undo button
            await waitFor(() => {
                expect(screen.getByText('Undo')).toBeInTheDocument();
            });
        });
    });

    describe('Bulk Selection and Actions', () => {
        it('should enable bulk action buttons when items are selected', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Select first checkbox
            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[1]); // Skip header checkbox, click first row

            const acceptButton = screen.getByText('ACCEPT').closest('button');
            const rejectButton = screen.getByText('REJECT').closest('button');

            expect(acceptButton).not.toBeDisabled();
            expect(rejectButton).not.toBeDisabled();
        });

        it('should select all items when header checkbox is clicked', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Click header checkbox
            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[0]); // Header checkbox

            // All checkboxes should be checked
            checkboxes.forEach(checkbox => {
                expect(checkbox).toBeChecked();
            });
        });

        it('should show snackbar with count when bulk approve is clicked', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Select all items
            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[0]); // Header checkbox

            // Click bulk approve
            const acceptButton = screen.getByText('ACCEPT');
            await user.click(acceptButton);

            // Check for snackbar with count
            await waitFor(() => {
                expect(screen.getByText(/transfer request.*approved/i)).toBeInTheDocument();
            });
        });
    });

    describe('Filtering and Search', () => {
        it('should filter by search term', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            const searchInput = screen.getByPlaceholderText('Search requests');
            await user.type(searchInput, '1120518');

            // Should show the matching request
            expect(screen.getByText('1120518')).toBeInTheDocument();
        });

        it('should toggle equipment type filters', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            const aircraftChip = screen.getByTestId('filter-aircraft-button');

            // Click to deselect aircraft
            await user.click(aircraftChip);

            // Should show no results message
            await waitFor(() => {
                expect(screen.getByText(/No equipment types selected/i)).toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        it('should display pagination controls', () => {
            renderTestingComponent();
            expect(screen.getByText(/1–2 of 2/)).toBeInTheDocument();
        });

        it('should clear selections when changing tabs', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Select an item
            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[1]);

            // Verify button is enabled
            let acceptButton = screen.getByText('ACCEPT').closest('button');
            expect(acceptButton).not.toBeDisabled();

            // Switch back to requested tab (which clears selections)
            const requestedButton = screen.getByRole('button', { name: /requested/i });
            await user.click(requestedButton);

            // Switch back to received tab
            await user.click(receivedButton);

            // Selections should be cleared (bulk buttons disabled)
            acceptButton = screen.getByText('ACCEPT').closest('button');
            expect(acceptButton).toBeDisabled();
        });
    });

    describe('Toggle Between Tabs', () => {
        it('should clear selections when switching tabs', async () => {
            renderTestingComponent();
            const user = userEvent.setup();

            // Switch to received tab
            const receivedButton = screen.getByRole('button', { name: /received/i });
            await user.click(receivedButton);

            // Select an item
            const checkboxes = screen.getAllByRole('checkbox');
            await user.click(checkboxes[1]);

            // Switch back to requested tab
            const requestedButton = screen.getByRole('button', { name: /requested/i });
            await user.click(requestedButton);

            // Switch back to received
            await user.click(receivedButton);

            // Selections should be cleared
            const acceptButton = screen.getByText('ACCEPT').closest('button');
            expect(acceptButton).toBeDisabled();
        });
    });
});