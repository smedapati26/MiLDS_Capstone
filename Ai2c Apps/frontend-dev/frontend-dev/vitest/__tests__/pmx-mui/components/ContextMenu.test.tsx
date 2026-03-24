import React from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { ContextMenu, ContextMenuPosition } from '@pmx-mui-components/ContextMenu';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import '@testing-library/jest-dom';

/* Test Component */
function TestingComponent() {
  const [selected, setSelected] = React.useState('');
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

  const handleClick = (value: string) => {
    setSelected(value);
    setContextMenuPosition(null);
  };

  return (
    <Box data-testid="test-component" component="div" onContextMenu={handleContextMenu}>
      <Typography data-testid="target">Target</Typography>
      <ContextMenu handleClose={() => setContextMenuPosition(null)} contextMenuPosition={contextMenuPosition}>
        <MenuItem onClick={() => handleClick('Copy')}>Copy</MenuItem>
        <MenuItem onClick={() => handleClick('Print')} data-testid="test-button">
          Print
        </MenuItem>
      </ContextMenu>
      <p data-testid="test-value">Result = {selected}</p>
    </Box>
  );
}

/* Context Menu Tests */
describe('ContextMenuTest', () => {
  beforeEach(() => render(<TestingComponent />));

  test('renders context menu on right click', async () => {
    const target = screen.getByTestId('target');
    await fireEvent.contextMenu(target);
    const menu = screen.getByTestId('context-menu');
    expect(menu.innerHTML).toContain('Copy');
  });

  test('context menu item clickable', async () => {
    const target = screen.getByTestId('target');
    await fireEvent.contextMenu(target);
    const menuItem = screen.getByTestId('test-button');
    await userEvent.click(menuItem);
    const value = screen.getByTestId('test-value');
    expect(value.innerHTML).toEqual('Result = Print');
  });
});
