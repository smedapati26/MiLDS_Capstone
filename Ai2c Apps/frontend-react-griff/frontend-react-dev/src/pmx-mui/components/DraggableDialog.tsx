import * as React from 'react';
import Draggable from 'react-draggable';

import Dialog from '@mui/material/Dialog';
import Paper, { PaperProps } from '@mui/material/Paper';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Custom Paper component for draggable dialog.
 *
 * @param props - The props for the Paper component.
 * @returns The JSX element representing the draggable Paper component.
 */
export const PaperComponent = (props: PaperProps) => {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
};

interface Props {
  open: boolean;

  setOpen: (_open: boolean) => void;
  children: Array<React.ReactElement>;
  sx?: SxProps<Theme>;
  hideBackdrop?: boolean;
}

/**
 * DraggableDialog component.
 *
 * @component
 * @param {object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open or not.
 * @param {function} props.setOpen - Function to set the open state of the dialog.
 * @param {ReactNode} props.children - The content of the dialog.
 * @param {object} props.sx - Additional styles for the dialog.
 * @param {boolean} [props.hideBackdrop=false] - Whether to hide the backdrop or not.
 * @returns {JSX.Element} The DraggableDialog component.
 */
export const DraggableDialog: React.FC<Props> = ({ open, setOpen, children, sx, hideBackdrop = false }) => {
  const handleClose = (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  return (
    <Dialog
      maxWidth="xs"
      open={open}
      onClose={handleClose}
      hideBackdrop={hideBackdrop}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      sx={{ ...sx }}
    >
      {...children}
    </Dialog>
  );
};
