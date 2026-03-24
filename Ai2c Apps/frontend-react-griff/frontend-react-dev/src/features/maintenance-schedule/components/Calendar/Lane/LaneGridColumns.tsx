import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { Box } from '@mui/material';

import { DATE_FORMAT } from '@utils/constants';
import { dateRangesOverlap } from '@utils/helpers';

import { IMaintenanceEvent, IMaintenanceLane } from '@store/griffin_api/events/models';
import { useAppSelector } from '@store/hooks';

import {
  selectCalendarEventTypes,
  selectCalenderView,
  selectDateRanges,
} from '../../../slices/maintenanceScheduleSlice';
import { LaneEvent } from './LaneEvent';

/**
 * Extended interface for maintenance events, adding additional properties
 * for display control and grid positioning.
 *
 * @extends IMaintenanceEvent
 *
 * @property {boolean} display - Indicates whether the event should be displayed.
 * @property {boolean} isBeforeDateRange - Indicates if the event occurs before the date range.
 * @property {boolean} isAfterDateRange - Indicates if the event occurs after the date range.
 * @property {number} gridColStart - The starting column position in the grid layout.
 * @property {number} gridColEnd - The ending column position in the grid layout.
 */
export interface IMaintenanceEventExtended extends IMaintenanceEvent {
  display: boolean;
  isBeforeDateRange: boolean;
  isAfterDateRange: boolean;
  gridColStart: number;
  gridColEnd: number;
  hasConflict: boolean;
  hasOverlap: boolean;
}

/**
 * Props for the LaneGridColumns component.
 */
interface Props {
  lane: IMaintenanceLane;
  events: Array<IMaintenanceEvent>;
}

/**
 * LaneGridColumns component is responsible for rendering a grid of maintenance events
 * within a specified date range. Each event is displayed as a box spanning the appropriate
 * columns based on its start and end dates.
 *
 * @component
 * @param {Props} props - The properties object.
 * @param {Lane} props.lane - The lane object containing lane details.
 * @param {Array<IMaintenanceEventExtended>} props.events - The list of maintenance events.
 * @param {Array<dayjs.Dayjs>} props.dateRanges - The array of date ranges for the grid columns.
 * @param {string} props.calenderView - The current calendar view mode.
 *
 * @returns {JSX.Element} The rendered LaneGridColumns component.
 *
 * @remarks
 * This component uses the `dayjs` library for date manipulation and comparison.
 * It maps the events to determine their display properties such as grid column start and end,
 * conflict status, and visibility within the date range.
 *
 * The events are sorted by start date to manage their z-index, ensuring the latest event appears on top.
 * The component renders a grid with each event spanning the appropriate columns based on its date range.
 */
export const LaneGridColumns: React.FC<Props> = ({ lane, events }) => {
  const dateRanges = useAppSelector(selectDateRanges);
  const calenderView = useAppSelector(selectCalenderView);
  const [mappedEvents, setMappedEvents] = useState<Array<IMaintenanceEventExtended>>();
  const eventType = useAppSelector(selectCalendarEventTypes);

  const dateRangeLength = dateRanges ? dateRanges.length : 0;

  // map event start & stop dates to propagate display properties.
  useEffect(() => {
    if (events && dateRanges && calenderView) {
      const filteredEvents = eventType === 'all' ? events : events.filter((e) => e.isPhase);

      const mapped = filteredEvents.map((event) => {
        const eventStartDate = dayjs(event.startDate);
        const eventEndDate = dayjs(event.endDate);

        let hasConflict = false;
        let hasOverlap = false;
        filteredEvents
          .filter((e) => e.id !== event.id)
          .forEach((e) => {
            hasOverlap = dateRangesOverlap(eventStartDate, eventEndDate, dayjs(e.startDate), dayjs(e.endDate));
            hasConflict = hasOverlap;
          });

        const gridColStartDate = dateRanges[0];
        const gridColeEndDate = dateRanges[dateRangeLength - 1];

        const isBeforeDateRange = eventStartDate.isBefore(gridColStartDate);
        const isAfterDateRange = eventEndDate.isAfter(gridColeEndDate);

        const display = eventStartDate.isBefore(gridColeEndDate) && eventEndDate.isAfter(gridColStartDate);

        const gridColStart = isBeforeDateRange
          ? 1
          : dateRanges.findIndex((date) => date.format(DATE_FORMAT) === eventStartDate.format(DATE_FORMAT)) + 1;

        const gridColEnd = isAfterDateRange
          ? dateRangeLength + 1
          : dateRanges.findIndex((date) => date.format(DATE_FORMAT) === eventEndDate.format(DATE_FORMAT)) + 2;

        return {
          ...event,
          isBeforeDateRange,
          isAfterDateRange,
          gridColStart,
          gridColEnd,
          display,
          hasConflict,
          hasOverlap,
        };
      });

      mapped.sort((a, b) => dayjs(b.startDate).diff(a.startDate));
      setMappedEvents(mapped);
    }
  }, [dateRanges, events, calenderView, dateRangeLength, eventType]);

  /* Grid columns for each date interval  */
  return (
    <Box
      component="div"
      id="grid-columns"
      data-testid="grid-columns"
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${dateRangeLength}, 1fr)`,
        height: '80px',
      }}
    >
      {/* Set event to span date ranges */
      mappedEvents?.map((event, index) => {
        return event.display ? (
          <Box
            component="div"
            key={`lane-${lane.id}-grid-col-span-${event.id}`}
            id={`lane-${lane.id}-grid-col-span-${event.id}`}
            data-testid={`lane-${lane.id}-grid-col-span-${index}`}
            sx={{
              minWidth: '40px',
              zIndex: 100 - index, // Places latest event on top
              position: 'absolute',
              width: '100%',
              height: event.hasOverlap ? '30px' : '45px',
              top: event.hasOverlap && index % 2 !== 0 ? '45px' : 10,
              gridColumn: `${event.gridColStart} / ${event.gridColEnd}`,
            }}
          >
            <LaneEvent lane={lane} event={event} calenderView={calenderView} />
          </Box>
        ) : null;
      })}
    </Box>
  );
};
