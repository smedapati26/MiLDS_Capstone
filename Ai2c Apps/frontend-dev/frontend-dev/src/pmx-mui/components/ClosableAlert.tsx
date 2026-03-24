import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import Alert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

/**
 * @typedef ClosableAlertProps
 * @prop { AlertColor } severity
 * @prop { React.ReactNode } [children]
 */
export type ClosableAlertProps = {
  severity: AlertColor;
  children?: React.ReactNode;
};

/**
 * Transition Alert
 *
 * MUI Alert wrapper that adds a closable button
 *
 * @param { ClosableAlertProps } props
 */
export const ClosableAlert: React.FC<ClosableAlertProps> = ({ severity, children }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={open} data-testid="transition-alert">
        <Alert
          data-testid="transition-alert-alert"
          severity={severity}
          action={
            <IconButton
              data-testid="transition-alert-close-button"
              aria-label="close button"
              color="inherit"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 3 }}
        >
          {children}
        </Alert>
      </Collapse>
    </Box>
  );
};
