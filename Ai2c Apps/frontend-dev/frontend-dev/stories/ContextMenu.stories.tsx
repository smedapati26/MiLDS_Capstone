import { useState } from 'react';

import { MenuItem } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { ContextMenu, ContextMenuPosition } from '../components/ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
};

export default meta;

type Story = StoryObj<typeof ContextMenu>;

// Separate component to handle state
const ContextMenuDemo = (args: React.ComponentProps<typeof ContextMenu>) => {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  };

  const handleClose = () => {
    setPosition(null);
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        width: '100%',
        height: '300px',
        border: '1px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="button"
      tabIndex={0}
      aria-label="Context menu demo area"
    >
      Right-click anywhere in this box
      <ContextMenu {...args} contextMenuPosition={position} handleClose={handleClose} />
    </div>
  );
};

export const Primary: Story = {
  render: (args) => <ContextMenuDemo {...args} />,
  args: {
    children: (
      <>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Delete</MenuItem>
      </>
    ),
  },
};

export const Secondary: Story = {
  render: (args) => <ContextMenuDemo {...args} />,
  args: {
    variant: 'secondary',
    children: (
      <>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Share</MenuItem>
        <MenuItem>Export</MenuItem>
      </>
    ),
  },
};
