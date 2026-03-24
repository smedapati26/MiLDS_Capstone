import { Provider } from 'react-redux';
import { useBlocker } from 'react-router-dom';
import { Mock } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InformationSection from '@features/user-management/components/AccountManagement/InformationSection';

import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers';
import { mockTestUnit } from '@vitest/mocks/griffin_api_handlers/units/mock_data';
import { mockAppUser } from '@vitest/mocks/griffin_api_handlers/users/mock_data';

import '@testing-library/jest-dom';

vi.mock('@ai2c/pmx-mui', () => ({
  __esModule: true,
  titlecase: vi.fn((value) => (value)),
}));

vi.mock('@utils/helpers', async (importOriginal) => {
  const actual = await importOriginal() as object;
  return {
    ...actual,
    mapUnitsWithTaskforceHierarchy: vi.fn(() => ([mockTestUnit])),
  };
});

// Mock the react-router-dom for blocking navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useBlocker: vi.fn(() => ({
      state: 'unblocked',
      location: { pathname: '/' },
      reset: vi.fn(),
      proceed: vi.fn(),
    })),
  };
});

// Mock API slices
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetUnitsQuery: vi.fn(() => ({ data: [mockTestUnit], isSuccess: true })),
}));

// Mock store
vi.mock('@store/store', () => ({
  store: {
    getState: vi.fn(() => ({
      appSettings: {
        appUser: mockAppUser,
      },
    })),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
}));

/* Testing Component */
function TestingComponent() {
  return (
      <Provider store={store}>
              <ThemedTestingComponent>
          <InformationSection />
                </ThemedTestingComponent>
      </Provider>
  );
}

/* User Info Section Tests */
describe('User Info Section Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<TestingComponent />);
  });

  /* Component Rendering */
  it('Renders Relevant Components', () => {
    const userInfoPaper = screen.getByText('User Information');
    expect(userInfoPaper).toBeInTheDocument();

    const rankSelect = screen.getByTestId('rank-select');
    expect(rankSelect).toBeInTheDocument();

    const firstNameTextbox = screen.getByTestId('first-name');
    expect(firstNameTextbox).toBeInTheDocument();

    const lastNameTextbox = screen.getByTestId('last-name');
    expect(lastNameTextbox).toBeInTheDocument();

    const jobDescriptionTextbox = screen.getByTestId('job-description');
    expect(jobDescriptionTextbox).toBeInTheDocument();
  });

  it('Renders readonly mode on initialization and edit button', async () => {
    const editButton = screen.getByTestId('user-edit-icon');
    expect(editButton).toBeInTheDocument();

    const rankSelect = screen.getByLabelText('Rank Input');
    const firstNameTextbox = screen.getByLabelText('First Name Input');
    const lastNameTextbox = screen.getByLabelText('Last Name Input');
    const jobDescriptionTextbox = screen.getByLabelText('Job Description Input');

    expect(firstNameTextbox).toHaveAttribute('readonly');
    expect(lastNameTextbox).toHaveAttribute('readonly');
    expect(jobDescriptionTextbox).toHaveAttribute('readonly');

    await userEvent.click(editButton);
    expect(editButton).toBeDisabled();

    expect(rankSelect).not.toHaveAttribute('readonly');
    expect(firstNameTextbox).not.toHaveAttribute('readonly');
    expect(lastNameTextbox).not.toHaveAttribute('readonly');
    expect(jobDescriptionTextbox).not.toHaveAttribute('readonly');
  });

  it('only allows one section to be edited at a time', () => {
    fireEvent.click(screen.getByTestId('user-edit-icon'));
    expect(screen.getByTestId('unit-edit-icon')).toBeDisabled();

    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(screen.getByTestId('user-edit-icon')).not.toBeDisabled();
    expect(screen.getByTestId('unit-edit-icon')).not.toBeDisabled();

    fireEvent.click(screen.getByTestId('unit-edit-icon'));
    expect(screen.getByTestId('user-edit-icon')).toBeDisabled();
  });

  it('Renders save button correctly and calls API', async () => {
    const noSaveButton = screen.queryByTestId('save-button');
    expect(noSaveButton).not.toBeInTheDocument();

    const editButton = screen.getByTestId('user-edit-icon');
    await userEvent.click(editButton);

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeEnabled();

    const firstNameField = screen.getByLabelText('First Name Input');
    await userEvent.type(firstNameField, ' Jr.');

    await userEvent.click(saveButton);
    expect(firstNameField).toHaveValue('Testy Jr.');

    const firstNameError = screen.queryByText('First name is required.');
    expect(firstNameError).not.toBeInTheDocument();

    const lastNameError = screen.queryByText('Last name is required.');
    expect(lastNameError).not.toBeInTheDocument();

    const rankError = screen.queryByText('Rank is required.');
    expect(rankError).not.toBeInTheDocument();

    const unitError = screen.queryByText('Unit is required.');
    expect(unitError).not.toBeInTheDocument();
  });

  it('Renders cancel button correctly and doesnt call API', async () => {
    const noCancelButton = screen.queryByTestId('cancel-button');
    expect(noCancelButton).not.toBeInTheDocument();

    const editButton = screen.getByTestId('user-edit-icon');
    await userEvent.click(editButton);

    const firstNameField = screen.getByLabelText('First Name Input');
    await userEvent.type(firstNameField, 'ny');

    const cancelButton = screen.getByTestId('cancel-button');
    expect(cancelButton).toBeEnabled();

    await userEvent.click(cancelButton);

    expect(editButton).toBeInTheDocument();
    expect(cancelButton).not.toBeInTheDocument();
  });
});

/* Unit Info Section Tests */
describe('Unit Info Section Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<TestingComponent />);
  });

  /* Component Rendering */
  it('Renders Relevant Components', () => {
    const unitInfoPaper = screen.getByText('Unit Information');
    expect(unitInfoPaper).toBeInTheDocument();

    const unitHomeSelect = screen.getByText('Home Unit');
    expect(unitHomeSelect).toBeInTheDocument();

    const unitGlobalSelect = screen.getByText('Global Unit');
    expect(unitGlobalSelect).toBeInTheDocument();
  });

  it('Renders save button correctly and calls API', async () => {
    const noSaveButton = screen.queryByTestId('save-button');
    expect(noSaveButton).not.toBeInTheDocument();

    const editButton = screen.getByTestId('unit-edit-icon');
    await userEvent.click(editButton);

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeInTheDocument();

    const globalSelect = screen.getByTestId('global-unit-select-text-field');
    await userEvent.click(globalSelect);

    const globalTreeItem = screen.getByText(mockTestUnit.displayName);
    await userEvent.click(globalTreeItem);

    await userEvent.click(saveButton);
  });

  it('Renders cancel button correctly and doesnt call API', async () => {
    const noCancelButton = screen.queryByTestId('cancel-button');
    expect(noCancelButton).not.toBeInTheDocument();

    const editButton = screen.getByTestId('unit-edit-icon');
    await userEvent.click(editButton);

    const cancelButton = screen.getByTestId('cancel-button');
    expect(cancelButton).toBeInTheDocument();

    await userEvent.click(cancelButton);
  });
});

/* Navigation with Unsaved Changes Tests */
describe('InformationSection Navigation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<TestingComponent />);
  });

  it('Renders hidden modal on start', () => {
    const modal = screen.getByLabelText('Unsaved Changes Modal');
    const modalTitle = screen.queryByText('Leave Without Saving');

    expect(modal).toBeInTheDocument();
    expect(modalTitle).not.toBeInTheDocument();
  });

  it('Renders UnsavedChangesModal when navigation is trigged with unsaved changes', async () => {
    // override useBlocker as blocked
    (useBlocker as Mock).mockReturnValue({
      state: 'blocked',
      location: { pathname: '/test' },
      reset: vi.fn(),
      proceed: vi.fn(),
    });

    const editButton = screen.getByTestId('user-edit-icon');
    await userEvent.click(editButton);

    const firstNameTextbox = screen.getByLabelText('First Name Input');
    fireEvent.change(firstNameTextbox, { target: { value: 'Bob' } });
    expect(firstNameTextbox).toHaveValue('Bob');

    fireEvent(window, new Event('beforeunload', { bubbles: true, cancelable: true }));

    const modalTitle = screen.getByText('Leave Without Saving');
    expect(modalTitle).toBeInTheDocument();
  });
});
