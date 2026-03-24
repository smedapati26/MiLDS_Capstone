import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { Matcher, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Echelon } from '@ai2c/pmx-mui/models';

import ComponentOverviewTab, {
  COMPONENT_TABLE_COLUMNS,
} from '@features/component-management/components/Overview/OverviewTab';
import { componentManagementReducer } from '@features/component-management/slices';

import { aircraftApi } from '@store/griffin_api/aircraft/slices';
import { componentsApi, useGetShortLifeQuery } from '@store/griffin_api/components/slices';
import { appSettingsReducer, setCurrentUnit } from '@store/slices';

import '@testing-library/jest-dom';

// Mock the hook
vi.mock('@store/griffin_api/components/slices', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useGetShortLifeQuery: vi.fn(),
    componentsApi: actual.componentsApi,
  };
});

// Sample data for tests
const sampleShortLifeData = [
  {
    id: '1',
    aircraftSerialNumber: 'SN123',
    aircraftModel: 'UH-60',
    nomenclature: 'Main Rotor',
    workUnitCode: '123',
    partNumber: 'PN456',
    serialNumber: 'S789',
    trackerName: 'Hours',
    currentValue: 100,
    replacementDue: 200,
    hoursRemaining: 50,
  },
  {
    id: '2',
    aircraftSerialNumber: 'SN456',
    aircraftModel: 'UH-60',
    nomenclature: 'Tail Rotor',
    workUnitCode: '456',
    partNumber: 'PN789',
    serialNumber: 'S012',
    trackerName: 'Hours',
    currentValue: 150,
    replacementDue: 250,
    hoursRemaining: 75,
  },
];

describe('ComponentOverviewTab', () => {
  beforeEach(() => {
    vi.mocked(useGetShortLifeQuery).mockReturnValue({
      data: sampleShortLifeData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  const renderComponent = () => {
    const store = configureStore({
      reducer: {
        appSettings: appSettingsReducer,
        componentManagement: componentManagementReducer,
        [aircraftApi.reducerPath]: aircraftApi.reducer,
        [componentsApi.reducerPath]: componentsApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(aircraftApi.middleware).concat(componentsApi.middleware),
    });

    store.dispatch(
      setCurrentUnit({
        uic: 'WDYFAA',
        shortName: '2-1 GSAB',
        displayName: '2nd Battalion, 1st Aviation Regiment',
        echelon: Echelon.BATTALION,
        component: '1',
        level: 0,
      }),
    );

    return render(
      <Provider store={store}>
        <ComponentOverviewTab />
      </Provider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('TBO/Short Life Table')).toBeInTheDocument();
  });

  it('renders loading skeleton when data is loading', () => {
    vi.mocked(useGetShortLifeQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderComponent();
    const skeletons = screen.getAllByRole('row');
    expect(skeletons.length).toBeTruthy();
  });

  it('filters data by search query', async () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'Main Rotor');

    // Check that the filtered item is present in the table
    const rows = screen.getAllByRole('row');
    const rowText = rows.map((row) => row.textContent).join('');
    expect(rowText).toContain('Main Rotor');
  });

  it('renders all column headers correctly', () => {
    renderComponent();

    COMPONENT_TABLE_COLUMNS.forEach((header: { header: Matcher }) => {
      expect(screen.getByText(header.header)).toBeInTheDocument();
    });
  });

  it('autocomplete search functionality works correctly', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'Main Rotor');

    const cells = screen.getAllByRole('cell');
    const nomenclatureCell = cells.find((cell) => cell.textContent === 'Main Rotor');

    expect(nomenclatureCell).toBeInTheDocument();

    // Clear search
    await userEvent.clear(searchInput);

    // Verify all items are shown again
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(3); // Header + 2 data rows
    });
  });

  it('handles rows per page changes correctly', async () => {
    renderComponent();

    const select = screen.getByLabelText('Rows per page:');
    await userEvent.click(select);

    // Find and click the menu item with value 25
    const option25 = await screen.findByRole('option', { name: '25' });
    await userEvent.click(option25);

    // Verify the new rows per page is applied
    expect(select).toHaveTextContent('25');
  });
});
