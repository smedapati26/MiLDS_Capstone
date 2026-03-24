import { describe } from 'vitest';
import { RenderHelper } from 'vitest/helpers/RenderHelper';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import { UnitFlagDialog } from '@features/soldier-manager/components/dialogs/UnitFlagDialog';
import { IUnitActiveFlag } from '@store/amap_ai/soldier_manager';
import { useLazyGetUnitFlagsQuery } from '@store/amap_ai/soldier_manager/slices/soldierManagerApi';
import { IUnitBrief } from '@store/amap_ai/units/models';

const mockUnitBrief: IUnitBrief = {
  component: 'Component',
  displayName: 'Test Unit',
  echelon: Echelon.COMPANY,
  level: 0,
  shortName: 'Unit Short Name',
  uic: 'TSTUNIT',
};

const mockIUnitFlags: IUnitActiveFlag[] = [
  {
    flagId: 1,
    unit: 'Test Unit',
    unitUic: 'TSTUNIT',
    flagInfo: 'Flag Info',
    flagType: 'Unit/Position',
    mxAvailability: 'Available',
    startDate: '01/01/2025',
    endDate: undefined,
    maintainerCount: 10,
    remarks: 'Test Remarks',
  },
  {
    flagId: 2,
    unit: 'Testy Unit',
    unitUic: 'TSTYUNIT',
    flagInfo: 'Admin Info',
    flagType: 'Admin',
    mxAvailability: 'Limited',
    startDate: '02/02/2025',
    endDate: '03/03/2025',
    maintainerCount: 10,
    remarks: 'Test Remarks',
  },
];

vi.mock('@store/amap_ai/soldier_manager/slices/soldierManagerApi', async () => {
  const actual = await vi.importActual<typeof import('@store/amap_ai/soldier_manager/slices/soldierManagerApi')>(
    '@store/amap_ai/soldier_manager/slices/soldierManagerApi',
  );
  return {
    ...actual,
    useLazyGetUnitFlagsQuery: vi.fn(),
  };
});

describe('CreateSoldierDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    const getUnitFlagsQueryTriggerMock = vi.fn();

    const getUnitFlagsQueryUnwrap = vi.fn().mockResolvedValue(mockIUnitFlags);

    getUnitFlagsQueryTriggerMock.mockReturnValue({ unwrap: getUnitFlagsQueryUnwrap });

    (useLazyGetUnitFlagsQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      getUnitFlagsQueryTriggerMock,
      { data: mockIUnitFlags },
    ]);
  });

  it('Does not render when closed', () => {
    RenderHelper(
      <UnitFlagDialog open={false} setOpen={() => {}} managedUnits={[mockUnitBrief]} unit={mockUnitBrief} />,
    );

    expect(screen.queryByText('View Unit Flags')).not.toBeInTheDocument();
  });

  it('Renders intial UI Correctly', () => {
    RenderHelper(<UnitFlagDialog open={true} setOpen={() => {}} managedUnits={[mockUnitBrief]} unit={mockUnitBrief} />);

    expect(screen.queryByText('View Unit Flags')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Add Flag')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('Filters correctly', async () => {
    RenderHelper(<UnitFlagDialog open={true} setOpen={() => {}} managedUnits={[mockUnitBrief]} unit={mockUnitBrief} />);

    const searchForm = screen.getByRole('textbox');
    const flagRowOne = screen.getByText(mockIUnitFlags[0].unit);
    const flagRowTwo = screen.getByText(mockIUnitFlags[1].unit);

    expect(searchForm).toBeInTheDocument();
    expect(flagRowOne).toBeInTheDocument();
    expect(flagRowTwo).toBeInTheDocument();

    fireEvent.change(searchForm, { target: { value: mockIUnitFlags[0].unit } });

    await waitFor(() => {
      expect(screen.getByText(mockIUnitFlags[0].unit)).toBeInTheDocument();
      expect(screen.queryByText(mockIUnitFlags[1].unit)).not.toBeInTheDocument();
    });

    fireEvent.change(searchForm, { target: { value: mockIUnitFlags[1].flagType } });

    await waitFor(() => {
      expect(screen.queryByText(mockIUnitFlags[0].unit)).not.toBeInTheDocument();
      expect(screen.getByText(mockIUnitFlags[1].unit)).toBeInTheDocument();
    });

    fireEvent.change(searchForm, { target: { value: mockIUnitFlags[0].mxAvailability } });

    await waitFor(() => {
      expect(screen.getByText(mockIUnitFlags[0].unit)).toBeInTheDocument();
      expect(screen.queryByText(mockIUnitFlags[1].unit)).not.toBeInTheDocument();
    });

    fireEvent.change(searchForm, { target: { value: mockIUnitFlags[1].endDate } });

    await waitFor(() => {
      expect(screen.queryByText(mockIUnitFlags[0].unit)).not.toBeInTheDocument();
      expect(screen.getByText(mockIUnitFlags[1].unit)).toBeInTheDocument();
    });

    fireEvent.change(searchForm, { target: { value: mockIUnitFlags[0].startDate } });

    await waitFor(() => {
      expect(screen.getByText(mockIUnitFlags[0].unit)).toBeInTheDocument();
      expect(screen.queryByText(mockIUnitFlags[1].unit)).not.toBeInTheDocument();
    });
  });

  it('Add Flag Form Works as expected', async () => {
    RenderHelper(<UnitFlagDialog open={true} setOpen={() => {}} managedUnits={[mockUnitBrief]} unit={mockUnitBrief} />);

    const addFlagButton = screen.getByText('Add Flag');

    expect(addFlagButton).toBeInTheDocument();

    fireEvent.click(addFlagButton);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Select Unit' })).toBeInTheDocument();
    });

    const unitSelect = screen.getByRole('combobox', { name: 'Select Unit' });
    const flagTypeSelect = screen.getByRole('combobox', { name: 'Flag Type' });
    const availabilitySelect = screen.getByRole('combobox', { name: 'Mx Availability' });
    const startDateForm = screen.getByRole('textbox', { name: 'Start Date' });
    const endDateForm = screen.getByRole('textbox', { name: 'End Date' });
    const noEndDateCheckbox = screen.getByRole('checkbox');
    const remarksForm = screen.getByRole('textbox', { name: 'Remarks' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const addButton = screen.getByRole('button', { name: 'Add' });

    expect(unitSelect).toBeInTheDocument();
    expect(flagTypeSelect).toBeInTheDocument();
    expect(availabilitySelect).toBeInTheDocument();
    expect(startDateForm).toBeInTheDocument();
    expect(endDateForm).toBeInTheDocument();
    expect(noEndDateCheckbox).toBeInTheDocument();
    expect(remarksForm).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeDisabled();

    fireEvent.mouseDown(unitSelect);

    await waitFor(() => {
      const unitOption = screen.getAllByRole('option')[0];

      fireEvent.click(unitOption);
      fireEvent.click(unitSelect);
    });

    fireEvent.mouseDown(flagTypeSelect);

    await waitFor(() => {
      const flagTypeOption = screen.getAllByRole('option')[0];

      fireEvent.click(flagTypeOption);
      fireEvent.click(flagTypeSelect);
    });

    fireEvent.mouseDown(availabilitySelect);

    await waitFor(() => {
      const availabilityOption = screen.getAllByRole('option')[0];

      fireEvent.click(availabilityOption);
      fireEvent.click(availabilitySelect);
    });

    fireEvent.change(startDateForm, { target: { value: '01/01/2025' } });

    fireEvent.click(noEndDateCheckbox);

    await waitFor(() => {
      expect(addButton).toBeEnabled();
    });

    fireEvent.click(noEndDateCheckbox);

    fireEvent.change(endDateForm, { target: { value: '02/02/2025' } });

    await waitFor(() => {
      expect(addButton).toBeEnabled();
    });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(addButton).not.toBeInTheDocument();
    });
  });
});
