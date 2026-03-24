import React from 'react';

import { Alert, AlertProps, Snackbar, SnackbarCloseReason, SxProps, Theme } from '@mui/material';

interface PmxSnackbarProps {
  open: boolean;
  onClose?: (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => void;
  message?: string;
  action?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: React.ReactElement<any, any>;
  anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' };
  sx?: SxProps<Theme>;
  autoHideDuration?: number;
  severity?: AlertProps['severity'];
  variant?: AlertProps['variant'];
  isAlert?: boolean;
}

export const PmxSnackbar: React.FC<PmxSnackbarProps> = ({
  open,
  onClose,
  message,
  action,
  children,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
  sx,
  autoHideDuration,
  severity = 'info',
  variant = 'standard',
  isAlert = false,
}) => {
  const styles = sx
    ? sx
    : { '& .MuiSnackbarContent-root': { minWidth: 'unset' }, '&.MuiSnackbar-root': { top: '96px' } };

  if (isAlert) {
    return (
      <Snackbar
        open={open}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        autoHideDuration={autoHideDuration}
        sx={{ ...styles }} // offset
      >
        <Alert severity={severity} variant={variant} onClose={onClose} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      message={message}
      action={action}
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      sx={{ ...styles }} // offset
    >
      {children}
    </Snackbar>
  );
};

export default PmxSnackbar;
