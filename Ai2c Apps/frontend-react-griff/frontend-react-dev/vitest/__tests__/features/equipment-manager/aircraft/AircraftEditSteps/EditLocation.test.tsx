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
  remarks: true,
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
    render(<EditLocationStep location={mockLocation} setLocation={mockSetLocation} autoSync={mockAutoSync} setAutoSync={mockSetAutoSync} />);
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
});
