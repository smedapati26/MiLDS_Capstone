import { MemoryRouter } from 'react-router-dom';
import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitMissingPacketsData } from 'vitest/mocks/handlers/unit-health/unit-missing-packets-data/mock_data';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { MissingPacketsTable } from '@features/unit-health/components/tables/UnitMissingPackets/MissingPacketsTable';
import { mapToIUnitMissingPacketsSoldierData } from '@store/amap_ai/unit_health';

describe('Unit Availability Dialog Table Test', () => {
  it('renders correctly', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <MissingPacketsTable
              unitMissingPacketsData={mockUnitMissingPacketsData.map(mapToIUnitMissingPacketsSoldierData)}
            />
          </MemoryRouter>
        </LocalizationProvider>
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <MissingPacketsTable
              unitMissingPacketsData={mockUnitMissingPacketsData.map(mapToIUnitMissingPacketsSoldierData)}
            />
          </MemoryRouter>
        </LocalizationProvider>
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

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
    });

    const searchField = screen.getByRole('textbox');

    expect(searchField).toBeInTheDocument();

    fireEvent.change(searchField, { target: { value: 'Test Megee' } });

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'tstsoldier1' } });

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'Missing' } });

    await waitFor(() => {
      const soldier1Row = screen.queryByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');

      expect(soldier1Row).not.toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: '05/11/1998' } });

    await waitFor(() => {
      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
    });

    fireEvent.change(searchField, { target: { value: 'TSTUNIT2' } });

    await waitFor(() => {
      const soldier1Row = screen.queryByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');

      expect(soldier1Row).not.toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
    });
  });

  it('filter menu does not filter when apply not clicked', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <MissingPacketsTable
              unitMissingPacketsData={mockUnitMissingPacketsData.map(mapToIUnitMissingPacketsSoldierData)}
            />
          </MemoryRouter>
        </LocalizationProvider>
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

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
    });

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

    fireEvent.mouseDown(unitDropdown);

    // No filtering when Apply button not pressed
    await waitFor(() => {
      const overdue = screen.getByRole('option', { name: 'TSTUNIT1' });

      fireEvent.click(overdue);
      fireEvent.click(unitDropdown);

      fireEvent.click(filtersButton);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.getByText('Testy Megeey');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on Packet Status', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <MissingPacketsTable
              unitMissingPacketsData={mockUnitMissingPacketsData.map(mapToIUnitMissingPacketsSoldierData)}
            />
          </MemoryRouter>
        </LocalizationProvider>
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

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
    });

    fireEvent.click(filtersButton);

    await waitFor(() => {
      filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
      expect(filtersPopper).toBeInTheDocument();
    });

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const uploadedStatusButton = screen.getByRole('button', { name: 'Uploaded Packet Status Button' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(uploadedStatusButton).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.click(uploadedStatusButton);

      fireEvent.click(applyFilters);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
    });
  });

  it('filter menu filtering functionality works on Unit', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <MissingPacketsTable
              unitMissingPacketsData={mockUnitMissingPacketsData.map(mapToIUnitMissingPacketsSoldierData)}
            />
          </MemoryRouter>
        </LocalizationProvider>
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

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();
    });

    fireEvent.click(filtersButton);

    await waitFor(() => {
      filtersPopper = screen.queryByLabelText('Table Dropdown Filters');
      expect(filtersPopper).toBeInTheDocument();
    });

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const unitDropdown = screen.getByRole('combobox', { name: 'Unit' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(unitDropdown).toBeInTheDocument();

    fireEvent.mouseDown(unitDropdown);

    await waitFor(() => {
      const unit1 = screen.getByRole('option', { name: 'TSTUNIT1' });

      fireEvent.click(unit1);
      fireEvent.click(unitDropdown);

      fireEvent.click(applyFilters);

      const soldier1Row = screen.getByText('Test Megee');
      const soldier2Row = screen.queryByText('Testy Megeey');

      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).not.toBeInTheDocument();
    });
  });
});
