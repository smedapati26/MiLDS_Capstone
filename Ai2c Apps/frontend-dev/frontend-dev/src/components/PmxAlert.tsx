import React from 'react';

import ErrorIcon from '@mui/icons-material/Error';
import { Alert, AlertColor, AlertProps, useTheme } from '@mui/material';

interface PmxAlertProps extends Omit<AlertProps, 'severity'> {
  severity: AlertColor;
  children?: React.ReactNode;
}

const PmxAlert: React.FC<PmxAlertProps> = ({ severity, children, ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const severityColors: Record<AlertColor, string> = {
    error: isDark ? (theme.palette.error.d40 as string) : (theme.palette.error.l90 as string),
    warning: isDark ? (theme.palette.warning.d60 as string) : (theme.palette.warning.l80 as string),
    info: isDark ? (theme.palette.info.d60 as string) : (theme.palette.info.l80 as string),
    success: isDark ? (theme.palette.success.d60 as string) : (theme.palette.success.l80 as string),
  };

  const severityBorderColors: Record<AlertColor, string> = {
    error: theme.palette.error.d20 as string,
    warning: theme.palette.warning.d20 as string,
    info: theme.palette.info.d20 as string,
    success: theme.palette.success.d20 as string,
  };

  return (
    <Alert
      severity={severity}
      variant="standard"
      icon={<ErrorIcon />}
      sx={{
        border: `1px solid ${severityBorderColors[severity]}`,
        backgroundColor: severityColors[severity],
        color: theme.palette.text.primary,
        '& .MuiAlert-icon': {
          color: severityBorderColors[severity],
        },
        ml: 2,
        display: 'flex',
      }}
      {...props}
    >
      {children}
    </Alert>
  );
};

export default PmxAlert;
