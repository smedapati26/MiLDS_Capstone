import { Provider } from 'react-redux';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserPermissionsTab from '@features/user-management/components/UserManagement/UserPermissionsTab';

import { mapToIUserRole } from '@store/griffin_api/users/models';
import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockRoles } from '@vitest/mocks/griffin_api_handlers/user_management/user_role/mock_data';
import { mockAppUserDto } from '@vitest/mocks/griffin_api_handlers/users/mock_data';

import '@testing-library/jest-dom';

// Mock API slices
vi.mock('@store/griffin_api/users/slices', () => ({
  useGetRolesQuery: vi.fn(() => ({ data: mockRoles.map(mapToIUserRole) })),
  useCreateUserMutation: () => [vi.fn().mockResolvedValue({})],
}));

/* Testing User Permissions Tab */
const renderTestingComponent = () => {
  return render(
    <Provider store={store}>
      <ThemedTestingComponent>
        <UserPermissionsTab />
      </ThemedTestingComponent>
    </Provider>,
  );
};

/* User Permissions Tab Tests */
describe('User Permissions Tab Tests', () => {


  it('User Management Permissions Tab Table Filters Properly', async () => {
    renderTestingComponent();

    let FILTERED_ROW_COUNT;
    const userPermissionsTable = await waitFor(() => screen.getByRole('table'));
    const filterSearchForm = screen.getByRole('textbox');

    expect(userPermissionsTable).toBeInTheDocument();
    expect(filterSearchForm).toBeInTheDocument();

    /* User First Name filtering */
    await waitFor(() => {
      fireEvent.change(filterSearchForm, { target: { value: mockRoles[0].user.first_name } });
      FILTERED_ROW_COUNT = mockRoles.filter(role => role.user.first_name === mockRoles[0].user.first_name).length + 1;
      expect(screen.getAllByRole('row')).toHaveLength(FILTERED_ROW_COUNT);
    });

    /* User Last Name filtering */
    await waitFor(() => {
      fireEvent.change(filterSearchForm, { target: { value: mockRoles[0].user.last_name} });
      FILTERED_ROW_COUNT = mockRoles.filter(role => role.user.last_name === mockRoles[0].user.last_name).length + 1;
      expect(screen.getAllByRole('row')).toHaveLength(FILTERED_ROW_COUNT);
    });

    /* User UserID filtering */
    await waitFor(() => {
      fireEvent.change(filterSearchForm, { target: { value: mockRoles[0].user.user_id } });
      FILTERED_ROW_COUNT = mockRoles.filter(role => role.user.user_id === mockRoles[0].user.user_id).length + 1;
      expect(screen.getAllByRole('row')).toHaveLength(FILTERED_ROW_COUNT);
    });

    /* Unit Name filtering */
    await waitFor(() => {
      fireEvent.change(filterSearchForm, { target: { value: mockRoles[0].unit.display_name } });
      FILTERED_ROW_COUNT = mockRoles.filter(role => role.unit.display_name === mockRoles[0].unit.display_name).length + 1;
    });

    /* Unit UIC filtering */
    await waitFor(() => {
      fireEvent.change(filterSearchForm, { target: { value: mockRoles[0].unit.uic } });
      FILTERED_ROW_COUNT = mockRoles.filter(role => role.unit.uic === mockRoles[0].unit.uic).length + 1;
    });
  });
});

/* UserPermissionsTab Tests Functionality */
describe('UserPermissionsTab Functionality Test', async () => {
  beforeEach(() => renderTestingComponent());

  it('renders tab content', () => {
    const tabContent = screen.queryByTestId('user-permissions-tab-content');
    expect(tabContent).toBeInTheDocument();
  });

  it('renders buttons and filters', () => {
    const createButton = screen.getByText('CREATE NEW USER');
    expect(createButton).toBeInTheDocument();

    const filterText = screen.getByText('Filter By:');
    expect(filterText).toBeInTheDocument();

    const searchBar = screen.getByPlaceholderText('Search users');
    expect(searchBar).toBeInTheDocument();
  });

  it('renders rows with users', async () => {
    const headers = ['Name', 'Rank', 'DoD ID Number', 'Unit', 'Last Active', 'Role'];

    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('filters based off of search input filter value', async () => {
    const searchBar = screen.getByPlaceholderText('Search users');
    await userEvent.type(searchBar, mockAppUserDto.first_name);
    expect(searchBar).toHaveValue(mockAppUserDto.first_name);

    await waitFor(() => {
      const USER_ROW_COUNT = mockRoles.filter(role => role.user.first_name === mockAppUserDto.first_name).length + 1;
      expect(screen.getAllByRole('row')).toHaveLength(USER_ROW_COUNT);
    });
  });
});
