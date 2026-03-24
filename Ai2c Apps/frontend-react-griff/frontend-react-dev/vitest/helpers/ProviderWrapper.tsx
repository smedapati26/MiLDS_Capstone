import * as React from 'react';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { EnhancedStore } from '@reduxjs/toolkit';

import { baseLightPalette } from '@ai2c/pmx-mui/theme';

import { SnackbarProvider } from '@store/providers/SnackbarProvider';
import { store as AppStore } from '@store/store';

export interface Props {
  store?: EnhancedStore;
  children?: React.ReactNode;
}

const theme = createTheme({
  palette: baseLightPalette,
});

export const ProviderWrapper: React.FC<Props> = ({ store = AppStore, children }) => {
  return (
    <Provider store={store}>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </SnackbarProvider>
    </Provider>
  );
};

// Wrapper component for hooks
export const createWrapper = (store: EnhancedStore) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </Provider>
    );
  };

  return wrapper;
};
