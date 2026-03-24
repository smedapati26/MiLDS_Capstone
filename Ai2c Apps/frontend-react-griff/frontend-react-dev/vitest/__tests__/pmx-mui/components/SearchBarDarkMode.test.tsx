import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { ContextMenuPosition } from '@ai2c/pmx-mui/components/ContextMenu';
import { SearchBar } from '@ai2c/pmx-mui/components/SearchBar';
import { getEchelonOptions } from '@ai2c/pmx-mui/models/Echelon';
import { pmxPalette } from '@ai2c/pmx-mui/theme/pmxPalette';
import { ColorModeContext, usePmxMuiTheme } from '@ai2c/pmx-mui/theme/PmxThemeContextProvider';

/* Testing Component */
function TestingComponent() {
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

  const [selected, setSelected] = useState('');
  const options = getEchelonOptions();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Button data-testid="toggle-mode" onClick={handleClick}>
          Toggle
        </Button>
        <Box data-testid="test-component" component="div" onContextMenu={handleContextMenu}>
          <SearchBar
            data-testid="search-bar-1"
            small
            variant="underline"
            options={options}
            onChange={(_event: unknown, value: { label: React.SetStateAction<string> }) => setSelected(value.label)}
          />
          <SearchBar
            data-testid="search-bar-2"
            options={options}
            onChange={(_event: unknown, value: { label: React.SetStateAction<string> }) => {
              setSelected(value.label);
            }}
          />
          Result = {selected}
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

/* Search Bar Dark Mode Test */
describe('SearchBarDarkModeTest', () => {
  beforeEach(() => render(<TestingComponent />));

  it('renders small', async () => {
    const searchBar = screen.getByTestId('search-bar-1');
    expect(searchBar.children[0].children[0].classList).toContain('MuiInputBase-sizeSmall');
  });

  it('renders dark background in dark mode', () => {
    const searchBar = screen.getByTestId('search-bar-1');
    expect(searchBar).toHaveStyle('background-color: rgba(0,0,0,0)');
  });
});
