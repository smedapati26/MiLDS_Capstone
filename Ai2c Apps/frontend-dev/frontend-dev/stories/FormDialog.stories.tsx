import { useState } from 'react';

import { Box, TextField } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { FormDialog, FormDialogsProps } from '../components/FormDialog';

const meta: Meta<typeof FormDialog> = {
  title: 'Components/FormDialog',
  component: FormDialog,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FormDialog>;

const Template = (args: FormDialogsProps) => {
  const [open, setOpen] = useState(args.open ?? true);
  const [value, setValue] = useState('');

  return (
    <Box>
      <button onClick={() => setOpen(true)}>Open Dialog</button>
      <FormDialog
        {...args}
        open={open}
        handleClose={() => setOpen(false)}
        handleSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField label="Name" value={value} onChange={(e) => setValue(e.target.value)} fullWidth />
        </Box>
      </FormDialog>
    </Box>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    title: 'Example Form',
    open: false,
    submitLabel: 'Save',
    size: 'sm',
  },
};
