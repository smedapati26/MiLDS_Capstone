import { describe, expect, it } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';

import SnackbarProvider from '@context/SnackbarProvider';
import { screen } from '@testing-library/react';

import { TransferSoldiersPage } from '@features/soldier-manager';

describe('TransferSoldiersPage', () => {
  it('renders the page title', () => {
    renderWithProviders(
      <SnackbarProvider>
        <ThemedTestingComponent>
          <TransferSoldiersPage />
        </ThemedTestingComponent>
      </SnackbarProvider>,
    );
    expect(screen.getAllByRole('heading', { level: 6 })[0]).toHaveTextContent('Transfer From');
    expect(screen.getAllByRole('heading', { level: 6 })[1]).toHaveTextContent('Transfer To');
  });
});
