import React, { useEffect, useRef, useState, WheelEventHandler } from 'react';

import { Box, Skeleton, styled, Typography } from '@mui/material';

import { titlecase } from '@ai2c/pmx-mui';

import { CalendarLaneGroupingEnum } from '@features/maintenance-schedule/models/CalendarLaneGroupingEnum';

import { IMaintenanceEvent, IMaintenanceLane } from '@store/griffin_api/events/models';
import { useGetLanesQuery } from '@store/griffin_api/events/slices';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices/appSettingsSlice';

import { CalenderViewEnum } from '../../../models';
import { selectCalendarLaneGrouping, selectCalenderView, setCalenderView } from '../../../slices';
import { LaneGridColumns } from '../Lane/LaneGridColumns';
import { LaneGroupLeft, LaneGroupRight } from '../Lane/LaneGroup';
import { LaneTitle } from '../Lane/LaneTitle';
import CalenderEvents from './CalenderEvents';
import CalenderFilter from './CalenderFilter';
import CalenderViewDisplay from './CalenderViewDisplay';
import DateRangeNavigation from './DateRangeNavigation';

/**
 * Represents the GanttLayoutColumn component.
 */
const GanttLayoutColumn = styled(Box)(({ theme }) => ({
  minWidth: '150px',
  display: 'grid',
  gridTemplateRows: `${theme.spacing(4)} auto`,
  gridTemplateColumns: '1fr',
  gridRowGap: theme.spacing(3),
  // Target the first child (the header spacers/displays)
  '& > :first-of-type': {
    position: 'sticky',
    top: 0,
    zIndex: 10, // Ensure it stays above the lane content
    backgroundColor: theme.palette.layout?.background5 || theme.palette.background.paper,
  },
}));

/**
 * Represents the styled container for the calendar component.
 */
const CalenderContainer = styled(Box)(({ theme }) => {
  const isDarkMode = theme.palette.mode === 'dark';

  return {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    gap: theme.spacing(3),
    backgroundColor: isDarkMode ? theme.palette.layout?.background5 : theme.palette.layout?.base,
    border: `1px solid ${isDarkMode ? theme.palette.layout?.background7 : theme.palette.layout?.background5}`,
    boxShadow: theme.palette.boxShadow,
    borderRadius: '3px',
    padding: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginBottom: theme.spacing(3),
  };
});

/**
 * Props for the Calender component.
 */
export interface Props {
  events: Array<IMaintenanceEvent>;
}

/**
 * MaintenanceCalender component displays a calendar view for maintenance schedules.
 * It supports different views (annual, monthly, weekly) and allows zooming in and out using CTRL + Wheel.
 *
 * @component
 * @param {Props} props - The properties object.
 * @param {Array} props.events - The events to be displayed in the calendar.
 *
 * @returns {JSX.Element} The rendered MaintenanceCalender component.
 *
 * @example
 * <MaintenanceCalender lanes={lanesData} events={eventsData} />
 *
 * @remarks
 * - The component uses `dayjs` for date manipulation.
 * - The calendar view can be changed by calling `handleViewOnChange`.
 * - Date navigation is handled by `handleDateNavigationChange`.
 * - The component prevents the body from scrolling while using the onWheel event.
 */
export const MaintenanceCalender: React.FC<Props> = ({ events }: Props): JSX.Element => {
  const currentUic = useAppSelector(selectCurrentUic);
  const calenderView = useAppSelector(selectCalenderView);
  const calendarLaneGrouping = useAppSelector(selectCalendarLaneGrouping);
  const dispatch = useAppDispatch();
  const ref = useRef();

  const { data: lanes, isSuccess } = useGetLanesQuery(currentUic);
  const [laneGroups, setLaneGroups] = useState<Array<{ name: string; lanes: Array<IMaintenanceLane> }>>();

  /* Required to block the body from scrolling while using OnWheel for Div component */
  useEffect(() => {
    const cancelWheel = (e: WheelEvent) => (e.ctrlKey || e.metaKey) && ref.current && e.preventDefault();
    document.body.addEventListener('wheel', cancelWheel as unknown as EventListener, { passive: false });
    return () => document.body.removeEventListener('wheel', cancelWheel as unknown as EventListener);
  }, []);

  /* airframeFamilyGroupGenerator assists when grouping lanes by model by creating the a common key */
  const airframeFamilyGroupKey = (airframeFamilies: string[]) => {
    // Needs a zero length array escape clause to ensure downstream titlecase is done safely
    if (airframeFamilies.length === 0) return 'UNLISTED';
    return [...airframeFamilies]
      .sort((a, b) => a.localeCompare(b)) // sort to ensure no duplicates in unordered array input
      .reduce((familyGroupKey: string, family: string) => familyGroupKey + ', ' + family, '')
      .slice(2); // slice to ensure no leading ', ' characters
  };

  /* groupLanesByModel builds lane groups grouped by the airframe family that lane supports */
  const groupLanesByModel = (lanes: IMaintenanceLane[]) => {
    const models: string[] = [...new Set(lanes.map((lane) => airframeFamilyGroupKey(lane.airframeFamilies)))];

    const laneGroupings: Array<{ name: string; lanes: Array<IMaintenanceLane> }> = models.map((model) => {
      return {
        name: titlecase(model),
        lanes: lanes.filter((lane) => airframeFamilyGroupKey(lane.airframeFamilies) === model),
      };
    });

    return laneGroupings;
  };

  /* groupLanesByLocation builds lane groups grouped by the location of the lane */
  const groupLanesByLocation = (lanes: IMaintenanceLane[]) => {
    const locations: (string | undefined)[] = [...new Set(lanes.map((lane) => lane.location?.name))];

    const laneGroupings: Array<{ name: string; lanes: Array<IMaintenanceLane> }> = locations.map((location) => {
      return {
        name: location ? titlecase(location) : 'Undefined Location',
        lanes: lanes.filter((lane) => lane.location?.name === location),
      };
    });

    return laneGroupings;
  };

  /* groupLanesByUnit builds lane groups grouped by the unit the lane belongs to
   */
  const groupLanesByUnit = (lanes: IMaintenanceLane[]) => {
    const units: string[] = [...new Set(lanes.map((lane) => lane.unitUic))];

    const laneGroupings: Array<{ name: string; lanes: Array<IMaintenanceLane> }> = units.map((unit) => {
      return { name: unit, lanes: lanes.filter((lane) => lane.unitUic === unit) };
    });

    return laneGroupings;
  };

  /* Group lanes by user selected method */
  useEffect(() => {
    if (lanes) {
      switch (calendarLaneGrouping) {
        case CalendarLaneGroupingEnum.MODEL:
          setLaneGroups(groupLanesByModel(lanes));
          break;
        case CalendarLaneGroupingEnum.LOCATION:
          setLaneGroups(groupLanesByLocation(lanes));
          break;
        case CalendarLaneGroupingEnum.LANE_UNIT:
          setLaneGroups(groupLanesByUnit(lanes));
          break;
        default:
          setLaneGroups(groupLanesByUnit(lanes));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarLaneGrouping, isSuccess, lanes]);

  /* CTRL + Wheel zoom in/out handler */
  const handleOnWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    // Windows & Linux: ctrl, Mac: meta
    if (event.ctrlKey || event.metaKey) {
      const zoom = event.deltaY < 0 ? 'in' : 'out';

      if (zoom === 'in') {
        switch (calenderView) {
          case CalenderViewEnum.ANNUAL:
            dispatch(setCalenderView(CalenderViewEnum.MONTHLY));
            break;
          case CalenderViewEnum.MONTHLY:
            dispatch(setCalenderView(CalenderViewEnum.WEEKLY));
            break;
        }
      } else if (zoom === 'out') {
        switch (calenderView) {
          case CalenderViewEnum.MONTHLY:
            dispatch(setCalenderView(CalenderViewEnum.ANNUAL));
            break;
          case CalenderViewEnum.WEEKLY:
            dispatch(setCalenderView(CalenderViewEnum.MONTHLY));
            break;
        }
      }
    }
  };
  const getGroupLabel = (groupName: string): string => {
    if (groupName === 'Unlisted') {
      return 'No Models Assigned';
    }

    const modelCount = groupName.split(',').length;
    if (modelCount > 2) {
      return '3+ Models';
    }

    return groupName;
  };
  const laneRowStyle = {
    py: 1.5,
    px: 1,
    borderBottom: '2px solid',
    borderColor: 'divider',
    minHeight: '48px', // ensures alignment even if label text wraps
  };

  return (
    <CalenderContainer data-testid="maintenance-calender" ref={ref} onWheel={handleOnWheel}>
      {/* Gantt Calender Heading */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <DateRangeNavigation />
        <CalenderFilter />
      </Box>

      {/* Gantt Calender */}
      <Box id="calender-layout" sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', height: '100%' }}>
        {/* Gantt Left */}
        <GanttLayoutColumn id="calender-layout-left" data-testid="calender-layout-left">
          <Box
            id="calender-layout-left-scale"
            sx={{
              position: 'sticky',
              top: 0,
              bgcolor: 'inherit',
              zIndex: 11,
            }}
          >
            {/* Spacer */}
          </Box>
          <Box id="calender-layout-left-lane-titles">
            {laneGroups ? (
              laneGroups.map((group) => (
                <LaneGroupLeft key={`lane-group-${group.name}`} id={`lane-group-${group.name}`}>
                  <Typography variant="subtitle2" sx={{ pl: 2, py: 1 }}>
                    {getGroupLabel(group.name)}
                  </Typography>
                  {group.lanes.map((lane) => (
                    <Box key={`lane-title-${lane.id}`} sx={laneRowStyle}>
                      <LaneTitle lane={lane} />
                    </Box>
                  ))}
                </LaneGroupLeft>
              ))
            ) : (
              <Skeleton />
            )}
          </Box>
        </GanttLayoutColumn>

        {/* Gantt Right */}
        <GanttLayoutColumn id="calender-layout-right" sx={{ overflow: 'visible' }}>
          {/* parent handles scroll */}
          <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'inherit' }}>
            <CalenderViewDisplay />
          </Box>
          {/* Lanes */}
          <Box id="calender-layout-right-scroll-area" sx={{ position: 'relative' }}>
            {laneGroups ? (
              laneGroups.map((group) => (
                <LaneGroupRight key={`calender-lane-group-${group.name}`} id={`calender-lane-group-${group.name}`}>
                  <Typography variant="subtitle2" sx={{ pl: 2, py: 1 }} visibility="hidden">
                    {getGroupLabel(group.name)}
                  </Typography>
                  {group.lanes.map((lane) => (
                    <Box key={`lane-row-${lane.id}`} id={`lane-row-${lane.id}`} sx={laneRowStyle}>
                      <LaneGridColumns lane={lane} events={events.filter((e) => e.laneId === lane.id)} />
                    </Box>
                  ))}
                </LaneGroupRight>
              ))
            ) : (
              <Skeleton />
            )}

            {/* Calender Events */}
            <CalenderEvents events={[]} />
          </Box>
        </GanttLayoutColumn>
      </Box>
    </CalenderContainer>
  );
};
