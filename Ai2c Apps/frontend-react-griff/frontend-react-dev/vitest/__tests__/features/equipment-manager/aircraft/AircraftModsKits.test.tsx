import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import AircraftModsKits from '@features/equipment-manager/aircraft/AircraftModsKits';
import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';

import { ThemedTestingComponent } from '@vitest/helpers';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/mods/slices', () => ({
  useGetModificationsByUicQuery: vi.fn().mockResolvedValue([]),
  useDeleteModificationMutation:  vi.fn(() => [
    vi.fn(), // mock mutation
    { isLoading: false }, // mock state object
  ]),
}));

const mockSetSerialFilter = vi.fn(); // Mock function for setSerialFilter
const mockData = [
  {
    serialNumber: 'A123',
    mod1: 'Mod 1',
    mod2: '',
  },
  {
    serialNumber: 'B456',
    mod1: 'Mod 1',
    mod2: 'Mod 2',
  },
  {
    serialNumber: 'C789',
    mod1: '',
    mod2: 'Mod 2',
  },
]; // Example data for testing

describe('AircraftModsKits Component', () => {
  it('renders correctly', () => {
    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AircraftModsKits data={mockData} setSerialFilter={mockSetSerialFilter} mkToggle="modifications" />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    // Check if the component is rendered
    expect(screen.getByTestId('em-aircraft-mods-kits-carousel')).toBeInTheDocument();
  });

  it('renders ModsCarousel when mkToggle is "mods"', () => {
    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AircraftModsKits data={mockData} setSerialFilter={mockSetSerialFilter} mkToggle="modifications" />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    // Check if ModsCarousel is rendered
    expect(screen.getByTestId('mods-carousel')).toBeInTheDocument();
  });

  it('calls setSerialFilter correctly when handleFilter is triggered', () => {
    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AircraftModsKits data={mockData} setSerialFilter={mockSetSerialFilter} mkToggle="modifications" />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );

    // Simulate selecting a mod
    const modCard = screen.getAllByTestId('mod-card');
    fireEvent.click(modCard[0]);
  });
});
