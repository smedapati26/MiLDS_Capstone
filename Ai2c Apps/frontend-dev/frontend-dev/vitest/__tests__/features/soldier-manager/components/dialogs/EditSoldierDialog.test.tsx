import { describe } from 'vitest';
import { RenderHelper } from 'vitest/helpers/RenderHelper';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import { EditSoldierDialog } from '@features/soldier-manager/components/dialogs/EditSoldierDialog';
import { useGetAllDesignationsQuery } from '@store/amap_ai/designation';
import { IDesignation } from '@store/amap_ai/designation/models';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { ISoldierInfo, IUnitSoldierFlag, useLazyGetSoldierInfoQuery } from '@store/amap_ai/soldier_manager';
import { SupportingDocument, useLazyGetSupportingDocumentsQuery } from '@store/amap_ai/supporting_documents';
import { IUnitBrief } from '@store/amap_ai/units/models';

const mockUnitBrief: IUnitBrief = {
  component: 'Component',
  displayName: 'Test Unit',
  echelon: Echelon.COMPANY,
  level: 0,
  shortName: 'Unit Short Name',
  uic: 'TSTUNIT',
};

const mockMos = [
  {
    mos: 'MOS1',
    mos_description: 'Des1',
  },
  {
    mos: 'MOS2',
    mos_description: 'Des2',
  },
  {
    mos: 'MOS3',
    mos_description: 'Des3',
  },
];

const mockSupportingDocuments: SupportingDocument[] = [
  {
    documentDate: '01/01/2025',
    documentTitle: 'Supporting Doc',
    documentType: 'Award',
    id: 1,
    relatedDesignation: null,
    relatedEvent: null,
    soldier: {
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
      userId: '1234567899',
    },
    uploadDate: '01/01/2025',
    uploadedBy: 'CPT Test MeGee',
    visibleToUser: true,
  },
];

const mockDesignations: IDesignation[] = [
  {
    description: 'Designation 1',
    id: 1,
    type: 'Type 1',
  },
];

const mockUnitSoldierFlag: IUnitSoldierFlag = {
  name: 'Testy MeGee',
  designations: undefined,
  dodId: '1234567890',
  mxAvailability: 'Available',
  rank: 'CPT',
  roles: [],
  unit: 'Test Unit',
  isMaintainer: true,
  isAmtpMaintainer: true,
};

const mockSoldierInfo: ISoldierInfo = {
  additionalMos: ['MOS2', 'MOS3'],
  currentUnit: 'Test Unit',
  dodId: '1234567890',
  name: 'Test MeGee',
  primaryMos: 'MOS1',
  rank: 'CPT',
  unitRolesAndDesignations: [],
  isMaintainer: true,
};

vi.mock('@store/amap_ai/supporting_documents', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/supporting_documents')>(
    '@store/amap_ai/supporting_documents',
  );
  return {
    ...actual,
    useLazyGetSupportingDocumentsQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/designation', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/designation')>('@store/amap_ai/designation');
  return {
    ...actual,
    useGetAllDesignationsQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/mos_code', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/mos_code')>('@store/amap_ai/mos_code');
  return {
    ...actual,
    useGetAllMOSQuery: vi.fn(),
  };
});

vi.mock('@store/amap_ai/soldier_manager', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/soldier_manager')>(
    '@store/amap_ai/soldier_manager',
  );
  return {
    ...actual,
    useLazyGetSoldierInfoQuery: vi.fn(),
  };
});

describe('CreateSoldierDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (useLazyGetSoldierInfoQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      vi.fn(),
      { data: mockSoldierInfo },
    ]);

    (useLazyGetSupportingDocumentsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      vi.fn(),
      { data: { supportingDocuments: mockSupportingDocuments } },
    ]);

    (useGetAllDesignationsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockDesignations });

    (useGetAllMOSQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockMos });
  });

  it('Does not render when closed', () => {
    RenderHelper(
      <EditSoldierDialog
        managedUnits={[mockUnitBrief]}
        open={false}
        setOpen={() => {}}
        soldier={mockUnitSoldierFlag}
      />,
    );

    expect(screen.queryByText('Edit Soldier')).not.toBeInTheDocument();
  });

  it('Renders intial UI Correctly', () => {
    RenderHelper(
      <EditSoldierDialog managedUnits={[mockUnitBrief]} open={true} setOpen={() => {}} soldier={mockUnitSoldierFlag} />,
    );

    expect(screen.queryByText('Edit Soldier')).toBeInTheDocument();
    expect(screen.getByText('Rank:')).toBeInTheDocument();
    expect(screen.getByText('DoD ID:')).toBeInTheDocument();
    expect(screen.getByText('Current Unit:')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Primary MOS' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Additional MOS' })).toBeInTheDocument();
    expect(screen.getByText('Add Role')).toBeInTheDocument();
    expect(screen.getByText('Add Designation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('Handles MOS Changes properly', async () => {
    RenderHelper(
      <EditSoldierDialog managedUnits={[mockUnitBrief]} open={true} setOpen={() => {}} soldier={mockUnitSoldierFlag} />,
    );

    const primaryMOSSelect = screen.getByRole('combobox', { name: 'Primary MOS' });
    const additionalMOSSelect = screen.getByRole('combobox', { name: 'Additional MOS' });

    expect(primaryMOSSelect).toBeInTheDocument();
    expect(additionalMOSSelect).toBeInTheDocument();

    await waitFor(() => {
      expect(primaryMOSSelect).toHaveTextContent('MOS1');
      expect(additionalMOSSelect).toHaveTextContent('MOS2MOS3');
    });

    fireEvent.mouseDown(additionalMOSSelect);

    await waitFor(() => {
      const additionalMOS1Options = screen.getByRole('option', { name: 'MOS1' });

      expect(additionalMOS1Options).toBeInTheDocument();
      expect(additionalMOS1Options).toHaveAttribute('aria-disabled', 'true');
    });

    fireEvent.click(additionalMOSSelect);

    fireEvent.mouseDown(primaryMOSSelect);

    await waitFor(() => {
      const mos2Option = screen.getByRole('option', { name: 'MOS2' });

      expect(mos2Option).toBeInTheDocument();

      fireEvent.click(mos2Option);
    });

    await waitFor(() => {
      expect(primaryMOSSelect).toHaveTextContent('MOS2');
      expect(additionalMOSSelect).toHaveTextContent('MOS3');
    });
  });

  it('Handles new roles', async () => {
    RenderHelper(
      <EditSoldierDialog managedUnits={[mockUnitBrief]} open={true} setOpen={() => {}} soldier={mockUnitSoldierFlag} />,
    );

    const addRoleButton = screen.getByRole('button', { name: 'Add Role' });
    const addDesignationButton = screen.getByRole('button', { name: 'Add Designation' });

    expect(addRoleButton).toBeInTheDocument();
    expect(addDesignationButton).toBeInTheDocument();

    fireEvent.click(addRoleButton);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Unit' })).toBeInTheDocument();
    });

    const unitSelect = screen.getByRole('combobox', { name: 'Unit' });
    const roleSelect = screen.getByRole('combobox', { name: 'Role' });
    const addButton = screen.getByRole('button', { name: 'Add' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(addRoleButton).toBeDisabled();
    expect(addDesignationButton).toBeDisabled();
    expect(unitSelect).toBeInTheDocument();
    expect(roleSelect).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();

    fireEvent.mouseDown(unitSelect);

    await waitFor(() => {
      const unitOption1 = screen.queryAllByRole('option')[0];

      expect(unitOption1).toBeInTheDocument();

      fireEvent.click(unitOption1);
    });

    fireEvent.click(unitSelect);

    fireEvent.mouseDown(roleSelect);

    await waitFor(() => {
      const roleOption1 = screen.queryAllByRole('option')[0];

      expect(roleOption1).toBeInTheDocument();

      fireEvent.click(roleOption1);
    });

    fireEvent.click(roleSelect);

    expect(addButton).toBeEnabled();

    fireEvent.click(cancelButton);
  });

  it('Handles new designations', async () => {
    RenderHelper(
      <EditSoldierDialog managedUnits={[mockUnitBrief]} open={true} setOpen={() => {}} soldier={mockUnitSoldierFlag} />,
    );

    const addRoleButton = screen.getByRole('button', { name: 'Add Role' });
    const addDesignationButton = screen.getByRole('button', { name: 'Add Designation' });

    expect(addRoleButton).toBeInTheDocument();
    expect(addDesignationButton).toBeInTheDocument();

    fireEvent.click(addDesignationButton);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Unit' })).toBeInTheDocument();
    });

    const unitSelect = screen.getByRole('combobox', { name: 'Unit' });
    const designationSelect = screen.getByRole('combobox', { name: 'Designation' });
    const startDateForm = screen.getByRole('textbox', { name: 'Start Date' });
    const endDateForm = screen.getByRole('textbox', { name: 'End Date' });
    const noEndDateCheckbox = screen.getByRole('checkbox', { name: 'No End Date' });
    const addButton = screen.getByRole('button', { name: 'Add' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(addRoleButton).toBeDisabled();
    expect(addDesignationButton).toBeDisabled();
    expect(unitSelect).toBeInTheDocument();
    expect(designationSelect).toBeInTheDocument();
    expect(startDateForm).toBeInTheDocument();
    expect(endDateForm).toBeInTheDocument();
    expect(noEndDateCheckbox).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();

    fireEvent.mouseDown(unitSelect);

    await waitFor(() => {
      const unitOption1 = screen.queryAllByRole('option')[0];

      expect(unitOption1).toBeInTheDocument();

      fireEvent.click(unitOption1);
    });

    fireEvent.click(unitSelect);

    fireEvent.mouseDown(designationSelect);

    await waitFor(() => {
      const designationOption1 = screen.queryAllByRole('option')[0];

      expect(designationOption1).toBeInTheDocument();

      fireEvent.click(designationOption1);
    });

    fireEvent.click(designationSelect);

    fireEvent.change(startDateForm, { target: { value: '01/01/2025' } });

    fireEvent.change(endDateForm, { target: { value: '02/02/2025' } });

    screen.queryAllByRole('checkbox').forEach((element) => {
      fireEvent.click(element);
    });

    expect(addButton).toBeEnabled();

    const uploadNewDocumentOption = screen.getByText('Upload a new document.');

    expect(uploadNewDocumentOption).toBeInTheDocument();

    fireEvent.click(uploadNewDocumentOption);

    fireEvent.click(cancelButton);
  });
});
