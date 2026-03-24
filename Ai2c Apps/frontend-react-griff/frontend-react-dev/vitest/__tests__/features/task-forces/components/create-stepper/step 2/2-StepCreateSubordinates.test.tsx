import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { CreateTaskForceSchemaType } from '@features/task-forces/components/create-stepper/schema';
import { createTaskForceDefaultValues } from '@features/task-forces/components/create-stepper/schema';
import { Step2CreateSubordinates } from '@features/task-forces/components/create-stepper/step 2/2-StepCreateSubordinates';
import { useFormLogoImage } from '@features/task-forces/hooks/useFormLogoImage';

// Mock Snackbar Provider
vi.mock('@store/providers/SnackbarProvider', () => ({
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock dependencies
vi.mock('@features/task-forces/hooks/useFormLogoImage', () => ({
  useFormLogoImage: vi.fn(),
}));

vi.mock('@store/griffin_api/users/slices', () => ({
  useGetUserQuery: vi.fn(() => ({
    data: { id: 'owner-123', name: 'Test Owner' },
    isSuccess: true,
  })),
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

// Mock SubordinateDynamicForm component
vi.mock('@features/task-forces/components/create-stepper/step 2/SubordinateDynamicForm', () => ({
  SubordinateDynamicForm: ({ index }: { index: number }) => (
    <div data-testid={`subordinate-form-${index}`}>Subordinate Form {index}</div>
  ),
}));

// Mock TaskforceLogoHeading component
vi.mock('@features/task-forces/components/TaskforceLogoHeading', () => ({
  TaskforceLogoHeadingFormWrapper: () => <div data-testid="logo-image">Logo</div>,
}));

const mockUseFormLogoImage = vi.mocked(useFormLogoImage);

describe('Step2CreateSubordinates', () => {
  const TestWrapper: React.FC<{ children: React.ReactNode; formValues?: Partial<CreateTaskForceSchemaType> }> = ({
    children,
    formValues = {},
  }) => {
    const methods = useForm<CreateTaskForceSchemaType>({
      defaultValues: {
        ...createTaskForceDefaultValues,
        name: 'Test Task Force',
        shortname: 'TTF',
        echelon: 'Division',
        location: { name: 'Test Location', code: 'TL' },
        tfDateRange: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        slogan: 'Test Slogan',
        ownerId: 'owner-123',
        ...formValues,
      },
    });

    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormLogoImage.mockReturnValue('data:image/png;base64,mockLogoData');
  });

  it('renders the component without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <Step2CreateSubordinates />
      </TestWrapper>,
    );

    expect(container).toBeInTheDocument();
  });

  it('renders the Create Subordinate Group button', () => {
    render(
      <TestWrapper>
        <Step2CreateSubordinates />
      </TestWrapper>,
    );

    const button = screen.getByRole('button', { name: /create subordinate group/i });
    expect(button).toBeInTheDocument();
  });

  it('displays empty state when no subordinates exist', () => {
    render(
      <TestWrapper>
        <Step2CreateSubordinates />
      </TestWrapper>,
    );

    expect(screen.getByText('Create one to start building your task force.')).toBeInTheDocument();
  });

  it('renders logo image component', () => {
    render(
      <TestWrapper>
        <Step2CreateSubordinates />
      </TestWrapper>,
    );

    expect(screen.getByTestId('logo-image')).toBeInTheDocument();
  });

  it('displays progress bar', () => {
    render(
      <TestWrapper>
        <Step2CreateSubordinates />
      </TestWrapper>,
    );

    expect(screen.getByText('Progress saving...')).toBeInTheDocument();
  });
});
