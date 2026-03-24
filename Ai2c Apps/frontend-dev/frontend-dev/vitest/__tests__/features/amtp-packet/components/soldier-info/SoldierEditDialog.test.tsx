import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockSoldierData } from 'vitest/mocks/handlers/amtp-packet/mock_data';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SoldierEditDialog from '@features/amtp-packet/components/soldier-info/SoldierEditDialog';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { useUpdateSoldierMutation } from '@store/amap_ai/soldier';
import { IAppUser } from '@store/amap_ai/user/models';
import { mapResponseData } from '@utils/helpers/dataTransformer';

vi.mock('@store/amap_ai/mos_code', () => ({
  useGetAllMOSQuery: vi.fn(),
}));

vi.mock('@store/amap_ai/soldier', () => ({
  useUpdateSoldierMutation: vi.fn(),
}));

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

describe('SoldierEditDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useGetAllMOSQuery as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: [{ mos: '15F' }, { mos: '15E' }, { mos: '15D' }],
      isLoading: false,
    }));
    (useUpdateSoldierMutation as ReturnType<typeof vi.fn>).mockImplementation(() => [vi.fn(), { isLoading: false }]);
    vi.mock('@hooks/useUnitAccess', () => ({
      default: () => ({
        // eslint-disable-next-line sonarjs/no-nested-functions
        hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
      }),
    }));
  });

  const renderDialog = () => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SoldierEditDialog
          open={true}
          handleClose={() => {}}
          handleUpdate={() => {}}
          soldier={mapResponseData(mockSoldierData) as IAppUser}
        />
      </LocalizationProvider>,
    );
  };

  it('opens and closes the dialog', async () => {
    await renderDialog();

    // Check if the dialog is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders dropdowns and date pickers correctly', () => {
    renderDialog();

    // Verify dropdowns are rendered correctly
    expect(screen.getAllByText('Primary MOS*')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Additional MOS*')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Birth Month*')[0]).toBeInTheDocument();

    // Verify date pickers are rendered correctly
    expect(screen.getAllByText('Private (PV2)')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Private First Class')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Specialist')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sergeant')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Staff Sergeant')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sergeant First Class')[0]).toBeInTheDocument();
  });

  it('validates required fields on form submission', async () => {
    const incompleteMockSoldierData = {
      ...mockSoldierData,
      primaryMos: '',
      birthMonth: '',
    };

    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SoldierEditDialog
          open={true}
          handleClose={() => {}}
          handleUpdate={() => {}}
          soldier={mapResponseData(incompleteMockSoldierData) as IAppUser}
        />
      </LocalizationProvider>,
    );

    // Submit the form without filling in required fields
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText('Primary MOS is required')).toBeInTheDocument();
      expect(screen.getByText('Birth Month is required')).toBeInTheDocument();
    });
  });
});
