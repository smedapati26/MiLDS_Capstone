import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { PmxThemeContextProvider, usePmxMuiTheme } from '@ai2c/pmx-mui';

import Oops from '@pages/Oops';
import { amapPalette } from '@theme/theme';

describe('Oops Component', () => {
  const RenderWithProviders = () => {
    const [theme, colorMode] = usePmxMuiTheme(amapPalette);

    return (
      <PmxThemeContextProvider theme={theme} colorMode={colorMode}>
        <ThemeProvider theme={theme}>
          <Oops />
        </ThemeProvider>
      </PmxThemeContextProvider>
    );
  };

  it('renders the Oops component with correct elements', () => {
    render(<RenderWithProviders />);

    // Check if the icon is rendered
    const iconContainer = screen.getByTestId('amap-icon');
    expect(iconContainer).toBeInTheDocument();

    // Check if the message is rendered
    const message = screen.getByText('Oops, we made a mistake...');
    expect(message).toBeInTheDocument();
  });

  it('renders the correct structure and styling', () => {
    render(<RenderWithProviders />);

    // Check if the main Container is rendered correctly
    const mainContainer = screen.getByLabelText('main-container');
    expect(mainContainer).toHaveStyle(`
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      min-width: 100vw;
    `);

    // Check if the inner Container is rendered correctly
    const innerContainer = screen.getByLabelText('inner-container');
    expect(innerContainer).toHaveStyle(`
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 368px;
      height: 210px;
    `);
  });
});
