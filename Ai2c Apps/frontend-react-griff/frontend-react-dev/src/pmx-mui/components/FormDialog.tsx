import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Breakpoint } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';

/**
 * @typedef FormDialogsProps
 * @prop { string | React.JSX.Element } title - Form Title
 * @prop {boolean } open - Open state of the dialog
 * @prop { function } handleClose - Callback passed in to handel close event
 * @prop { function } handleSubmit - Callback passed in to handel submit event
 * @prop { React.ReactNode } [children] - Renderable React elements
 * @prop { string | React.JSX.Element} [submitLabel="Save"] - Submit button label
 * @prop { Breakpoint } [size="sm"] - Dialog sizes. 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export type FormDialogsProps = {
  title: string | React.JSX.Element;
  open: boolean;
  handleClose: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
  submitLabel?: string | React.JSX.Element;
  size?: Breakpoint;
};

/**
 * FormDialog
 *
 * MUI Dialog wrapper function used to add custom styling and close icon in top right corner
 *
 * @param { FormDialogsProps } props
 */
export const FormDialog: React.FC<FormDialogsProps> = (props) => {
  const { title, open, handleClose, handleSubmit, children, submitLabel = 'Save', size = 'sm', ...other } = props;

  return (
    <Dialog
      data-testid="form-dialog"
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
      maxWidth={size}
      {...other}
    >
      <DialogTitle data-testid="form-dialog-title" sx={{ pb: 0 }}>
        {title}
      </DialogTitle>
      <IconButton
        data-testid="form-dialog-close-button"
        aria-label="close button"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      {
        /* Dialog Content */
        children
      }
      <DialogActions data-testid="form-dialog-actions" sx={{ p: 4 }}>
        <Button variant="outlined" data-testid="form-dialog-cancel" onClick={handleClose}>
          Cancel
        </Button>
        <Button data-testid="form-dialog-submit" type="submit" variant="contained">
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
