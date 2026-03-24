import { createMemoryRouter, RouteObject, RouterProvider } from 'react-router-dom';

import { MAIN_NAV_DRAWER_WIDTH_CLOSED, MAIN_NAV_DRAWER_WIDTH_OPEN } from '@constants/index';
import { MainLayoutDrawer } from '@pmx-mui-components/layout/MainLayoutDrawer';
import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

describe('MainLayoutDrawerTest', () => {
  const routes: Array<RouteObject> = [
    { path: '/', element: <div>Home</div>, label: 'Home' },
    { path: '/about', element: <div>About</div>, label: 'About' },
  ];

  const router = createMemoryRouter([
    {
      path: '/',
      label: 'app-root',
      element: <MainLayoutDrawer routes={routes} />,
      children: routes,
    },
  ]);

  beforeEach(() => render(<RouterProvider router={router} />));

  test('renders MainLayoutDrawer with routes', () => {
    expect(screen.getByTestId('main-left-nav-drawer')).toBeInTheDocument();
  });

  test('renders with correct height', () => {
    const drawer = screen.getByTestId('main-left-nav-drawer');
    expect(drawer).toHaveStyle('height: 100%');
  });

  test('toggles drawer open and close', () => {
    const toggleButton = screen.getByTestId('main-left-nav-drawer-toggle');
    const drawer = screen.getByTestId('main-left-nav-drawer');

    // Initially closed
    expect(drawer.firstChild).toHaveStyle(`width: ${MAIN_NAV_DRAWER_WIDTH_CLOSED}px`);

    // Open drawer
    fireEvent.click(toggleButton);
    expect(drawer.firstChild).toHaveStyle(`width: ${MAIN_NAV_DRAWER_WIDTH_OPEN}px`);

    // Close drawer
    fireEvent.click(toggleButton);
    expect(drawer.firstChild).toHaveStyle(`width: ${MAIN_NAV_DRAWER_WIDTH_CLOSED}px`);
  });

  test('renders routes if provided', () => {
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('renders children inside the drawer', () => {
    render(
      <MainLayoutDrawer open={true}>
        <div data-testid="child-element">Child Element</div>
      </MainLayoutDrawer>,
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
});
