import { describe } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockSoldierFlags } from 'vitest/mocks/handlers/amtp-packet/soldier-flags/mock_data';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import AddEditSoldierFlagDialog, {
  IAddEditSoldierFlagDialogProps,
} from '@features/amtp-packet/components/soldier-flags/AddEditSoldierFlagDialog';
import { mapToISoldierFlag } from '@store/amap_ai/soldier_flag/models';
import { SOLDIERFLAGTYPES } from '@utils/enums';

const mockSetOpen = vi.fn();

const render = ({ ...props }: IAddEditSoldierFlagDialogProps) => {
  return renderWithProviders(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AddEditSoldierFlagDialog {...props} />
    </LocalizationProvider>,
  );
};

describe('AddEditSoldierFlagsDialog Tests', () => {
  it('Does not render while dialog is not open', () => {
    render({
      soldierFlag: mapToISoldierFlag(mockSoldierFlags[0]),
      open: false,
      handleClose: mockSetOpen,
      refetchSoldierFlags: () => {},
      isUnitFlag: false,
    });

    const divElements = screen.queryByLabelText('Add/Edit Soldier Flag Dialog');
    expect(divElements).not.toBeInTheDocument();
  });

  it('Renders when dialog is open and form fields that are populated', async () => {
    render({
      soldierFlag: null,
      open: true,
      handleClose: mockSetOpen,
      refetchSoldierFlags: () => {},
      isUnitFlag: false,
    });

    const divElements = screen.queryByLabelText('Add/Edit Soldier Flag Dialog');
    const flagTypeForm = screen.getByRole('combobox', { name: 'Flag Type' });
    const flagInfoForm = screen.getByRole('combobox', { name: 'Flag Info' });
    const flagStartDateForm = screen.getByLabelText('Start Date');
    const flagEndDateForm = screen.getByRole('textbox', { name: 'End Date' });
    const flagNoEndDateCheckbox = screen.getByRole('checkbox');
    const flagRemarksForm = screen.getByLabelText('Remarks');
    let unitSelectForm = screen.queryByLabelText('Unit');

    expect(divElements).toBeInTheDocument();
    expect(flagTypeForm).toBeInTheDocument();
    expect(flagInfoForm).toBeInTheDocument();
    expect(flagStartDateForm).toBeInTheDocument();
    expect(flagEndDateForm).toBeInTheDocument();
    expect(flagEndDateForm).toBeDisabled();
    expect(flagNoEndDateCheckbox).toBeInTheDocument();
    expect(flagNoEndDateCheckbox).toBeChecked();
    expect(flagRemarksForm).toBeInTheDocument();
    expect(unitSelectForm).not.toBeInTheDocument();

    fireEvent.mouseDown(flagTypeForm);

    const unitOrPosOption = screen.getByText(SOLDIERFLAGTYPES.UNITORPOS);

    fireEvent.click(unitOrPosOption);

    unitSelectForm = screen.getByLabelText('Unit');

    expect(unitSelectForm).toBeInTheDocument();

    fireEvent.click(flagNoEndDateCheckbox);

    await waitFor(() => {
      expect(flagNoEndDateCheckbox).not.toBeChecked();
      expect(flagEndDateForm).not.toBeDisabled();
    });
  });

  it('Renders when dialog is open and form fields that are populated', async () => {
    render({
      soldierFlag: mapToISoldierFlag(mockSoldierFlags[0]),
      open: true,
      handleClose: mockSetOpen,
      refetchSoldierFlags: () => {},
      isUnitFlag: false,
    });

    const divElements = screen.queryByLabelText('Add/Edit Soldier Flag Dialog');
    const flagTypeForm = screen.getByRole('combobox', { name: 'Flag Type' });
    const flagTypeInit = await waitFor(() => within(flagTypeForm).getByText(mockSoldierFlags[0].flag_type as string));
    const flagInfoForm = screen.getByRole('combobox', { name: 'Flag Info' });
    const flagInfoInit = await waitFor(() => within(flagInfoForm).getByText(mockSoldierFlags[0].flag_info));
    const flagStartDateForm = screen.getByLabelText('Start Date');
    const flagEndDateForm = screen.getByLabelText('End Date');
    const flagNoEndDateCheckbox = screen.getByRole('checkbox');
    const flagRemarksForm = screen.getByLabelText('Remarks');
    const unitSelectForm = screen.queryByLabelText('Unit');

    expect(divElements).toBeInTheDocument();
    expect(flagTypeForm).toBeInTheDocument();
    expect(flagTypeInit).toBeInTheDocument();
    expect(flagInfoForm).toBeInTheDocument();
    expect(flagInfoInit).toBeInTheDocument();
    expect(flagStartDateForm).toBeInTheDocument();
    expect(flagEndDateForm).toBeInTheDocument();
    expect(flagNoEndDateCheckbox).toBeInTheDocument();
    expect(flagNoEndDateCheckbox).not.toBeChecked();
    expect(flagRemarksForm).toBeInTheDocument();
    expect(unitSelectForm).not.toBeInTheDocument();

    fireEvent.mouseDown(flagTypeForm);

    const noUnitPosOption = screen.queryByText(SOLDIERFLAGTYPES.UNITORPOS);

    expect(noUnitPosOption).not.toBeInTheDocument();
  });

  it('Renders when dialog is open and form fields that are populated; no end date', async () => {
    render({
      soldierFlag: mapToISoldierFlag(mockSoldierFlags[1]),
      open: true,
      handleClose: mockSetOpen,
      refetchSoldierFlags: () => {},
      isUnitFlag: true,
    });

    const divElements = screen.queryByLabelText('Add/Edit Soldier Flag Dialog');
    const flagTypeForm = screen.getByRole('combobox', { name: 'Flag Type' });
    const flagTypeInit = await waitFor(() => within(flagTypeForm).getByText(mockSoldierFlags[1].flag_type as string));
    const flagInfoForm = screen.getByRole('combobox', { name: 'Flag Info' });
    const flagInfoInit = await waitFor(() => within(flagInfoForm).getByText(mockSoldierFlags[1].flag_info));
    const flagStartDateForm = screen.getByLabelText('Start Date');
    const flagEndDateForm = screen.getByLabelText('End Date');
    const flagNoEndDateCheckbox = screen.getByRole('checkbox');
    const flagRemarksForm = screen.getByLabelText('Remarks');
    const unitSelectForm = screen.queryByLabelText('Unit');

    expect(divElements).toBeInTheDocument();
    expect(flagTypeForm).toBeInTheDocument();
    expect(flagTypeInit).toBeInTheDocument();
    expect(flagInfoForm).toBeInTheDocument();
    expect(flagInfoInit).toBeInTheDocument();
    expect(flagStartDateForm).toBeInTheDocument();
    expect(flagEndDateForm).toBeInTheDocument();
    expect(flagNoEndDateCheckbox).toBeInTheDocument();
    expect(flagNoEndDateCheckbox).toBeChecked();
    expect(flagRemarksForm).toBeInTheDocument();
    expect(unitSelectForm).toBeInTheDocument();

    fireEvent.mouseDown(flagTypeForm);

    const noIndividualFlagOption = screen.queryByText(SOLDIERFLAGTYPES.ADMIN);

    expect(noIndividualFlagOption).not.toBeInTheDocument();
  });
});
