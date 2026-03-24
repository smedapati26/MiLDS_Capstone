import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import AircraftOverviewCarousel from '@features/equipment-manager/aircraft/AircraftOverviewCarousel';
import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';

import { useGetAircraftModelStatusQuery } from '@store/griffin_api/equipment/slices/equipmentApi';
import { useAppSelector } from '@store/hooks';

import {
  mockAircraftModelStatus,
  mockAircraftModelStatusLess,
} from '@vitest/mocks/griffin_api_handlers/equipment/mock_data';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/equipment/slices/equipmentApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAircraftModelStatusQuery: vi.fn(),
  };
});

describe('AircraftOverviewCarousel', () => {
  it('test carousel renders', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAircraftModelStatusQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockAircraftModelStatus,
      isLoading: false,
    });

    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AircraftOverviewCarousel />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('em-aircraft-carousel')).toBeInTheDocument();
  });

  it('test stack of cards renders', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAircraftModelStatusQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockAircraftModelStatusLess,
      isLoading: false,
    });

    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AircraftOverviewCarousel />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('pmx-carousel')).toBeInTheDocument();
  });

  it('test empty result', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAircraftModelStatusQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AircraftOverviewCarousel />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('em-empty-data')).toBeInTheDocument();
  });

  it('test loading result', () => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    (useGetAircraftModelStatusQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AircraftOverviewCarousel />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    expect(screen.getByTestId('em-carousel-loading')).toBeInTheDocument();
  });
});
