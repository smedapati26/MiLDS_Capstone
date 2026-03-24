import React, { useRef } from 'react';
import dayjs from 'dayjs';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { Box, styled, Typography, useTheme } from '@mui/material';

import { ClockLoaderIcon } from '@ai2c/pmx-mui';

import { CalenderViewEnum } from '@features/maintenance-schedule/models';
import { setActiveFormType, setMaintenanceType } from '@features/maintenance-schedule/slices';
import {
  setActiveEvent,
  setIsMaintenanceEditForm,
} from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';

import { IMaintenanceLane } from '@store/griffin_api/events/models';
import { useAppDispatch } from '@store/hooks';

import { IMaintenanceEventExtended } from './LaneGridColumns';

/**
 * A styled component that serves as an indicator with various styling properties.
 */
const StyledIndicator = styled(Box)(({ theme }) => ({
  zIndex: 200,
  position: 'absolute',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  color: theme.palette.text.primary,
  border: '2px solid',
  padding: '10px',
  overflow: 'hidden',
  width: `100%`,
  height: '100%',
  cursor: 'pointer',
}));

/**
 * A styled component that adds ellipsis if overflown.
 */
const StyledOverflowText = styled(Typography)(() => ({
  overflow: 'hidden',
  marginTop: '3px',
  textWrap: 'nowrap',
  position: 'relative',
  textOverflow: 'ellipsis',
}));

/**
 * Props interface for the LaneEvent component.
 */
export interface Props {
  lane: IMaintenanceLane;
  event: IMaintenanceEventExtended;
  calenderView: CalenderViewEnum;
}

/**
 * LaneEvent component represents a maintenance event for an aircraft within a specific lane.
 * It displays the event details and status with appropriate styling based on the event properties.
 *
 * @component
 * @param {Props} props - The properties object.
 * @param {Lane} props.lane - The lane in which the event is displayed.
 * @param {Event} props.event - The maintenance event details.
 * @param {CalenderViewEnum} props.calenderView - The current calendar view mode.
 *
 * @returns {JSX.Element} The rendered LaneEvent component.
 *
 * @remarks
 * The component uses the theme for styling and adjusts the border styles based on the event properties
 * such as `isPhase`, `hasConflict`, `isBeforeDateRange`, and `isAfterDateRange`.
 * It also conditionally renders different icons based on the event status.
 */
export const LaneEvent: React.FC<Props> = ({ lane, event }) => {
  const dispatch = useAppDispatch();
  const today = dayjs();
  const theme = useTheme();
  const inspectionName = event.inspectionReference?.commonName || event.notes;
  const inspectionText = inspectionName ? `, ${inspectionName}` : '';
  const serialSuffix = event.aircraft.serialNumber.slice(-3);
  const title = `${serialSuffix} ${inspectionText}, ${event.aircraft.model}, ${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;

  const isOutsideUnit =
    lane.unitUic !== event.aircraft.currentUnitUic && !lane.subordinateUnits.includes(event.aircraft.currentUnitUic);

  // Formatting for easy comparison
  function formatDate(dateString: string) {
    return dayjs(dateString).format('DDMMMYY');
  }

  const getBorderStyles = () => {
    const borderRadius = event.isPhase ? '25px' : '3px'; // Phase inspections are rounded edges

    //Sets Background color
    let backgroundColor = theme.palette.error?.l90;
    if (!event.hasConflict) {
      backgroundColor = theme.palette.layout?.base;
    } else if (theme.palette.mode === 'dark') {
      backgroundColor = theme.palette.error?.d60;
    }

    return {
      backgroundColor: backgroundColor,
      width: '100%', // Displays as single line on annual view & not phase
      padding: 2, // Removes padding to display as a single line on annual view & not phase
      borderColor: event.hasConflict ? theme.palette.error.main : event.color,
      borderRadius: borderRadius,
      borderStyle: isOutsideUnit ? 'dashed' : 'solid', // Aircraft outside Lane UIC has dashed border
      /** extends out of date range border styles  */
      borderLeftWidth: event.isBeforeDateRange ? '0px' : '2px',
      borderTopLeftRadius: event.isBeforeDateRange ? '0px' : borderRadius,
      borderBottomLeftRadius: event.isBeforeDateRange ? '0px' : borderRadius,
      borderRightWidth: event.isAfterDateRange ? '0px' : '2px',
      borderTopRightRadius: event.isAfterDateRange ? '0px' : borderRadius,
      borderBottomRightRadius: event.isAfterDateRange ? '0px' : borderRadius,
    };
  };

  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    clickCount.current += 1;

    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      dispatch(setActiveEvent(String(event.id)));
      dispatch(setActiveFormType('maint' as 'lane' | 'maint'));
      dispatch(setIsMaintenanceEditForm(true));
      dispatch(setMaintenanceType(event.maintenanceType));

      // Reset
      clickCount.current = 0;
      clickTimer.current = null;
    }, 250); // 250ms is standard double-click threshold
  };

  const handleContextMenu = (clickEvent: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    clickEvent.preventDefault();
  };

  // Render Status by based on relation to today's date
  const renderStatusIcon = () => {
    const iconStyles = { marginRight: '5px' };

    if (today.isBefore(dayjs(event.startDate))) {
      return <WatchLaterIcon data-testid="upcoming" sx={{ ...iconStyles, width: '18px' }} />;
    } else if (today.isAfter(dayjs(event.endDate))) {
      return <CheckCircleIcon data-testid="complete" sx={{ ...iconStyles, width: '18px' }} />;
    } else {
      return <ClockLoaderIcon data-testid="in-progress" size={15} sx={{ ...iconStyles }} />;
    }

    // if (today.isAfter(eventEndDate) &&  incomplete ) => Past Due
    // return <EmergencyIcon data-testid="past-due" size={20} sx={{ ...iconStyles, marginTop: '2px' }} />;
  };

  return (
    <Box
      display="flex"
      justifyContent="flex-start"
      margin="auto"
      height="100%"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-testid="clickable-container"
    >
      <StyledIndicator data-testid="event-container" sx={getBorderStyles()}>
        {/* Icon display */ renderStatusIcon()}
        {/* Text display */ <StyledOverflowText variant="body3">{title}</StyledOverflowText>}
      </StyledIndicator>
    </Box>
  );
};
