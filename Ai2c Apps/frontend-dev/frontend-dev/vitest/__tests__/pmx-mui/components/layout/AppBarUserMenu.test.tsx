import { createMemoryRouter, redirect, RouteObject, RouterProvider, useLoaderData } from 'react-router-dom';

import { Ai2cLogoIcon, GriffinBeakIcon } from '@icons/index';
import MenuIcon from '@mui/icons-material/Menu';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AppBarUserMenu, MainLayout } from '@pmx-mui-components/layout';
import { AppUser } from '@pmx-mui-models/index';
import { pmxPalette } from '@pmx-mui-theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@pmx-mui-theme/PmxThemeContextProvider';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

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
            userMenu={<AppBarUserMenu user={appUser} menuIcon={<MenuIcon />} routes={routes} />}
          />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Box>
  );
}

describe('AppBarUserMenu', () => {
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

  it('renders the menu icon', () => {
    const menuIconBtn = screen.getByTestId('user-menu-button');
    expect(menuIconBtn).toBeInTheDocument();
  });

  it('opens user menu', async () => {
    const avatarButton = screen.getByTestId('user-menu-button');
    expect(avatarButton).toBeInTheDocument();

    await userEvent.click(avatarButton);
    const profileMenu = screen.getByTestId('user-menu-popover');
    expect(profileMenu).toBeInTheDocument();
  });
});
