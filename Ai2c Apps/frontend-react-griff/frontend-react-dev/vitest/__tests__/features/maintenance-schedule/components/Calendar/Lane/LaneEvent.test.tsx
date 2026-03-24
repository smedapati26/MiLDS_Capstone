import { vi } from 'vitest';

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';

import { LaneEvent } from '@features/maintenance-schedule/components/Calendar/Lane/LaneEvent';
import { IMaintenanceEventExtended } from '@features/maintenance-schedule/components/Calendar/Lane/LaneGridColumns';
import { CalenderViewEnum } from '@features/maintenance-schedule/models';
import { maintenanceScheduleReducer } from '@features/maintenance-schedule/slices';

import { IMaintenanceLane } from '@store/griffin_api/events/models';

import { ProviderWrapper } from '@vitest/helpers/ProviderWrapper';
import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

import '@testing-library/jest-dom';

// Mock dayjs
vi.mock('dayjs', () => ({
  default: vi.fn((date) => ({
    format: vi.fn((formatStr) => {
      if (formatStr === 'DDMMMYY') {
        if (date === '2024-10-10') return '10OCT24';
        if (date === '2024-10-20') return '20OCT24';
        return '15OCT24';
      }
      return 'mocked';
    }),
    isBefore: vi.fn(() => false),
    isAfter: vi.fn(() => false),
  })),
}));

// Mock useAppDispatch
const mockDispatch = vi.fn();
vi.mock('@store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

describe('LaneEvent', () => {
  const mockLane: IMaintenanceLane = {
    id: 1,
    location: {
      name: 'Test Airfield',
      shortName: 'Test AF',
      code: 'TSTA',
    },
    unitUic: 'AAAAAA',
    airframeFamilies: ['APACHE'],
    subordinateUnits: ['AAAA01'],
    name: 'CH-47F Hanger 1',
    isContractor: false,
    isInternal: true,
  };

  const baseEvent: IMaintenanceEventExtended = {
    id: 1,
    startDate: '2024-10-10',
    endDate: '2024-10-20',
    laneId: 1,
    maintenanceType: 'insp',
    aircraft: {
      serialNumber: '1111111',
      currentUnitUic: 'AAAAAA',
      model: 'CH-47F',
      mds: 'CH-47FM3',
    },
    notes: 'Test Notes',
    poc: '1501619902',
    altPoc: null,
    inspection: null,
    inspectionReference: {
      id: 100,
      commonName: '500HR PHASE',
      code: 'A755',
      isPhase: false,
    },
    isPhase: false,
    hasConflict: false,
    isBeforeDateRange: false,
    isAfterDateRange: false,
    color: '#000000',
    display: true,
    gridColStart: 1,
    gridColEnd: 11,
    hasOverlap: false,
  };

  const renderWithProviders = (component: React.ReactNode) => {
    const store = configureStore({
      reducer: {
        maintenanceSchedule: maintenanceScheduleReducer,
      },
    });

    return render(
      <ProviderWrapper store={store}>
        <ThemedTestingComponent mode="light">{component}</ThemedTestingComponent>
      </ProviderWrapper>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the component with basic props', () => {
    renderWithProviders(<LaneEvent lane={mockLane} event={baseEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    expect(screen.getByTestId('event-container')).toBeInTheDocument();
    expect(screen.getByTestId('clickable-container')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    renderWithProviders(<LaneEvent lane={mockLane} event={baseEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    expect(screen.getByText('111 , 500HR PHASE, CH-47F, 10OCT24 - 20OCT24')).toBeInTheDocument();
  });

  it('displays title with notes when inspectionReference is null', () => {
    const eventWithoutInspection = { ...baseEvent, inspectionReference: null };
    renderWithProviders(
      <LaneEvent lane={mockLane} event={eventWithoutInspection} calenderView={CalenderViewEnum.MONTHLY} />,
    );
    expect(screen.getByText('111 , Test Notes, CH-47F, 10OCT24 - 20OCT24')).toBeInTheDocument();
  });

  it('applies correct border styles for non-conflict event', () => {
    renderWithProviders(<LaneEvent lane={mockLane} event={baseEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    const container = screen.getByTestId('event-container');
    expect(container).toHaveStyle('border-color: #000000');
    expect(container).toHaveStyle('border-radius: 3px');
    expect(container).toHaveStyle('border-style: solid');
  });

  it('applies correct border styles for conflict event', () => {
    const conflictEvent = { ...baseEvent, hasConflict: true };
    renderWithProviders(<LaneEvent lane={mockLane} event={conflictEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    const container = screen.getByTestId('event-container');
    expect(container).toHaveStyle('border-color: rgb(236, 0, 0)'); // theme.palette.error.main
  });

  it('applies rounded border for phase event', () => {
    const phaseEvent = { ...baseEvent, isPhase: true };
    renderWithProviders(<LaneEvent lane={mockLane} event={phaseEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    const container = screen.getByTestId('event-container');
    expect(container).toHaveStyle('border-radius: 25px');
  });

  it('applies dashed border for outside unit', () => {
    const outsideEvent = { ...baseEvent, aircraft: { ...baseEvent.aircraft, currentUnitUic: 'BBBBBB' } };
    renderWithProviders(<LaneEvent lane={mockLane} event={outsideEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    const container = screen.getByTestId('event-container');
    expect(container).toHaveStyle('border-style: dashed');
  });

  it('applies correct border widths for before date range', () => {
    const beforeEvent = { ...baseEvent, isBeforeDateRange: true };
    renderWithProviders(<LaneEvent lane={mockLane} event={beforeEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    const container = screen.getByTestId('event-container');
    expect(container).toHaveStyle('border-left-width: 0px');
  });

  it('applies correct border widths for after date range', () => {
    const afterEvent = { ...baseEvent, isAfterDateRange: true };
    renderWithProviders(<LaneEvent lane={mockLane} event={afterEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    const container = screen.getByTestId('event-container');
    expect(container).toHaveStyle('border-right-width: 0px');
  });

  it('dispatches actions on click', async () => {
    renderWithProviders(<LaneEvent lane={mockLane} event={baseEvent} calenderView={CalenderViewEnum.MONTHLY} />);
    const container = screen.getByTestId('clickable-container');
    fireEvent.click(container);

    // Fast-forward timers
    vi.advanceTimersByTime(250);

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'maintenanceEditEventSlice/setActiveEvent', payload: '1' });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'maintenanceLane/setActiveFormType', payload: 'maint' });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'maintenanceEditEventSlice/setIsMaintenanceEditForm',
      payload: true,
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'maintenanceScheduleFormSlice/setMaintenanceType',
      payload: 'insp',
    });
  });
});
