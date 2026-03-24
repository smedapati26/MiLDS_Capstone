import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';

import App from '../../src/App';
import { ProviderWrapper } from '../helpers/ProviderWrapper';
import { server } from '../mocks/server';

// Mock the theme
vi.mock('@theme/theme', () => ({
  extendTheme: vi.fn(() => ({
    palette: { mode: 'light' },
  })),
  griffinPalette: {},
}));

// Mock Snackbar Provider
vi.mock('@store/providers/SnackbarProvider', () => ({
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock PmxMuiTheme
vi.mock('@ai2c/pmx-mui', () => ({
  usePmxMuiTheme: vi.fn(() => [{}, () => {}]),
  PmxThemeContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MainLayout: vi.fn(({ title, appIcon, appBarCenter, userMenu, classification }) => (
    <div data-testid="main-layout">
      <div>{title}</div>
      <div>{appIcon}</div>
      <div>{appBarCenter}</div>
      <div>{userMenu}</div>
      <div>{classification}</div>
    </div>
  )),
  AppBarUserMenu: vi.fn(({ children }) => <div data-testid="app-bar-user-menu">{children}</div>),
  GlobalUnitSelect: vi.fn(() => <div data-testid="global-unit-select"></div>),
  GriffinBeakIcon: vi.fn(() => <div data-testid="griffin-beak-icon"></div>),
  Classification: { CUI: 'CUI' },
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useLoaderData: vi.fn(() => ({
    userId: 'test-user',
    unit: { uic: 'test-uic' },
    globalUnit: { uic: 'test-uic' },
    firstName: 'Test',
    lastName: 'User',
    rank: 'Test',
    isAdmin: false,
    newUser: false,
  })),
}));

// Mock MUI
vi.mock('@mui/material', () => ({
  Button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Divider: vi.fn(() => <div data-testid="divider"></div>),
  SnackBar: vi.fn(() => <div data-testid="snackbar"></div>),
}));

vi.mock('@mui/x-date-pickers', () => ({
  AdapterDayjs: vi.fn(),
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock RTK Query hooks
vi.mock('@store/amap_api/users/slices/amapUsersApi', () => ({
  useGetAmapUserElevatedRolesQuery: vi.fn(() => ({ data: { manager: [], recorder: [], viewer: [] } })),
}));

vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetUnitsQuery: vi.fn(() => ({ data: [], isSuccess: true })),
  useGetFavoriteUnitsQuery: vi.fn(() => ({ data: [] })),
  useAddFavoriteUnitsMutation: () => [vi.fn().mockResolvedValue({})],
  useRemoveFavoriteUnitsMutation: () => [vi.fn().mockResolvedValue({})],
  useGetTransferRequestsQuery: vi.fn(() => ({ data: [] })),
}));

const mockKeycloak = {
  // Mock keycloak properties and methods as needed for your tests
  authenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  hasRealmRole: vi.fn(() => true),
  token: 'mock-token',
  tokenParsed: {
    name: 'Test',
  },
};

vi.mock('@react-keycloak/web', () => ({
  useKeycloak: vi.fn(() => ({
    keycloak: mockKeycloak,
    initialized: true,
  })),
}));

vi.mock('@store/griffin_api/users/slices', () => ({
  useGetUserElevatedRolesQuery: vi.fn(() => ({ data: { admin: [], write: [] } })),
  useGetAllRoleRequestsForAdminQuery: vi.fn(() => ({ data: [] })),
}));

// Mock store hooks
const mockDispatch = vi.fn();
vi.mock('@store/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
  useAppSelector: vi.fn((selector) =>
    selector({
      appSettings: {
        appUser: { userId: 'test-user', unit: { uic: 'test-uic' } },
        currentUic: 'test-uic',
      },
    }),
  ),
}));

// Mock store
vi.mock('@store/store', () => ({
  store: {
    getState: vi.fn(() => ({
      appSettings: {
        appUser: { userId: 'test-user', unit: { uic: 'test-uic' } },
        currentUic: 'test-uic',
      },
    })),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
}));

// Mock routes
vi.mock('../../src/routes', () => ({
  routes: [],
}));

// Mock helpers
vi.mock('@utils/helpers', () => ({
  mapUnitsWithTaskforceHierarchy: vi.fn(() => []),
}));

import { useLoaderData } from 'react-router-dom';

import { useElevatedRolesPermissions } from '@hooks/useElevatedRolesPermissions';
import { useInitializeUnits } from '@hooks/useInitializeUnits';

// Mock custom hooks
vi.mock('@hooks/useInitializeUnits', () => ({
  useInitializeUnits: vi.fn(() => ({ units: [], isSuccess: true })),
}));

vi.mock('@hooks/useElevatedRolesPermissions', () => ({
  useElevatedRolesPermissions: vi.fn(),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

const mockLocalStorageSetItem = vi.mocked(window.localStorage.setItem);

// Start MSW server
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe('App Component', () => {
  beforeEach(() => {
    vi.mocked(useInitializeUnits).mockReturnValue({ units: [], isSuccess: true });
    vi.mocked(useElevatedRolesPermissions).mockReturnValue({ isAdmin: false });
  });

  it('renders the main layout with correct title', async () => {
    vi.stubEnv('VITE_APP_TITLE', 'Griffin AI');

    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    expect(screen.getByText('Griffin AI')).toBeInTheDocument();
  });

  it('renders the griffin beak icon', async () => {
    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('griffin-beak-icon')).toBeInTheDocument();
    });
  });

  it('renders the global unit select when units are successfully loaded and currentUic is set', async () => {
    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('global-unit-select')).toBeInTheDocument();
    });
  });

  it('does not render the global unit select when units are not successfully loaded', async () => {
    vi.mocked(useInitializeUnits).mockReturnValueOnce({ units: [], isSuccess: false });

    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('global-unit-select')).not.toBeInTheDocument();
    });
  });

  it('renders the app bar user menu with manage account button', async () => {
    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-bar-user-menu')).toBeInTheDocument();
      expect(screen.getByText('Manage Your Account')).toBeInTheDocument();
    });
  });

  it('renders with correct classification', async () => {
    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('CUI')).toBeInTheDocument();
    });
  });

  it('calls useInitializeUnits with the app user from loader data', async () => {
    const mockAppUser = {
      userId: 'test-user',
      unit: { uic: 'test-uic' },
      globalUnit: { uic: 'test-uic' },
      firstName: 'Test',
      lastName: 'User',
      rank: 'Test',
      isAdmin: false,
      newUser: false,
    };
    vi.mocked(useLoaderData).mockReturnValue(mockAppUser);

    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(vi.mocked(useInitializeUnits)).toHaveBeenCalledWith(mockAppUser);
    });
  });

  it('calls useElevatedRolesPermissions with userId and currentUic', async () => {
    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(vi.mocked(useElevatedRolesPermissions)).toHaveBeenCalledWith('test-user', 'test-uic');
    });
  });

  it('sets theme mode in localStorage', async () => {
    render(
      <ProviderWrapper>
        <App />
      </ProviderWrapper>,
    );

    await waitFor(() => {
      expect(mockLocalStorageSetItem).toHaveBeenCalledWith('theme_color_mode', 'light');
    });
  });
});
