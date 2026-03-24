// src/tests/MultiEditModal.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColumnConfig } from '@components/data-tables';
import { ModEditStepsEnum } from '@features/equipment-manager/mods/ModEditSteps/SelectFields';
import ModsMultiEdit from '@features/equipment-manager/mods/ModsMultiEdit';

import { IModification } from '@store/griffin_api/mods/models';

vi.mock('./ModEditSteps/SelectFields', () => ({
  default: () => <div>{ModEditStepsEnum.SELECT}</div>,
}));

vi.mock('./ModEditSteps/EditAircraftAssignment', () => ({
  default: () => <div>{ModEditStepsEnum.AIRCRAFT}</div>,
}));

vi.mock('./ModEditSteps/EditVariableAndStatus', () => ({
  default: () => <div>{ModEditStepsEnum.STATUS}</div>,
}));

vi.mock('./ModEditSteps/EditLocation', () => ({
  default: () => <div>{ModEditStepsEnum.LOCATION}</div>,
}));

vi.mock('./ModEditSteps/AddRemarks', () => ({
  default: () => <div>{ModEditStepsEnum.REMARKS}</div>,
}));

vi.mock('./ModEditSteps/ReviewChanges', () => ({
  default: () => <div>{ModEditStepsEnum.REVIEW}</div>,
}));

vi.mock('@store/griffin_api/mods/slices', () => ({
  useEditModificationsMutation: vi.fn(() => [
    vi.fn(), // mock mutation
    { isLoading: false }, // mock state object
  ]),
}));

const mockData: IModification[] = [];
const mockColumns: ColumnConfig<IModification>[] = [];
const mockSetOpen = vi.fn();
const mockHandleEditSave = vi.fn();
const mockModelType = 'Bambi Bucket';

describe('ModsMultiEditModal Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <ModsMultiEdit 
          rows={mockData} 
          columns={mockColumns} 
          open={false} 
          setOpen={mockSetOpen} 
          handleEditSave={mockHandleEditSave} 
          modelType={mockModelType}
        />
      </ThemedTestingComponent>
    );
  });

  it('should not be visible when open is false', () => {
    expect(screen.queryByText(`Edit ${mockModelType}`)).not.toBeInTheDocument();
    expect(screen.queryByTestId('multi-edit-cancel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('multi-edit-next')).not.toBeInTheDocument();
  });
});


describe('ModsMultiEditModal Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <ModsMultiEdit 
          rows={mockData} 
          columns={mockColumns} 
          open={true} 
          setOpen={mockSetOpen} 
          handleEditSave={mockHandleEditSave}
          modelType={mockModelType}
        />
      </ThemedTestingComponent>
    );
  });

  it('Renders Relevant Components for start page and first step', () => {
    expect(screen.getByText(`Edit ${mockModelType}`)).toBeInTheDocument();
    expect(screen.getByTestId('multi-edit-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('multi-edit-next')).toBeInTheDocument();

    expect(screen.getByText(ModEditStepsEnum.SELECT)).toBeInTheDocument();
  });
  
  it('should navigate to the next step when the "Next" button is clicked', async () => {
    // Step 1
    expect(screen.getByText(ModEditStepsEnum.SELECT)).toBeInTheDocument();

    // Click next
    const nextButton = screen.getByTestId('multi-edit-next');
    await userEvent.click(nextButton);
    
    // Now on Step 2
    expect(screen.getByText(ModEditStepsEnum.REVIEW)).toBeInTheDocument();
  });
  
  it('should close when the "Cancel" button is clicked', async () => {
    const cancelButton = screen.getByTestId('multi-edit-cancel');
    await userEvent.click(cancelButton);
    expect(mockSetOpen).toBeCalled();
  });
  
  it('should close when the close "X" button is clicked', async () => {
    const closeButton = screen.getByTestId('close-mods-multi-edit');
    await userEvent.click(closeButton);
    expect(mockSetOpen).toBeCalled();
  });

});
