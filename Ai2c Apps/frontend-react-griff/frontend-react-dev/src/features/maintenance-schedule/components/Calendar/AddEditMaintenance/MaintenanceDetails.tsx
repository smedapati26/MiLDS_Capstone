import dayjs, { Dayjs } from 'dayjs';

import { Box, FormControl, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { InspectionDropdown } from '@components/dropdowns/InspectionsDropdown';
import LaneDropdown from '@components/dropdowns/LaneDropdown';
import MaintainerDropdown from '@components/dropdowns/MaintainerDropdown';
import {
  selectEventEnd,
  selectEventStart,
  selectInspectionReferenceId,
  selectLaneId,
  selectNotes,
  setEventEnd,
  setEventStart,
  setInspectionReferenceId,
  setLaneId,
  setNotes,
} from '@features/maintenance-schedule/slices';
import {
  selectPhaseTeam,
  setAssistantPhaseLeadUserId,
  setPhaseLeadUserId,
  setPhaseMemberIds,
} from '@features/maintenance-schedule/slices/phaseTeamSlice';

import { useGetAircraftBySerialQuery } from '@store/griffin_api/aircraft/slices';
import { useGetInspectionTypesQuery } from '@store/griffin_api/inspections/slices';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  selectCurrentUnitAdmin,
  selectCurrentUnitAmapManager,
  selectCurrentUnitWrite,
} from '@store/slices/appSettingsSlice';

interface MaintenanceDetailsProps {
  serial: string;
  type?: string;
}
/**
 * MaintenanceDetails Functional Component
 *
 * @param { MaintenanceDetailsProps } props
 */
const MaintenanceDetails: React.FC<MaintenanceDetailsProps> = ({ serial, type }) => {
  const { data: aircraft } = useGetAircraftBySerialQuery(serial);
  const { data: inspectionTypes = [], isLoading: isLoadingInspectionTypes } = useGetInspectionTypesQuery(
    aircraft?.aircraftMds || '',
    {
      skip: !aircraft?.aircraftMds,
    },
  );

  const dispatch = useAppDispatch();

  const notes = useAppSelector(selectNotes);
  const endDate = useAppSelector(selectEventEnd);
  const startDate = useAppSelector(selectEventStart);
  const inspectionReference = useAppSelector(selectInspectionReferenceId);
  const selectedInspection = inspectionTypes.find((insp) => insp.id === inspectionReference);
  const isPhase = selectedInspection?.isPhase ?? false;
  const selectedLane = [String(useAppSelector(selectLaneId))];

  const currentUnitWrite = useAppSelector(selectCurrentUnitWrite);
  const currentUnitAdmin = useAppSelector(selectCurrentUnitAdmin);
  const currentUnitAmapManager = useAppSelector(selectCurrentUnitAmapManager);
  const canEdit = currentUnitWrite || currentUnitAdmin;

  const phaseTeam = useAppSelector(selectPhaseTeam);
  const phaseLead = phaseTeam?.phaseLeadUserId ?? '';
  const assistantLead = phaseTeam?.assistantPhaseLeadUserId ?? '';

  const showHelperText = (phaseLead && !assistantLead) || (!phaseLead && assistantLead);

  const handleInspectionChange = (event: SelectChangeEvent<number>): void => {
    dispatch(setInspectionReferenceId(Number(event.target.value)));
  };

  const handleStartDateChange = (newDate: Dayjs | null): void => {
    if (newDate) {
      dispatch(setEventStart(newDate.format('YYYY-MM-DD')));

      // Automatically set end date to 45 days later if no end date or it's before new start
      const newEndDate = newDate.add(45, 'day');
      if (!endDate || dayjs(endDate).isBefore(newDate)) {
        dispatch(setEventEnd(newEndDate.format('YYYY-MM-DD')));
      }
    }
  };

  const handleEndDateChange = (newDate: Dayjs | null): void => {
    if (newDate) dispatch(setEventEnd(newDate.format('YYYY-MM-DD')));
  };

  const handleLaneChange = (values: string[]): void => {
    dispatch(setLaneId(Number(values[0])));
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setNotes(event.target.value));
  };

  return (
    <>
      <Typography variant="body2" mt={5}>
        <b>{aircraft?.aircraftModel || 'Unknown Model'} Maintenance Type</b>
      </Typography>

      {type === 'OTHER' ? (
        <TextField
          label="Maintenance Event Name*"
          value={notes}
          onChange={handleNoteChange}
          fullWidth
          sx={{ mt: 2, mb: 4 }}
          disabled={!canEdit}
        />
      ) : (
        <FormControl fullWidth sx={{ mt: 2, mb: 4 }}>
          <InspectionDropdown
            inspectionTypes={inspectionTypes}
            selectedInspectionReferenceId={inspectionReference ? inspectionReference : null}
            onChange={handleInspectionChange}
            isLoading={isLoadingInspectionTypes}
            disabled={!canEdit}
          />
        </FormControl>
      )}

      {(inspectionReference != null || notes != '') && (
        <>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date*"
              value={startDate ? dayjs(startDate) : null}
              disabled={!canEdit}
              onChange={handleStartDateChange}
              sx={{ width: '100%', mb: 5 }}
            />
            <DatePicker
              label="End Date*"
              value={endDate ? dayjs(endDate) : null}
              disabled={!canEdit}
              onChange={handleEndDateChange}
              sx={{ width: '100%', mb: 5 }}
            />
          </LocalizationProvider>

          <Box>
            <LaneDropdown
              values={selectedLane}
              disabled={!canEdit}
              handleSelect={handleLaneChange}
              containerSx={{ width: '100%' }}
            />
          </Box>
        </>
      )}

      {startDate != null && endDate != null && isPhase && (
        <>
          <FormControl fullWidth sx={{ mt: 4 }}>
            <MaintainerDropdown
              label="Phase Lead"
              values={phaseTeam?.phaseLeadUserId ? [phaseTeam.phaseLeadUserId] : []}
              handleSelect={(values) => {
                dispatch(setPhaseLeadUserId(values[0] ?? ''));
              }}
              multiSelect={false}
              startDate={startDate}
              endDate={endDate}
              disabled={!(currentUnitAmapManager || canEdit)}
              helperText={
                showHelperText ? 'To set a phase team, you must set both a Phase Lead and Asst. Phase Lead' : ''
              }
            />
          </FormControl>

          <FormControl fullWidth sx={{ mt: 4 }}>
            <MaintainerDropdown
              label="Asst. Phase Lead"
              values={phaseTeam?.assistantPhaseLeadUserId ? [phaseTeam.assistantPhaseLeadUserId] : []}
              handleSelect={(values) => {
                dispatch(setAssistantPhaseLeadUserId(values[0] ?? ''));
              }}
              multiSelect={false}
              startDate={startDate}
              endDate={endDate}
              disabled={!(currentUnitAmapManager || canEdit)}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mt: 4 }}>
            <MaintainerDropdown
              label="Phase Members"
              values={phaseTeam?.phaseMembers ?? []}
              handleSelect={(values) => {
                dispatch(setPhaseMemberIds(values));
              }}
              multiSelect={true}
              startDate={startDate}
              endDate={endDate}
              disabled={!(currentUnitAmapManager || canEdit)}
            />
          </FormControl>
        </>
      )}
    </>
  );
};

export default MaintenanceDetails;
