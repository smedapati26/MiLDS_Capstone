import React, { useState } from 'react';

import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { CalenderViewEnum } from '@features/maintenance-schedule/models';
import { CalendarLaneGroupingEnum } from '@features/maintenance-schedule/models/CalendarLaneGroupingEnum';
import {
  selectCalendarEventTypes,
  selectCalendarLaneGrouping,
  selectCalenderView,
  setCalendarEventTypes,
  setCalendarLaneGrouping,
  setCalenderView,
} from '@features/maintenance-schedule/slices/maintenanceScheduleSlice';

import { useAppDispatch, useAppSelector } from '@store/hooks';

/**
 * `CalenderFilter` is a React functional component that provides a UI for selecting different calendar views.
 * It includes a button that opens a popover with toggle buttons for selecting the view.
 */
const CalenderFilter: React.FC = () => {
  const calenderView = useAppSelector(selectCalenderView);
  const calendarLaneGrouping = useAppSelector(selectCalendarLaneGrouping);
  const calendarEventTypes = useAppSelector(selectCalendarEventTypes);
  const dispatch = useAppDispatch();

  const [filterPopoverEl, setFilterPopoverEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterPopoverEl(event.currentTarget);
  };

  const handleClose = () => {
    setFilterPopoverEl(null);
  };

  /* Handles on calender view changes (annual, monthly, weekly) */
  const handleCalendarViewChange = (_event: React.MouseEvent<HTMLElement>, calenderView: CalenderViewEnum) => {
    dispatch(setCalenderView(calenderView));
  };

  /* Handles on calendar lane grouping changes */
  const handleCalendarLaneGroupingChange = (event: SelectChangeEvent<CalendarLaneGroupingEnum>) => {
    dispatch(setCalendarLaneGrouping(event.target.value));
  };

  /* Handles on calendar lane grouping changes */
  const handleCalendarEventTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: 'phase' | 'all' | null) => {
    if (newType !== null) {
      dispatch(setCalendarEventTypes(newType));
    }
  };

  return (
    <Box data-testid="calender-filter">
      {/* Filter Icon button */}
      <IconButton
        data-testid="calender-filter-button"
        sx={{ float: 'right', marginTop: '-5px', marginRight: '-5px' }}
        onClick={handleClick}
      >
        <FilterListIcon />
      </IconButton>

      {/* Popover Filter menu */}
      <Popover
        data-testid="calender-filter-popover"
        open={Boolean(filterPopoverEl)}
        anchorEl={filterPopoverEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        spacing={3}
        sx={{ '& .MuiPaper-root': { p: 3 } }}
      >
        <Typography gutterBottom>Calender View</Typography>
        <ToggleButtonGroup
          fullWidth
          exclusive
          size="small"
          value={calenderView}
          onChange={handleCalendarViewChange}
          sx={{ float: 'right', marginBottom: 3, button: { fontSize: '10px', padding: '5px', height: '25px' } }}
        >
          <ToggleButton value={CalenderViewEnum.ANNUAL} aria-label="Annual">
            Annual
          </ToggleButton>
          <ToggleButton value={CalenderViewEnum.MONTHLY} aria-label="Monthly">
            Monthly
          </ToggleButton>
          <ToggleButton value={CalenderViewEnum.WEEKLY} aria-label="Weekly">
            Weekly
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          fullWidth
          exclusive
          size="small"
          value={calendarEventTypes}
          onChange={handleCalendarEventTypeChange}
          sx={{ float: 'right', marginBottom: 3, button: { fontSize: '10px', padding: '5px', height: '25px' } }}
        >
          <ToggleButton value={'all'} aria-label="All">
            All Maintenance
          </ToggleButton>
          <ToggleButton value={'phase'} aria-label="Phase">
            Phases
          </ToggleButton>
        </ToggleButtonGroup>
        <FormControl fullWidth>
          <InputLabel id="lane-grouping-selection-label">Grouping</InputLabel>
          <Select
            label="Grouping"
            labelId="lane-grouping-selection-label"
            value={calendarLaneGrouping}
            onChange={handleCalendarLaneGroupingChange}
          >
            <MenuItem value={CalendarLaneGroupingEnum.MODEL}>Model(s)</MenuItem>
            <MenuItem value={CalendarLaneGroupingEnum.LANE_UNIT}>Lane Unit</MenuItem>
          </Select>
        </FormControl>
      </Popover>
    </Box>
  );
};

export default CalenderFilter;
