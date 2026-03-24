import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Modal,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import LocationDropdown from '@components/dropdowns/LocationDropdown';
import { HeaderContent } from '@features/equipment-manager/components/helper';

import { IAGSE, IAGSEEditIn, ISync, mapToAGSEEditInDto } from '@store/griffin_api/agse/models';
import { useEditAGSEMutation } from '@store/griffin_api/agse/slices';
import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IAGSE;
  syncData: ISync;
  setUpdatedRows: React.Dispatch<React.SetStateAction<string[]>>;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConvertSync = (syncData: ISync): { [sync: string]: boolean } => {
  const allSync: { [sync: string]: boolean } = Object.keys(syncData).reduce(
    (acc: { [sync: string]: boolean }, [key, value]) => {
      if (key !== 'equipmentNumber') {
        acc[key] = Boolean(value);
      }
      return acc;
    },
    {},
  );

  return allSync;
};

/**
 * AGSE single edit component
 * @param props props object
 * @param {boolean} props.open to open or close modal
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setOpen state set action
 * @param {IAGSE} props.data single aircraft data
 * @param {React.Dispatch<React.SetStateAction<string[]>>} props.setUpdatedRows setState action for rows to flash when updated
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setShowSnackbar to show snackbar when a row is updated.
 *
 * @returns ReactNode
 */

const AGSESingleEdit: React.FC<Props> = (props: Props): React.ReactNode => {
  const { open, setOpen, data, syncData, setUpdatedRows, setShowSnackbar } = props;
  const [ORStatus, setORStatus] = useState<string>('FMC');
  const [remarks, setRemarks] = useState<string>('');
  const [location, setLocation] = useState<IAutoDsrLocation | undefined>(undefined);
  const [syncAll, setSyncAll] = useState<boolean>(true);
  const [fieldSyncStatus, setFieldSyncStatus] = useState<{ [sync: string]: boolean }>({
    syncCondition: true,
    syncRemarks: true,
    syncEarliestNmcStart: true,
    syncLocation: true,
  });
  const theme = useTheme();

  const [editAGSE, { isLoading: isEditLoading }] = useEditAGSEMutation();

  const handleSave = async () => {
    const editData: IAGSEEditIn | undefined = {
      condition: ORStatus,
      equipmentNumber: data.equipmentNumber,
      fieldSyncStatus: fieldSyncStatus,
      locationId: location?.id,
      remarks: remarks,
    };

    try {
      const response = await editAGSE([mapToAGSEEditInDto(editData)]).unwrap();

      if (response) {
        setUpdatedRows(response.editedAGSE as string[]);
        handleClose();
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error editing AGSE details:', error);
    }
  };

  const handleSync = (value: boolean): void => {
    setFieldSyncStatus((prev) => ({
      ...prev,
      syncCondition: value,
      syncRemarks: value,
      syncEarliestNmcStart: value,
      syncLocation: value,
    }));
    setSyncAll(value);
  };

  const handleRemarks = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemarks(event.target.value);
  };

  const handleLocation = (value: IAutoDsrLocation | null): void => {
    setLocation(value as IAutoDsrLocation);
  };

  useEffect(() => {
    setORStatus(data.status);
    setRemarks(data.remarks as string);
    setLocation(data.location as IAutoDsrLocation);
    setFieldSyncStatus(ConvertSync(syncData));
    setSyncAll(Object.keys(fieldSyncStatus).every((item) => Boolean(item)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, syncData]);
  532466;

  const handleClose = (): void => {
    setLocation(undefined);
    setOpen(false);
  };
  return (
    <Modal open={open} onClose={handleClose} sx={{ overflow: 'scroll' }} data-testid="agse-single-edit">
      <Paper
        data-testid="agse-single-edit-paper"
        sx={{
          width: '675px',
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
            <Typography variant="body2">Edit AGSE</Typography>
            <Button onClick={handleClose} data-testid="close-button">
              <CloseIcon fontSize="small" />
            </Button>
          </Stack>
          <Paper sx={{ bgcolor: theme.palette.layout.background5 }}>
            <Stack direction="row" spacing="20px" sx={{ p: '20px 16px' }}>
              <HeaderContent title="Serial Number" value={data.equipmentNumber} />
              <Divider orientation="vertical" flexItem sx={{ width: '1px' }} />
              <HeaderContent title="Model" value={data.model} />
              <Divider orientation="vertical" flexItem sx={{ width: '1px' }} />
              <HeaderContent title="Unit" value={data.displayName} />
            </Stack>
          </Paper>
          <Typography variant="body2">Operational Readiness Status</Typography>
          <ToggleButtonGroup
            value={ORStatus as string}
            exclusive
            onChange={(_, value) => value && setORStatus(value)}
            size="small"
          >
            <ToggleButton sx={{ width: '100%' }} value="FMC">
              FMC
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value="PMC">
              PMC
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value="NMC">
              NMC
            </ToggleButton>
            <ToggleButton sx={{ width: '100%' }} value="DADE">
              DADE
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="body2">Additional Details</Typography>
          <LocationDropdown onChange={handleLocation} defaultValue={location as IAutoDsrLocation} />
          <TextField
            id="remarks"
            label="Remarks"
            data-testid="remarks"
            required
            multiline
            value={remarks as string}
            rows={3}
            onChange={handleRemarks}
          />
          <FormControlLabel
            label="Auto-sync all AGSE data sources"
            control={<Checkbox checked={syncAll} onChange={(_, value) => handleSync(value)} />}
          />
          <Stack direction="row" spacing={3} justifyContent="flex-end" alignItems="center">
            <Button variant="outlined" size="large" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              data-testid="save-button"
              size="large"
              onClick={handleSave}
              disabled={isEditLoading}
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

export default AGSESingleEdit;
