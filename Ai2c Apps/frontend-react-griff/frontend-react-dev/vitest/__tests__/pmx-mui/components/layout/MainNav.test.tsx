import { BrowserRouter, RouteObject } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { MainNav } from '@ai2c/pmx-mui/components/layout/MainNav';

describe('MainNav', () => {
  const routes: Array<RouteObject> = [
    { path: '/home', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  it('should render navigation links', () => {
    render(
      <BrowserRouter>
        <MainNav routes={routes} />
      </BrowserRouter>,
    );

    routes.forEach((route) => {
      const linkElement = screen.getByTestId(`main-nav-drawer-link-${route.path}`);
      expect(linkElement).toBeInTheDocument();
    });
  });

  it('should render links with correct labels when open', () => {
    render(
      <BrowserRouter>
        <MainNav routes={routes} open={true} />
      </BrowserRouter>,
    );

    routes.forEach((route) => {
      const linkElement = screen.getByText(route.label as string);
      expect(linkElement).toBeInTheDocument();
    });
  });

  it('should render links with tooltips when closed and icons are provided', () => {
    const routesWithIcons: Array<RouteObject> = routes.map((route) => ({
      ...route,
      icon: <span data-testid={`icon-${route.path}`} />,
    }));

    render(
      <BrowserRouter>
        <MainNav routes={routesWithIcons} open={false} />
      </BrowserRouter>,
    );

    routesWithIcons.forEach((route) => {
      const tooltipElement = screen.getByTestId(`icon-${route.path}`);
      expect(tooltipElement).toBeInTheDocument();
    });
  });

  it('should not render index routes', () => {
    const routesWithIndex: Array<RouteObject> = [...routes, { path: '/', label: 'Index', index: true }];

    render(
      <BrowserRouter>
        <MainNav routes={routesWithIndex} />
      </BrowserRouter>,
    );

    const indexLinkElement = screen.queryByText('Index');
    expect(indexLinkElement).not.toBeInTheDocument();
  });
});
