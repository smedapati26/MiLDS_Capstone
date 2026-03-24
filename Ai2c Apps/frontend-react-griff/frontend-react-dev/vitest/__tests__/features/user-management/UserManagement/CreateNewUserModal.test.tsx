import { Provider } from 'react-redux';

import Box from '@mui/material/Box';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateNewUserModal from '@features/user-management/components/UserManagement/CreateNewUserModal';

import { UserRoleOptions } from '@store/griffin_api/users/models/IUserRole';
import { store } from '@store/store';

import { mockTestUnitDto } from '@vitest/mocks/griffin_api_handlers/units/mock_data';

import '@testing-library/jest-dom';

/* Testing User Permissions Tab */
const renderTestingComponent = () => {
  return render(
    <Box data-testid='test-component' component='div'>
      <Provider store={store}>
        <CreateNewUserModal setShowSnackbar={vi.fn()} setSnackbarMessage={vi.fn()}/>
      </Provider>
    </Box>,
  );
};

/* Helper Functions */
const fillFields = async () => {
  const firstNameField = screen.getByLabelText('First Name Input');
  fireEvent.change(firstNameField, { target: { value: 'John' } });

  const lastNameField = screen.getByLabelText('Last Name Input');
  fireEvent.change(lastNameField, { target: { value: 'Doe' } });

  const rankDropdown = screen.getByLabelText('Rank Input');
  fireEvent.mouseDown(rankDropdown);

  const rankOption = screen.getByText('CTR');
  fireEvent.click(rankOption);

  const userIdField = screen.getByLabelText('DoD ID Input');
  fireEvent.change(userIdField, { target: { value: '8675309' } });

  const selectTextField = screen.getByTestId('unit-select-text-field');
  await userEvent.click(selectTextField);

  const treeItem = screen.getByText(mockTestUnitDto.display_name);
  await userEvent.click(treeItem);
};

/* CreateNewUserModal Tests */
describe('CreateNewUserModal Test', () => {
  it('Renders Relevant Components', () => {
    renderTestingComponent();

    const createUserButton = screen.getByText('CREATE NEW USER');
    fireEvent.click(createUserButton);

    const firstNameField = screen.getByText('First Name');
    const lastNameField = screen.getByText('Last Name');
    const rankField = screen.getByText('Rank');
    const userIdField = screen.getByText('DoD ID');
    const unitField = screen.getByText('Unit');
    const roleField = screen.getByText('User Role');

    expect(firstNameField).toBeInTheDocument();
    expect(lastNameField).toBeInTheDocument();
    expect(rankField).toBeInTheDocument();
    expect(userIdField).toBeInTheDocument();
    expect(unitField).toBeInTheDocument();
    expect(roleField).toBeInTheDocument();

    const cancelButton = screen.getByText('CANCEL');
    const confirmButton = screen.getByText('CONFIRM');

    expect(cancelButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });

  it('Renders modal properly when cancelled.', async () => {
    renderTestingComponent();

    // Opens modal and fills fields
    const createUserButton = screen.getByText('CREATE NEW USER');
    await userEvent.click(createUserButton);

    await fillFields();

    // Cancels request and closes modal
    const cancelButton = screen.getByText('CANCEL');
    await userEvent.click(cancelButton);

    // Opens modal and clears fields
    await userEvent.click(createUserButton);
  });

  it('Renders modal properly when submitted.', async () => {
    renderTestingComponent();

    // Opens modal and fills fields
    const createUserButton = screen.getByText('CREATE NEW USER');
    await userEvent.click(createUserButton);

    await fillFields();

    // Sends request and closes modal
    const confirmButton = screen.getByText('CONFIRM');
    await userEvent.click(confirmButton);
  });

  it('Calls CreateUserRole API when role other than Viewer is selected.', async () => {
    renderTestingComponent();

    // Opens modal and fills fields
    const createUserButton = screen.getByText('CREATE NEW USER');
    await userEvent.click(createUserButton);

    await fillFields();

    //select elevated role
    const roleDropdown = screen.getByLabelText('User Role Input');
    await userEvent.click(roleDropdown);

    const roleOption = screen.getByText(UserRoleOptions.WRITE);
    await userEvent.click(roleOption);

    // Sends request and closes modal
    const confirmButton = screen.getByText('CONFIRM');
    await userEvent.click(confirmButton);
  });
});
