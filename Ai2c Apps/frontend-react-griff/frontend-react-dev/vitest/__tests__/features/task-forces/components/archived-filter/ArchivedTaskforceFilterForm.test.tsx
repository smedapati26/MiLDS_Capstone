/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterAll, afterEach,beforeAll, describe, expect, it, vi } from 'vitest';

import { act, fireEvent,render, screen } from '@testing-library/react';

import { ArchivedTaskforceFilterForm } from '@features/task-forces/components/archived-filter/ArchivedTaskforceFilterForm';
import { TaskForceFilterSchemaType } from '@features/task-forces/components/archived-filter/schema';

import { ITaskForceSimple } from '@store/griffin_api/taskforce/models/ITaskforce';

// Mocking @ai2c/pmx-mui SearchBar
vi.mock('@ai2c/pmx-mui', () => ({
  SearchBar: vi.fn(({ onChange }) => (
    // Mock a simple input that calls onChange when typed into
    <input
      data-testid="search-bar"
      onChange={(e) => onChange(null, { value: e.target.value, label: e.target.value })}
    />
  )),
}));

// Mocking custom react-hook-form components
vi.mock('@components/react-hook-form', () => ({
  RHFDateRangePicker: vi.fn(({ field }) => <div data-testid={`rhf-date-range-picker-${field}`} />),
  RHFLocationDropdown: vi.fn(({ field }) => <div data-testid={`rhf-location-dropdown-${field}`} />),
}));

// Mock utility functions to isolate the component's own logic
vi.mock('./utils', () => ({
  getNestedField: vi.fn(),
  isSameOrAfter: vi.fn(() => true),
  isSameOrBefore: vi.fn(() => true),
}));

// Mock MUI components to keep tests light
vi.mock('@mui/material', async (importOriginal) => {
  const original = await importOriginal<typeof import('@mui/material')>();
  return {
    ...original, // Keep original exports for non-mocked components
    Stack: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    Typography: vi.fn(({ children }) => <span>{children}</span>),
    Divider: vi.fn(() => <hr />),
  };
});

// A wrapper component to provide the necessary react-hook-form context
const TestWrapper: React.FC<{
  children: React.ReactNode;
  defaultValues?: Partial<TaskForceFilterSchemaType>;
}> = ({ children, defaultValues }) => {
  const methods = useForm<TaskForceFilterSchemaType>({
    defaultValues: defaultValues || {
      tfDateRange: { startDate: null, endDate: null },
      location: undefined,
    },
  });

  // Expose setValue to the test window for easy manipulation
  (window as any).testSetValue = methods.setValue;

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ArchivedTaskforceFilterForm', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnSearchChange = vi.fn();
  const mockData: ITaskForceSimple[] = [{ unit: {
      uic: 'TF-12345',
      shortName: 'TF-12345',
      displayName: 'TASKFORCE-12345',
      echelon: 'BAT',
      level: 0,
      parentUic: ''
  }, startDate: '2023-01-01', endDate: '2023-02-01' }];

  // Use Vitest's fake timers to control the setTimeout in the component
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clear mock history after each test
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should render all filter components correctly', () => {
    render(
      <TestWrapper>
        <ArchivedTaskforceFilterForm
          data={mockData}
          onFilterChange={mockOnFilterChange}
          onSearchChange={mockOnSearchChange}
        />
      </TestWrapper>
    );

    // Verify all parts of the form are in the document
    expect(screen.getByTestId('archived-tf-filters')).toBeInTheDocument();
    expect(screen.getByText('Filter by date range:')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-date-range-picker-tfDateRange')).toBeInTheDocument();
    expect(screen.getByText('Filter by location:')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-location-dropdown-location')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('should call onFilterChange with form values after a delay', () => {
    render(
      <TestWrapper>
        <ArchivedTaskforceFilterForm
          data={mockData}
          onFilterChange={mockOnFilterChange}
          onSearchChange={mockOnSearchChange}
        />
      </TestWrapper>
    );

    // Initial render should not trigger the change handler immediately
    expect(mockOnFilterChange).not.toHaveBeenCalled();

    // Simulate a change in a form field
    act(() => {
      (window as any).testSetValue('location', { name: 'Test Location', code: 'TEST' });
    });

    // Fast-forward time by 500ms to trigger the useEffect's setTimeout
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now, the callback should have been called once with the updated values
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        location: { name: 'Test Location', code: 'TEST' },
      })
    );
  });

  it('should call onSearchChange immediately when search input changes', () => {
    render(
      <TestWrapper>
        <ArchivedTaskforceFilterForm
          data={mockData}
          onFilterChange={mockOnFilterChange}
          onSearchChange={mockOnSearchChange}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByTestId('search-bar');
    fireEvent.change(searchInput, { target: { value: 'Test Search' } });

    // The onSearchChange callback should be called immediately
    expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
    expect(mockOnSearchChange).toHaveBeenCalledWith({ value: 'Test Search', label: 'Test Search' });
  });
});
