import { Provider } from 'react-redux';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RequestPermissionsTab, { RequestPermissionsProps } from '@features/user-management/components/AccountManagement/RequestPermissionsTab';

import { mapRoleRequest } from '@store/griffin_api/users/models/IRoleRequest';
import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockTestUnitDto } from '@vitest/mocks/griffin_api_handlers/units/mock_data';
import { mockRoleRequests } from '@vitest/mocks/griffin_api_handlers/user_management/role_request/mock_data';


/* Testing Component */
function TestingComponent(props: Partial<RequestPermissionsProps> = {}) {
  const { activeTab = 0, index = 0, roleRequestData = [] } = props;

  return (
    <Provider store={store}>
      <ThemedTestingComponent>
        <RequestPermissionsTab
          activeTab={activeTab}
          index={index}
          roleRequestData={roleRequestData}
        />
      </ThemedTestingComponent>
    </Provider>
  );
}

/* Request Permissions Tab Tests */
describe('Testing Request Permissions Tab Tests', () => {
  /* Component Rendering */
  it('Renders Relevant Components and data', async () => {
    render(<TestingComponent roleRequestData={mockRoleRequests.map(mapRoleRequest)} />);

    const roleRadioButtons = screen.getByLabelText('Role Radio Buttons');
    expect(roleRadioButtons).toBeInTheDocument();

    const unitSelect = screen.getByTestId('requested-unit-select-text-field');
    expect(unitSelect).toBeInTheDocument();

    const requestPermissionsPaper = screen.getByLabelText('Request Permissions Tab Content');
    const requestedPermissionsTable = screen.getByLabelText('Requested Permissions Table');

    expect(requestPermissionsPaper).toBeInTheDocument();
    expect(requestedPermissionsTable).toBeInTheDocument();

    const unitColumnHeader = within(requestedPermissionsTable).getByText('Unit');
    const permissionsColumnHeader = within(requestedPermissionsTable).getByText('Permissions');
    const dateColumnHeader = within(requestedPermissionsTable).getByText('Date Requested');
    const approverColumnHeader = within(requestedPermissionsTable).getByText('Approver(s)');
    const actionColumnHeader = within(requestedPermissionsTable).getByText('Actions');

    expect(unitColumnHeader).toBeInTheDocument();
    expect(permissionsColumnHeader).toBeInTheDocument();
    expect(dateColumnHeader).toBeInTheDocument();
    expect(approverColumnHeader).toBeInTheDocument();
    expect(actionColumnHeader).toBeInTheDocument();

    await waitFor(() => {
      const roleColumnData1 = within(requestedPermissionsTable).getByText(mockRoleRequests[0].access_level);
      expect(roleColumnData1).toBeInTheDocument();

      const dateData1 = within(requestedPermissionsTable).getByText(mockRoleRequests[0].date_created);
      expect(dateData1).toBeInTheDocument();
    });

    const deleteButton = await waitFor(() => within(requestedPermissionsTable).getAllByTestId('DeleteIcon'));
    expect(deleteButton).toHaveLength(mockRoleRequests.length);
  });

  it('Calls API when new request is entered and snackbar is created', async () => {
    render(<TestingComponent />);

    const requestButton = screen.getByLabelText('Submit Request Button');
    expect(requestButton).toBeDisabled();

    const unitSelect = screen.getByTestId('requested-unit-select-text-field');
    await userEvent.click(unitSelect);

    const treeItem = screen.getByText(mockTestUnitDto.display_name);
    await userEvent.click(treeItem);
    await waitFor(() => {
      const unitSelectInput = screen.getByTestId('input-requested-unit-select-text-field');
      expect(unitSelectInput).toHaveValue(mockTestUnitDto.display_name);
    });

    const roleRadioButtons = screen.getByLabelText('Role Radio Buttons');
    expect(roleRadioButtons).toBeInTheDocument();

    const roleRadioBox = screen.getByRole('radio', { name: /Write/i });
    expect(roleRadioBox).not.toBeChecked();

    await userEvent.click(roleRadioBox);
    expect(roleRadioBox).toBeChecked();

    const noSnackbar = screen.queryByTestId('role-request-snackbar');
    expect(noSnackbar).not.toBeInTheDocument();
  });

  it('Calls API when existing request is deleted', async () => {
    render(<TestingComponent roleRequestData={mockRoleRequests.map(mapRoleRequest)} />);

    const noSnackbar = screen.queryByTestId('role-request-snackbar');
    expect(noSnackbar).not.toBeInTheDocument();

    const deleteButton = screen.getByTestId(`delete-button-${mockRoleRequests[0].id}`);
    expect(deleteButton).toBeInTheDocument();
    await userEvent.click(deleteButton);
  });

  it('Does not render when not active', () => {
    render(<TestingComponent activeTab={1} />);

    const requestPermissionsPaper = screen.queryByLabelText('Request Permissions Tab Content');
    expect(requestPermissionsPaper).not.toBeInTheDocument();

    const requestedPermissionsTable = screen.queryByLabelText('Requested Permissions Table');
    expect(requestedPermissionsTable).not.toBeInTheDocument();
  });
});
