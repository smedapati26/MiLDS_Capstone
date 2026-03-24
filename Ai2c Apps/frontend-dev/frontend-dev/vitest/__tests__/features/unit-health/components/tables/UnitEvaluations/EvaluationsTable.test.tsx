import { MemoryRouter } from 'react-router-dom';
import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitEvaluationsSoldierData } from 'vitest/mocks/handlers/unit-health/unit-evaluations-data/mock_data';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { EvaluationsTable } from '@features/unit-health/components/tables/UnitEvaluations/EvaluationsTable';
import { mapToIUnitEvaluationsSoldierData } from '@store/amap_ai/unit_health';

describe('Unit Availability Dialog Table Test', () => {
  it('renders correctly', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <EvaluationsTable
            unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
            isLoading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFilters = screen.getByLabelText('Table Filters');
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    const filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableFilters).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();
  });

  it('search filtering functionality works as expected', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <EvaluationsTable
            unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
            isLoading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFilters = screen.getByLabelText('Table Filters');
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    const filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableFilters).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    const searchField = screen.getByRole('textbox');

    expect(searchField).toBeInTheDocument();

    fireEvent.change(searchField, { target: { value: 'Test Megee' } });

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'tstsoldier1' } });

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'Overdue' } });

    await waitFor(() => {
      const soldier1Row = screen.queryByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

      expect(soldier1Row).not.toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'TSTUNIT3' } });

    await waitFor(() => {
      const soldier1Row = screen.queryByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

      expect(soldier1Row).not.toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'MOS1' } });

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'ML1' } });

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu does not filter when apply not clicked', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <EvaluationsTable
            unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
            isLoading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFilters = screen.getByLabelText('Table Filters');
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableFilters).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

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

    // No filtering when Apply button not pressed
    await waitFor(() => {
      fireEvent.mouseDown(evalDropdown);

      const overdue = screen.getByRole('option', { name: 'Met - In Window' });

      fireEvent.click(overdue);

      fireEvent.click(evalDropdown);

      fireEvent.click(filtersButton);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
      expect(soldier3Row).toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on Evaluation Status', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <EvaluationsTable
            unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
            isLoading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFilters = screen.getByLabelText('Table Filters');
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableFilters).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

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
    const evalDropdown = screen.getByRole('combobox', { name: 'Annual Evaluation' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(evalDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(evalDropdown);

      const overdue = screen.getByRole('option', { name: 'Met - In Window' });

      fireEvent.click(overdue);

      fireEvent.click(evalDropdown);

      fireEvent.click(applyFilters);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on Unit', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <EvaluationsTable
            unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
            isLoading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFilters = screen.getByLabelText('Table Filters');
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableFilters).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

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
    const evalDropdown = screen.getByRole('combobox', { name: 'Unit' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(evalDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(evalDropdown);

      const unit1 = screen.getByRole('option', { name: 'TSTUNIT1' });

      fireEvent.click(unit1);

      fireEvent.click(evalDropdown);

      fireEvent.click(applyFilters);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on MOS', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <EvaluationsTable
            unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
            isLoading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFilters = screen.getByLabelText('Table Filters');
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableFilters).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

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
    const evalDropdown = screen.getByRole('combobox', { name: 'MOS' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(evalDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(evalDropdown);

      const mos1 = screen.getByRole('option', { name: 'MOS1' });

      fireEvent.click(mos1);

      fireEvent.click(evalDropdown);

      fireEvent.click(applyFilters);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on ML', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <MemoryRouter>
          <EvaluationsTable
            unitEvaluationsData={mockUnitEvaluationsSoldierData.map(mapToIUnitEvaluationsSoldierData)}
            isLoading={false}
          />
        </MemoryRouter>
      </ThemedTestingComponent>,
    );

    const tableFilters = screen.getByLabelText('Table Filters');
    const filtersButton = screen.getByRole('button', { name: 'Filters Button' });
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableFilters).toBeInTheDocument();
    expect(filtersButton).toBeInTheDocument();
    expect(filtersPopper).not.toBeInTheDocument();

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');
      const soldier3Row = screen.getByText('Tester Megeer');

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
    const evalDropdown = screen.getByRole('combobox', { name: 'ML' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(evalDropdown).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.mouseDown(evalDropdown);

      const ml1 = screen.getByRole('option', { name: 'ML1' });

      fireEvent.click(ml1);

      fireEvent.click(evalDropdown);

      fireEvent.click(applyFilters);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');
      const soldier3Row = screen.queryByText('Tester Megeer');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
      expect(soldier3Row).not.toBeInTheDocument();
    });
  });
});
