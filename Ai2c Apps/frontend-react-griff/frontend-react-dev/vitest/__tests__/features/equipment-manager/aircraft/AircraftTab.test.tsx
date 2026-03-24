import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock child components
vi.mock('@features/equipment-manager/aircraft/AircraftOverviewCarousel', () => ({
  default: () => <div data-testid="aircraft-overview-carousel" />,
}));

vi.mock('@features/equipment-manager/aircraft/AircraftEquipmentSection', () => ({
  default: () => <div data-testid="aircraft-equipment-details-section" />,
}));

import AircraftTab from '@features/equipment-manager/aircraft/AircraftTab';

describe('AircraftTab Component', () => {
  it('renders the AircraftTab component with correct structure', () => {
    renderWithProviders(<AircraftTab />);

    // Check that the main container is rendered
    expect(screen.getByTestId('em-aircraft-tab')).toBeInTheDocument();

    // Check that child components are rendered
    expect(screen.getByTestId('aircraft-overview-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('aircraft-equipment-details-section')).toBeInTheDocument();
  });
});
