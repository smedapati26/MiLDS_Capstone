/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AddEditMaintenanceForm from '@features/maintenance-schedule/components/Calendar/AddEditMaintenance/AddEditMaintenanceForm';
import * as maintenanceSlices from '@features/maintenance-schedule/slices';
import * as maintenanceEditEventSlice from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';
import * as phaseTeamSlice from '@features/maintenance-schedule/slices/phaseTeamSlice';

import * as appSettingsSlice from '@store/slices/appSettingsSlice';
import { store } from '@store/store';

interface AircraftSerialDropdownProps {
  values: string[];
  handleSelect: (values: string[]) => void;
  disabled: boolean;
}

interface MaintenanceDetailsProps {
  serial: string;
  type: string;
}

// Mock child components
vi.mock('@components/dropdowns', () => ({
  AircraftSerialDropdown: ({ values, handleSelect, disabled }: AircraftSerialDropdownProps) => (
    <div data-testid="aircraft-serial-dropdown">
      <select
        data-testid="aircraft-select"
        value={values[0] || ''}
        onChange={(e) => handleSelect([e.target.value])}
        disabled={disabled}
      >
        <option value="">Select Aircraft</option>
        <option value="ABC123">ABC123 - Aircraft 1</option>
      </select>
    </div>
  ),
}));

vi.mock('@features/maintenance-schedule/components/Calendar/AddEditMaintenance/MaintenanceDetails', () => ({
  default: ({ serial, type }: MaintenanceDetailsProps) => (
    <div data-testid="maintenance-details">
      Maintenance Details for {serial} - {type}
    </div>
  ),
}));

// Mock RTK Query hooks
vi.mock('@store/amap_api/personnel/slices', () => ({
  useAddPhaseTeamMutation: () => [vi.fn().mockResolvedValue({})],
  useGetPhaseTeamQuery: () => ({ data: null, error: null }),
  useUpdatePhaseTeamMutation: () => [vi.fn().mockResolvedValue({})],
}));

vi.mock('@store/griffin_api/events/slices', () => ({
  useAddMaintenanceEventMutation: () => {
    const trigger = vi.fn();
    const promise = Promise.resolve({ id: 1 }) as any;
    promise.unwrap = () => promise;
    trigger.mockReturnValue(promise);
    return [trigger];
  },
  useDeleteMaintenanceEventMutation: () => {
    const trigger = vi.fn();
    const promise = Promise.resolve({}) as any;
    promise.unwrap = () => promise;
    trigger.mockReturnValue(promise);
    return [trigger];
  },
  useGetMaintenanceEventQuery: () => ({ data: null }),
  useUpdateMaintenanceEventMutation: () => {
    const trigger = vi.fn();
    const promise = Promise.resolve({}) as any;
    promise.unwrap = () => promise;
    trigger.mockReturnValue(promise);
    return [trigger];
  },
}));

// Mock Redux selectors
vi.mock('@store/hooks', () => ({
  useAppDispatch: vi.fn(() => vi.fn()),
  useAppSelector: vi.fn((selector) => selector()),
}));

// Mock Redux actions and selectors
vi.mock('@features/maintenance-schedule/slices', () => ({
  resetMaintenanceLaneSlice: vi.fn(),
  resetMaintenanceScheduleForm: vi.fn(),
  selectAircraftSerialId: vi.fn(() => ''),
  selectEventEnd: vi.fn(() => null),
  selectEventStart: vi.fn(() => null),
  selectInspectionReferenceId: vi.fn(() => null),
  selectLaneId: vi.fn(() => null),
  selectMaintenanceType: vi.fn(() => ''),
  selectNotes: vi.fn(() => ''),
  setAircraftSerialId: vi.fn(),
  setEventEnd: vi.fn(),
  setEventStart: vi.fn(),
  setInspectionReferenceId: vi.fn(),
  setLaneId: vi.fn(),
  setMaintenanceType: vi.fn(),
  setNotes: vi.fn(),
}));

vi.mock('@features/maintenance-schedule/slices/maintenanceEditEventSlice', () => ({
  selectActiveEvent: vi.fn(() => null),
}));

vi.mock('@features/maintenance-schedule/slices/phaseTeamSlice', () => ({
  resetPhaseTeam: vi.fn(),
  selectPhaseTeam: vi.fn(() => null),
  setPhaseTeam: vi.fn(),
}));

vi.mock('@store/slices/appSettingsSlice', () => ({
  selectCurrentUic: vi.fn(() => 'U123'),
  selectCurrentUnitAdmin: vi.fn(() => false),
  selectCurrentUnitWrite: vi.fn(() => true),
  selectCurrentUnitAmapManager: vi.fn(() => false),
}));

const renderComponent = (props = {}) =>
  render(
    <Provider store={store}>
      <AddEditMaintenanceForm onCancel={vi.fn()} {...props} />
    </Provider>,
  );

describe('<AddEditMaintenanceForm />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default values
    vi.mocked(maintenanceSlices.selectAircraftSerialId).mockReturnValue('');
    vi.mocked(maintenanceSlices.selectEventEnd).mockReturnValue(null);
    vi.mocked(maintenanceSlices.selectEventStart).mockReturnValue(null);
    vi.mocked(maintenanceSlices.selectInspectionReferenceId).mockReturnValue(null);
    vi.mocked(maintenanceSlices.selectLaneId).mockReturnValue(null);
    vi.mocked(maintenanceSlices.selectMaintenanceType).mockReturnValue('');
    vi.mocked(maintenanceSlices.selectNotes).mockReturnValue('');
    vi.mocked(appSettingsSlice.selectCurrentUnitWrite).mockReturnValue(true);
    vi.mocked(appSettingsSlice.selectCurrentUnitAdmin).mockReturnValue(false);
    vi.mocked(appSettingsSlice.selectCurrentUnitAmapManager).mockReturnValue(false);
    vi.mocked(maintenanceEditEventSlice.selectActiveEvent).mockReturnValue(null);
    vi.mocked(phaseTeamSlice.selectPhaseTeam).mockReturnValue(null);
    vi.mocked(appSettingsSlice.selectCurrentUic).mockReturnValue('U123');
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Aircraft')).toBeInTheDocument();
  });

  it('displays aircraft dropdown', () => {
    renderComponent();
    expect(screen.getByTestId('aircraft-serial-dropdown')).toBeInTheDocument();
  });

  it('shows maintenance details when aircraft is selected', () => {
    vi.mocked(maintenanceSlices.selectAircraftSerialId).mockReturnValue('ABC123');
    renderComponent();
    expect(screen.getByTestId('maintenance-details')).toBeInTheDocument();
  });

  it('disables form when user lacks permissions', () => {
    vi.mocked(appSettingsSlice.selectCurrentUnitWrite).mockReturnValue(false);
    vi.mocked(appSettingsSlice.selectCurrentUnitAdmin).mockReturnValue(false);
    vi.mocked(maintenanceSlices.selectAircraftSerialId).mockReturnValue('ABC123');
    renderComponent();
    expect(screen.getByTestId('permission-warning')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    vi.mocked(maintenanceSlices.selectAircraftSerialId).mockReturnValue('ABC123');
    renderComponent({ onCancel });

    fireEvent.click(screen.getByTestId('cancel-maintenance-button'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows delete button when buttonLabel is Update', () => {
    vi.mocked(maintenanceSlices.selectAircraftSerialId).mockReturnValue('ABC123');
    renderComponent({ buttonLabel: 'Update' });
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('opens delete confirmation dialog', () => {
    vi.mocked(maintenanceSlices.selectAircraftSerialId).mockReturnValue('ABC123');
    vi.mocked(maintenanceSlices.selectLaneId).mockReturnValue(1);
    vi.mocked(maintenanceSlices.selectEventStart).mockReturnValue('2023-01-01');
    vi.mocked(maintenanceSlices.selectEventEnd).mockReturnValue('2023-01-02');
    renderComponent({ buttonLabel: 'Update' });
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Confirm Event Deletion')).toBeInTheDocument();
  });

  it('calls handleAddClick when add button is clicked', async () => {
    const onSubmit = vi.fn();
    vi.mocked(maintenanceSlices.selectAircraftSerialId).mockReturnValue('ABC123');
    vi.mocked(maintenanceSlices.selectEventStart).mockReturnValue('2023-01-01');
    vi.mocked(maintenanceSlices.selectEventEnd).mockReturnValue('2023-01-02');
    vi.mocked(maintenanceSlices.selectLaneId).mockReturnValue(1);
    vi.mocked(maintenanceSlices.selectMaintenanceType).mockReturnValue('INSP');

    renderComponent({ onSubmit });

    fireEvent.click(screen.getByTestId('add-maintenance-button'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
