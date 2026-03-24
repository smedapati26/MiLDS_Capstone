import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertColor, Button, IconButton, Snackbar } from '@mui/material';
import { SnackbarOrigin } from '@mui/material/Snackbar';

type LabelColors = 'success' | 'info' | 'warning' | 'error' | 'primary';

interface SnackbarContextType {
  showAlert: (
    message: string,
    type: AlertColor,
    showIcon?: boolean,
    label?: string,
    labelColor?: LabelColors,
    onLabelClick?: () => void,
  ) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

interface SnackbarState {
  open: boolean;
  message: string;
  type: AlertColor;
  showIcon: boolean;
  label?: string;
  labelColor: LabelColors;
  onLabelClick?: () => void;
}

const anchorOrigin: SnackbarOrigin = {
  vertical: 'top',
  horizontal: 'right',
};

const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    type: 'success',
    showIcon: true,
    labelColor: 'success',
  });

  const showAlert = useCallback(
    (
      message: string,
      type: AlertColor,
      showIcon: boolean = true,
      label?: string,
      labelColor: LabelColors = 'success',
      onLabelClick?: () => void,
    ) => {
      setSnackbar({
        open: true,
        message,
        type,
        showIcon,
        label,
        labelColor: labelColor || 'success',
        onLabelClick,
      });
    },
    [],
  );

  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const action = (
    <>
      {snackbar.label && (
        <Button
          color={snackbar.labelColor || 'info'}
          size="small"
          onClick={() => {
            snackbar.onLabelClick ? snackbar.onLabelClick() : null;
            setSnackbar((prev) => ({ ...prev, open: false }));
          }}
        >
          {snackbar.label}
        </Button>
      )}
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  // prevent other components from rerendering
  const contextValue = useMemo(() => ({ showAlert }), [showAlert]);

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={anchorOrigin}>
        <Alert
          onClose={handleClose}
          severity={snackbar.type}
          icon={snackbar.showIcon ? undefined : false}
          variant="filled"
          action={action}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
