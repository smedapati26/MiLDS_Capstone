import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Checkbox,
  Divider,
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
  useTheme,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import LocationDropdown from '@components/dropdowns/LocationDropdown';
import { isSubsetEqual } from '@components/utils';
import { HeaderContent } from '@features/equipment-manager/components/helper';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';
import { IUAS, IUASIn, UasType } from '@store/griffin_api/uas/models/IUAS';
import { useEditUacEquipmentMutation, useEditUavEquipmentMutation } from '@store/griffin_api/uas/slices';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IUAS;
  setUpdatedRows: React.Dispatch<React.SetStateAction<string[]>>;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  uasType?: UasType;
}

interface RowProps {
  title?: string;
  children?: React.ReactNode;
  sync: boolean;
  field: string;
  setSync: (field: string, value: boolean) => void;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
}

const UasRow: React.FC<RowProps> = ({
  title,
  children,
  sync,
  field,
  setSync,
  direction = 'row',
}: RowProps): React.ReactNode => {
  return (
    <Stack direction="column" spacing={3}>
      {title && <Typography variant="body2">{title}</Typography>}
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
    </Stack>
  );
};

// Operational Readiness Status options (excluding MOC and MTF for UAS)
const OR_STATUS_OPTIONS = [
  { value: OperationalReadinessStatusEnum.FMC, label: 'FMC' },
  { value: OperationalReadinessStatusEnum.PMCS, label: 'PMCS' },
  { value: OperationalReadinessStatusEnum.PMCM, label: 'PMCM' },
  { value: OperationalReadinessStatusEnum.NMCS, label: 'NMCS' },
  { value: OperationalReadinessStatusEnum.NMCM, label: 'NMCM' },
  { value: OperationalReadinessStatusEnum.DADE, label: 'DADE' },
];

/**
 * UAS single edit component
 * @param props object
 * @param {boolean} props.open opened state of modal
 * @param {React.Dispatch<React.SetStateAction<string[]>>} props.setOpen open state action setter
 * @param {IUAS} props.data single uas data
 * @param {React.Dispatch<React.SetStateAction<string[]>>} props.setUpdatedRows setState action for rows to flash when updated
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setShowSnackbar to show snackbar when a row is updated.
 * @param {UasType} uasType to show as UAV or Component
 * @returns ReactNode
 */
const UasSingleEdit: React.FC<Props> = (props: Props): React.ReactNode => {
  const theme = useTheme();
  const { data, open, setOpen, setShowSnackbar, setUpdatedRows, uasType = 'Uav' } = props;
  const [launchStatus, setLaunchStatus] = useState<string>('RTL');
  const [flightHours, setFlightHours] = useState<string>('');
  const [ORStatus, setORStatus] = useState<string>('FMC');
  const [dateDown, setDateDown] = useState<Dayjs | null>(null);
  const [ecd, setEcd] = useState<Dayjs | null>(null);
  const [remarks, setRemarks] = useState<string>('');
  const [location, setLocation] = useState<IAutoDsrLocation | undefined | null>(undefined);
  const [fieldSyncStatus, setFieldSyncStatus] = useState<{ [sync: string]: boolean }>({
    rtl: true,
    status: true,
    dateDown: true,
    ecd: true,
    flightHours: true,
    remarks: true,
    location: true,
  });

  const [editUac, { isLoading: uacLoading }] = useEditUacEquipmentMutation();
  const [editUav, { isLoading: uavLoading }] = useEditUavEquipmentMutation();

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleFlightHours = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFlightHours(event.target.value);
  };

  const handleRemarks = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemarks(event.target.value);
  };

  const handleLocation = (value: IAutoDsrLocation | null): void => {
    if (!value?.id) {
      // set location to null so it deletes.
      setLocation(null);
    } else {
      setLocation(value as IAutoDsrLocation);
    }
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
    const editData: IUASIn | undefined = {
      ...(location === null && { locationId: null }),
      ...(location !== undefined && location !== null && { locationId: location.id }),
      status: ORStatus,
      rtl: launchStatus,
      remarks: remarks,
      flightHours: flightHours,
      dateDown: dateDown ? dateDown.format('YYYY-MM-DD') : null,
      ecd: ecd ? ecd.format('YYYY-MM-DD') : null,
    };

    if (!isSubsetEqual(data.fieldSyncStatus, fieldSyncStatus)) {
      editData.fieldSyncStatus = fieldSyncStatus;
    }

    try {
      let response = null;

      if (uasType === 'Uav') {
        response = await editUav({ id: Number(data.id), payload: editData }).unwrap();
      } else {
        response = await editUac({ id: Number(data.id), payload: editData }).unwrap();
      }
      if (response) {
        setUpdatedRows([data.serialNumber]);
        handleClose();
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error editing UAV/UAC:', error);
    }
  };

  useEffect(() => {
    if (open) {
      setLaunchStatus(data.rtl);
      setORStatus(data.displayStatus as string);
      setDateDown(data.dateDown ? dayjs(data.dateDown) : null);
      setEcd(data.ecd ? dayjs(data.ecd) : null);
      setFlightHours(data.flightHours.toString());
      setRemarks(data.remarks);
      if (data.locationId) {
        setLocation({
          code: data.locationCode,
          name: data.locationName,
          id: data.locationId,
        } as IAutoDsrLocation);
      }

      setFieldSyncStatus((prev) => ({
        ...prev,
        ...data.fieldSyncStatus,
      }));
    }
  }, [data, open]);

  return (
    <Modal open={open} onClose={handleClose} sx={{ overflow: 'scroll' }} data-testid="uas-single-edit">
      <Paper
        data-testid="uas-single-edit-paper"
        sx={{
          width: 'fit-content',
          minWidth: '675px',
          minHeight: '485px',
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
            <Typography variant="body2">{`Edit ${uasType === 'Uav' ? 'UAV' : 'Component'}`}</Typography>
            <Button onClick={handleClose} data-testid="close-button">
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          <Paper sx={{ bgcolor: theme.palette.layout.background5 }}>
            <Stack direction="row" spacing="20px" sx={{ p: '20px 16px' }}>
              <HeaderContent title="Serial Number" value={data.serialNumber} />
              <Divider orientation="vertical" flexItem sx={{ width: '1px' }} />
              <HeaderContent title="Model" value={data.model} />
              <Divider orientation="vertical" flexItem sx={{ width: '1px' }} />
              <HeaderContent title="Unit" value={data.currentUnit} />
            </Stack>
          </Paper>
          {uasType === 'Uav' && (
            <UasRow title="Launch Status" sync={fieldSyncStatus?.['rtl'] as boolean} setSync={handleSync} field="rtl">
              <ToggleButtonGroup
                sx={{ width: '100%' }}
                value={launchStatus}
                exclusive
                onChange={(_, value) => value && setLaunchStatus(value)}
                size="small"
              >
                <ToggleButton sx={{ width: '100%' }} value="RTL">
                  RTL
                </ToggleButton>
                <ToggleButton sx={{ width: '100%' }} value="NRTL">
                  NRTL
                </ToggleButton>
              </ToggleButtonGroup>
            </UasRow>
          )}
          <UasRow
            title="Operational Readiness"
            sync={fieldSyncStatus?.['status'] as boolean}
            setSync={handleSync}
            field="status"
          >
            <Select
              value={ORStatus}
              onChange={handleORStatusChange}
              size="small"
              sx={{ width: '100%' }}
              data-testid="uas-or-status-select"
            >
              {OR_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </UasRow>
          <Typography variant="caption" color="text.secondary">
            For NMC equipment, provide the following dates:
          </Typography>
          <UasRow sync={fieldSyncStatus?.['dateDown'] as boolean} setSync={handleSync} field="dateDown">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date Down"
                value={dateDown}
                onChange={(newValue) => setDateDown(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: '100%' },
                  },
                  field: { clearable: true },
                }}
              />
            </LocalizationProvider>
          </UasRow>
          <UasRow sync={fieldSyncStatus?.['ecd'] as boolean} setSync={handleSync} field="ecd">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Estimated Completion Date"
                value={ecd}
                onChange={(newValue) => setEcd(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: '100%' },
                  },
                  field: { clearable: true },
                }}
              />
            </LocalizationProvider>
          </UasRow>
          {uasType === 'Uav' && (
            <UasRow
              title="Flight Hours"
              sync={fieldSyncStatus?.['flightHours'] as boolean}
              setSync={handleSync}
              field="flightHours"
            >
              <TextField
                id="uas-single-edit-hours-flown"
                data-testid="uas-single-edit-hours-flown"
                label="Period Hours"
                required
                value={flightHours}
                onChange={handleFlightHours}
                sx={{ width: '100%' }}
                size="small"
              />
            </UasRow>
          )}
          <Typography variant="body2">Additional Details</Typography>
          <UasRow sync={fieldSyncStatus?.['location'] as boolean} setSync={handleSync} field="location">
            <LocationDropdown
              onChange={handleLocation}
              defaultValue={location as IAutoDsrLocation}
              sx={{ width: '100%' }}
            />
          </UasRow>
          <UasRow
            sync={fieldSyncStatus?.['remarks'] as boolean}
            setSync={handleSync}
            field="remarks"
            direction="column"
          >
            <TextField
              id="uas-single-edit-remarks"
              data-testid="uas-single-edit-remarks"
              label="Remarks"
              multiline
              rows={3}
              value={remarks}
              onChange={handleRemarks}
              sx={{ width: '100%' }}
              size="small"
            />
          </UasRow>
          <Stack direction="row" spacing={3} justifyContent="flex-end" alignItems="center">
            <Button variant="outlined" size="large" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              data-testid="uas-single-edit-save-button"
              onClick={handleSave}
              disabled={uacLoading || uavLoading}
              startIcon={(uacLoading || uavLoading) && <CircularProgress size={6} />}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default UasSingleEdit;
