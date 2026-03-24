import React, { useState } from 'react';
import { Dayjs } from 'dayjs';

import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  Slider,
  Typography,
} from '@mui/material';
import { TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Filter option structure
export type FilterOptions = {
  serialNumbers: string[];
  models: string[];
  inspectionTypes: string[];
  lanes: string[];
  responsibleUnits: string[];
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  completionStatus?: [number, number];
};

export type MaintenanceDetailsFilterProps = {
  tableData: Array<{
    serial: string;
    model: string;
    inspection_name: string;
    lane_name: string;
    responsible_unit: string;
    status: number;
  }>;
  anchorEl: HTMLButtonElement | null; // Anchor element for the Popover
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
};

const MaintenanceDetailsFilter: React.FC<MaintenanceDetailsFilterProps> = ({
  tableData,
  anchorEl,
  onClose,
  onApplyFilters,
}) => {
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [inspectionTypes, setInspectionTypes] = useState<string[]>([]);
  const [lanes, setLanes] = useState<string[]>([]);
  const [responsibleUnits, setResponsibleUnits] = useState<string[]>([]);
  const [startDateFrom, setStartDateFrom] = useState<Dayjs | null>(null);
  const [startDateTo, setStartDateTo] = useState<Dayjs | null>(null);
  const [endDateFrom, setEndDateFrom] = useState<Dayjs | null>(null);
  const [endDateTo, setEndDateTo] = useState<Dayjs | null>(null);
  const [completionStatus, setCompletionStatus] = useState<[number, number]>([0, 100]);

  // Extract unique values for dropdowns from table data
  const dropdownOptions = React.useMemo(() => {
    const serialNumbers = Array.from(new Set(tableData.map((row) => row.serial)));
    const models = Array.from(new Set(tableData.map((row) => row.model)));
    const inspectionTypes = Array.from(new Set(tableData.map((row) => row.inspection_name)));
    const lanes = Array.from(new Set(tableData.map((row) => row.lane_name)));
    const responsibleUnits = Array.from(new Set(tableData.map((row) => row.responsible_unit)));

    return { serialNumbers, models, inspectionTypes, lanes, responsibleUnits };
  }, [tableData]);

  // Handle changes in drop down selections
  const handleDropdownChange = (
    event: SelectChangeEvent<string[]>,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setState(event.target.value as string[]);
  };

  // Apply the selected filters and close the modal
  const handleApplyFilters = () => {
    onApplyFilters({
      serialNumbers,
      models,
      inspectionTypes,
      lanes,
      responsibleUnits,
      startDateFrom: startDateFrom ? startDateFrom.format('MM/DD/YYYY') : undefined,
      startDateTo: startDateTo ? startDateTo.format('MM/DD/YYYY') : undefined,
      endDateFrom: endDateFrom ? endDateFrom.format('MM/DD/YYYY') : undefined,
      endDateTo: endDateTo ? endDateTo.format('MM/DD/YYYY') : undefined,
      completionStatus,
    });

    // Close the Popover
    onClose();
  };

  const handleClearFilters = () => {
    // Reset all filter states to empty arrays
    setSerialNumbers([]);
    setModels([]);
    setInspectionTypes([]);
    setLanes([]);
    setResponsibleUnits([]);
    setStartDateFrom(null); // Reset start date
    setStartDateTo(null);
    setEndDateFrom(null); // Reset end date
    setEndDateTo(null);
    setCompletionStatus([0, 100]);

    // Apply empty filters to reset the table
    onApplyFilters({
      serialNumbers: [],
      models: [],
      inspectionTypes: [],
      lanes: [],
      responsibleUnits: [],
      startDateFrom: undefined,
      startDateTo: undefined,
      endDateFrom: undefined,
      endDateTo: undefined,
      completionStatus: [0, 100],
    });
  };

  return (
    <Box>
      {/* Popover Filter menu */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{ '& .MuiPaper-root': { p: 4, width: 400 } }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Typography variant="body2" gutterBottom>
            Filter Maintenance Details
          </Typography>

          <Typography
            variant="body2"
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            }}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Typography>
        </Box>

        {/* Serial Number Filter */}
        <FormControl fullWidth sx={{ marginBottom: 4 }}>
          <InputLabel id="serial-number-selection-label">Serial Number</InputLabel>
          <Select
            label="Serial Number"
            labelId="serial-number-selection-label"
            multiple
            value={serialNumbers}
            onChange={(event) => handleDropdownChange(event, setSerialNumbers)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {dropdownOptions.serialNumbers.map((serial) => (
              <MenuItem key={serial} value={serial}>
                {serial}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Models Filter */}
        <FormControl fullWidth sx={{ marginBottom: 4 }}>
          <InputLabel id="models-selection-label">Models</InputLabel>
          <Select
            label="Models"
            labelId="models-selection-label"
            multiple
            value={models}
            onChange={(event) => handleDropdownChange(event, setModels)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {dropdownOptions.models.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Inspection Type Filter */}
        <FormControl fullWidth sx={{ marginBottom: 4 }}>
          <InputLabel id="inspection-type-selection-label">Inspection Type</InputLabel>
          <Select
            label="Inspection Type"
            labelId="inspection-type-selection-label"
            multiple
            value={inspectionTypes}
            onChange={(event) => handleDropdownChange(event, setInspectionTypes)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {dropdownOptions.inspectionTypes.map((inspection) => (
              <MenuItem key={inspection} value={inspection}>
                {inspection}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Lane Filter */}
        <FormControl fullWidth sx={{ marginBottom: 4 }}>
          <InputLabel id="lane-selection-label">Lane</InputLabel>
          <Select
            label="Lane"
            labelId="lane-selection-label"
            multiple
            value={lanes}
            onChange={(event) => handleDropdownChange(event, setLanes)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {dropdownOptions.lanes.map((lane) => (
              <MenuItem key={lane} value={lane}>
                {lane}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Responsible Unit Filter */}
        <FormControl fullWidth sx={{ marginBottom: 4 }}>
          <InputLabel id="responsible-unit-selection-label">Responsible Unit</InputLabel>
          <Select
            label="Responsible Unit"
            labelId="responsible-unit-selection-label"
            multiple
            value={responsibleUnits}
            onChange={(event) => handleDropdownChange(event, setResponsibleUnits)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {dropdownOptions.responsibleUnits.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Divider */}
        <Divider orientation="horizontal" sx={{ mb: 4 }} />

        {/* Start Date From */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Typography variant="subtitle1" sx={{ marginBottom: 3 }}>
            Maintenance Start Date Range
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
            {/* Start Date From */}
            <DatePicker
              label="Start Date From"
              value={startDateFrom}
              onChange={(newValue) => setStartDateFrom(newValue)}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />

            <Typography variant="body1" sx={{ marginX: 1 }}>
              -
            </Typography>

            {/* Start Date To */}
            <DatePicker
              label="Start Date To"
              value={startDateTo}
              onChange={(newValue) => setStartDateTo(newValue)}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Box>
        </LocalizationProvider>

        {/* Divider */}
        <Divider orientation="horizontal" sx={{ mb: 4 }} />

        {/* End Date From */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
            Maintenance End Date Range
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
            {/* End Date From */}
            <DatePicker
              label="End Date From"
              value={endDateFrom}
              onChange={(newValue) => setEndDateFrom(newValue)}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />

            <Typography variant="body1" sx={{ marginX: 1 }}>
              -
            </Typography>

            {/* End Date To */}
            <DatePicker
              label="End Date To"
              value={endDateTo}
              onChange={(newValue) => setEndDateTo(newValue)}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Box>
        </LocalizationProvider>

        {/* Divider */}
        <Divider orientation="horizontal" sx={{ mb: 4 }} />

        {/* Completion Status Slider */}
        <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
          Completion Status (%)
        </Typography>
        <Slider
          value={completionStatus}
          onChange={(_, newValue) => setCompletionStatus(newValue as [number, number])}
          valueLabelDisplay="auto"
          min={0}
          max={100}
          step={1}
          sx={{ marginBottom: 8, ml: 2, width: 'calc(100% - 16px)' }}
          marks={[
            { value: 0, label: 0 },
            { value: 25, label: 25 },
            { value: 50, label: 50 },
            { value: 75, label: 75 },
            { value: 100, label: 100 },
          ]}
        />

        {/* Apply Filters Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            marginTop: 2,
          }}
        >
          <Button variant="outlined" color="primary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleApplyFilters}>
            Apply
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default MaintenanceDetailsFilter;
