
import { Provider } from 'react-redux';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PermissionRequestsTab from '@features/user-management/components/UserManagement/PermissionRequestsTab';

import { mapToIAdminRoleRequest, mapToIUserRole } from '@store/griffin_api/users/models';
import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockRoleRequests } from '@vitest/mocks/griffin_api_handlers/user_management/admin_role_request/mock_data';
import { mockRoles } from '@vitest/mocks/griffin_api_handlers/user_management/user_role/mock_data';

import '@testing-library/jest-dom';

// Mock API slices
vi.mock('@store/griffin_api/users/slices', () => ({
  useGetRolesQuery: vi.fn(() => ({ data: mockRoles.map(mapToIUserRole) })),
  useGetAllRoleRequestsForAdminQuery: vi.fn(() => ({ data: mockRoleRequests.map(mapToIAdminRoleRequest) })),
  useAdjudicateRoleRequestForAdminMutation: () => [vi.fn().mockResolvedValue({})],
}));

/* Testing User Permissions Tab */
const renderTestingComponent = () => {
  return render(
    <Provider store={store}>
      <ThemedTestingComponent>
          <PermissionRequestsTab />
      </ThemedTestingComponent>
    </Provider>,
  );
};


/* PermissionRequestsTab Tests Inactive */
describe('PermissionRequestsTab Test Inactive', () => {
  beforeEach(() => {
    renderTestingComponent();
  });

  it('renders tab content', () => {
    const tabContent = screen.getByTestId('permission-requests-tab-content');
    expect(tabContent).toBeInTheDocument();
  });

  it('renders buttons and filters', () => {
    const acceptButton = screen.getByText('ACCEPT');
    expect(acceptButton).toBeInTheDocument();

    const rejectButton = screen.getByText('REJECT');
    expect(rejectButton).toBeInTheDocument();

    const searchBar = screen.getByPlaceholderText('Search Users...');
    expect(searchBar).toBeInTheDocument();
  });

  it('renders rows with users and buttons', async () => {
    const headers = [
      'Name',
      'Rank',
      'DoD ID Number',
      'Unit',
      'Last Active',
      'Current Role',
      'Requested Role',
      'Actions',
    ];

    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('filters based off of search input filter value', async () => {
    const searchBar = screen.getByPlaceholderText('Search Users...');
    await userEvent.type(searchBar, 'John');
    expect(searchBar).toHaveValue('John');

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(mockRoleRequests.filter((role) => role.user.first_name === 'John').length + 1);
    });
  });
});
