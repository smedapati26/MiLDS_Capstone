import { MemoryRouter } from 'react-router-dom';
import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { mockUnitRosterData } from 'vitest/mocks/handlers/unit-health/unit-roster-data/mock_data';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { UnitRosterTable } from '@features/unit-health/components/tables/UnitRoster/UnitRosterTable';
import { mapToIUnitRoster } from '@store/amap_ai/unit_health';

describe('Unit Roster Table Tests', () => {
  it('renders correctly', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const rosterTableFooter = screen.getByLabelText('Unit Roster Table Footer');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(rosterTableFooter).toBeInTheDocument();
  });

  it('search filtering works as expected', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const searchFilter = screen.getByRole('textbox');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(searchFilter).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: 'Unavailable' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).queryByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).not.toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: 'Testest MeGeest' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).queryByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).not.toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: 'testestmegeest' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).queryByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).not.toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: 'MOS1' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: 'ML1' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: 'Unknown' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).queryByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).not.toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: '2025' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });

    fireEvent.change(searchFilter, { target: { value: 'Overdue' } });

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).queryByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).not.toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });
  });

  it('filter popper does not filter when apply not clicked', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const popperButton = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(popperButton).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.click(popperButton);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxAvailableButton = screen.getByRole('button', { name: 'Available MX Filter' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxAvailableButton).toBeInTheDocument();

    expect(applyFilters).toBeDisabled();

    // No filtering when Apply button not pressed
    await waitFor(() => {
      fireEvent.click(mxAvailableButton);

      expect(applyFilters).toBeEnabled();

      fireEvent.click(popperButton);

      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });
  });

  it('filter popper works on availability', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const popperButton = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(popperButton).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.click(popperButton);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mxAvailableButton = screen.getByRole('button', { name: 'Available MX Filter' });
    const mxLimitedButton = screen.getByRole('button', { name: 'Limited MX Filter' });
    const mxUnavailableButton = screen.getByRole('button', { name: 'Unavailable MX Filter' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mxAvailableButton).toBeInTheDocument();
    expect(mxLimitedButton).toBeInTheDocument();
    expect(mxUnavailableButton).toBeInTheDocument();

    expect(applyFilters).toBeDisabled();

    fireEvent.click(mxAvailableButton);

    expect(applyFilters).toBeEnabled();

    fireEvent.click(applyFilters);

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });
  });

  it('filter popper works on evaluation', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const popperButton = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(popperButton).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.click(popperButton);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const evalMetButton = screen.getByRole('button', { name: 'Met Evaluation Filter' });
    const evalDueButton = screen.getByRole('button', { name: 'Due Evaluation Filter' });
    const evalOverDueButton = screen.getByRole('button', { name: 'Overdue Evaluation Filter' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(evalMetButton).toBeInTheDocument();
    expect(evalDueButton).toBeInTheDocument();
    expect(evalOverDueButton).toBeInTheDocument();

    expect(applyFilters).toBeDisabled();

    fireEvent.click(evalMetButton);

    expect(applyFilters).toBeEnabled();

    fireEvent.click(applyFilters);

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });
  });

  it('filter popper works on rank', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const popperButton = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(popperButton).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.click(popperButton);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const rankDropdown = screen.getByRole('combobox', { name: 'Rank' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(rankDropdown).toBeInTheDocument();

    expect(applyFilters).toBeDisabled();

    await waitFor(() => {
      fireEvent.mouseDown(rankDropdown);

      const cpt = screen.getByRole('option', { name: 'CPT' });

      fireEvent.click(cpt);

      fireEvent.click(rankDropdown);

      expect(applyFilters).toBeEnabled();

      fireEvent.click(applyFilters);

      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });
  });

  it('filter popper works on mos', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const popperButton = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(popperButton).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.click(popperButton);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mosDropdown = screen.getByRole('combobox', { name: 'MOS' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mosDropdown).toBeInTheDocument();

    expect(applyFilters).toBeDisabled();

    await waitFor(() => {
      fireEvent.mouseDown(mosDropdown);

      const mos1 = screen.getByRole('option', { name: 'MOS1' });

      fireEvent.click(mos1);

      fireEvent.click(mosDropdown);

      expect(applyFilters).toBeEnabled();

      fireEvent.click(applyFilters);

      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });
  });

  it('filter popper works on ml', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const popperButton = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(popperButton).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.click(popperButton);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const mlDropdown = screen.getByRole('combobox', { name: 'ML' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(mlDropdown).toBeInTheDocument();

    expect(applyFilters).toBeDisabled();

    await waitFor(() => {
      fireEvent.mouseDown(mlDropdown);

      const ml1 = screen.getByRole('option', { name: 'ML1' });

      fireEvent.click(ml1);

      fireEvent.click(mlDropdown);

      expect(applyFilters).toBeEnabled();

      fireEvent.click(applyFilters);

      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });
  });

  it('filter popper works on birthmonth', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MemoryRouter>
            <UnitRosterTable loading={false} unitAvailabilityData={mockUnitRosterData.map(mapToIUnitRoster)} />
          </MemoryRouter>
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const tableHeaderFilter = screen.getByLabelText('Table Header and Filters');
    const rosterTable = screen.getByLabelText('Unit Roster Table');
    const popperButton = screen.getByLabelText('Filters Button');
    let filtersPopper = screen.queryByLabelText('Table Dropdown Filters');

    expect(tableHeaderFilter).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
    expect(popperButton).toBeInTheDocument();

    await waitFor(() => {
      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).getByText('Tester MeGeer');
      const row3 = within(rosterTable).getByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).toBeInTheDocument();
      expect(row3).toBeInTheDocument();
    });

    fireEvent.click(popperButton);

    await waitFor(() => {
      filtersPopper = screen.getByLabelText('Table Dropdown Filters');
    });

    expect(filtersPopper).toBeInTheDocument();

    const clearFilters = screen.getByLabelText('Clear Filters');
    const applyFilters = screen.getByRole('button', { name: 'apply-filters' });
    const birthMonthDropdown = screen.getByRole('combobox', { name: 'Birth Month' });

    expect(clearFilters).toBeInTheDocument();
    expect(applyFilters).toBeInTheDocument();
    expect(birthMonthDropdown).toBeInTheDocument();

    expect(applyFilters).toBeDisabled();

    await waitFor(() => {
      fireEvent.mouseDown(birthMonthDropdown);

      const january = screen.getByRole('option', { name: 'January' });

      fireEvent.click(january);

      fireEvent.click(birthMonthDropdown);

      expect(applyFilters).toBeEnabled();

      fireEvent.click(applyFilters);

      const rosterTable = screen.getByLabelText('Unit Roster Table');

      expect(rosterTable).toBeInTheDocument();

      const row1 = within(rosterTable).getByText('Test MeGee');
      const row2 = within(rosterTable).queryByText('Tester MeGeer');
      const row3 = within(rosterTable).queryByText('Testest MeGeest');

      expect(row1).toBeInTheDocument();
      expect(row2).not.toBeInTheDocument();
      expect(row3).not.toBeInTheDocument();
    });
  });
});
