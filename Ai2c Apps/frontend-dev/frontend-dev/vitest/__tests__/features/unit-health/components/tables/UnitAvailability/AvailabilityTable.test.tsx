import { MemoryRouter } from 'react-router-dom';
import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitAvailabilityData } from 'vitest/mocks/handlers/unit-health/unit-availability-data/mock_data';

import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { AvailabilityTable } from '@features/unit-health/components/tables/UnitAvailability/AvailabilityTable';
import { mapToIUnitAvailabilityData } from '@store/amap_ai/unit_health';

describe('Unit Availability Dialog Table Test', () => {
  it('renders correctly', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    const unitViewByButton = screen.getByRole('button', { name: 'Unit View By Button' });
    const subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    const filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const groupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(unitViewByButton).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(groupedTable).not.toBeInTheDocument();
  });

  it('view by functionailty works as expected', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    const unitViewByButton = screen.getByRole('button', { name: 'Unit View By Button' });
    let subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    const filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    let groupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(unitViewByButton).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(groupedTable).not.toBeInTheDocument();

    const unitCheckedViewBy = within(unitViewByButton).getByLabelText('unit-checked');
    const subordinatesNotCheckedViewBy = within(subordinateViewByButton).queryByLabelText('subordinates-checked');

    expect(unitCheckedViewBy).toBeInTheDocument();
    expect(subordinatesNotCheckedViewBy).not.toBeInTheDocument();

    fireEvent.click(subordinateViewByButton);

    await waitFor(() => {
      subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
      groupedTable = screen.getByLabelText('Grouped Table');

      const unitNotCheckedViewBy = within(unitViewByButton).queryByLabelText('unit-checked');
      const subordinatesCheckedViewBy = within(subordinateViewByButton).getByLabelText('subordinates-checked');
      const unitHeaderRow = within(groupedTable).getByLabelText(
        `subordinate-unit-view-${mockUnitAvailabilityData[0].unit_name}-header`,
      );

      expect(unitNotCheckedViewBy).not.toBeInTheDocument();
      expect(subordinatesCheckedViewBy).toBeInTheDocument();
      expect(groupedTable).toBeInTheDocument();
      expect(unitHeaderRow).toBeInTheDocument();
    });
  });

  it('search filtering functionality works as expected', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    let subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    const filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const noGroupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(noGroupedTable).not.toBeInTheDocument();

    fireEvent.click(subordinateViewByButton);
    await waitFor(() => {
      subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
      const groupedTable = screen.getByLabelText('Grouped Table');

      const subordinatesCheckedViewBy = within(subordinateViewByButton).getByLabelText('subordinates-checked');

      expect(subordinatesCheckedViewBy).toBeInTheDocument();
      expect(groupedTable).toBeInTheDocument();

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    const searchField = screen.getByRole('textbox');

    expect(searchField).toBeInTheDocument();

    fireEvent.change(searchField, { target: { value: 'Test Megee' } });

    await waitFor(() => {
      const groupedTable = screen.getByLabelText('Grouped Table');
      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'tstsoldier1' } });

    await waitFor(() => {
      const groupedTable = screen.getByLabelText('Grouped Table');
      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'email1' } });

    await waitFor(() => {
      const groupedTable = screen.getByLabelText('Grouped Table');
      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'Unavailable' } });

    await waitFor(() => {
      const groupedTable = screen.getByLabelText('Grouped Table');
      const soldier1Row = within(groupedTable).queryByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).not.toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'TSTUNIT3' } });

    await waitFor(() => {
      const groupedTable = screen.getByLabelText('Grouped Table');
      const soldier1Row = within(groupedTable).queryByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).not.toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'MOS1' } });

    await waitFor(() => {
      const groupedTable = screen.getByLabelText('Grouped Table');
      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'ML1' } });

    await waitFor(() => {
      const groupedTable = screen.getByLabelText('Grouped Table');
      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu does not filter when apply not clicked', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    let subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const noGroupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(noGroupedTable).not.toBeInTheDocument();

    fireEvent.click(subordinateViewByButton);

    await waitFor(() => {
      subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
      const groupedTable = screen.getByLabelText('Grouped Table');

      const subordinatesCheckedViewBy = within(subordinateViewByButton).getByLabelText('subordinates-checked');

      expect(subordinatesCheckedViewBy).toBeInTheDocument();
      expect(groupedTable).toBeInTheDocument();

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

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

    // No filtering when Apply button not pressed
    await waitFor(() => {
      fireEvent.mouseDown(mxDropdown);

      const available = screen.getByRole('option', { name: 'Available' });

      fireEvent.click(available);

      fireEvent.click(mxDropdown);

      fireEvent.click(filtersButton);

      const groupedTable = screen.getByLabelText('Grouped Table');

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on MX Availability', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    let subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const noGroupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(noGroupedTable).not.toBeInTheDocument();

    fireEvent.click(subordinateViewByButton);

    await waitFor(() => {
      subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
      const groupedTable = screen.getByLabelText('Grouped Table');

      const subordinatesCheckedViewBy = within(subordinateViewByButton).getByLabelText('subordinates-checked');

      expect(subordinatesCheckedViewBy).toBeInTheDocument();
      expect(groupedTable).toBeInTheDocument();

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    fireEvent.click(filtersButton);

    await waitFor(() => {
      filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
      expect(filtersPopper).toBeInTheDocument();
    });

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxDropdown = screen.getByRole('combobox', { name: 'MX Availability' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(mxDropdown);

      const available = screen.getByRole('option', { name: 'Available' });

      fireEvent.click(available);

      fireEvent.click(mxDropdown);

      fireEvent.click(applyFilters);

      const groupedTable = screen.getByLabelText('Grouped Table');

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on Unit', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    let subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const noGroupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(noGroupedTable).not.toBeInTheDocument();

    fireEvent.click(subordinateViewByButton);

    await waitFor(() => {
      subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
      const groupedTable = screen.getByLabelText('Grouped Table');

      const subordinatesCheckedViewBy = within(subordinateViewByButton).getByLabelText('subordinates-checked');

      expect(subordinatesCheckedViewBy).toBeInTheDocument();
      expect(groupedTable).toBeInTheDocument();

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    fireEvent.click(filtersButton);

    await waitFor(() => {
      filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
      expect(filtersPopper).toBeInTheDocument();
    });

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxDropdown = screen.getByRole('combobox', { name: 'Unit' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(mxDropdown);

      const unit1 = screen.getByRole('option', { name: 'TSTUNIT1' });

      fireEvent.click(unit1);

      fireEvent.click(mxDropdown);

      fireEvent.click(applyFilters);

      const groupedTable = screen.getByLabelText('Grouped Table');

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on MOS', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    let subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const noGroupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(noGroupedTable).not.toBeInTheDocument();

    fireEvent.click(subordinateViewByButton);

    await waitFor(() => {
      subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
      const groupedTable = screen.getByLabelText('Grouped Table');

      const subordinatesCheckedViewBy = within(subordinateViewByButton).getByLabelText('subordinates-checked');

      expect(subordinatesCheckedViewBy).toBeInTheDocument();
      expect(groupedTable).toBeInTheDocument();

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    fireEvent.click(filtersButton);

    await waitFor(() => {
      filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
      expect(filtersPopper).toBeInTheDocument();
    });

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxDropdown = screen.getByRole('combobox', { name: 'MOS' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(mxDropdown);

      const mos1 = screen.getByRole('option', { name: 'MOS1' });

      fireEvent.click(mos1);

      fireEvent.click(mxDropdown);

      fireEvent.click(applyFilters);

      const groupedTable = screen.getByLabelText('Grouped Table');

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on ML', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <AvailabilityTable unitAvailabilityData={mockUnitAvailabilityData.map(mapToIUnitAvailabilityData)} />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFiltersAndHeader = screen.getByLabelText('Table Header and Filters');
    let subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
    const noGroupedTable = screen.queryByLabelText('Grouped Table');

    expect(tableFiltersAndHeader).toBeInTheDocument();
    expect(subordinateViewByButton).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
    expect(noGroupedTable).not.toBeInTheDocument();

    fireEvent.click(subordinateViewByButton);

    await waitFor(() => {
      subordinateViewByButton = screen.getByRole('button', { name: 'Subordinates View By Button' });
      const groupedTable = screen.getByLabelText('Grouped Table');

      const subordinatesCheckedViewBy = within(subordinateViewByButton).getByLabelText('subordinates-checked');

      expect(subordinatesCheckedViewBy).toBeInTheDocument();
      expect(groupedTable).toBeInTheDocument();

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).getByText('Testy Megeey');
      const soldier3Row = within(groupedTable).getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    fireEvent.click(filtersButton);

    await waitFor(() => {
      filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
      expect(filtersPopper).toBeInTheDocument();
    });

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxDropdown = screen.getByRole('combobox', { name: 'ML' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(mxDropdown);

      const ml1 = screen.getByRole('option', { name: 'ML1' });

      fireEvent.click(ml1);

      fireEvent.click(mxDropdown);

      fireEvent.click(applyFilters);

      const groupedTable = screen.getByLabelText('Grouped Table');

      const soldier1Row = within(groupedTable).getByText('Test Megee');
      const soldier2Row = within(groupedTable).queryByText('Testy Megeey');
      const soldier3Row = within(groupedTable).queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });
});
