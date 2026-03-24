/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { vi } from 'vitest';

import { fireEvent } from '@testing-library/react';

import { CalenderViewEnum } from '@features/maintenance-schedule/models';
import { CalendarLaneGroupingEnum } from '@features/maintenance-schedule/models/CalendarLaneGroupingEnum';

import { renderWithProviders } from '@vitest/helpers/renderWithProviders';

// Mock the store hooks
vi.mock('@store/hooks', () => ({
  useAppDispatch: vi.fn(() => vi.fn()),
  useAppSelector: vi.fn((selector) => selector()),
}));
import { useAppDispatch } from '@store/hooks';
const mockUseAppDispatch = vi.mocked(useAppDispatch);

// Mock the RTK Query hook
vi.mock('@store/griffin_api/events/slices', () => ({
  useGetLanesQuery: vi.fn(),
}));
import { useGetLanesQuery } from '@store/griffin_api/events/slices';
const mockUseGetLanesQuery = vi.mocked(useGetLanesQuery);

// Mock the maintenance schedule slices
vi.mock('@features/maintenance-schedule/slices', async () => {
  const actual = await vi.importActual('@features/maintenance-schedule/slices');
  return {
    ...actual,
    selectCalendarLaneGrouping: vi.fn(),
    selectCalenderView: vi.fn(),
    setCalenderView: vi.fn(),
  };
});
import { selectCalendarLaneGrouping, selectCalenderView, setCalenderView } from '@features/maintenance-schedule/slices';
const mockSelectCalendarLaneGrouping = vi.mocked(selectCalendarLaneGrouping);
const mockSelectCalenderView = vi.mocked(selectCalenderView);
const mockSetCalenderView = vi.mocked(setCalenderView);

// Mock the app settings slice
vi.mock('@store/slices/appSettingsSlice', () => ({
  selectCurrentUic: vi.fn(),
}));
import { selectCurrentUic } from '@store/slices/appSettingsSlice';
const mockSelectCurrentUic = vi.mocked(selectCurrentUic);

// Mock child components to simplify testing
vi.mock('@features/maintenance-schedule/components/Calendar/MaintenanceCalender/CalenderEvents', () => ({
  default: () => <div data-testid="calender-events" />,
}));
vi.mock('@features/maintenance-schedule/components/Calendar/MaintenanceCalender/CalenderFilter', () => ({
  default: () => <div data-testid="calender-filter" />,
}));
vi.mock('@features/maintenance-schedule/components/Calendar/MaintenanceCalender/CalenderViewDisplay', () => ({
  default: () => <div data-testid="calender-view-display" />,
}));
vi.mock('@features/maintenance-schedule/components/Calendar/MaintenanceCalender/DateRangeNavigation', () => ({
  default: () => <div data-testid="date-range-navigation" />,
}));
vi.mock('@features/maintenance-schedule/components/Calendar/Lane/LaneGridColumns', () => ({
  LaneGridColumns: () => <div data-testid="lane-grid-columns" />,
}));
vi.mock('@features/maintenance-schedule/components/Calendar/Lane/LaneGroup', () => ({
  LaneGroupLeft: ({ children }: { children: React.ReactNode }) => <div data-testid="lane-group-left">{children}</div>,
  LaneGroupRight: ({ children }: { children: React.ReactNode }) => <div data-testid="lane-group-right">{children}</div>,
}));
vi.mock('@features/maintenance-schedule/components/Calendar/Lane/LaneTitle', () => ({
  LaneTitle: ({ lane }: { lane: { name: string } }) => <div data-testid="lane-title">{lane.name}</div>,
}));

import { MaintenanceCalender } from '@features/maintenance-schedule/components/Calendar/MaintenanceCalender/MaintenanceCalender';

describe('MaintenanceCalender', () => {
  const mockEvents = [
    {
      id: 1,
      laneId: 1,
      startDate: '2025-11-03',
      endDate: '2025-11-30',
      maintenanceType: 'insp' as 'insp' | 'other',
      notes: null,
      poc: null,
      altPoc: null,
      aircraft: {
        serialNumber: 'A123456',
        currentUnitUic: 'TEST_UIC',
        model: 'UH-60',
        mds: 'Apache',
      },
      inspection: null,
      inspectionReference: null,
      isPhase: false,
    },
  ];

  const mockLanes = [
    {
      id: 1,
      name: 'Test Lane',
      unitUic: 'TEST_UIC',
      airframeFamilies: ['F-35'],
      location: { name: 'Test Location' },
    },
  ];

  beforeEach(() => {
    mockSelectCurrentUic.mockReturnValue('TEST_UIC');
    mockSelectCalenderView.mockReturnValue(CalenderViewEnum.ANNUAL);
    mockSelectCalendarLaneGrouping.mockReturnValue(CalendarLaneGroupingEnum.LANE_UNIT);
    (mockUseGetLanesQuery as any).mockReturnValue({
      data: mockLanes,
      isSuccess: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the calendar container', () => {
    const { getByTestId } = renderWithProviders(<MaintenanceCalender events={mockEvents} />);

    expect(getByTestId('maintenance-calender')).toBeInTheDocument();
  });

  it('renders skeleton when lanes are loading', () => {
    (mockUseGetLanesQuery as unknown as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = renderWithProviders(<MaintenanceCalender events={mockEvents} />);

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument(); // Skeleton is rendered
  });

  it('renders lane groups when lanes are available', () => {
    const { getByTestId } = renderWithProviders(<MaintenanceCalender events={mockEvents} />);

    expect(getByTestId('lane-group-left')).toBeInTheDocument();
    expect(getByTestId('lane-group-right')).toBeInTheDocument();
  });

  it('handles wheel event for zooming in', () => {
    (mockUseAppDispatch as any).mockReturnValue(mockSetCalenderView);

    const { getByTestId } = renderWithProviders(<MaintenanceCalender events={mockEvents} />);

    const container = getByTestId('maintenance-calender');
    fireEvent.wheel(container, { deltaY: -100, ctrlKey: true });

    expect(mockSetCalenderView).toHaveBeenCalledWith(CalenderViewEnum.MONTHLY);
  });

  it('handles wheel event for zooming in from monthly to weekly', () => {
    (mockUseAppDispatch as any).mockReturnValue(mockSetCalenderView);
    mockSelectCalenderView.mockReturnValue(CalenderViewEnum.MONTHLY);

    const { getByTestId } = renderWithProviders(<MaintenanceCalender events={mockEvents} />);

    const container = getByTestId('maintenance-calender');
    fireEvent.wheel(container, { deltaY: -100, ctrlKey: true });

    expect(mockSetCalenderView).toHaveBeenCalledWith(CalenderViewEnum.WEEKLY);
  });

  it('handles wheel event for zooming out from weekly to monthly', () => {
    (mockUseAppDispatch as any).mockReturnValue(mockSetCalenderView);
    mockSelectCalenderView.mockReturnValue(CalenderViewEnum.WEEKLY);

    const { getByTestId } = renderWithProviders(<MaintenanceCalender events={mockEvents} />);

    const container = getByTestId('maintenance-calender');
    fireEvent.wheel(container, { deltaY: 100, ctrlKey: true });

    expect(mockSetCalenderView).toHaveBeenCalledWith(CalenderViewEnum.MONTHLY);
  });

  it('handles wheel event for zooming out', () => {
    (mockUseAppDispatch as any).mockReturnValue(mockSetCalenderView);
    mockSelectCalenderView.mockReturnValue(CalenderViewEnum.MONTHLY);

    const { getByTestId } = renderWithProviders(<MaintenanceCalender events={mockEvents} />);

    const container = getByTestId('maintenance-calender');
    fireEvent.wheel(container, { deltaY: 100, ctrlKey: true });

    expect(mockSetCalenderView).toHaveBeenCalledWith(CalenderViewEnum.ANNUAL);
  });
});
