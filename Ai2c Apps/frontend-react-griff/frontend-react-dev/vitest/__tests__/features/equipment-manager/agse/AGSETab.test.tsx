import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import AGSETab from '@features/equipment-manager/agse/AGSETab';
import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';

import { useGetAggregateConditionQuery, useGetAGSESubordinateQuery } from '@store/griffin_api/agse/slices/agseApi';
import { useAppSelector } from '@store/hooks';

import { mockAggregateCondition, mockAGSESubordinate } from '@vitest/mocks/griffin_api_handlers/agse/mock_data';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/agse/slices/agseApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAggregateConditionQuery: vi.fn(),
    useGetAGSESubordinateQuery: vi.fn(),
  };
});

vi.mock('@store/griffin_api/aircraft/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftByUicQuery: vi.fn(() => [{ data: [] }]),
  };
});

vi.mock('@store/griffin_api/mods/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetModificationTypesQuery: vi.fn(() => [{ data: [] }]),
    useAddNewModificationMutation: vi.fn(() => [vi.fn()]),
  };
});

describe('AGSETab', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAggregateConditionQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockAggregateCondition,
      isLoading: false,
    });
    (useGetAGSESubordinateQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockAGSESubordinate,
      isLoading: false,
    });
    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AGSETab />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );
  });
  it('test AGSETab renders correctly', () => {
    expect(screen.getByTestId('em-agse-tab')).toBeInTheDocument();
    expect(screen.getByTestId('pmx-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('agse-equipment-details')).toBeInTheDocument();
  });
});

describe('AGSETab loading', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAggregateConditionQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: true,
    });
    (useGetAGSESubordinateQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: true,
    });
    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AGSETab />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );
  });
  it('test AGSETab renders correctly', () => {
    expect(screen.getByTestId('em-agse-tab')).toBeInTheDocument();
    expect(screen.getByTestId('em-agse-carousel-loading')).toBeInTheDocument();
  });
});
