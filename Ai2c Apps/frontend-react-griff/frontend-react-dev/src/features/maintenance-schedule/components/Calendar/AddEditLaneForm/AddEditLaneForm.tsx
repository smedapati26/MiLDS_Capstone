import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { Heading } from '@ai2c/pmx-mui';

import { AircraftDropdown } from '@components/dropdowns';
import { resetMaintenanceLaneSlice, resetMaintenanceScheduleForm } from '@features/maintenance-schedule/slices';
import { resetPhaseTeam } from '@features/maintenance-schedule/slices/phaseTeamSlice';

import { AutoDsrTagEnum } from '@store/griffin_api/auto_dsr/cacheTags';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { EventsTagEnum } from '@store/griffin_api/events/cacheTags';
import { IMaintenanceLane } from '@store/griffin_api/events/models';
import { maintenanceApi } from '@store/griffin_api/events/slices';
import {
  useAddLaneMutation,
  useDeleteLaneMutation,
  useGetLanesQuery,
  useUpdateLaneMutation,
} from '@store/griffin_api/events/slices';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';
import { selectCurrentUnitAdmin, selectCurrentUnitWrite } from '@store/slices/appSettingsSlice';

import LaneUnitDropdown from './LaneUnitSelect';

interface Props {
  onCancel: () => void;
  onSubmit: () => void;
  lane?: IMaintenanceLane | null;
}

const AddEditLaneForm = ({ onCancel, onSubmit, lane }: Props): JSX.Element => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const currentUic = useAppSelector(selectCurrentUic);
  const { data: lanes } = useGetLanesQuery(currentUic);
  const { data: units } = useGetUnitsQuery({ topLevelUic: currentUic ?? '' });
  const [createLane, { isLoading: creating }] = useAddLaneMutation();
  const [updateLane, { isLoading: updating }] = useUpdateLaneMutation();
  const [deleteLane, { isLoading: deleting }] = useDeleteLaneMutation();
  const currentUnitWrite = useAppSelector(selectCurrentUnitWrite);
  const currentUnitAdmin = useAppSelector(selectCurrentUnitAdmin);
  const canEdit = currentUnitWrite || currentUnitAdmin;
  const [prevUic, setPrevUic] = useState(currentUic);

  const dispatch = useAppDispatch();

  const resetForm = useCallback(() => {
    dispatch(resetMaintenanceScheduleForm());
    dispatch(resetPhaseTeam());
    dispatch(resetMaintenanceLaneSlice());
  }, [dispatch]);

  useEffect(() => {
    if (prevUic && prevUic !== currentUic) {
      resetForm();
    }
    setPrevUic(currentUic);
  }, [currentUic, prevUic, resetForm]);

  const handleCancelClick = () => {
    resetForm();
    onCancel();
  };

  const [formState, setFormState] = useState({
    name: '',
    unit_id: currentUic ?? '',
    airframes: [] as string[],
    internal: 'internal',
    contractor: false,
  });
  const [submitError, setSubmitError] = useState<boolean>(false);

  const isDuplicateName = useMemo(() => {
    if (!formState.name || !lanes) return false;

    return lanes.some(
      (l) => l.name.trim().toLowerCase() === formState.name.trim().toLowerCase() && (!lane || lane.id !== l.id),
    );
  }, [formState.name, lanes, lane]);

  useEffect(() => {
    if (lane) {
      setFormState({
        name: lane.name,
        unit_id: lane.unitUic,
        airframes: lane.airframeFamilies,
        internal: lane.isInternal ? 'internal' : 'external',
        contractor: lane.isContractor,
      });
    }
  }, [lane]);

  type LaneFormField = 'name' | 'unit_id' | 'airframes' | 'internal' | 'contractor';

  const handleChange = (field: LaneFormField, value: string | string[] | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleOnSubmit = async () => {
    setSubmitError(false);
    const airframeReplacements: Record<string, string> = {
      'Black Hawk': 'UH-60M',
      Apache: 'AH-64E',
      Chinook: 'CH-47F',
      Lakota: 'UH-72A',
    };

    const filteredAirframes = formState.airframes.map((name) => {
      // Check if name matches any of the keys (case-insensitive)
      const match = Object.keys(airframeReplacements).find((key) => key.toLowerCase() === name.toLowerCase());

      return match ? airframeReplacements[match] : name;
    });

    const payload = {
      unit_id: formState.unit_id,
      airframes: filteredAirframes,
      name: formState.name,
      contractor: formState.contractor,
      internal: formState.internal === 'internal',
    };

    const result = lane ? await updateLane({ id: lane.id, ...payload }) : await createLane(payload);

    if ('error' in result) {
      setSubmitError(true);
    } else {
      onSubmit();
    }
  };

  const handleDeleteClick = async () => {
    try {
      if (lane) {
        await deleteLane(lane.id);
      }
    } catch (error) {
      console.error('Error deleting maintenance event', error);
    }
    dispatch(
      maintenanceApi.util.invalidateTags([
        { type: EventsTagEnum.MAINTENANCE_EVENTS },
        { type: AutoDsrTagEnum.BANK_TIME_FORECAST },
      ]),
    );
    resetForm();
    onCancel();
  };

  const isLoading = creating || updating;

  return (
    <FormControl sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
      <Box>
        <Heading variant="body2">Lane Details</Heading>
        <Stack gap={4} mt={2}>
          <LaneUnitDropdown
            units={units ?? []}
            value={formState.unit_id}
            onChange={(unit) => handleChange('unit_id', unit.uic)}
          />

          <ToggleButtonGroup
            value={formState.internal}
            exclusive
            size="small"
            onChange={(_, value) => value && handleChange('internal', value)}
            aria-label="schedule item form type"
            sx={{ '& .MuiToggleButton-root': { px: '23px' } }}
          >
            <ToggleButton value="internal">Internal</ToggleButton>
            <ToggleButton value="external">External</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            required
            label="Lane Name"
            value={formState.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={submitError && !formState.name}
            helperText={isDuplicateName ? 'A lane with this name already exists for this unit.' : ''}
          />
          <AircraftDropdown selected={formState.airframes} handleSelect={(value) => handleChange('airframes', value)} />
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, flexDirection: 'column' }}>
        {!canEdit && (
          <Typography
            variant="caption"
            color="error"
            sx={{ textAlign: 'left', mb: 1 }}
            data-testid="permission-warning"
          >
            You must have elevated permissions to add/edit.
          </Typography>
        )}
        <Stack direction="row" gap={2}>
          <Button variant="outlined" onClick={handleCancelClick}>
            Cancel
          </Button>
          {lane && (
            <Button variant="contained" onClick={() => setConfirmOpen(true)} disabled={deleting || !canEdit}>
              Delete
            </Button>
          )}
          <Button variant="contained" onClick={handleOnSubmit} disabled={isLoading || !canEdit}>
            {lane ? 'Update' : 'Add'}
          </Button>
        </Stack>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Lane Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to delete this lane?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setConfirmOpen(false);
              await handleDeleteClick();
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </FormControl>
  );
};

export default AddEditLaneForm;
