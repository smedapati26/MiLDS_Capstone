import { useCallback, useEffect, useState } from 'react';

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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';

import { AircraftSerialDropdown } from '@components/dropdowns';
import MaintenanceDetails from '@features/maintenance-schedule/components/Calendar/AddEditMaintenance/MaintenanceDetails';
import {
  resetMaintenanceLaneSlice,
  resetMaintenanceScheduleForm,
  selectAircraftSerialId,
  selectEventEnd,
  selectEventStart,
  selectInspectionReferenceId,
  selectLaneId,
  selectMaintenanceType,
  selectNotes,
  setAircraftSerialId,
  setEventEnd,
  setEventStart,
  setInspectionReferenceId,
  setLaneId,
  setMaintenanceType,
  setNotes,
} from '@features/maintenance-schedule/slices';
import { selectActiveEvent } from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';
import { resetPhaseTeam, selectPhaseTeam, setPhaseTeam } from '@features/maintenance-schedule/slices/phaseTeamSlice';

import { mapToIPhaseTeam } from '@store/amap_api/personnel/models';
import {
  useAddPhaseTeamMutation,
  useGetPhaseTeamQuery,
  useUpdatePhaseTeamMutation,
} from '@store/amap_api/personnel/slices';
import { MaintenanceEventPostDto } from '@store/griffin_api/events/models';
import {
  UpdateMaintenancePayload,
  useAddMaintenanceEventMutation,
  useDeleteMaintenanceEventMutation,
  useGetMaintenanceEventQuery,
  useUpdateMaintenanceEventMutation,
} from '@store/griffin_api/events/slices';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  selectCurrentUic,
  selectCurrentUnitAdmin,
  selectCurrentUnitAmapManager,
  selectCurrentUnitWrite,
} from '@store/slices/appSettingsSlice';

const AddEditMaintenanceForm = ({
  buttonLabel = 'Add',
  onCancel,
  onSubmit,
}: {
  buttonLabel?: string;
  onCancel: () => void;
  onSubmit?: () => void;
}): JSX.Element => {
  const dispatch = useAppDispatch();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const serialId = useAppSelector(selectAircraftSerialId);
  const endDate = useAppSelector(selectEventEnd);
  const startDate = useAppSelector(selectEventStart);
  const lane = useAppSelector(selectLaneId);
  const inspectionReference = useAppSelector(selectInspectionReferenceId);
  const maintenanceType = useAppSelector(selectMaintenanceType);
  const notes = useAppSelector(selectNotes);
  const currentUnitWrite = useAppSelector(selectCurrentUnitWrite);
  const currentUnitAdmin = useAppSelector(selectCurrentUnitAdmin);
  const canEdit = currentUnitWrite || currentUnitAdmin;
  const currentUnitAmapManager = useAppSelector(selectCurrentUnitAmapManager);
  const activeEvent = useAppSelector(selectActiveEvent);
  const phaseTeam = useAppSelector(selectPhaseTeam);

  const [addMaintenanceEvent] = useAddMaintenanceEventMutation();
  const [updateMaintenanceEvent] = useUpdateMaintenanceEventMutation();
  const [deleteMaintenanceEvent] = useDeleteMaintenanceEventMutation();

  const [addPhaseTeam] = useAddPhaseTeamMutation();
  const [updatePhaseTeam] = useUpdatePhaseTeamMutation();

  const { data: eventData } = useGetMaintenanceEventQuery(
    { eventId: String(activeEvent) },
    {
      skip: activeEvent == null,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: phaseTeamDto, error: phaseTeamError } = useGetPhaseTeamQuery(
    activeEvent ? { phaseId: activeEvent } : skipToken,
  );

  useEffect(() => {
    if (phaseTeamDto) {
      dispatch(setPhaseTeam(mapToIPhaseTeam(phaseTeamDto)));
    } else if (phaseTeamError && 'status' in phaseTeamError && phaseTeamError.status === 404) {
      dispatch(resetPhaseTeam());
    }
  }, [phaseTeamDto, phaseTeamError, dispatch]);

  useEffect(() => {
    if (!activeEvent && !phaseTeam) {
      dispatch(
        setPhaseTeam({
          id: 0,
          phaseId: 0,
          phaseLeadUserId: '',
          assistantPhaseLeadUserId: '',
          phaseMembers: [],
        }),
      );
    }
  }, [activeEvent, phaseTeam, dispatch]);

  // Prefill form state when editing
  useEffect(() => {
    if (!eventData) return;
    if (eventData.inspectionReference && typeof eventData.inspectionReference.id === 'number') {
      dispatch(setInspectionReferenceId(eventData.inspectionReference.id));
    }
    dispatch(setLaneId(Number(eventData.laneId)));
    dispatch(setEventStart(eventData.startDate));
    dispatch(setEventEnd(eventData.endDate));
    dispatch(setNotes(eventData.notes || ''));
    dispatch(setAircraftSerialId(String(eventData.aircraft.serialNumber)));
  }, [eventData, dispatch]);

  const selectedSerial = serialId ? [String(serialId)] : [];

  const currentUic = useAppSelector(selectCurrentUic);
  const [prevUic, setPrevUic] = useState(currentUic);

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

  const handleSelectedSerial = (values: string[]): void => {
    const justSerial = values[0].split(' - ')[0];
    dispatch(setAircraftSerialId(justSerial));
  };

  const isActive = Boolean(lane) && Boolean(startDate) && Boolean(endDate);

  const handleCancelClick = () => {
    resetForm();
    onCancel();
  };

  const handleDeleteClick = async () => {
    try {
      if (activeEvent) {
        await deleteMaintenanceEvent(activeEvent);
      }
    } catch (error) {
      console.error('Error deleting maintenance event', error);
    }

    resetForm();
    onCancel();
  };

  const handleAddClick = async () => {
    try {
      let maintenanceId = activeEvent;

      // 1. CREATE or UPDATE maintenance event
      if (activeEvent) {
        const updatePayload: UpdateMaintenancePayload = {
          id: activeEvent,
          aircraft_id: serialId,
          lane_id: lane,
          maintenance_type: maintenanceType,
          event_start: startDate,
          event_end: endDate,
          notes: notes,
        };
        if (inspectionReference !== null) {
          updatePayload.inspection_reference_id = inspectionReference;
        }

        await updateMaintenanceEvent(updatePayload).unwrap();
      } else {
        const createPayload: MaintenanceEventPostDto = {
          aircraft_id: serialId,
          lane_id: lane,
          maintenance_type: maintenanceType,
          event_start: startDate,
          event_end: endDate,
          notes: notes,
        };

        if (inspectionReference !== null) {
          createPayload.inspection_reference_id = inspectionReference;
        }

        const newEvent = await addMaintenanceEvent(createPayload).unwrap();
        maintenanceId = String(newEvent.id);
      }

      // 2. CREATE or UPDATE phase team
      if (phaseTeam && maintenanceId && phaseTeam.phaseLeadUserId !== '' && phaseTeam.assistantPhaseLeadUserId !== '') {
        const teamPayload = {
          phaseId: Number(maintenanceId),
          phase_lead_user_id: phaseTeam.phaseLeadUserId,
          assistant_phase_lead_user_id: phaseTeam.assistantPhaseLeadUserId,
          phase_members: phaseTeam.phaseMembers,
        };

        if (phaseTeam.id === 0) {
          await addPhaseTeam(teamPayload).unwrap();
        } else {
          await updatePhaseTeam(teamPayload).unwrap();
        }
      }

      // Reset form state and trigger callbacks
      resetForm();
      onSubmit?.();
      onCancel(); // <-- close the toolbar
    } catch (error) {
      console.error('Error saving maintenance event or phase team: ', error);
    }
  };

  return (
    <FormControl
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <Box>
        <Typography variant="body2" mb={3}>
          Aircraft
        </Typography>
        <Box>
          <AircraftSerialDropdown values={selectedSerial} handleSelect={handleSelectedSerial} disabled={!canEdit} />
        </Box>

        {selectedSerial.length > 0 && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <ToggleButtonGroup
              value={maintenanceType}
              exclusive
              onChange={(_, value) => {
                if (value) dispatch(setMaintenanceType(value));
                dispatch(setInspectionReferenceId(null));
                dispatch(setLaneId(null));
                dispatch(setEventStart(null));
                dispatch(setEventEnd(null));
                dispatch(setNotes(''));
              }}
              size="small"
              aria-label="maintenance mode toggle"
              disabled={buttonLabel == 'Update'}
            >
              <ToggleButton value="INSP" aria-label="Inspection Mode">
                INSPECTION
              </ToggleButton>
              <ToggleButton value="OTHER" aria-label="Other Mode">
                OTHER
              </ToggleButton>
            </ToggleButtonGroup>

            <MaintenanceDetails serial={selectedSerial[0]} type={maintenanceType} />
          </Box>
        )}
      </Box>

      {selectedSerial.length !== 0 && (
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
          <Stack spacing={3} direction="row" justifyContent="flex-end">
            <Button variant="outlined" data-testid="cancel-maintenance-button" onClick={handleCancelClick}>
              Cancel
            </Button>
            {buttonLabel == 'Update' && (
              <Button
                variant="contained"
                disabled={!isActive || !canEdit}
                data-testid="add-maintenance-button"
                onClick={() => setConfirmOpen(true)}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              disabled={!isActive || !(canEdit || currentUnitAmapManager)}
              data-testid="add-maintenance-button"
              onClick={handleAddClick}
            >
              {buttonLabel}
            </Button>
          </Stack>
        </Box>
      )}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Event Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to delete this maintenance event?
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

export default AddEditMaintenanceForm;
