import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { alpha, Box, Divider, useTheme } from '@mui/material';

import { DATE_FORMAT } from '@utils/constants';

import { useAppSelector } from '@store/hooks';

import { CalenderEventTypeEnum, ICalenderEvent } from '../../../models/ICalenderEvent';
import { selectCalenderView, selectDateRanges, selectToday } from '../../../slices/maintenanceScheduleSlice';

/**
 * Represents an event in the calendar with additional grid layout properties.
 *
 * @interface IEvent
 * @extends {ICalenderEvent}
 *
 * @property {number} gridColStart - The starting column of the event in the grid layout.
 * @property {number} gridColEnd - The ending column of the event in the grid layout.
 */
interface IEvent extends ICalenderEvent {
  gridColStart: number;
  gridColEnd: number;
}

/**
 * Props interface for the CalenderEvents component.
 */
export interface Props {
  events: Array<ICalenderEvent>;
}

/**
 * Component representing calendar events within a calendar view.
 *
 * @component
 * @param {Props} props - The properties for the component.
 * @param {dayjs.Dayjs} props.today - The current day.
 * @param {Array<dayjs.Dayjs>} props.dateRanges - The range of dates displayed in the calendar.
 * @param {Array<IEvent>} props.events - The list of events to display on the calendar.
 * @param {CalenderViewEnum} props.calenderView - The current view of the calendar (e.g., annual, monthly).
 *
 * @returns {JSX.Element} The rendered calendar events component.
 *
 * @example
 * <CalenderEvents
 *   events={[{ startDate: dayjs(), endDate: dayjs().add(1, 'day'), type: CalenderEventTypeEnum.HOLIDAY }]}
 * />
 */
const CalenderEvents: React.FC<Props> = ({ events }) => {
  const today = useAppSelector(selectToday);
  const dateRanges = useAppSelector(selectDateRanges);
  const calenderView = useAppSelector(selectCalenderView);
  const theme = useTheme();

  const [selected, setSelected] = useState<string>('');
  const [calenderEvents, setCalenderEvents] = useState<Array<IEvent>>([]);
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    if (dateRanges && calenderView) {
      const donsa: Array<IEvent> = [];

      // Today
      const formattedToday = today.format(DATE_FORMAT);
      const todaysDate = dateRanges.find((date: dayjs.Dayjs) => date.format(DATE_FORMAT) === formattedToday);
      if (todaysDate) {
        const gridColStart =
          dateRanges.findIndex((date: dayjs.Dayjs) => date.format(DATE_FORMAT) === formattedToday) + 1;
        const gridColEnd = dateRanges.findIndex((date: dayjs.Dayjs) => date.format(DATE_FORMAT) === formattedToday) + 1;
        donsa.push({
          id: 'today',
          name: 'today',
          startDate: todaysDate,
          endDate: todaysDate,
          gridColStart,
          gridColEnd,
          type: CalenderEventTypeEnum.TODAY,
        });
      }

      // Mapping Calender event display props
      events.forEach((event) => {
        const range = dateRanges.length;
        const eventStartDate = dayjs(event.startDate);
        const eventEndDate = dayjs(event.endDate);

        const startDate = dateRanges[0];
        const endDate = dateRanges[range - 1];
        const display = eventStartDate.isBefore(endDate) && eventEndDate.isAfter(startDate);

        if (display) {
          let gridColStart = dateRanges.findIndex(
            (date: dayjs.Dayjs) => date.format(DATE_FORMAT) === eventStartDate.format(DATE_FORMAT),
          );
          let gridColEnd = dateRanges.findIndex(
            (date: dayjs.Dayjs) => date.format(DATE_FORMAT) === eventEndDate.format(DATE_FORMAT),
          );

          gridColStart = gridColStart ? gridColStart + 1 : 0;
          gridColEnd = gridColEnd ? gridColEnd + 2 : range;

          donsa.push({
            id: event.id,
            name: event.name,
            startDate,
            endDate,
            gridColStart,
            gridColEnd,
            type: event.type,
          });
        }
      });

      setCalenderEvents(donsa);
    }
  }, [dateRanges, calenderView, today, events]);

  // Sets selected event
  function handleSelection(event: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string) {
    event.stopPropagation();
    setSelected(id);
  }

  // Background color based on type
  function getBackgroundColor(type: CalenderEventTypeEnum) {
    switch (type) {
      case CalenderEventTypeEnum.DEFAULT:
        return isDarkMode
          ? theme.palette.grey?.d40 && alpha(theme.palette.grey?.d40, 0.6)
          : theme.palette.grey?.l40 && alpha(theme.palette.grey?.l40, 0.6);
      case CalenderEventTypeEnum.HOLIDAY:
        return isDarkMode
          ? theme.palette.primary?.d40 && alpha(theme.palette.primary?.d40, 0.2)
          : theme.palette.primary?.l60 && alpha(theme.palette.primary?.l60, 0.2);
      case CalenderEventTypeEnum.WEEKEND:
        return isDarkMode
          ? theme.palette.grey?.d60 && alpha(theme.palette.grey?.d60, 0.4)
          : theme.palette.grey?.l60 && alpha(theme.palette.grey?.l60, 0.4);
      default:
        return 'transparent';
    }
  }

  // Hover borders based on theme & event type
  function getHoverBorderColor(type: CalenderEventTypeEnum) {
    if (type === CalenderEventTypeEnum.TODAY) {
      return 'transparent';
    } else if (isDarkMode) {
      return theme.palette.primary?.l20 as string;
    } else {
      return theme.palette.primary?.d20 as string;
    }
  }

  // Grid columns
  return (
    <Box
      id="calender-layout-right-events"
      data-testid="calender-layout-right-events"
      onClick={(e) => handleSelection(e, 'parent')}
      sx={{
        display: 'grid',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 15,
        gridTemplateColumns: `repeat(${dateRanges ? dateRanges.length : 0}, 1fr)`,
        gridAutoRows: 'minmax(100%, auto)',
      }}
    >
      {
        // Calender event spanning date ranges
        calenderEvents.map((event, index) => {
          const uid = `${event.type}-${index}`;

          return (
            <Box
              id={uid}
              data-testid={`calender-event-${index}`}
              key={uid}
              onClick={(e) => handleSelection(e, uid)}
              sx={{
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                border: '1px solid transparent',
                gridColumn: `${event.gridColStart} / ${event.gridColEnd}`,
                backgroundColor: getBackgroundColor(event.type),
                '&:hover': {
                  borderColor: getHoverBorderColor(event.type),
                },
                borderColor:
                  selected === uid && event.type !== CalenderEventTypeEnum.TODAY ? 'primary.main' : 'transparent',
              }}
            >
              {
                // Today event indicator
                event.type === CalenderEventTypeEnum.TODAY && (
                  <Divider
                    data-testid="calender-event-today"
                    orientation="vertical"
                    sx={{
                      borderRightWidth: '2px',
                      borderColor:
                        theme.palette.mode === 'dark' ? theme.palette.primary?.d20 : theme.palette.primary?.l20,
                      position: 'absolute',
                      top: '-15px',
                      height: 'calc(100% + 15px)', // top offset
                      zIndex: 1000,
                    }}
                  />
                )
              }
            </Box>
          );
        })
      }
    </Box>
  );
};

export default CalenderEvents;
