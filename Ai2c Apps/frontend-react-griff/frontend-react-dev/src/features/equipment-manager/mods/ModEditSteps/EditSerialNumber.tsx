import React, { useState } from 'react';

import { Box, FormControl, InputLabel, Stack, TextField, Typography } from '@mui/material';

import { ModAircraftAssignment } from '../helper';

interface Props {
  assignedAircraft: ModAircraftAssignment[];
  setAssignedAircraft: React.Dispatch<React.SetStateAction<ModAircraftAssignment[]>>;
}

/**
 * Component to update Serial Numbers
 * @params {string}
 * @returns JSX.Element
 */
const EditSerialNumber: React.FC<Props> = (props: Props): JSX.Element => {
  const { assignedAircraft, setAssignedAircraft } = props;

  // Make a copy of the original data on mount to display previous label.
  const [originalAircraft] = useState(() =>
    assignedAircraft.map((item) => ({ ...item, serialNumber: String(item.serialNumber) })),
  );

  const handleSerialAssignment = (serialNumber: string, modId: number) => {
    setAssignedAircraft((prev) => {
      return prev.map((assignment) => {
        if (assignment.id === modId) {
          return { id: assignment.id, serialNumber: serialNumber, aircraft: assignment.aircraft };
        }
        return assignment;
      });
    });
  };

  return (
    <Box width="100%">
      {assignedAircraft.map(({ id, serialNumber }) => {
        const original = originalAircraft.find((item) => item.id === id)?.serialNumber;
        return (
          <Box key={`${id}-serial-entry`} sx={{ pb: 5, width: '100%' }}>
            <Typography sx={{ pt: 1, pb: 5 }}>Edit mod SN {original}.</Typography>
            <Stack direction="row" spacing={3}>
              <FormControl fullWidth sx={{ marginBottom: 4 }}>
                <InputLabel shrink id={`serial-number-${id}`}>
                  Mod Serial Number
                </InputLabel>
                <TextField
                  id="edit-serial-number-textbox"
                  data-testid="edit-serial-number-textbox"
                  label="Mod Serial Number"
                  size="small"
                  value={serialNumber}
                  sx={{ width: '100%' }}
                  onChange={(e) => handleSerialAssignment(e.target.value, id)}
                />
              </FormControl>
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
};

export default EditSerialNumber;
