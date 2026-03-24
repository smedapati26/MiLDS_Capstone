import { useState } from 'react';

import { Box, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { DraggableDialog } from '../components/DraggableDialog';

const meta: Meta<typeof DraggableDialog> = {
  title: 'Components/DraggableDialog',
  component: DraggableDialog,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof DraggableDialog>;

const Template = () => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <button onClick={() => setOpen(true)}>Open Dialog</button>
      <DraggableDialog open={open} setOpen={setOpen}>
        <Typography variant="h6" id="draggable-dialog-title" sx={{ cursor: 'move', p: 2 }}>
          Drag Me
        </Typography>
        <Box sx={{ p: 2 }}>
          <Typography>This is a draggable dialog. Click and drag the title to move it.</Typography>
        </Box>
      </DraggableDialog>
    </Box>
  );
};

export const Primary: Story = {
  render: Template,
};

export const WithoutBackdrop: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <button onClick={() => setOpen(true)}>Open Dialog</button>
        <DraggableDialog open={open} setOpen={setOpen} hideBackdrop>
          <Typography variant="h6" id="draggable-dialog-title" sx={{ cursor: 'move', p: 2 }}>
            Drag Me (No Backdrop)
          </Typography>
          <Box sx={{ p: 2 }}>
            <Typography>This dialog has no backdrop.</Typography>
          </Box>
        </DraggableDialog>
      </Box>
    );
  },
};
