import { Provider } from 'react-redux';

import { render, screen } from '@testing-library/react';

import AccountManagement from '@features/user-management/components/AccountManagement';

import { store } from '@store/store';

import { ThemedTestingComponent } from '@vitest/helpers';

import '@testing-library/jest-dom';

vi.mock('@ai2c/pmx-mui', () => ({
  __esModule: true,
  ScrollableLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

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

/* Testing Component */
function TestingComponent() {
  return (
      <Provider store={store}>
            <ThemedTestingComponent>
        <AccountManagement />
              </ThemedTestingComponent>
      </Provider>
  );
}

/* Account Management Tests */
describe('AccountManagementTest', () => {
  beforeEach(() => render(<TestingComponent />));

  it('Renders all relevant components', () => {
    expect(screen.getByText('User Information')).toBeInTheDocument();
    expect(screen.getByText('Unit Information')).toBeInTheDocument();
    expect(screen.getByText('User Permissions')).toBeInTheDocument();

    expect(screen.getByLabelText('View Permissions')).toBeInTheDocument();
    expect(screen.getByLabelText('Request Permissions')).toBeInTheDocument();
  });
});
