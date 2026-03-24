import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { baseDarkPalette, baseLightPalette } from '@pmx-mui-theme/index';
import { render, screen } from '@testing-library/react';

import { ColorModeContext, PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui';

describe('PmxThemeContextProvider', () => {
  it('should create theme', async () => {
    const theme = createTheme({
      palette: {
        mode: 'dark',
        boxShadow: '1px 2px 3px rgba(0, 0, 0, 0.25)',
        layout: {},
        avatar: '#000000',
        badge: '#000000',
      },
    });
    const colorMode = { toggleColorMode: vi.fn() };

    render(
      <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
        <div>Test Child</div>
      </PmxThemeContextProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should toggle color mode', async () => {
    const TestComponent = () => {
      const [theme, colorMode] = usePmxMuiTheme({ light: baseLightPalette, dark: baseDarkPalette }, 'light');
      return (
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <button onClick={colorMode.toggleColorMode}>Toggle Mode</button>
            <div>{theme.palette.mode}</div>
          </ThemeProvider>
        </ColorModeContext.Provider>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('light')).toBeInTheDocument();
  });
});
