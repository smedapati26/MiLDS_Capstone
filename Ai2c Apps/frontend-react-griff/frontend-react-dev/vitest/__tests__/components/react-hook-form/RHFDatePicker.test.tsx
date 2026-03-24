import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RHFDatePicker } from 'src/components/react-hook-form/RHFDatePicker';
import { describe, expect, it } from 'vitest';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen } from '@testing-library/react';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
    </FormProvider>
  );
};

describe('RHFDatePicker', () => {
  it('renders the DatePicker with default props', () => {
    render(
      <TestWrapper>
        <RHFDatePicker field="testDate" />
      </TestWrapper>,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <TestWrapper>
        <RHFDatePicker field="testDate" label="Select Date" />
      </TestWrapper>,
    );

    expect(screen.getByLabelText('Select Date')).toBeInTheDocument();
  });

  it('sets required attribute when required is true', () => {
    render(
      <TestWrapper>
        <RHFDatePicker field="testDate" required />
      </TestWrapper>,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });

  it('disables the input when disabled is true', () => {
    render(
      <TestWrapper>
        <RHFDatePicker field="testDate" disabled />
      </TestWrapper>,
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('displays error message when there is an error', () => {
    const TestComponent = () => {
      const methods = useForm();
      methods.setError('testDate', { message: 'Invalid date' });
      return (
        <FormProvider {...methods}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RHFDatePicker field="testDate" />
          </LocalizationProvider>
        </FormProvider>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });
});
