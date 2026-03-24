import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitAvailabilityData } from 'vitest/mocks/handlers/unit-health/unit-availability-data/mock_data';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { AvailabilityFilters } from '@features/unit-health/components/tables/UnitAvailability/AvailabilityFilters';
import { mapToIUnitAvailabilityData } from '@store/amap_ai/unit_health';

const mockSetFilteredData = vi.fn();

describe('Unit Availability Dialog Table Test', () => {
  it('renders correctly', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <AvailabilityFilters
          unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)}
          setFilteredUnitAvailabilityData={mockSetFilteredData}
        />
      </ThemedTestingComponent>,
    );

    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const searchField = screen.getByRole('textbox');

    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();

    expect(searchField).toBeInTheDocument();

    fireEvent.click(filtersButton);

    await waitFor(() => {
      filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
      expect(filtersPopper).toBeInTheDocument();
    });

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxDropdown = screen.getByRole('combobox', { name: 'MX Availability' });
    const unitDropdown = screen.getByRole('combobox', { name: 'Unit' });
    const mosDropdown = screen.getByRole('combobox', { name: 'MOS' });
    const mlDropdown = screen.getByRole('combobox', { name: 'ML' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxDropdown).toBeInTheDocument();
    expect(unitDropdown).toBeInTheDocument();
    expect(mosDropdown).toBeInTheDocument();
    expect(mlDropdown).toBeInTheDocument();
  });
});
