import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColumnConfig } from '@components/data-tables';
import { AGSEEditStepsEnum } from '@features/equipment-manager/agse/AGSEEditSteps/SelectFields';
import AGSEMultiEdit from '@features/equipment-manager/agse/AGSEMultiEdit';

import { IAGSE } from '@store/griffin_api/agse/models';

vi.mock('./AGSEEditSteps/SelectFields', () => ({
  default: () => <div>{AGSEEditStepsEnum.SELECT}</div>,
}));

vi.mock('./AGSEEditSteps/EditAGSEStatus', () => ({
  default: () => <div>{AGSEEditStepsEnum.STATUS}</div>,
}));

vi.mock('./AGSEEditSteps/EditLocation', () => ({
  default: () => <div>{AGSEEditStepsEnum.LOCATION}</div>,
}));

vi.mock('./AGSEEditSteps/AddRemarks', () => ({
  default: () => <div>{AGSEEditStepsEnum.REMARKS}</div>,
}));

vi.mock('./AGSEEditSteps/ReviewChanges', () => ({
  default: () => <div>{AGSEEditStepsEnum.REVIEW}</div>,
}));

vi.mock('@store/griffin_api/agse/slices', () => ({
  useEditAGSEMutation: vi.fn(() => [
    vi.fn(), // mock mutation
    { isLoading: false }, // mock state object
  ]),
}));

const mockData: Record<string, IAGSE[]> = { KEY: [] };
const mockColumns: ColumnConfig<IAGSE>[] = [];
const mockSetOpen = vi.fn();
const mockSetShowSnackbar = vi.fn();
const mockSetUpdatedRows = vi.fn();

describe('AGSEMultiEditModal Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <AGSEMultiEdit
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
    expect(screen.queryByText('Edit AGSE')).not.toBeInTheDocument();
    expect(screen.queryByTestId('multi-edit-cancel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('multi-edit-next')).not.toBeInTheDocument();
  });
});

describe('AGSEMultiEditModal Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <AGSEMultiEdit
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
    expect(screen.getByText('Edit AGSE')).toBeInTheDocument();
    expect(screen.getByTestId('multi-edit-cancel')).toBeInTheDocument();
    expect(screen.getByTestId('multi-edit-next')).toBeInTheDocument();

    expect(screen.getByText(AGSEEditStepsEnum.SELECT)).toBeInTheDocument();
  });

  it('should navigate to the next step when the "Next" button is clicked', async () => {
    // Step 1
    expect(screen.getByText(AGSEEditStepsEnum.SELECT)).toBeInTheDocument();

    // Click next
    const nextButton = screen.getByTestId('multi-edit-next');
    await userEvent.click(nextButton);

    // Now on Step 2
    expect(screen.getByText(AGSEEditStepsEnum.REVIEW)).toBeInTheDocument();
  });

  it('should close when the "Cancel" button is clicked', async () => {
    const cancelButton = screen.getByTestId('multi-edit-cancel');
    await userEvent.click(cancelButton);
    expect(mockSetOpen).toBeCalled();
  });

  it('should close when the close "X" button is clicked', async () => {
    const closeButton = screen.getByTestId('close-multi-edit');
    await userEvent.click(closeButton);
    expect(mockSetOpen).toBeCalled();
  });
});
