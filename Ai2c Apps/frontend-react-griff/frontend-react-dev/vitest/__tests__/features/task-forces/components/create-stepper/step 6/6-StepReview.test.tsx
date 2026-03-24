/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import { StepReview } from '@features/task-forces/components/create-stepper';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetRolesQuery } from '@store/griffin_api/users/slices';
import { useAppSelector } from '@store/hooks';

import { renderWithTheme } from '@vitest/helpers/ThemedTestingComponent';

// Mock child components
vi.mock('@components/PmxCollapsibleTreeTable', () => ({
  PmxCollapsibleTreeTable: ({ rows }: any) => <div data-testid="table">{JSON.stringify(rows)}</div>,
}));

// Mock hooks
vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@/hooks/useOwnerOptions', () => ({
  useOwnerOptions: vi.fn(),
}));

vi.mock('@store/griffin_api/users/slices', () => ({
  useGetRolesQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/taskforce/slices', () => ({
  useGetUserEquipmentQuery: vi.fn(),
}));

vi.mock('@features/task-forces/components/TaskforceLogoHeading', () => ({
  TaskforceLogoHeadingFormWrapper: () => <div>Taskforce Logo</div>,
}));

// Mock react-hook-form components
vi.mock('@components/react-hook-form', () => ({
  RHFProgressIndicator: vi.fn(() => <div data-testid="progress-indicator">Saving Progress...</div>),
}));

describe('StepReview', () => {
  const mockUseAppSelector = vi.mocked(useAppSelector);
  const mockUseGetRolesQuery = vi.mocked(useGetRolesQuery);

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementations
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === 'selectAllUnits') return [{ uic: '123', name: 'Unit1' }];
      if (selector.name === 'selectCurrentUnit') return { uic: '123', name: 'Unit1' };
      return [];
    });

    mockUseGetRolesQuery.mockReturnValue({
      data: [
        {
          id: 0,
          user: 'TEST_USER',
          unit: {} as IUnitBrief,
          accessLevel: 'Admin',
          grantedOn: 'YESTERDAY',
        },
      ],
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(() => ({ data: [], isLoading: false }) as any),
    });
  });

  it('renders table with transformed data', () => {
    // Mock form values
    (useFormContext as any).mockReturnValue({
      getValues: vi.fn().mockImplementation((key) => {
        if (key === 'subordinates') {
          return [
            { uuid: '1', ownerId: 10, name: 'Alpha' },
            { uuid: '2', ownerId: 20, name: 'Bravo' },
          ];
        }
        return undefined;
      }),
    });

    renderWithTheme(<StepReview />);

    // Logo heading should render
    expect(screen.getByText('Taskforce Logo')).toBeInTheDocument();

    // Table Columns
    expect(screen.getByText('Subordinate Unit')).toBeInTheDocument();
    expect(screen.getByText('Echelon')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Short Name')).toBeInTheDocument();
    expect(screen.getByText('Nickname')).toBeInTheDocument();
    expect(screen.getByText('Models')).toBeInTheDocument();
  });
});
