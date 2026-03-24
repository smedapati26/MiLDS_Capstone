import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import LocationDropdown from '@components/dropdowns/LocationDropdown';
import SingleEditCard from '@features/equipment-manager/aircraft/components/SingleEditCard';
import ModsKitsTable from '@features/equipment-manager/components/ModsKitsTable';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAircraftEditIn, IAircraftEquipmentDetails, mapToAircraftEditInDto } from '@store/griffin_api/aircraft/models';
import { useEditAircraftEquipmentDetailsMutation } from '@store/griffin_api/aircraft/slices';
import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IAircraftEquipmentDetails;
  setUpdatedRows: React.Dispatch<React.SetStateAction<string[]>>;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

const validateHours = (total: number | null, monthly: number | null): string | null => {
  let errorMessage = null;
  // Validate monthly flight hours against total flight hours
  if (total && monthly && monthly > total) {
    errorMessage = 'Monthly flight hours cannot exceed total flight hours.';
  }

  return errorMessage;
};

interface CustomRowProps {
  children: React.ReactNode;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  sync: boolean;
  field: string;
  setSync: (field: string, value: boolean) => void;
}

const CustomRow: React.FC<CustomRowProps> = ({ children, direction = 'row', sync, field, setSync }: CustomRowProps) => {
  return (
    <Stack direction={direction} spacing={3}>
      {children}
      <FormControlLabel
        control={
          <Checkbox
            checked={sync}
            onChange={(_, value) => {
              setSync(field, value);
            }}
          />
        }
        label="Auto-sync data"
        data-testid="custom-row"
      />
    </Stack>
  );
};

// Operational Readiness Status options in display order
const OR_STATUS_OPTIONS = [
  { value: OperationalReadinessStatusEnum.FMC, label: 'FMC' },
  { value: OperationalReadinessStatusEnum.MTF, label: 'MTF' },
  { value: OperationalReadinessStatusEnum.PMCS, label: 'PMCS' },
  { value: OperationalReadinessStatusEnum.PMCM, label: 'PMCM' },
  { value: OperationalReadinessStatusEnum.NMCS, label: 'NMCS' },
  { value: OperationalReadinessStatusEnum.NMCM, label: 'NMCM' },
  { value: OperationalReadinessStatusEnum.MOC, label: 'MOC' },
  { value: OperationalReadinessStatusEnum.DADE, label: 'DADE' },
];

/**
 * Single edit of an aircraft equipment.
 * @param {boolean} props.open to open or close modal
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setOpen state set action
 * @param {IAircraftEquipmentDetails} props.data single aircraft data
 * @param {React.Dispatch<React.SetStateAction<string[]>>} props.setUpdatedRows setState action for rows to flash when updated
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setShowSnackbar to show snackbar when a row is updated.
 *
 * @returns {React.Node}
 */

const AircraftSingleEdit: React.FC<Props> = (props: Props): React.ReactNode => {
  const { data, open, setOpen, setUpdatedRows, setShowSnackbar } = props;
  const [launchStatus, setLaunchStatus] = useState<string>('NRTL');
  const [ORStatus, setORStatus] = useState<string>('FMC');
  const [dateDown, setDateDown] = useState<Dayjs | null>(null);
  const [ecd, setEcd] = useState<Dayjs | null>(null);
  const [totalFlightHours, setTotalFlightHours] = useState<number | null>(0);
  const [monthlyFlightHours, setMonthlyFlightHours] = useState<number | null>(0);
  const [hoursError, setHoursError] = useState<string | null>('');
  const [location, setLocation] = useState<IAutoDsrLocation | undefined>(undefined);
  const [modificationIds, setModificationIds] = useState<string[]>([]);
  const [remarks, setRemarks] = useState<string | undefined>('');
  const [fieldSyncStatus, setFieldSyncStatus] = useState<{ [sync: string]: boolean } | undefined>({
    rtl: true,
    status: true,
    date_down: true,
    ecd: true,
    total_airframe_hours: true,
    flight_hours: true,
    remarks: true,
    location: true,
  });

  const [editAircraftEquipmentDetails, { isLoading: isEditLoading }] = useEditAircraftEquipmentDetailsMutation();

  const clearAll = (): void => {
    setModificationIds([]);
    setLocation(undefined);
  };

  const handleClose = () => {
    setOpen(false);
    clearAll();
  };

  const handleTotalHours = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? null : parseFloat(event.target.value);
    setTotalFlightHours(value);
  };

  const handleMonthlyHours = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? null : parseFloat(event.target.value);
    setMonthlyFlightHours(value);
  };

  const validateHoursOnBlur = () => {
    setHoursError(validateHours(Number(totalFlightHours), Number(monthlyFlightHours)));
  };

  const handleRemarks = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemarks(event.target.value);
  };

  const handleLocation = (value: IAutoDsrLocation | null): void => {
    setLocation(value as IAutoDsrLocation);
  };

  const handleSync = (key: string, value: boolean): void => {
    if (fieldSyncStatus) {
      setFieldSyncStatus((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleORStatusChange = (event: SelectChangeEvent<string>) => {
    setORStatus(event.target.value);
  };

  const handleSave = async () => {
    const editData: IAircraftEditIn | undefined = {
      serial: data.models[0].aircraft[0].serial,
      rtl: launchStatus,
      status: ORStatus,
      dateDown: dateDown ? dateDown.toDate() : null,
      ecd: ecd ? ecd.toDate() : null,
      totalAirframeHours: totalFlightHours ? totalFlightHours : undefined,
      flightHours: monthlyFlightHours ? monthlyFlightHours : undefined,
      locationId: location?.id,
      remarks: remarks,
      fieldSyncStatus: fieldSyncStatus,
      mods: data.models[0].aircraft[0].modifications.filter((item) => !modificationIds.includes(String(item.id))),
    };

    try {
      const response = await editAircraftEquipmentDetails([mapToAircraftEditInDto(editData)]).unwrap();

      if (response) {
        setUpdatedRows(response.editedAircraft as string[]);
        handleClose();
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error editing aircraft equipment details:', error);
    }
  };

  useEffect(() => {
    setLaunchStatus(data.models[0].aircraft[0].rtl);
    setORStatus(data.models[0].aircraft[0].ORStatus);
    setDateDown(data.models[0].aircraft[0].dateDown ? dayjs(data.models[0].aircraft[0].dateDown) : null);
    setEcd(data.models[0].aircraft[0].ecd ? dayjs(data.models[0].aircraft[0].ecd) : null);
    setTotalFlightHours(
      data.models[0].aircraft[0].totalAirframeHours
        ? Math.round(data.models[0].aircraft[0].totalAirframeHours * 10) / 10
        : 0,
    );
    setMonthlyFlightHours(
      data.models[0].aircraft[0].flightHours ? Math.round(data.models[0].aircraft[0].flightHours * 10) / 10 : 0,
    );
    setLocation(data.models[0].aircraft[0].location as IAutoDsrLocation);
    setRemarks(data.models[0].aircraft[0].remarks ?? '');
    setFieldSyncStatus(data.models[0].aircraft[0].fieldSyncStatus);
  }, [data]);

  return (
    <Modal open={open} onClose={handleClose} sx={{ overflow: 'scroll' }}>
      <Paper
        data-testid="aircraft-single-edit-paper"
        sx={{
          width: '675px',
          minHeight: '1123px',
          padding: '20px 16px',
          margin: 'auto',
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, 0%)',
        }}
      >
        <Stack direction="column" spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">Edit Aircraft</Typography>
            <Button onClick={handleClose} data-testid="close-button">
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          <SingleEditCard
            aircraft={data.models[0].aircraft[0]}
            model={data.models[0].model}
            unitShortName={data.unitShortName}
          />
          <Typography variant="body2">Launch Status</Typography>
          <CustomRow sync={fieldSyncStatus?.['rtl'] as boolean} setSync={handleSync} field="rtl">
            <ToggleButtonGroup
              value={launchStatus as string}
              exclusive
              onChange={(_, value) => value && setLaunchStatus(value)}
              sx={{ width: '75%' }}
              size="small"
            >
              <ToggleButton sx={{ width: '100%' }} value="RTL">
                RTL
              </ToggleButton>
              <ToggleButton sx={{ width: '100%' }} value="NRTL">
                NRTL
              </ToggleButton>
            </ToggleButtonGroup>
          </CustomRow>

          <Typography variant="body2">Operational Readiness</Typography>
          <CustomRow sync={fieldSyncStatus?.['status'] as boolean} setSync={handleSync} field="status">
            <Select
              value={ORStatus}
              onChange={handleORStatusChange}
              size="small"
              sx={{ width: '75%' }}
              data-testid="or-status-select"
            >
              {OR_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </CustomRow>
          <Typography variant="caption" color="text.secondary">
            For NMC aircraft, provide the following dates:
          </Typography>
          <CustomRow sync={fieldSyncStatus?.['date_down'] as boolean} setSync={handleSync} field="date_down">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date Down"
                value={dateDown}
                onChange={(newValue) => setDateDown(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: '75%' },
                  },
                  field: { clearable: true },
                }}
              />
            </LocalizationProvider>
          </CustomRow>
          <CustomRow sync={fieldSyncStatus?.['ecd'] as boolean} setSync={handleSync} field="ecd">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Estimated Completion Date"
                value={ecd}
                onChange={(newValue) => setEcd(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: '75%' },
                  },
                  field: { clearable: true },
                }}
              />
            </LocalizationProvider>
          </CustomRow>
          <Typography variant="body2">Flight Hours</Typography>
          <CustomRow
            sync={fieldSyncStatus?.['total_airframe_hours'] as boolean}
            setSync={handleSync}
            field="total_airframe_hours"
          >
            <TextField
              id="total-flight-hours"
              data-testid="total-flight-hours"
              label="Total Flight Hours"
              required
              type="number"
              size="small"
              value={totalFlightHours !== null && totalFlightHours !== undefined ? totalFlightHours : 0}
              onChange={handleTotalHours}
              onBlur={validateHoursOnBlur}
              error={!!hoursError}
              helperText={hoursError}
              sx={{ width: '75%' }}
            />
          </CustomRow>
          <CustomRow sync={fieldSyncStatus?.['flight_hours'] as boolean} setSync={handleSync} field="flight_hours">
            <TextField
              id="monthly-flight-hours"
              data-testid="monthly-flight-hours"
              label="Monthly Flight Hours"
              required
              type="number"
              size="small"
              value={monthlyFlightHours !== null && monthlyFlightHours !== undefined ? monthlyFlightHours : 0}
              onChange={handleMonthlyHours}
              onBlur={validateHoursOnBlur}
              error={!!hoursError}
              helperText={hoursError}
              sx={{ width: '75%' }}
            />
          </CustomRow>
          <Typography variant="body2">Additional Details</Typography>
          <CustomRow sync={fieldSyncStatus?.['location'] as boolean} setSync={handleSync} field="location">
            <LocationDropdown
              onChange={handleLocation}
              sx={{ width: '75%' }}
              defaultValue={location as IAutoDsrLocation}
            />
          </CustomRow>
          <CustomRow
            sync={fieldSyncStatus?.['remarks'] as boolean}
            setSync={handleSync}
            field="remarks"
            direction="column"
          >
            <TextField
              id="remarks"
              label="Remarks"
              data-testid="remarks"
              required
              multiline
              size="small"
              value={remarks !== null && remarks !== undefined ? remarks : ''}
              rows={3}
              onChange={handleRemarks}
              sx={{ width: '100%' }}
            />
          </CustomRow>
          <Typography variant="body2">Modification and Kits</Typography>
          <ModsKitsTable data={data.models[0].aircraft[0].modifications} setToDelete={setModificationIds} />
          <Stack direction="row" spacing={3} justifyContent="flex-end" alignItems="center">
            <Button variant="outlined" size="large" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              data-testid="save-button"
              size="large"
              onClick={handleSave}
              disabled={!!hoursError || isEditLoading}
              startIcon={isEditLoading && <CircularProgress size={6} />}
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default AircraftSingleEdit;
