import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';

import { aircraftApi, useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { INewModificationDto, TrackingVariableOptions } from '@store/griffin_api/mods/models';
import { modsApi, useAddNewModificationMutation, useGetModificationTypesQuery } from '@store/griffin_api/mods/slices';

import { useEquipmentManagerContext } from '../EquipmentManagerContext';
import { getTrackingValueOptions } from './helper';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Modal to add Modification
 * @param {boolean} props.open to open or close modal
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setOpen state set action
 *
 * @returns {React.Node}
 */

const AddModificationModal: React.FC<Props> = (props: Props): React.ReactNode => {
  const { open, setOpen } = props;

  const theme = useTheme();
  const [model, setModel] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [trackingVariable, setTrackingVariable] = useState<string | undefined>(undefined);
  const [value, setValue] = useState<string>('');
  const [assignedAircraftSerials, setAssignedAircraftSerials] = useState<string[]>([]);
  const [remarks, setRemarks] = useState<string>('');

  const { chosenUic } = useEquipmentManagerContext();
  const { data: modelData } = useGetModificationTypesQuery();
  const { data: aircraftData } = useGetAircraftByUicQuery(chosenUic, { skip: chosenUic === '' });
  const [addModification] = useAddNewModificationMutation();

  useEffect(() => {
    setValue('');
  }, [trackingVariable]);

  const trackingValueOptions: string[] | undefined = useMemo(
    () => getTrackingValueOptions(trackingVariable),
    [trackingVariable],
  );

  const handleClose = () => {
    setModel('');
    setSerialNumber('');
    setTrackingVariable(undefined);
    setValue('');
    setAssignedAircraftSerials([]);
    setRemarks('');
    setOpen(false);
  };

  const dispatch = useDispatch();
  // 3. Update the handleAdd to ensure the model name is preserved
  const handleAdd = async () => {
    if (!(model && trackingVariable && assignedAircraftSerials.length > 0)) return;

    try {
      const newMod: INewModificationDto = {
        serial_number: serialNumber,
        model: model, // This will have underscores
        tracking_variable: trackingVariable,
        value: value,
        unit_uic: chosenUic,
        assigned_aircraft: assignedAircraftSerials,
        remarks: remarks,
      };
      await addModification(newMod);
      dispatch(aircraftApi.util.invalidateTags(['Aircraft']));
      dispatch(modsApi.util.invalidateTags(['Modifications']));
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  // 1. Group and Sort Aircraft Data
  const organizedAircraft = useMemo(() => {
    if (!aircraftData) return [];
    return [...aircraftData].sort((a, b) => {
      if (a.aircraftModel !== b.aircraftModel) {
        return a.aircraftModel.localeCompare(b.aircraftModel);
      }
      return a.serial.localeCompare(b.serial);
    });
  }, [aircraftData]);

  // 2. Select All Logic
  const isAllSelected = organizedAircraft.length > 0 && assignedAircraftSerials.length === organizedAircraft.length;

  return (
    <Modal open={open} onClose={handleClose} sx={{ overflow: 'scroll' }}>
      <Paper
        sx={{
          width: '444px',
          padding: '20px 16px',
          margin: 'auto',
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, 0%)',
        }}
      >
        <Stack direction="column" spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">Add Modification</Typography>
            <Button onClick={handleClose}>
              <CloseIcon fontSize="small" sx={{ color: theme.palette.text.primary }} />
            </Button>
          </Stack>

          {/* Model (Free Text + Dropdown) and Serial Number */}
          <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
            <FormControl sx={{ width: '50%' }}>
              <Autocomplete
                freeSolo
                data-testid="model-select"
                size="small"
                options={modelData || []}
                // Display: Replace underscores with spaces
                getOptionLabel={(option) => option.replace(/_/g, ' ')}
                value={model.replace(/_/g, ' ')}
                // Save: Replace spaces back to underscores for backend
                onInputChange={(_, newValue) => {
                  setModel(newValue.replace(/ /g, '_'));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Model" required InputLabelProps={{ shrink: true }} />
                )}
              />
            </FormControl>
            <FormControl sx={{ width: '50%' }}>
              <TextField
                label="Serial Number"
                data-testid="serial-number-text"
                size="small"
                value={serialNumber}
                onChange={(event) => setSerialNumber(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Stack>

          {/* Tracking Variable Selection */}
          <Stack direction="row" spacing={3}>
            <FormControl fullWidth>
              <InputLabel shrink required id="tracking-var-selection-label">
                Tracking Variable
              </InputLabel>
              <Select
                label="Tracking Variable"
                labelId="tracking-var-selection-label"
                data-testid="tracking-var-select"
                required
                notched
                size="small"
                value={trackingVariable ?? ''}
                onChange={(event) => setTrackingVariable(event.target.value)}
              >
                {Object.entries(TrackingVariableOptions).map(([key, { value, label }]) => (
                  <MenuItem key={key} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Toggle Buttons for Value Options */}
          {trackingValueOptions && (
            <Stack direction="row" spacing={3}>
              <ToggleButtonGroup
                data-testid="tracking-value-select"
                value={value ?? ''}
                exclusive
                onChange={(_, val) => val && setValue(val)}
                sx={{ width: '100%' }}
                size="small"
              >
                {trackingValueOptions.map((v) => (
                  <ToggleButton sx={{ width: '100%' }} key={v} value={v}>
                    {v}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          )}

          {/* Aircraft Multi-Select with Sorting and Select All */}
          <FormControl fullWidth>
            <InputLabel shrink required id="aircraft-selection-label">
              Assigned Aircraft
            </InputLabel>
            <Select
              multiple
              label="Assigned Aircraft"
              labelId="aircraft-selection-label"
              data-testid="aircraft-select"
              required
              notched
              size="small"
              value={assignedAircraftSerials}
              onChange={(event) => {
                const {
                  target: { value },
                } = event;
                const selected = typeof value === 'string' ? value.split(',') : value;

                // Interceptor for Select All Logic
                if (selected.includes('all-options')) {
                  if (assignedAircraftSerials.length > 0) {
                    setAssignedAircraftSerials([]);
                  } else {
                    setAssignedAircraftSerials(organizedAircraft.map((a) => a.serial));
                  }
                  return;
                }
                setAssignedAircraftSerials(selected);
              }}
              renderValue={(selected) =>
                selected.length === organizedAircraft.length
                  ? 'All Aircraft Selected'
                  : `${selected.length} aircraft selected`
              }
            >
              {/* Select All Row */}
              <MenuItem value="all-options">
                <Checkbox
                  size="small"
                  checked={isAllSelected}
                  indeterminate={assignedAircraftSerials.length > 0 && !isAllSelected}
                />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Select All
                </Typography>
              </MenuItem>

              {/* Grouped and Sorted Aircraft */}
              {organizedAircraft.map((aircraft, index) => {
                const showHeader = index === 0 || organizedAircraft[index - 1].aircraftModel !== aircraft.aircraftModel;
                const items = [];

                if (showHeader) {
                  items.push(
                    <Typography
                      key={`header-${aircraft.aircraftModel}`}
                      variant="overline"
                      sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: theme.palette.action.hover,
                        display: 'block',
                        pointerEvents: 'none',
                      }}
                    >
                      {aircraft.aircraftModel.replace(/_/g, ' ')}
                    </Typography>,
                  );
                }

                items.push(
                  <MenuItem key={aircraft.serial} value={aircraft.serial}>
                    <Checkbox size="small" checked={assignedAircraftSerials.indexOf(aircraft.serial) > -1} />
                    <Typography variant="body2">{aircraft.serial}</Typography>
                  </MenuItem>,
                );

                return items;
              })}
            </Select>
          </FormControl>

          {/* Remarks Field */}
          <FormControl fullWidth>
            <TextField
              label="Remarks"
              multiline
              rows={3}
              placeholder="Add details about this modification..."
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>

          {/* Actions */}
          <Stack direction="row" spacing={3} justifyContent="flex-end" alignItems="center">
            <Button variant="outlined" size="large" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleAdd}
              disabled={!(model && trackingVariable && assignedAircraftSerials.length > 0)}
            >
              Add
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default AddModificationModal;
