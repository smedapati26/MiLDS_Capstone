import { Box, ThemeProvider } from '@mui/material';
import { ClassificationBanner } from '@pmx-mui-components/layout/ClassificationBanner';
import { Classification } from '@pmx-mui-models/Classification';
import { baseDarkPalette } from '@pmx-mui-theme/darkPalette';
import { pmxPalette } from '@pmx-mui-theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@pmx-mui-theme/PmxThemeContextProvider';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

/* Testing Component */
function TestingComponent({ classification }: { classification: Classification }) {
  const [theme, colorMode] = usePmxMuiTheme(pmxPalette, 'dark');

  return (
    <Box data-testid="test-component" component="div">
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <ClassificationBanner type={classification} />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Box>
  );
}

describe('ClassificationBanner', () => {
  it('renders with correct text and styles for UNCLASSIFIED', () => {
    render(<TestingComponent classification={Classification.UNCLASSIFIED} />);
    const banner = screen.getByTestId('classification-banner');
    expect(banner).toHaveTextContent('UNCLASSIFIED');
    expect(banner).toHaveStyle('color: #FFFFFF');
    expect(banner).toHaveStyle(`background-color: ${baseDarkPalette.classification?.unclassified}`);
  });

  it('renders with correct text and styles for CUI', () => {
    render(<TestingComponent classification={Classification.CUI} />);
    const banner = screen.getByTestId('classification-banner');
    expect(banner).toHaveTextContent('CUI');
    expect(banner).toHaveStyle('color: #FFFFFF');
    expect(banner).toHaveStyle(`background-color: ${baseDarkPalette.classification?.cui}`);
  });

  it('renders with correct text and styles for CONFIDENTIAL', () => {
    render(<TestingComponent classification={Classification.CONFIDENTIAL} />);
    const banner = screen.getByTestId('classification-banner');
    expect(banner).toHaveTextContent('CONFIDENTIAL');
    expect(banner).toHaveStyle('color: #FFFFFF');
    expect(banner).toHaveStyle(`background-color: ${baseDarkPalette.classification?.confidential}`);
  });

  it('renders with correct text and styles for SECRET', () => {
    render(<TestingComponent classification={Classification.SECRET} />);
    const banner = screen.getByTestId('classification-banner');
    expect(banner).toHaveTextContent('SECRET');
    expect(banner).toHaveStyle('color: #FFFFFF');
    expect(banner).toHaveStyle(`background-color: ${baseDarkPalette.classification?.secret}`);
  });

  it('renders with correct text and styles for TOP_SECRET', () => {
    render(<TestingComponent classification={Classification.TOP_SECRET} />);
    const banner = screen.getByTestId('classification-banner');
    expect(banner).toHaveTextContent('TOP SECRET');
    expect(banner).toHaveStyle('color: #000000');
    expect(banner).toHaveStyle(`background-color: ${baseDarkPalette.classification?.top_secret}`);
  });

  it('renders with correct text and styles for TOP_SECRET_SCI', () => {
    render(<TestingComponent classification={Classification.TOP_SECRET_SCI} />);
    const banner = screen.getByTestId('classification-banner');
    expect(banner).toHaveTextContent('TOP SECRET // SCI');
    expect(banner).toHaveStyle('color: #000000');
    expect(banner).toHaveStyle(`background-color: ${baseDarkPalette.classification?.top_secret_sci}`);
  });
});
