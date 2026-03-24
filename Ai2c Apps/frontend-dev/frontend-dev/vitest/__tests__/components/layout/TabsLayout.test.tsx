import { createMemoryRouter, redirect, RouteObject, RouterProvider } from 'react-router-dom';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { ColorModeContext, ErrorBoundary, MainLayout, usePmxMuiTheme } from '@ai2c/pmx-mui';

import { TabsLayout } from '@components/layout';

import '@testing-library/jest-dom';

export const tabRoutes: Array<RouteObject> = [
  { index: true, label: 'index', path: '', loader: () => redirect('tab-1') },
  {
    label: 'Tab 1',
    path: 'tab-1',
    element: <Box data-testid="tab-1-div">Tab 1</Box>,
  },
];

const routes: Array<RouteObject> = [
  {
    path: '/',
    label: 'app-root',
    element: <TestingComponent />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        label: 'Tabs Layout',
        path: '',
        element: <TabsLayout sxTabBox={{ borderBottom: 'none' }} title="Tabs Layout" routes={tabRoutes} />,
      },
    ],
  },
];

/* Testing Component */
function TestingComponent() {
  const [theme, colorMode] = usePmxMuiTheme();

  return (
    <Box data-testid="test-component" component="div">
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <MainLayout title="TEST" routes={routes} />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Box>
  );
}

/* Tabs Layout  Tests */
describe('TabsLayoutTest', () => {
  const router = createMemoryRouter(routes);
  beforeEach(() => (window.HTMLElement.prototype.scroll = function () {}));
  beforeEach(() => render(<RouterProvider router={router} />));

  it('renders tabs layout', () => {
    const layout = screen.getByTestId('test-component');
    expect(layout).toBeInTheDocument();
  });

  it('renders tabs layout title', () => {
    const title = screen.getByTestId('tabs-layout-section-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Tabs Layout');
  });

  it('renders tabs layout tabs', async () => {
    const tab1 = screen.getByTestId('tab-tab-1');
    expect(tab1).toBeInTheDocument();
    const tab1panel = screen.getByTestId('tab-panel-');
    expect(tab1panel).toBeInTheDocument();
  });

  it('applies sx style to sxTabBox', async () => {
    const layoutBox = screen.getByTestId('tabs-layout-layout-box');
    expect(layoutBox).toBeInTheDocument();
    expect(layoutBox).toHaveStyle('padding-bottom: none');
  });
});
