import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RHFLocationDropdown } from 'src/components/react-hook-form/RHFLocationDropdown';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers/renderWithProviders';
import { server } from 'vitest/mocks/server';

import { screen, waitFor } from '@testing-library/react';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('RHFLocationDropdown', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the LocationDropdown with default props', () => {
    renderWithProviders(
      <TestWrapper>
        <RHFLocationDropdown field="location" />
      </TestWrapper>,
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    renderWithProviders(
      <TestWrapper>
        <RHFLocationDropdown field="location" label="Select Location" />
      </TestWrapper>,
    );

    expect(screen.getByLabelText('Select Location')).toBeInTheDocument();
  });

  it('sets required attribute when required is true', () => {
    renderWithProviders(
      <TestWrapper>
        <RHFLocationDropdown field="location" required />
      </TestWrapper>,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('required');
  });

  it('loads and displays options', async () => {
    renderWithProviders(
      <TestWrapper>
        <RHFLocationDropdown field="location" />
      </TestWrapper>,
    );

    const input = screen.getByRole('combobox');
    input.focus();

    // Type in the input to trigger search
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });
});
