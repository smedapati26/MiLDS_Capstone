import { createMemoryRouter, redirect, RouteObject, RouterProvider, useLoaderData } from 'react-router-dom';
import { mockAppUser } from 'vitest/mocks/handlers/app_user/mock_data';

import Box from '@mui/material/Box';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { AppBarUserMenu, MainLayout } from '@ai2c/pmx-mui';

import { IAppUser } from '@store/amap_ai/user/models';

import '@testing-library/jest-dom';

const routes: Array<RouteObject> = [
  { index: true, label: 'index', path: '', loader: () => redirect('page-1') },
  {
    label: 'Page 1',
    path: 'page-1',
    element: <div data-testid="main-page-1">Page 1</div>,
  },
];

/* Testing Component */
function TestingComponent() {
  const appUser = useLoaderData() as IAppUser;

  return (
    <Box data-testid="test-component" component="div">
      <MainLayout
        title="TEST"
        routes={routes}
        userMenu={<AppBarUserMenu user={{ ...appUser, rank: 'CPT', unit: appUser.uic as string }} />}
      />
    </Box>
  );
}

/* authLoader Tests */
describe('authLoaderTest', () => {
  const router = createMemoryRouter([
    {
      path: '/',
      label: 'app-root',
      element: <TestingComponent />,
      loader: () => mockAppUser,
      errorElement: <div>Not Found</div>,
      children: routes,
    },
  ]);

  beforeEach(() => render(<RouterProvider router={router} />));

  it('authLoader provides appUser and userMenu displays user info', async () => {
    const avatarButton = screen.getByTestId('user-menu-button');
    expect(avatarButton).toBeInTheDocument();
    expect(avatarButton).toHaveTextContent('TM');

    await userEvent.click(avatarButton);
    const profileMenu = screen.getByTestId('user-menu-popover');
    expect(profileMenu).toBeInTheDocument();
  });
});
