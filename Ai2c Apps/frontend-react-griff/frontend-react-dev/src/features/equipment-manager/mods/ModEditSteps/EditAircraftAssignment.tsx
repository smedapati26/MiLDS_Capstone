import { FunctionComponent } from 'react';

import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';

import { useEquipmentManagerContext } from '@features/equipment-manager/EquipmentManagerContext';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';

import { ModAircraftAssignment } from '../helper';

/* Props for the step component. */
interface Props {
  assignedAircraft: ModAircraftAssignment[];
  setAssignedAircraft: React.Dispatch<React.SetStateAction<ModAircraftAssignment[]>>;
}

/**
 * A functional component that acts as a form for the Edit Aircraft Assignment step in Mods Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const EditAircraftAssignmentStep: FunctionComponent<Props> = (props: Props) => {
  const { assignedAircraft, setAssignedAircraft } = props;

  const { chosenUic } = useEquipmentManagerContext();
  const { data: aircraftData } = useGetAircraftByUicQuery(chosenUic, { skip: chosenUic === '' });

  /* Close modal and reset data */
  const handleAircraftAssignment = (aircraftSerial: string, modId: number) => {
    setAssignedAircraft((prev) => {
      return prev.map((assignment) => {
        if (assignment.id === modId) {
          return { id: assignment.id, serialNumber: assignment.serialNumber, aircraft: aircraftSerial };
        }
        return assignment;
      });
    });
  };

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box width="100%">
      {assignedAircraft.map(({ id, serialNumber, aircraft }) => (
        <Box key={id} sx={{ pb: 5, width: '50%' }}>
          <Typography sx={{ pt: 1, pb: 5 }}>Select an aircraft to assign {serialNumber} to.</Typography>
          <Stack direction="row" spacing={3}>
            <FormControl fullWidth sx={{ marginBottom: 4 }}>
              <InputLabel shrink required id={`aircraft-select-for-${id}-label`}>
                Aircraft Serial Number
              </InputLabel>
              <Select
                label="Aircraft Serial Number"
                labelId={`aircraft-select-for-${id}-label`}
                id={`aircraft-select-for-${id}`}
                data-testid={`aircraft-select-for-${id}`}
                value={aircraft ?? ''}
                onChange={(e) => handleAircraftAssignment(e.target.value, id)}
                required
                notched
                size="small"
                inputProps={{
                  'data-testid': `aircraft-select-for-${id}-input`,
                }}
              >
                {aircraftData?.map((aircraft) => (
                  <MenuItem key={aircraft.serial} value={aircraft.serial}>
                    {aircraft.serial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

export default EditAircraftAssignmentStep;
