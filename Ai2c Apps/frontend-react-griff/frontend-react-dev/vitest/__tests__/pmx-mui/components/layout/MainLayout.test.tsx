import { createMemoryRouter, redirect, RouteObject, RouterProvider, useLoaderData } from 'react-router-dom';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { AppBarUserMenu, MainLayout } from '@ai2c/pmx-mui/components/layout';
import { MAIN_NAV_DRAWER_WIDTH_OPEN } from '@ai2c/pmx-mui/constants/index';
import { Ai2cLogoIcon, GriffinBeakIcon } from '@ai2c/pmx-mui/icons/index';
import { AppUser, Classification } from '@ai2c/pmx-mui/models/index';
import { pmxPalette } from '@ai2c/pmx-mui/theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@ai2c/pmx-mui/theme/PmxThemeContextProvider';

import '@testing-library/jest-dom';

const loginLoader = async () => {
  // Await Fetch User
  const user: AppUser = {
    userId: '0123456789',
    firstName: 'Testy',
    lastName: 'McGee',
    email: 'testy.mcgee.ctr@army.mil',
    rank: 'CTR',
    isAdmin: true,
    unit: 'AI2C',
  };

  if (user) {
    return user;
  }

  throw new Error('Login failed');
};

const routes: Array<RouteObject> = [
  { index: true, label: 'index', path: '', loader: () => redirect('page-1') },
  {
    label: 'Page 1',
    path: 'page-1',
    element: <div data-testid="main-page-1">Page 1</div>,
    icon: <GriffinBeakIcon />,
  },
  {
    label: 'Page 2',
    path: 'page-2',
    element: <div data-testid="main-page-2">Page 2</div>,
    icon: <GriffinBeakIcon />,
  },
];

/* Testing Component */
function TestingComponent() {
  const [theme, colorMode] = usePmxMuiTheme(pmxPalette);
  const appUser = useLoaderData() as AppUser;

  return (
    <Box data-testid="test-component" component="div">
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <MainLayout
            appIcon={<Ai2cLogoIcon />}
            title="TEST"
            routes={routes}
            appBarLeft={<Box data-testid="appBarLeft">appBarLeft</Box>}
            appBarCenter={<Box data-testid="appBarCenter">appBarCenter</Box>}
            appBarRight={<Box data-testid="appBarRight">appBarRight</Box>}
            classification={Classification.UNCLASSIFIED}
            userMenu={<AppBarUserMenu user={appUser} />}
          />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Box>
  );
}

/* MainLayout Tests */
describe('MainLayoutTest', () => {
  const router = createMemoryRouter([
    {
      path: '/',
      label: 'app-root',
      element: <TestingComponent />,
      loader: loginLoader,
      errorElement: <div>Not Found</div>,
      children: routes,
    },
  ]);

  beforeEach(() => render(<RouterProvider router={router} />));

  it('renders main layout appbar', () => {
    const appBar = screen.getByTestId('main-layout-appbar');
    expect(appBar).toBeInTheDocument();
  });

  it('renders main layout title', () => {
    const title = screen.getByTestId('main-layout-brand');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('TEST');
  });

  it('renders main layout icon', () => {
    const icon = screen.getByTestId('main-layout-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders main layout classification banner', () => {
    const classificationBanner = screen.getByTestId('classification-banner');
    expect(classificationBanner).toBeInTheDocument();
    expect(classificationBanner).toHaveTextContent(Classification.UNCLASSIFIED.toUpperCase());
  });

  it('renders main layout appbar positions', () => {
    const appBarLeft = screen.getByTestId('appBarLeft');
    expect(appBarLeft).toBeInTheDocument();
    expect(appBarLeft).toHaveTextContent('appBarLeft');

    const appBarCenter = screen.getByTestId('appBarCenter');
    expect(appBarCenter).toBeInTheDocument();
    expect(appBarCenter).toHaveTextContent('appBarCenter');

    const appBarRight = screen.getByTestId('appBarRight');
    expect(appBarRight).toBeInTheDocument();
    expect(appBarRight).toHaveTextContent('appBarRight');
  });

  it('renders main nav drawers', () => {
    const drawer = screen.getByTestId('main-left-nav-drawer');
    expect(drawer).toBeInTheDocument();
  });

  it('renders main tab panel', () => {
    const drawer = screen.getByTestId('main-left-nav-drawer');
    expect(drawer).toBeInTheDocument();
  });

  it('toggles theme color mode', async () => {
    const appBar = screen.getByTestId('main-layout-appbar');
    expect(appBar).toHaveStyle('background-color: rgb(35, 35, 35)'); // #232323

    const colorModeToggleButton = screen.getByTestId('main-layout-color-mode-toggle');
    expect(colorModeToggleButton).toBeInTheDocument();
    await userEvent.click(colorModeToggleButton);

    expect(appBar).toHaveStyle('background-color: rgb(237, 237, 237)'); // #EDEDED
  });

  it('displays routes on click', async () => {
    const firstPageLink = screen.getByTestId('main-nav-drawer-link-page-1');
    const secondPageLink = screen.getByTestId('main-nav-drawer-link-page-2');
    expect(firstPageLink).toBeInTheDocument();
    expect(secondPageLink).toBeInTheDocument();

    const firstPage = screen.getByTestId('main-page-1');
    expect(firstPage).toBeInTheDocument();
  });

  it('opens user menu', async () => {
    const avatarButton = screen.getByTestId('user-menu-button');
    expect(avatarButton).toBeInTheDocument();
    expect(avatarButton).toHaveTextContent('TM');

    await userEvent.click(avatarButton);
    const profileMenu = screen.getByTestId('user-menu-popover');
    expect(profileMenu).toBeInTheDocument();
  });
});

function LeftDrawerTestingComponent() {
  const [theme, colorMode] = usePmxMuiTheme(pmxPalette);
  const appUser = useLoaderData() as AppUser;

  return (
    <Box data-testid="test-component" component="div">
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <MainLayout
            appIcon={<Ai2cLogoIcon />}
            title="TEST"
            routes={routes}
            appBarLeft={<Box data-testid="appBarLeft">appBarLeft</Box>}
            appBarCenter={<Box data-testid="appBarCenter">appBarCenter</Box>}
            appBarRight={<Box data-testid="appBarRight">appBarRight</Box>}
            classification={Classification.UNCLASSIFIED}
            userMenu={<AppBarUserMenu user={appUser} />}
            leftDrawer={<div>leftDrawer</div>}
            leftDrawerOpen={true}
            leftDrawerCollapsible={false}
          />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Box>
  );
}

/* MainLayout Tests */
describe('MainLayoutTest', () => {
  const router = createMemoryRouter([
    {
      path: '/',
      label: 'app-root',
      element: <LeftDrawerTestingComponent />,
      loader: loginLoader,
      errorElement: <div>Not Found</div>,
      children: routes,
    },
  ]);

  beforeEach(() => render(<RouterProvider router={router} />));

  it('renders main nav drawer defaults open', () => {
    const drawer = screen.getByTestId('main-left-nav-drawer');
    expect(drawer).toBeInTheDocument();
    if (drawer) {
      expect(drawer).toHaveStyle(`width: ${MAIN_NAV_DRAWER_WIDTH_OPEN}`);
    }
  });

  it('renders main nav drawer has left content', () => {
    const drawer = screen.getByText('leftDrawer');
    expect(drawer).toBeInTheDocument();
  });

  it('should not render collapse button', async () => {
    await waitFor(() => expect(() => screen.getByTestId('main-left-nav-drawer-toggle')).toThrow());
  });
});
