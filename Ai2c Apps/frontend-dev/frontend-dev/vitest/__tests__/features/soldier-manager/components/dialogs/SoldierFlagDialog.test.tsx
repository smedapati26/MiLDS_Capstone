import { describe } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';
import { unitSoldierFlagsMock } from 'vitest/mocks/handlers/transfer-requests/mock_data';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { SoldierFlagDialog } from '@features/soldier-manager/components/dialogs/SoldierFlagDialog';
import { mapToIUnitSoldierFlag } from '@store/amap_ai/soldier_manager';

describe('Soldier Flag Dialog Tests', () => {
  it('Does not render dialog when closed', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <SoldierFlagDialog open={false} setOpen={() => {}} soldier={mapToIUnitSoldierFlag(unitSoldierFlagsMock[0])} />
      </ThemedTestingComponent>,
    );

    expect(screen.queryByText('Active Flags')).not.toBeInTheDocument();
  });

  it('Renders the dialog correctly when open', () => {
    renderWithProviders(
      <SoldierFlagDialog open={true} setOpen={() => {}} soldier={mapToIUnitSoldierFlag(unitSoldierFlagsMock[0])} />,
    );

    const title = screen.getByText('Active Flags');
    const addFlagButton = screen.getByRole('button', { name: 'Add Flag' });
    const newFormSaveButton = screen.queryByText('Save');
    const doneButton = screen.getByRole('button', { name: 'Done' });

    expect(title).toBeInTheDocument();
    expect(addFlagButton).toBeInTheDocument();
    expect(newFormSaveButton).not.toBeInTheDocument();
    expect(doneButton).toBeInTheDocument();
  });

  it('Enables Add button on valid form', async () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SoldierFlagDialog open={true} setOpen={() => {}} soldier={mapToIUnitSoldierFlag(unitSoldierFlagsMock[0])} />
        </LocalizationProvider>
      </ThemedTestingComponent>,
    );

    const title = screen.getByText('Active Flags');
    const addFlagButton = screen.getByRole('button', { name: 'Add Flag' });

    expect(title).toBeInTheDocument();
    expect(addFlagButton).toBeInTheDocument();

    fireEvent.click(addFlagButton);

    const flagTypeForm = screen.getByRole('combobox', { name: 'Flag Type' });
    const flagInfoForm = screen.getByRole('combobox', { name: 'Flag Info' });
    const mxForm = screen.getByRole('combobox', { name: 'Mx Availability' });
    const startDateForm = screen.getByRole('textbox', { name: 'Start Date' });
    const endDateForm = screen.getByRole('textbox', { name: 'End Date' });
    const noEndDateCheckbox = screen.getByRole('checkbox');
    const remarksForm = screen.getByRole('textbox', { name: 'Remarks' });
    const addButton = screen.getByRole('button', { name: 'Add' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(flagTypeForm).toBeInTheDocument();
    expect(flagInfoForm).toBeInTheDocument();
    expect(mxForm).toBeInTheDocument();
    expect(startDateForm).toBeInTheDocument();
    expect(noEndDateCheckbox).toBeInTheDocument();
    expect(remarksForm).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();
    expect(cancelButton).toBeInTheDocument();

    fireEvent.mouseDown(flagTypeForm);

    await waitFor(() => {
      const flagTypeAdministrative = screen.getByRole('option', { name: 'Administrative' });

      expect(flagTypeAdministrative).toBeInTheDocument();

      fireEvent.click(flagTypeAdministrative);
    });

    fireEvent.mouseDown(flagInfoForm);

    await waitFor(() => {
      const flagInfoASAP = screen.getByRole('option', { name: 'ASAP' });

      expect(flagInfoASAP).toBeInTheDocument();

      fireEvent.click(flagInfoASAP);
    });

    fireEvent.mouseDown(mxForm);

    await waitFor(() => {
      const limitedOption = screen.getByRole('option', { name: 'Limited' });

      expect(limitedOption).toBeInTheDocument();

      fireEvent.click(limitedOption);
    });

    fireEvent.change(startDateForm, { target: { value: '01/01/2026' } });

    fireEvent.click(noEndDateCheckbox);

    await waitFor(() => {
      expect(addButton).toBeEnabled();
    });

    fireEvent.click(noEndDateCheckbox);

    await waitFor(() => {
      expect(addButton).toBeDisabled();
    });

    fireEvent.change(endDateForm, { target: { value: '02/02/2026' } });

    await waitFor(() => {
      expect(addButton).toBeEnabled();
    });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(addButton).not.toBeInTheDocument();
    });
  });
});
