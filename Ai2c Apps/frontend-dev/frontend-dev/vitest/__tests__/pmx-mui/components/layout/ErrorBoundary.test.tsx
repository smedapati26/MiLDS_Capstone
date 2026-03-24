import { createMemoryRouter, json, RouteObject, RouterProvider } from 'react-router-dom';

import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary, MainLayout } from '@pmx-mui-components/layout';
import { pmxPalette } from '@pmx-mui-theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@pmx-mui-theme/PmxThemeContextProvider';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

const routes: Array<RouteObject> = [
  {
    path: '/',
    label: 'app-root',
    element: <TestingComponent />,
    errorElement: <ErrorBoundary />,
    loader: () => {
      throw json({ message: 'ErrorComponent' }, { status: 404, statusText: 'Not Found' });
    },
    children: [
      {
        index: true,
        label: 'index',
        path: '',
        element: <div>Should not render</div>,
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

/* ErrorBoundary Tests */
describe('ErrorBoundaryTest', () => {
  const router = createMemoryRouter(routes);

  beforeEach(() => render(<RouterProvider router={router} />));

  it('renders not found page', () => {
    const title = screen.getByTestId('not-found-page');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('404');
    expect(title).toHaveTextContent('Sorry, we could not find the page you are looking for.');
    expect(title).toHaveTextContent('Not Found');
    expect(title).toHaveTextContent('ErrorComponent');

    expect(title).not.toHaveTextContent('Should not render');
  });
});
