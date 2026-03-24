/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormProvider, useForm } from 'react-hook-form';
import { vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Step5AddAGSE } from '@features/task-forces/components/create-stepper';

import { useGetAGSEQuery } from '@store/griffin_api/agse/slices';
import { useGetUserEquipmentQuery } from '@store/griffin_api/taskforce/slices';
import { useAppSelector } from '@store/hooks';

import { ProviderWrapper } from '@vitest/helpers';

// Mocks for external dependencies
vi.mock('@store/griffin_api/agse/slices', () => ({
  useGetAGSEQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/taskforce/slices', () => ({
  useGetUserEquipmentQuery: vi.fn(),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

vi.mock('@components/data-tables', () => ({
  PmxTransferTable: ({ leftLabel, rightLabel, onChange, isLoading }: any) => (
    <div>
      <div>{leftLabel}</div>
      <div>{rightLabel}</div>
      <button onClick={() => onChange([], [])}>Mock Transfer</button>
      {isLoading && <div>Loading...</div>}
    </div>
  ),
  OrStatusTableCell: ({ status }: any) => <span>{status}</span>,
  PmxTableCellBadge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@components/dropdowns/UnitSelect', () => ({
  UnitSelect: ({ onChange, value }: any) => (
    <select onChange={(e) => onChange({ uic: e.target.value })}>
      <option value={value?.uic}>{value?.name}</option>
    </select>
  ),
}));

vi.mock('@features/task-forces/components/TaskforceLogoHeading', () => ({
  TaskforceLogoHeadingFormWrapper: () => <div>Taskforce Logo</div>,
}));

vi.mock(import('react-hook-form'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    defaultValues: {
      agse: [],
      subordinates: [{ name: 'Sub1', agse: [] }],
    },
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      agse: [],
      subordinates: [{ name: 'Sub1', agse: [] }],
    },
  });

  return (
    <ProviderWrapper>
      <FormProvider {...methods}>{children}</FormProvider>
    </ProviderWrapper>
  );
};

describe('Step5AddAGSE', () => {
  const mockUseGetAGSEQuery = vi.mocked(useGetAGSEQuery);
  const mockUseGetUserEquipmentQuery = vi.mocked(useGetUserEquipmentQuery);

  const mockUseAppSelector = vi.mocked(useAppSelector);

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementations
    mockUseGetAGSEQuery.mockReturnValue({
      data: { agse: [] },
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(() => ({ data: { agse: [] }, isLoading: false }) as any),
    });

    mockUseGetUserEquipmentQuery.mockReturnValue({
      data: { aircraft: [], uas: [], agse: [] },
      refetch: vi.fn(() => ({ data: { aircraft: [], uas: [], agse: [] }, isLoading: false }) as any),
    });

    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === 'selectAllUnits') return [{ uic: '123', name: 'Unit1' }];
      if (selector.name === 'selectCurrentUnit') return { uic: '123', name: 'Unit1' };
      return [];
    });
  });

  it('renders the component with initial elements', () => {
    render(
      <TestWrapper>
        <Step5AddAGSE />
      </TestWrapper>,
    );

    expect(screen.getByText('Taskforce Logo')).toBeInTheDocument();
    expect(screen.getByText('AGSE Catalog')).toBeInTheDocument();
    expect(screen.getByText('Subordinates AGSE')).toBeInTheDocument();
  });
});
