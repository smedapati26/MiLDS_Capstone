import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RHFDateRangePicker } from 'src/components/react-hook-form/RHFDateRangePicker';
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

describe('RHFDateRangePicker', () => {
  it('renders start and end date pickers with default labels', () => {
    render(
      <TestWrapper>
        <RHFDateRangePicker field="dateRange" />
      </TestWrapper>,
    );

    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('renders custom labels', () => {
    render(
      <TestWrapper>
        <RHFDateRangePicker field="dateRange" startLabel="From Date" endLabel="To Date" />
      </TestWrapper>,
    );

    expect(screen.getByLabelText('From Date')).toBeInTheDocument();
    expect(screen.getByLabelText('To Date')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(
      <TestWrapper>
        <RHFDateRangePicker field="dateRange" label="Select Date Range" />
      </TestWrapper>,
    );

    expect(screen.getByText('Select Date Range')).toBeInTheDocument();
  });

  it('sets required attribute on inputs when required is true', () => {
    render(
      <TestWrapper>
        <RHFDateRangePicker field="dateRange" required />
      </TestWrapper>,
    );

    const startInput = screen.getByLabelText(/^Start Date/);
    const endInput = screen.getByLabelText(/^End Date/);

    expect(startInput).toHaveAttribute('required');
    expect(endInput).toHaveAttribute('required');
  });

  it('disables inputs when disabled is true', () => {
    render(
      <TestWrapper>
        <RHFDateRangePicker field="dateRange" disabled />
      </TestWrapper>,
    );

    const startInput = screen.getByLabelText('Start Date');
    const endInput = screen.getByLabelText('End Date');

    expect(startInput).toBeDisabled();
    expect(endInput).toBeDisabled();
  });
});
