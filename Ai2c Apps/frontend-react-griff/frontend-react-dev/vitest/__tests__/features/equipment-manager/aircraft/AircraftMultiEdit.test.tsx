// src/tests/MultiEditModal.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColumnConfig } from '@components/data-tables';
import { AircraftEditStepsEnum } from '@features/equipment-manager/aircraft/AircraftEditSteps/SelectFields';
import AircraftMultiEdit from '@features/equipment-manager/aircraft/AircraftMultiEdit';

import { IAircraftEquipmentDetailsInfo } from '@store/griffin_api/aircraft/models';

vi.mock('./AircraftEditSteps/SelectFields', () => ({
  default: () => <div>{AircraftEditStepsEnum.SELECT}</div>,
}));

vi.mock('./AircraftEditSteps/EditAircraftStatus', () => ({
  default: () => <div>{AircraftEditStepsEnum.STATUS}</div>,
}));

vi.mock('./AircraftEditSteps/EditLocation', () => ({
  default: () => <div>{AircraftEditStepsEnum.LOCATION}</div>,
}));

vi.mock('./AircraftEditSteps/AddRemarks', () => ({
  default: () => <div>{AircraftEditStepsEnum.REMARKS}</div>,
}));

vi.mock('./AircraftEditSteps/ReviewChanges', () => ({
  default: () => <div>{AircraftEditStepsEnum.REVIEW}</div>,
}));

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useEditAircraftEquipmentDetailsMutation: vi.fn(() => [
    vi.fn(), // mock mutation
    { isLoading: false }, // mock state object
  ]),
}));

const mockData: Record<string, IAircraftEquipmentDetailsInfo[]> = { KEY: [] };
const mockColumns: ColumnConfig<IAircraftEquipmentDetailsInfo>[] = [];
const mockSetOpen = vi.fn();
const mockSetShowSnackbar = vi.fn();
const mockSetUpdatedRows = vi.fn();

describe('AircraftMultiEditModal Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <AircraftMultiEdit
          data={mockData}
          columns={mockColumns}
          open={false}
          setOpen={mockSetOpen}
          setShowSnackbar={mockSetShowSnackbar}
          setUpdatedRows={mockSetUpdatedRows}
        />
      </ThemedTestingComponent>,
    );
  });

  it('should not be visible when open is false', () => {
    expect(screen.queryByText('Edit Aircraft')).not.toBeInTheDocument();
    expect(screen.queryByTestId('multi-edit-cancel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('multi-edit-next')).not.toBeInTheDocument();
  });
});

describe('AircraftMultiEditModal Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <AircraftMultiEdit
          data={mockData}
          columns={mockColumns}
          open={true}
          setOpen={mockSetOpen}
          setShowSnackbar={mockSetShowSnackbar}
          setUpdatedRows={mockSetUpdatedRows}
        />
      </ThemedTestingComponent>,
    );
  });

  it('Renders Relevant Components for start page and first step', () => {
    expect(screen.getByText('Edit Aircraft')).toBeInTheDocument();
    expect(screen.getByTestId('multi-edit-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('multi-edit-next')).toBeInTheDocument();

    expect(screen.getByText(AircraftEditStepsEnum.SELECT)).toBeInTheDocument();
  });

  it('should navigate to the next step when the "Next" button is clicked', async () => {
    // Step 1
    expect(screen.getByText(AircraftEditStepsEnum.SELECT)).toBeInTheDocument();

    // Click next
    const nextButton = screen.getByTestId('multi-edit-next');
    await userEvent.click(nextButton);

    // Now on Step 2
    expect(screen.getByText(AircraftEditStepsEnum.REVIEW)).toBeInTheDocument();
  });

  it('should close when the "Cancel" button is clicked', async () => {
    const cancelButton = screen.getByTestId('multi-edit-cancel');
    await userEvent.click(cancelButton);
    expect(mockSetOpen).toBeCalled();
  });

  it('should close when the close "X" button is clicked', async () => {
    const closeButton = screen.getByTestId('close-aircraft-multi-edit');
    await userEvent.click(closeButton);
    expect(mockSetOpen).toBeCalled();
  });
});
