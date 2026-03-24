import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitMissingPacketsData } from 'vitest/mocks/handlers/unit-health/unit-missing-packets-data/mock_data';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { MissingPacketsFilters } from '@features/unit-health/components/tables/UnitMissingPackets/MissingPacketsFilters';
import { mapToIUnitMissingPacketsSoldierData } from '@store/amap_ai/unit_health';

const mockSetFilteredData = vi.fn();

describe('Unit Availability Dialog Table Test', () => {
  it('renders correctly', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MissingPacketsFilters
            unitMissingPacketsData={mockUnitMissingPacketsData.map(mapToIUnitMissingPacketsSoldierData)}
            setFilteredUnitMissingPacketsData={mockSetFilteredData}
          />
        </LocalizationProvider>
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
    const allStatusButton = screen.getByRole('button', { name: 'All Packet Status Button' });
    const uploadedStatusButton = screen.getByRole('button', { name: 'Uploaded Packet Status Button' });
    const missingStatusButton = screen.getByRole('button', { name: 'Missing Packet Status Button' });
    const unitDropdown = screen.getByRole('combobox', { name: 'Unit' });
    const startDate = screen.getByLabelText('Start Date');
    const endDate = screen.getByLabelText('End Date');
    const noEndDate = screen.getByRole('checkbox', { name: 'No End Date' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(allStatusButton).toBeInTheDocument();
    expect(uploadedStatusButton).toBeInTheDocument();
    expect(missingStatusButton).toBeInTheDocument();
    expect(unitDropdown).toBeInTheDocument();
    expect(startDate).toBeInTheDocument();
    expect(endDate).toBeInTheDocument();
    expect(noEndDate).toBeInTheDocument();
  });
});
