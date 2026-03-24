import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitEvaluationsSoldierData } from 'vitest/mocks/handlers/unit-health/unit-evaluations-data/mock_data';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { EvaluationFilters } from '@features/unit-health/components/tables/UnitEvaluations/EvaluationFilters';
import { mapToIUnitEvaluationsSoldierData } from '@store/amap_ai/unit_health';

const mockSetFilteredData = vi.fn();

describe('Unit Availability Dialog Table Test', () => {
  it('renders correctly', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <EvaluationFilters
          unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
          setFilteredUnitEvaluationsData={mockSetFilteredData}
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
    const evalDropdown = screen.getByRole('combobox', { name: 'Annual Evaluation' });
    const unitDropdown = screen.getByRole('combobox', { name: 'Unit' });
    const mosDropdown = screen.getByRole('combobox', { name: 'MOS' });
    const mlDropdown = screen.getByRole('combobox', { name: 'ML' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(evalDropdown).toBeInTheDocument();
    expect(unitDropdown).toBeInTheDocument();
    expect(mosDropdown).toBeInTheDocument();
    expect(mlDropdown).toBeInTheDocument();
  });
});
