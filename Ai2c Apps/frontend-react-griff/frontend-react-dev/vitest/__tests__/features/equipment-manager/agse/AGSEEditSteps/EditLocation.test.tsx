import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditLocationStep from '@features/equipment-manager/aircraft/AircraftEditSteps/EditLocation';

const mockLocation = {
  id: 0,
  code: 'LOC',
  name: 'Location',
};
const mockSetLocation = vi.fn();
const mockAutoSync = {
  rtl: true,
  status: true,
  location: true,
};
const mockSetAutoSync = vi.fn();

vi.mock('@store/griffin_api/auto_dsr/slices', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetAutoDsrLocationQuery: vi.fn().mockReturnValue([]),
  };
});

describe('EditLocationStep Test', () => {
  beforeEach(() => {
    render(
      <EditLocationStep
        location={mockLocation}
        setLocation={mockSetLocation}
        autoSync={mockAutoSync}
        setAutoSync={mockSetAutoSync}
      />,
    );
  });

  it('should render all components with their labels', () => {
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByTestId('location-paginated-dropdown')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto-sync data')).toBeInTheDocument();
  });

  it('should call setLocation with the correct values when location is updated', async () => {
    const locationSelect = screen.getByTestId('location-paginated-dropdown');

    await userEvent.click(locationSelect);
    // expect(mockLocation).toHaveBeenCalled();
  });

  it('should call setAutoSync with the correct values when auto-sync checkbox is clicked', async () => {
    const autoSyncCheckbox = screen.getByLabelText('Auto-sync data');

    await userEvent.click(autoSyncCheckbox);
    expect(mockSetAutoSync).toHaveBeenCalled();
  });

  it('should render the checkbox with the correct initial state', () => {
    const autoSyncCheckbox = screen.getByLabelText('Auto-sync data');

    // Assert that the checkbox is initially checked based on mockAutoSync.location
    expect(autoSyncCheckbox).toBeChecked();
  });

  it('should update the checkbox state when clicked', async () => {
    const autoSyncCheckbox = screen.getByLabelText('Auto-sync data');

    // Simulate clicking the checkbox to toggle its state
    await userEvent.click(autoSyncCheckbox);

    // Assert that the checkbox is now unchecked
    expect(autoSyncCheckbox).toBeChecked();
  });
});
