import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { AlertColor } from '@mui/material';

import { PmxSnackbar } from '@components/feedback';

// Define the shape of the feedback
interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info' as AlertColor,
  });

  // Use useCallback to prevent unnecessary re-renders
  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackbarState({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <PmxSnackbar
        open={snackbarState.open}
        autoHideDuration={snackbarState.severity === 'error' ? undefined : 4000} // undefined = User must close error message
        onClose={handleClose}
        severity={snackbarState.severity}
        variant={snackbarState.severity === 'error' ? 'filled' : 'standard'}
        isAlert={snackbarState.severity === 'error'}
        message={snackbarState.message}
      />
    </SnackbarContext.Provider>
  );
};

// Custom hook for easy access
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
