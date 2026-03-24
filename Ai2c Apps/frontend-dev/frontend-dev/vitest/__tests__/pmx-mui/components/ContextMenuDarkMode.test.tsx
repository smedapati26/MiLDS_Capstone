import React from 'react';

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ContextMenu, ContextMenuPosition, ContextMenuType } from '@pmx-mui-components/ContextMenu';
import { pmxPalette } from '@pmx-mui-theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@pmx-mui-theme/PmxThemeContextProvider';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import '@testing-library/jest-dom';

/**
 * Test Component
 *
 * Used to test dark mode and variant="secondary"
 */
// eslint-disable-next-line react/prop-types
function TestingComponent({ variant = 'primary' }) {
  const [theme, colorMode] = usePmxMuiTheme(pmxPalette);
  const [contextMenuPosition, setContextMenuPosition] = React.useState<ContextMenuPosition | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuPosition(
      contextMenuPosition === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClick = () => {
    colorMode.toggleColorMode();
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Button data-testid="toggle-mode" onClick={handleClick}>
          Toggle
        </Button>
        <Box data-testid="test-component-2" component="div" onContextMenu={handleContextMenu}>
          <Typography data-testid="test-component-2-target">Target</Typography>
          <ContextMenu
            variant={variant as ContextMenuType}
            handleClose={() => setContextMenuPosition(null)}
            contextMenuPosition={contextMenuPosition}
          >
            <MenuItem>Item</MenuItem>
          </ContextMenu>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

/* Context Menu Dark Mode Tests */
describe('ContextMenuDarkModeTest', () => {
  test('dark mode variant primary', async () => {
    render(<TestingComponent />);

    const target = screen.getByTestId('test-component-2-target');
    const toggleButton = screen.getByTestId('toggle-mode');
    await userEvent.click(toggleButton);
    await fireEvent.contextMenu(target);
    const menu = screen.getByTestId('context-menu');
    expect(menu).toBeInTheDocument();
  });

  test('dark mode variant secondary', async () => {
    render(<TestingComponent variant="secondary" />);

    const target = screen.getByTestId('test-component-2-target');
    const toggleButton = screen.getByTestId('toggle-mode');
    await userEvent.click(toggleButton);
    await fireEvent.contextMenu(target);
    const menu = screen.getByTestId('context-menu');
    expect(menu).toBeInTheDocument();
  });
});
