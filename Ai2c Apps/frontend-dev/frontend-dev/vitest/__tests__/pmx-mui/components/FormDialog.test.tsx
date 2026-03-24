import React from 'react';
import { describe, expect, it } from 'vitest';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { FormDialog } from '@pmx-mui-components/FormDialog';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import '@testing-library/jest-dom';

/* Testing Component */
function TestingComponent() {
  const [value, setValue] = React.useState<string>('');
  const [open, setOpen] = React.useState(false);

  const handleDialog = (value: boolean) => {
    setOpen(value);
  };

  return (
    <Box data-testid="test-component" component="div">
      <Button data-testid="test-button" onClick={() => handleDialog(true)}>
        Open Dialog
      </Button>
      <FormDialog
        title="Test Dialog"
        open={open}
        handleClose={() => handleDialog(false)}
        handleSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleDialog(false);
        }}
      >
        <DialogContent>
          {/* text */}
          <FormControl>
            <TextField
              required
              id="text-field"
              label="Text Field"
              inputProps={{ 'data-testid': 'text-field' }}
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
          </FormControl>
        </DialogContent>
      </FormDialog>
      <p data-testid="test-value">{value}</p>
    </Box>
  );
}

/* Form Dialog Test */
describe('FormDialogTest', () => {
  beforeEach(() => render(<TestingComponent />));

  it('dialog opens', async () => {
    const openDialogButton = screen.getByTestId('test-button');
    await userEvent.click(openDialogButton);

    const component = screen.getByTestId('form-dialog-title');
    expect(component.innerHTML).toEqual('Test Dialog');
  });

  it('close dialog with close button', async () => {
    const openDialogButton = screen.getByTestId('test-button');
    await userEvent.click(openDialogButton);
    const closeButton = screen.getByTestId('form-dialog-close-button');
    await userEvent.click(closeButton);
    const form = screen.getByTestId('form-dialog');
    expect(form?.firstChild).toHaveStyle('opacity: 0');
  });

  it('close dialog with cancel button', async () => {
    const openDialogButton = screen.getByTestId('test-button');
    await userEvent.click(openDialogButton);
    const closeButton = screen.getByTestId('form-dialog-cancel');
    await userEvent.click(closeButton);
    const form = screen.getByTestId('form-dialog');
    expect(form?.firstChild).toHaveStyle('opacity: 0');
  });

  it('enter text into dialog form', async () => {
    const openDialogButton = screen.getByTestId('test-button');
    await userEvent.click(openDialogButton);
    const textField = screen.getByTestId('text-field');
    await userEvent.type(textField, 'TESTING');
    expect(screen.getByText('TESTING')).toBeInTheDocument();
  });
});
