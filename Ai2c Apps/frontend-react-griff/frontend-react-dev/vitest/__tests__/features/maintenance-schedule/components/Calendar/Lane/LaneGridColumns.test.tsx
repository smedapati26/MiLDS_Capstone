import dayjs from 'dayjs';
import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { LaneGridColumns } from '@features/maintenance-schedule/components/Calendar';
import { CalendarLaneGroupingEnum } from '@features/maintenance-schedule/models/CalendarLaneGroupingEnum';
import { CalenderViewEnum } from '@features/maintenance-schedule/models/CalenderViewEnum';
import { maintenanceScheduleReducer } from '@features/maintenance-schedule/slices';
import { DATE_FORMAT } from '@utils/constants';
import { getDateRangeDates } from '@utils/helpers';

import { IMaintenanceEvent } from '@store/griffin_api/events/models';

import '@testing-library/jest-dom';

/* LaneGridColumns Tests */
describe('LaneGridColumnsTest', () => {
  const today = dayjs('10-15-2024');
  const renderWithStore = (children: React.ReactNode) => {
    const store = configureStore({
      reducer: {
        maintenanceSchedule: maintenanceScheduleReducer,
      },
      preloadedState: {
        maintenanceSchedule: {
          today,
          calenderView: CalenderViewEnum.MONTHLY,
          dateRanges: getDateRangeDates(today.startOf('month'), today.endOf('month')),
          calendarLaneGrouping: CalendarLaneGroupingEnum.MODEL,
          calendarEventTypes: 'all',
        },
      },
    });

    return render(<Provider store={store}>{children}</Provider>);
  };

  const lane = {
    id: 1,
    location: {
      name: 'Test Airfield',
      short_name: 'Test AF',
      code: 'TSTA',
    },
    unitUic: 'AAAAAA',
    airframeFamilies: ['APACHE'],
    subordinateUnits: ['AAAA01', 'AAAA02'],
    name: 'CH-47F Hanger 1',
    isContractor: false,
    isInternal: true,
  };

  const events: Array<IMaintenanceEvent> = [
    {
      id: 1,
      startDate: today.subtract(1, 'week').format(DATE_FORMAT),
      endDate: today.add(1, 'week').format(DATE_FORMAT),
      laneId: 1,
      maintenanceType: 'insp',
      aircraft: {
        serialNumber: '1111111',
        currentUnitUic: 'AAAAAA',
        model: 'CH-47F',
        mds: 'CH-47FM3',
      },
      notes: null,
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
    },
  ];

  it('renders lane grid', () => {
    renderWithStore(<LaneGridColumns lane={lane} events={events} />);
    const component = screen.getByTestId('grid-columns');
    expect(component).toBeInTheDocument();
    expect(component).toHaveStyle('grid-template-columns: repeat(31, 1fr)');
  });

  it('does not display event', () => {
    const testEvents = [{ ...events[0], startDate: '06-01-2023', endDate: '06-30-2023' }];
    renderWithStore(<LaneGridColumns lane={lane} events={testEvents} />);
    const component = screen.getByTestId('grid-columns');
    expect(component).toBeInTheDocument();
    expect(component.children.length).toBe(0);
  });
});
