// src/tests/MultiEditModal.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModsDetailsModal from '@features/equipment-manager/mods/ModsDetailsModal';

import { IModification, mapToIModification } from '@store/griffin_api/mods/models';

import { mockModificationsDto } from '@vitest/mocks/griffin_api_handlers/mods/mock_data';

vi.mock('@store/griffin_api/mods/slices', () => ({
  useDeleteModificationMutation: vi.fn(() => [
    vi.fn(), // mock mutation
    { isLoading: false }, // mock state object
  ]),
  useEditModificationsMutation: vi.fn(() => [
    vi.fn(), // mock mutation
    { isLoading: false }, // mock state object
  ]),
}));

const mockData: IModification[] = mockModificationsDto.map(mapToIModification);
const mockSetOpen = vi.fn();
const mockModelType = 'Bambi Bucket';

describe('ModsDetailsModal Closed Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <ModsDetailsModal 
          data={mockData} 
          open={false}
          setOpen={mockSetOpen}
          model={mockModelType}
          isLoading={false}
        />
      </ThemedTestingComponent>
    );
  });

  it('should not be visible when open is false', () => {
    expect(screen.queryByText(`${mockModelType} Details`)).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-mods-details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('close-mods-details')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('search-bar')).not.toBeInTheDocument();
  });
});


describe('ModsDetailsModal Tests', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <ModsDetailsModal 
          data={mockData} 
          open={true}
          setOpen={mockSetOpen}
          model={mockModelType}
          isLoading={false}
        />
      </ThemedTestingComponent>
    );
  });

  it('Renders Relevant Components for modal', () => {
    expect(screen.getByText(`${mockModelType} Details`)).toBeInTheDocument();
    expect(screen.getByTestId('edit-mods-details')).toBeInTheDocument();
    expect(screen.getByTestId('close-mods-details')).toBeInTheDocument();
    expect(screen.getByLabelText('search-bar')).toBeInTheDocument();
  });

  it('Renders all table headers', () => {
    expect(screen.getByTestId('mod-checkbox-all')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
  
  it('should close the modal when the "Close" button is clicked', async () => {
    const closeButton = screen.getByTestId('close-mods-details');
    await userEvent.click(closeButton);
    expect(mockSetOpen).toBeCalledWith(false);
  });
  
  it('should open new modal when the "Edit" button is clicked', async () => {
    expect(screen.queryByText(`Edit ${mockModelType}`)).not.toBeInTheDocument();
    
    const mod1Checkbox = screen.getByTestId('mod-checkbox-1');
    await userEvent.click(mod1Checkbox);

    const editButton = screen.getByTestId('edit-mods-details');
    await userEvent.click(editButton);
  });
});
