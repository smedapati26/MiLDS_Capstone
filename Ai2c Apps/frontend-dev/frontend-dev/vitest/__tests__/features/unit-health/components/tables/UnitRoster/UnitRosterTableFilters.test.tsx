import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitRosterData } from 'vitest/mocks/handlers/unit-health/unit-roster-data/mock_data';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { RosterTableFilters } from '@features/unit-health/components/tables/UnitRoster/UnitRosterTableFilters';
import { mapToIUnitRoster } from '@store/amap_ai/unit_health';

const mockSetFilteredData = vi.fn();

describe('Unit Roster Table Filters Test', () => {
  it('renders correctly', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <RosterTableFilters
          unitRosterData={mockUnitRosterData.map(mapToIUnitRoster)}
          setFilteredUnitRosterData={mockSetFilteredData}
        />
      </ThemedTestingComponent>,
    );

    const filtersButtons = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const searchFilter = screen.getByRole('textbox');

    expect(filtersButtons).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(searchFilter).toBeInTheDocument();

    fireEvent.click(filtersButtons);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxAvailableButton = screen.getByRole('button', { name: 'Available MX Filter' });
    const mxLimitedButton = screen.getByRole('button', { name: 'Limited MX Filter' });
    const mxUnavailableButton = screen.getByRole('button', { name: 'Unavailable MX Filter' });
    const evalMetButton = screen.getByRole('button', { name: 'Met Evaluation Filter' });
    const evalDueButton = screen.getByRole('button', { name: 'Due Evaluation Filter' });
    const evalOverDueButton = screen.getByRole('button', { name: 'Overdue Evaluation Filter' });
    const rankDropdown = screen.getByRole('combobox', { name: 'Rank' });
    const mosDropdown = screen.getByRole('combobox', { name: 'MOS' });
    const mlDropdown = screen.getByRole('combobox', { name: 'ML' });
    const birthMonthDropdown = screen.getByRole('combobox', { name: 'Birth Month' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxAvailableButton).toBeInTheDocument();
    expect(mxLimitedButton).toBeInTheDocument();
    expect(mxUnavailableButton).toBeInTheDocument();
    expect(evalMetButton).toBeInTheDocument();
    expect(evalDueButton).toBeInTheDocument();
    expect(evalOverDueButton).toBeInTheDocument();
    expect(rankDropdown).toBeInTheDocument();
    expect(mosDropdown).toBeInTheDocument();
    expect(mlDropdown).toBeInTheDocument();
    expect(birthMonthDropdown).toBeInTheDocument();
  });
});
