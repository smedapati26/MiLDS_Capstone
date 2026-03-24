import { describe } from 'vitest';
import { RenderHelper } from 'vitest/helpers/RenderHelper';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import { CreateSoldierDialog } from '@features/soldier-manager/components/dialogs/CreateSoldierDialog';
import { useLazySoldierExistsQuery } from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { IAppUser } from '@store/amap_ai/user/models';
import { useLazyGetUserQuery } from '@store/amap_ai/user/slices/userApi';

const mockUnitBrief: IUnitBrief = {
  component: 'Component',
  displayName: 'Test Unit',
  echelon: Echelon.COMPANY,
  level: 0,
  shortName: 'Unit Short Name',
  uic: 'TSTUNIT',
};

const mockIAppUser: IAppUser = {
  firstName: 'John',
  lastName: 'Doe',
  birthMonth: 'JAN',
  fullName: 'CPT John Doe',
  additionalMos: [],
  availabilityStatus: 'Available',
  initials: 'JD',
  isAdmin: true,
  evaluationStatus: 'Approved',
  isMaintainer: true,
  newUser: false,
  unit: 'MAINUNIT',
  unitName: 'Main Unit',
  receiveEmails: false,
  userId: '1234567890',
};

vi.mock('@store/amap_ai/user/slices/userApi', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/user/slices/userApi')>(
    '@store/amap_ai/user/slices/userApi',
  );
  return {
    ...actual,
    useLazyGetUserQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/soldier_manager/slices/soldierManagerApi', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/soldier_manager/slices/soldierManagerApi')>(
    '@store/amap_ai/soldier_manager/slices/soldierManagerApi',
  );
  return {
    ...actual,
    useLazySoldierExistsQuery: vi.fn(),
  };
});

describe('CreateSoldierDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (useLazyGetUserQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      vi.fn().mockResolvedValue({
        data: undefined,
      }),
      { data: undefined },
    ]);

    const soldierExistsQueryTriggerMock = vi.fn();

    const soldierExistsQueryUnwrap = vi.fn().mockResolvedValue(false);

    soldierExistsQueryTriggerMock.mockReturnValue({ unwrap: soldierExistsQueryUnwrap });

    (useLazySoldierExistsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      soldierExistsQueryTriggerMock,
      { data: false },
    ]);
  });

  it('Does not render when closed', () => {
    RenderHelper(<CreateSoldierDialog open={false} setOpen={() => {}} managedUnits={[mockUnitBrief]} />);

    expect(screen.queryByText('Create Soldier')).not.toBeInTheDocument();
  });

  it('Renders intial UI Correctly', () => {
    RenderHelper(<CreateSoldierDialog open={true} setOpen={() => {}} managedUnits={[mockUnitBrief]} />);

    expect(screen.queryByText('Create Soldier')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('Shows when a soldier exists', async () => {
    await waitFor(() => {
      (useLazyGetUserQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
        vi.fn().mockResolvedValue({
          data: mockIAppUser,
        }),
        { data: mockIAppUser },
      ]);

      const soldierExistsQueryTriggerMock = vi.fn();

      const soldierExistsQueryUnwrap = vi.fn().mockResolvedValue(true);

      soldierExistsQueryTriggerMock.mockReturnValue({ unwrap: soldierExistsQueryUnwrap });

      (useLazySoldierExistsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
        soldierExistsQueryTriggerMock,
        { data: true },
      ]);
    });

    RenderHelper(<CreateSoldierDialog open={true} setOpen={() => {}} managedUnits={[mockUnitBrief]} />);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    const dodIdForm = screen.getByRole('textbox');

    fireEvent.change(dodIdForm, { target: { value: '1234567890' } });

    fireEvent.click(continueButton);

    await waitFor(() => {
      const requestTransferButton = screen.getByRole('button', { name: 'Request Transfer' });

      expect(screen.getByText('DoD ID number assigned to an existing user.')).toBeInTheDocument();
      expect(screen.getByText('Existing User Found')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(requestTransferButton).toBeInTheDocument();
      expect(requestTransferButton).toBeEnabled();
    });

    const unitForm = screen.getByRole('combobox');
    const requestTransferButton = screen.getByRole('button', { name: 'Request Transfer' });

    fireEvent.mouseDown(unitForm);

    await waitFor(() => {
      const unitComboboxOption = screen.getByRole('option');

      fireEvent.click(unitComboboxOption);

      fireEvent.click(unitForm);

      expect(requestTransferButton).toBeEnabled();
    });

    const backButton = screen.getByRole('button', { name: 'Back' });

    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.queryByText('DoD ID number assigned to an existing user.')).not.toBeInTheDocument();
    });
  });

  it('Works as expected when creating a new soldier', async () => {
    RenderHelper(<CreateSoldierDialog open={true} setOpen={() => {}} managedUnits={[mockUnitBrief]} />);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    const dodIdForm = screen.getByRole('textbox');

    fireEvent.change(dodIdForm, { target: { value: '1234567890' } });

    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(dodIdForm).toBeDisabled();
    });

    const firstNameForm = screen.getByRole('textbox', { name: 'First Name' });
    const lastNameForm = screen.getByRole('textbox', { name: 'Last Name' });
    const rankForm = screen.getByRole('combobox', { name: 'Rank' });
    const unitForm = screen.getByRole('combobox', { name: 'Current Unit' });
    const createButton = screen.getByRole('button', { name: 'Create' });

    expect(firstNameForm).toBeInTheDocument();
    expect(lastNameForm).toBeInTheDocument();
    expect(rankForm).toBeInTheDocument();
    expect(unitForm).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();

    fireEvent.change(firstNameForm, { target: { value: 'Testy' } });
    fireEvent.change(lastNameForm, { target: { value: 'MeGee' } });

    fireEvent.mouseDown(rankForm);

    await waitFor(() => {
      const rankOption = screen.getByRole('option', { name: 'PV1' });

      fireEvent.click(rankOption);
    });

    fireEvent.mouseDown(unitForm);

    await waitFor(() => {
      const unitOption = screen.getByRole('option');

      fireEvent.click(unitOption);
    });

    expect(createButton).toBeEnabled();
  });
});
