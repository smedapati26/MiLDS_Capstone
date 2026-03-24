import { Provider } from 'react-redux';

import { render, screen, within } from '@testing-library/react';

import CurrentPermissionsTab, { CurrentPermissionsProps } from '@features/user-management/components/AccountManagement/CurrentPermissionsTab';

import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers';

import '@testing-library/jest-dom';

/* Testing Component */
function TestingComponent(props: Partial<CurrentPermissionsProps> = {}) {
  const { activeTab = 0, index = 0 } = props;

  return (
    <Provider store={store}>
      <ThemedTestingComponent>
        <CurrentPermissionsTab activeTab={activeTab} index={index} />
      </ThemedTestingComponent>
    </Provider>
  );
}

/* Current Permissions Tab Tests */
describe('Testing Current Permissions Tab Tests', () => {
  /* Component Rendering */
  it('Renders Relevant Components', async () => {
    render(<TestingComponent />);

    const viewPermissionsPaper = screen.getByLabelText('View Permissions Tab Content');
    expect(viewPermissionsPaper).toBeInTheDocument();

    const currentPermissionsTable = screen.getByLabelText('Current Permissions Table');
    expect(currentPermissionsTable).toBeInTheDocument();

    const unitColumnHeader = within(currentPermissionsTable).getByText('Unit');
    const permissionColumnHeader = within(currentPermissionsTable).getByText('Permissions');
    const dateGrantedColumnHeader = within(currentPermissionsTable).getByText('Date Granted');

    expect(unitColumnHeader).toBeInTheDocument();
    expect(permissionColumnHeader).toBeInTheDocument();
    expect(dateGrantedColumnHeader).toBeInTheDocument();
  });

  it('Does not render when not active', () => {
    render(<TestingComponent activeTab={1} />);

    const viewPermissionsPaper = screen.queryByLabelText('View Permissions Tab Content');
    expect(viewPermissionsPaper).not.toBeInTheDocument();

    const currentPermissionsTable = screen.queryByLabelText('Current Permissions Table');
    expect(currentPermissionsTable).not.toBeInTheDocument();
  });
});
