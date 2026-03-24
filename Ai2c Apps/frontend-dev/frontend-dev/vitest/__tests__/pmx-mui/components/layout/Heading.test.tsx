import { ThemeProvider } from '@mui/material';
import { Heading } from '@pmx-mui-components/Heading';
import { pmxPalette } from '@pmx-mui-theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@pmx-mui-theme/PmxThemeContextProvider';
import { render, screen } from '@testing-library/react';

function TestingComponent() {
  const [theme, colorMode] = usePmxMuiTheme(pmxPalette);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Heading variant="h2" data-testid="test-component">
          TEST
        </Heading>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

/* Numeric Linear Progress Test */
describe('HeadingTest', () => {
  beforeEach(() => render(<TestingComponent />));

  it('adds 12px to the bottom of a heading', () => {
    const component = screen.getByTestId('test-component');
    const styles = getComputedStyle(component);
    expect(styles.marginBottom).toEqual('12px');
  });
});
