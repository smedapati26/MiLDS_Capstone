import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Step1TaskForceDetails } from '@features/task-forces/components/create-stepper/step 1/1-StepTaskForceDetails';

import { ProviderWrapper } from '@vitest/helpers/ProviderWrapper';
import { server } from '@vitest/mocks/server';

// Mock Snackbar Provider
vi.mock('@store/providers/SnackbarProvider', () => ({
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the pmx-mui getEchelonOptions
vi.mock('@ai2c/pmx-mui', () => ({
  getEchelonOptions: vi.fn(() => [
    { label: 'Squadron', value: 'squadron' },
    { label: 'Group', value: 'group' },
  ]),
}));

// Mock react-hook-form components
vi.mock('@components/react-hook-form', () => ({
  RHFTextField: vi.fn(({ field, label, required, multiline, rows }) => (
    <div data-testid={`rhf-text-field-${field}`}>
      <label>
        {label}
        {required ? ' *' : ''}
      </label>
      {multiline ? <textarea rows={rows} /> : <input type="text" />}
    </div>
  )),
  RHFDateRangePicker: vi.fn(({ field, startLabel, endLabel, required }) => (
    <div data-testid={`rhf-date-range-${field}`}>
      <div data-testid={`rhf-date-range-${field}-startDate`}>
        <label>
          {startLabel}
          {required ? ' *' : ''}
        </label>
      </div>
      <div data-testid={`rhf-date-range-${field}-endDate`}>
        <label>
          {endLabel}
          {required ? ' *' : ''}
        </label>
      </div>
    </div>
  )),
  RHFLocationDropdown: vi.fn(({ field, label, required }) => (
    <div data-testid={`rhf-location-${field}`}>
      <label>
        {label}
        {required ? ' *' : ''}
      </label>
    </div>
  )),
  RHFImageUploader: vi.fn(({ field, text }) => <div data-testid={`rhf-image-uploader-${field}`}>{text}</div>),
  RHFProgressIndicator: vi.fn(() => <div data-testid="progress-indicator">Saving Progress...</div>),
}));

vi.mock('@components/react-hook-form/RHFAutocomplete', () => ({
  RHFAutocomplete: vi.fn(({ field, label, options, required }) => (
    <div data-testid={`rhf-autocomplete-${field}`}>
      <label>
        {label}
        {required ? ' *' : ''}
      </label>
      <select>
        {options?.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )),
  OptionType: {},
}));

// Mock the API hooks
vi.mock('@store/griffin_api/users/slices', () => ({
  useGetRolesQuery: vi.fn(),
}));

// Mock store hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

// Mock MUI components
vi.mock('@mui/material', () => ({
  Grid: vi.fn(({ children, ...props }) => (
    <div data-testid="mui-grid" {...props}>
      {children}
    </div>
  )),
  Stack: vi.fn(({ children, ...props }) => (
    <div data-testid="mui-stack" {...props}>
      {children}
    </div>
  )),
  Typography: vi.fn(({ children, ...props }) => (
    <div data-testid="mui-typography" {...props}>
      {children}
    </div>
  )),
  ThemeProvider: vi.fn(({ children, ...props }) => (
    <div data-testid="mui-theme-provider" {...props}>
      {children}
    </div>
  )),
}));

import { useGetRolesQuery } from '@store/griffin_api/users/slices';
import { useAppSelector } from '@store/hooks';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      name: '',
      echelon: '',
      shortname: '',
      nickname: '',
      tfStartDate: '',
      tfEndDate: '',
      location: '',
      owner: '',
      slogan: '',
      logo: undefined,
    },
  });

  return (
    <ProviderWrapper>
      <FormProvider {...methods}>{children}</FormProvider>
    </ProviderWrapper>
  );
};

describe('Step1TaskForceDetails', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => server.close());

  it('renders the component with all form fields', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
    });
    vi.mocked(useGetRolesQuery).mockReturnValue({
      data: [],
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refetch: vi.fn(() => ({ data: [], isLoading: false }) as any),
    });

    render(
      <TestWrapper>
        <Step1TaskForceDetails />
      </TestWrapper>,
    );

    // Check main elements are rendered
    expect(screen.getByText('Enter task force details')).toBeInTheDocument();

    // Check form fields are rendered
    expect(screen.getByTestId('rhf-text-field-name')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-autocomplete-echelon')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-text-field-shortname')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-text-field-nickname')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-date-range-tfDateRange-startDate')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-date-range-tfDateRange-endDate')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-location-location')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-autocomplete-ownerId')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-text-field-slogan')).toBeInTheDocument();
    expect(screen.getByTestId('rhf-image-uploader-logo')).toBeInTheDocument();
  });

  it('displays owner options when roles data is available', () => {
    const mockRoles = [
      {
        user: {
          userId: 'user1',
          rankAndName: 'SGT Smith',
        },
      },
      {
        user: {
          userId: 'user2',
          rankAndName: 'CPT Johnson',
        },
      },
    ];

    vi.mocked(useAppSelector).mockReturnValue({
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
    });
    vi.mocked(useGetRolesQuery).mockReturnValue({
      data: mockRoles,
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refetch: vi.fn(() => ({ data: mockRoles, isLoading: false }) as any),
    });

    render(
      <TestWrapper>
        <Step1TaskForceDetails />
      </TestWrapper>,
    );

    // The owner dropdown should be rendered with options
    expect(screen.getByTestId('rhf-autocomplete-ownerId')).toBeInTheDocument();
  });

  it('renders required field indicators', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
    });
    vi.mocked(useGetRolesQuery).mockReturnValue({
      data: [],
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refetch: vi.fn(() => ({ data: [], isLoading: false }) as any),
    });

    render(
      <TestWrapper>
        <Step1TaskForceDetails />
      </TestWrapper>,
    );

    // Check that required fields have the asterisk
    expect(screen.getByText('Task Force Name *')).toBeInTheDocument();
    expect(screen.getByText('Echelon *')).toBeInTheDocument();
    expect(screen.getByText('Short Name *')).toBeInTheDocument();
    expect(screen.getByText('TF Start Date *')).toBeInTheDocument();
    expect(screen.getByText('TF End Date *')).toBeInTheDocument();
    expect(screen.getByText('Location *')).toBeInTheDocument();
    expect(screen.getByText('Owner *')).toBeInTheDocument();

    // Check that optional fields don't have asterisk
    expect(screen.getByText('Nick Name')).toBeInTheDocument();
    expect(screen.getByText('Slogan')).toBeInTheDocument();
  });
});
