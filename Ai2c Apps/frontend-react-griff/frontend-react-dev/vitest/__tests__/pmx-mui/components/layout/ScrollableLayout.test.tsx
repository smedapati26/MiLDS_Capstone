import { createMemoryRouter, RouteObject, RouterProvider } from 'react-router-dom';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { MainLayout, ScrollableLayout } from '@ai2c/pmx-mui/components/layout';
import { pmxPalette } from '@ai2c/pmx-mui/theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@ai2c/pmx-mui/theme/PmxThemeContextProvider';

import '@testing-library/jest-dom';

const routes: Array<RouteObject> = [
  {
    path: '/',
    label: 'app-root',
    element: <TestingComponent />,
    children: [
      {
        index: true,
        label: 'index',
        path: '',
        element: (
          <ScrollableLayout title="TEST">
            <div>TEST CONTENT</div>
          </ScrollableLayout>
        ),
      },
    ],
  },
];

/* Testing Component */
function TestingComponent() {
  const [theme, colorMode] = usePmxMuiTheme(pmxPalette);

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

/* ScrollableLayout Tests */
describe('ScrollableLayoutTest', () => {
  const router = createMemoryRouter(routes);
  beforeEach(() => (window.HTMLElement.prototype.scroll = function () {}));
  beforeEach(() => render(<RouterProvider router={router} />));

  it('renders scrollable layout title', () => {
    const title = screen.getByTestId('scrollable-layout-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('TEST');
  });

  it('renders scrollable layout content', () => {
    const content = screen.getByTestId('scrollable-layout-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('TEST CONTENT');
  });
});
