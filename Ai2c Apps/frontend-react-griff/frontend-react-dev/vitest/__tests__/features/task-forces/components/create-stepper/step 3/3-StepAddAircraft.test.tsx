/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormProvider, useForm } from 'react-hook-form';
import { vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Step3AddAircraft } from '@features/task-forces/components/create-stepper';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { useGetUserEquipmentQuery } from '@store/griffin_api/taskforce/slices';
import { useAppSelector } from '@store/hooks';

import { ProviderWrapper } from '@vitest/helpers';

// Mocks for external dependencies
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrQuery: vi.fn(),
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

vi.mock('dayjs', () => ({
  default: () => ({
    startOf: vi.fn(() => ({ format: vi.fn(() => '2023-01-01') })),
    endOf: vi.fn(() => ({ format: vi.fn(() => '2023-01-31') })),
  }),
}));

vi.mock(import('react-hook-form'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    defaultValues: {
      aircraft: [],
      subordinates: [{ name: 'Sub1', aircraft: [] }],
    },
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {
      aircraft: [],
      subordinates: [{ name: 'Sub1', aircraft: [] }],
    },
  });

  return (
    <ProviderWrapper>
      <FormProvider {...methods}>{children}</FormProvider>
    </ProviderWrapper>
  );
};

describe('Step3AddAircraft', () => {
  const mockUseGetAutoDsrQuery = vi.mocked(useGetAutoDsrQuery);
  const mockUseGetUserEquipmentQuery = vi.mocked(useGetUserEquipmentQuery);
  const mockUseAppSelector = vi.mocked(useAppSelector);

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementations
    mockUseGetAutoDsrQuery.mockReturnValue({
      data: { data: [] },
      isFetching: false,
      isUninitialized: false,
      refetch: vi.fn(() => ({ data: [], isLoading: false }) as any),
    });

    mockUseGetUserEquipmentQuery.mockReturnValue({
      data: { aircraft: [] },
      refetch: vi.fn(() => ({ data: { aircraft: [] }, isLoading: false }) as any),
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
        <Step3AddAircraft />
      </TestWrapper>,
    );

    expect(screen.getByText('Taskforce Logo')).toBeInTheDocument();
    expect(screen.getByText('Aircraft Catalog')).toBeInTheDocument();
    expect(screen.getByText('Subordinates Aircraft')).toBeInTheDocument();
  });
});
