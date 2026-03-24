import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';
import AddModificationModal from '@features/equipment-manager/mods/AddModificationModal'

import { TrackingVariableOptions } from '@store/griffin_api/mods/models';
import { store } from '@store/store';

const mockSetOpen = vi.fn();

const statusOptions = ['FMC', 'PMC', 'NMC', 'DADE'];
const installOptions = ['INSTALLED', 'NOT INSTALLED'];
const countOptions = ['HOURS', 'ROUNDS', 'DAYS', 'CYCLES'];

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useGetAircraftByUicQuery: vi.fn(() => [
    {data: []},
  ]),
}));

vi.mock('@store/griffin_api/mods/slices', () => ({
  useGetModificationTypesQuery: vi.fn(() => [
    {data: []},
  ]),
  useAddNewModificationMutation: vi.fn(() => [vi.fn()]),
}));

describe('AddModificationModal', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <AddModificationModal open={true} setOpen={mockSetOpen} />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </Provider>,
    );
  });

  it('Renders initial fields', () => {
    expect(screen.getByText('Add Modification')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    expect(screen.getByTestId('model-select')).toBeInTheDocument();
    expect(screen.getByTestId('serial-number-text')).toBeInTheDocument();
    expect(screen.getByTestId('tracking-var-select')).toBeInTheDocument();
    expect(screen.getByTestId('aircraft-select')).toBeInTheDocument();

    expect(screen.queryByTestId('tracking-value-select')).not.toBeInTheDocument();
  });

  
  it('Renders correct toggle buttons for STATUS tracking variable type', async () => {
    // Check that no tracking variable values are displayed on start
    Object.values([...statusOptions, ...installOptions]).map((text) => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    // Open select
    const select = screen.getByRole('combobox', { name: /Tracking Variable/i });
    await userEvent.click(select);

    //Select STATUS option
    const option = screen.getByRole('option', { name: /Operational Readiness Status/i });
    await userEvent.click(option);
    expect(select).toHaveTextContent(TrackingVariableOptions.STATUS.label);

    // Status options should be included
    Object.values(statusOptions).map((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    // Others options should not be included
    Object.values([...installOptions]).map((text) => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });
  });

  it('Renders correct toggle buttons for INSTALL tracking variable type', async () => {
    // Check that no tracking variable values are displayed on start
    Object.values([...statusOptions, ...installOptions, ...countOptions]).map((text) => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });

    // Open select
    const select = screen.getByRole('combobox', { name: /Tracking Variable/i });
    await userEvent.click(select);

    //Select INSTALL option
    const option = screen.getByRole('option', { name: /Install/i });
    await userEvent.click(option);
    expect(select).toHaveTextContent(TrackingVariableOptions.INSTALL.label);

    // Install options should be included
    Object.values(installOptions).map((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    // Others options should not be included
    Object.values([...statusOptions, ...countOptions]).map((text) => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });
  });

  it('Renders aircraft select as disabled until switch is checked', async () => {
    const aircraftSelect = screen.getByRole('combobox', { name: /Aircraft/i });

    expect(aircraftSelect).not.toHaveClass('Mui-disabled');
  });
});
