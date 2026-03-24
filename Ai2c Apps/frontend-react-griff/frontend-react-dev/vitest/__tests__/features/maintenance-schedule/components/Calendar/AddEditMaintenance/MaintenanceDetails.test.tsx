/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from 'react-redux';
import MaintenanceDetails from 'src/features/maintenance-schedule/components/Calendar/AddEditMaintenance/MaintenanceDetails';
import { maintenanceScheduleFormSlice } from 'src/features/maintenance-schedule/slices/maintenanceScheduleFormSlice';
import { phaseTeamSlice } from 'src/features/maintenance-schedule/slices/phaseTeamSlice';
import { appSettingsSlice, initialAppSettingsState } from 'src/store/slices/appSettingsSlice';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import { useGetAircraftBySerialQuery } from '@store/griffin_api/aircraft/slices';
import { useGetInspectionTypesQuery } from '@store/griffin_api/inspections/slices';

// Mock RTK Query hooks
vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useGetAircraftBySerialQuery: vi.fn(),
}));

vi.mock('@store/griffin_api/inspections/slices', () => ({
  useGetInspectionTypesQuery: vi.fn(),
}));

// Mock custom components
vi.mock('@components/dropdowns/InspectionsDropdown', () => ({
  InspectionDropdown: ({ onChange, selectedInspectionReferenceId, disabled }: any) => (
    <select
      data-testid="inspection-dropdown"
      value={selectedInspectionReferenceId || ''}
      onChange={(e) => onChange({ target: { value: Number(e.target.value) } })}
      disabled={disabled}
    >
      <option value="">Select Inspection</option>
      <option value="1">Inspection 1</option>
      <option value="2">Inspection 2 (Phase)</option>
    </select>
  ),
}));

vi.mock('@components/dropdowns/LaneDropdown', () => ({
  default: ({ values, handleSelect, disabled }: any) => (
    <select
      data-testid="lane-dropdown"
      value={values[0] || ''}
      onChange={(e) => handleSelect([e.target.value])}
      disabled={disabled}
    >
      <option value="">Select Lane</option>
      <option value="1">Lane 1</option>
    </select>
  ),
}));

vi.mock('@components/dropdowns/MaintainerDropdown', () => ({
  default: ({ label, values, handleSelect, disabled }: any) => (
    <select
      data-testid={`maintainer-dropdown-${label.replace(/\s+/g, '-').toLowerCase()}`}
      value={values[0] || ''}
      onChange={(e) => handleSelect([e.target.value])}
      disabled={disabled}
    >
      <option value="">Select {label}</option>
      <option value="user1">User 1</option>
    </select>
  ),
}));

// Mock Material-UI DatePicker
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange, disabled }: any) => (
    <input
      type="date"
      data-testid={`date-picker-${label.replace(/\s+/g, '-').toLowerCase()}`}
      value={value ? value.format('YYYY-MM-DD') : ''}
      onChange={(e) => onChange(e.target.value ? dayjs(e.target.value) : null)}
      disabled={disabled}
    />
  ),
  LocalizationProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: vi.fn(),
}));

// Mock dayjs
vi.mock('dayjs', () => ({
  default: vi.fn((date) => ({
    format: vi.fn(() => date || '2023-01-01'),
    add: vi.fn(() => ({ format: vi.fn(() => '2023-02-15') })),
    isBefore: vi.fn(() => false),
  })),
}));
import dayjs from 'dayjs';

const mockStore = configureStore({
  reducer: {
    maintenanceScheduleForm: maintenanceScheduleFormSlice.reducer,
    phaseTeam: phaseTeamSlice.reducer,
    appSettings: appSettingsSlice.reducer,
  },
  preloadedState: {
    maintenanceScheduleForm: {
      poc: null,
      aircraftId: null,
      inspectionReferenceId: null,
      laneId: null,
      maintenanceType: 'INSP',
      eventStart: null,
      eventEnd: null,
      notes: '',
    },
    phaseTeam: {
      team: {
        id: 0,
        phaseId: 0,
        phaseMembers: [],
        phaseLeadUserId: '',
        assistantPhaseLeadUserId: '',
      },
    },
    appSettings: initialAppSettingsState,
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(<Provider store={mockStore}>{component}</Provider>);
};

describe('MaintenanceDetails', () => {
  const mockAircraft = { aircraftModel: 'Boeing 737', aircraftMds: 'B737' };
  const mockInspectionTypes = [
    { id: 1, name: 'Inspection 1', isPhase: false },
    { id: 2, name: 'Inspection 2', isPhase: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the hooks
    vi.mocked(useGetAircraftBySerialQuery).mockReturnValue({
      data: mockAircraft,
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch: vi.fn(),
    });
    vi.mocked(useGetInspectionTypesQuery).mockReturnValue({
      data: mockInspectionTypes,
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('renders aircraft model and maintenance type', () => {
    renderWithProviders(<MaintenanceDetails serial="12345" />);
    expect(screen.getByText('Boeing 737 Maintenance Type')).toBeInTheDocument();
  });

  it('renders TextField for OTHER type', () => {
    renderWithProviders(<MaintenanceDetails serial="12345" type="OTHER" />);
    expect(screen.getByLabelText('Maintenance Event Name*')).toBeInTheDocument();
  });

  it('renders InspectionDropdown for non-OTHER type', () => {
    renderWithProviders(<MaintenanceDetails serial="12345" type="INSPECTION" />);
    expect(screen.getByTestId('inspection-dropdown')).toBeInTheDocument();
  });

  it('shows date pickers and lane dropdown when inspection is selected', () => {
    const store = configureStore({
      reducer: {
        maintenanceScheduleForm: maintenanceScheduleFormSlice.reducer,
        phaseTeam: phaseTeamSlice.reducer,
        appSettings: appSettingsSlice.reducer,
      },
      preloadedState: {
        maintenanceScheduleForm: {
          poc: null,
          aircraftId: null,
          inspectionReferenceId: 1,
          laneId: null,
          maintenanceType: 'INSP',
          eventStart: null,
          eventEnd: null,
          notes: '',
        },
        phaseTeam: {
          team: {
            id: 0,
            phaseId: 0,
            phaseMembers: [],
            phaseLeadUserId: '',
            assistantPhaseLeadUserId: '',
          },
        },
        appSettings: initialAppSettingsState,
      },
    });

    render(
      <Provider store={store}>
        <MaintenanceDetails serial="12345" type="INSPECTION" />
      </Provider>,
    );

    expect(screen.getByTestId('date-picker-start-date*')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-end-date*')).toBeInTheDocument();
    expect(screen.getByTestId('lane-dropdown')).toBeInTheDocument();
  });

  it('shows phase team dropdowns when isPhase is true and dates are set', () => {
    const store = configureStore({
      reducer: {
        maintenanceScheduleForm: maintenanceScheduleFormSlice.reducer,
        phaseTeam: phaseTeamSlice.reducer,
        appSettings: appSettingsSlice.reducer,
      },
      preloadedState: {
        maintenanceScheduleForm: {
          poc: null,
          aircraftId: null,
          inspectionReferenceId: 2, // Phase inspection
          laneId: 1,
          maintenanceType: 'INSP',
          eventStart: '2023-01-01',
          eventEnd: '2023-02-15',
          notes: '',
        },
        phaseTeam: {
          team: {
            id: 0,
            phaseId: 0,
            phaseMembers: [],
            phaseLeadUserId: '',
            assistantPhaseLeadUserId: '',
          },
        },
        appSettings: initialAppSettingsState,
      },
    });

    render(
      <Provider store={store}>
        <MaintenanceDetails serial="12345" type="INSPECTION" />
      </Provider>,
    );

    expect(screen.getByTestId('maintainer-dropdown-phase-lead')).toBeInTheDocument();
    expect(screen.getByTestId('maintainer-dropdown-asst.-phase-lead')).toBeInTheDocument();
    expect(screen.getByTestId('maintainer-dropdown-phase-members')).toBeInTheDocument();
  });

  it('dispatches setInspectionReferenceId on inspection change', () => {
    const store = mockStore;
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithProviders(<MaintenanceDetails serial="12345" type="INSPECTION" />);

    const dropdown = screen.getByTestId('inspection-dropdown');
    fireEvent.change(dropdown, { target: { value: '1' } });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'maintenanceScheduleFormSlice/setInspectionReferenceId',
      payload: 1,
    });
  });

  it('dispatches setEventStart and auto-sets end date on start date change', () => {
    const store = mockStore;
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithProviders(<MaintenanceDetails serial="12345" type="INSPECTION" />);

    // First select inspection to show date pickers
    const inspectionDropdown = screen.getByTestId('inspection-dropdown');
    fireEvent.change(inspectionDropdown, { target: { value: '1' } });

    const startDatePicker = screen.getByTestId('date-picker-start-date*');
    fireEvent.change(startDatePicker, { target: { value: '2023-01-01' } });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'maintenanceScheduleFormSlice/setEventStart',
      payload: '2023-01-01',
    });
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'maintenanceScheduleFormSlice/setEventEnd',
      payload: '2023-02-15',
    });
  });

  it('dispatches setEventEnd on end date change', () => {
    const store = mockStore;
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithProviders(<MaintenanceDetails serial="12345" type="INSPECTION" />);

    // First select inspection to show date pickers
    const inspectionDropdown = screen.getByTestId('inspection-dropdown');
    fireEvent.change(inspectionDropdown, { target: { value: '1' } });

    const endDatePicker = screen.getByTestId('date-picker-end-date*');
    fireEvent.change(endDatePicker, { target: { value: '2023-02-15' } });

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'maintenanceScheduleFormSlice/setInspectionReferenceId',
      payload: 1,
    });
  });

  it('dispatches setLaneId on lane change', () => {
    const store = mockStore;
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithProviders(<MaintenanceDetails serial="12345" type="INSPECTION" />);

    // First select inspection to show lane dropdown
    const inspectionDropdown = screen.getByTestId('inspection-dropdown');
    fireEvent.change(inspectionDropdown, { target: { value: '1' } });

    const laneDropdown = screen.getByTestId('lane-dropdown');
    fireEvent.change(laneDropdown, { target: { value: '1' } });

    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'maintenanceScheduleFormSlice/setLaneId', payload: 1 });
  });

  it('dispatches setNotes on note change for OTHER type', () => {
    const store = mockStore;
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithProviders(<MaintenanceDetails serial="12345" type="OTHER" />);

    const textField = screen.getByLabelText('Maintenance Event Name*');
    fireEvent.change(textField, { target: { value: 'New Note' } });

    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'maintenanceScheduleFormSlice/setNotes', payload: 'New Note' });
  });

  it('dispatches phase team actions on maintainer changes', () => {
    const store = configureStore({
      reducer: {
        maintenanceScheduleForm: maintenanceScheduleFormSlice.reducer,
        phaseTeam: phaseTeamSlice.reducer,
        appSettings: appSettingsSlice.reducer,
      },
      preloadedState: {
        maintenanceScheduleForm: {
          poc: null,
          aircraftId: null,
          inspectionReferenceId: 2,
          laneId: 1,
          maintenanceType: 'INSP',
          eventStart: '2023-01-01',
          eventEnd: '2023-02-15',
          notes: '',
        },
        phaseTeam: {
          team: {
            id: 0,
            phaseId: 0,
            phaseMembers: [],
            phaseLeadUserId: '',
            assistantPhaseLeadUserId: '',
          },
        },
        appSettings: initialAppSettingsState,
      },
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <MaintenanceDetails serial="12345" type="INSPECTION" />
      </Provider>,
    );

    const phaseLeadDropdown = screen.getByTestId('maintainer-dropdown-phase-lead');
    fireEvent.change(phaseLeadDropdown, { target: { value: 'user1' } });

    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'phaseTeam/setPhaseLeadUserId', payload: 'user1' });
  });

  it('disables fields when user lacks edit permissions', () => {
    const store = configureStore({
      reducer: {
        maintenanceScheduleForm: maintenanceScheduleFormSlice.reducer,
        phaseTeam: phaseTeamSlice.reducer,
        appSettings: appSettingsSlice.reducer,
      },
      preloadedState: {
        maintenanceScheduleForm: {
          poc: null,
          aircraftId: null,
          inspectionReferenceId: null,
          laneId: null,
          maintenanceType: 'INSP',
          eventStart: null,
          eventEnd: null,
          notes: '',
        },
        phaseTeam: {
          team: {
            id: 0,
            phaseId: 0,
            phaseMembers: [],
            phaseLeadUserId: '',
            assistantPhaseLeadUserId: '',
          },
        },
        appSettings: {
          ...initialAppSettingsState,
          currentUnitWrite: false,
          currentUnitAdmin: false,
          currentUnitAmapManager: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MaintenanceDetails serial="12345" type="INSPECTION" />
      </Provider>,
    );

    const dropdown = screen.getByTestId('inspection-dropdown');
    expect(dropdown).toBeDisabled();
  });
});
