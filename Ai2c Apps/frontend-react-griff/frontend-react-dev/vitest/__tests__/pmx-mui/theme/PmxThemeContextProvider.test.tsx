import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { baseDarkPalette, baseLightPalette } from '@ai2c/pmx-mui/theme/index';
import { ColorModeContext, PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui/theme/PmxThemeContextProvider';

describe('PmxThemeContextProvider', () => {
  it('should create theme', async () => {
    const theme = createTheme({
      palette: baseDarkPalette,
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
