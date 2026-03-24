import React from 'react';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';

import { SnackbarProvider } from '@store/providers/SnackbarProvider';
import { store } from '@store/store';

import { ThemedTestingComponent } from './ThemedTestingComponent';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderWithProviders = (ui: React.ReactElement, storeOverride?: any) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={storeOverride || store}>
      <SnackbarProvider>
        <ThemedTestingComponent>{children}</ThemedTestingComponent>
      </SnackbarProvider>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper });
};
