import React from 'react';

import { Box, Paper, Stack, Typography } from '@mui/material';

import { AirframeIcon } from '@components/AirframeIcon';

type Label = 'aircraft' | 'UAS' | 'AGSE';

/**
 * Empty page when no data is found
 * @param {Label} props.label - label of which type of emptiness it is
 */
const EmptyEquipmentManager: React.FC<{ label?: Label }> = ({ label = 'aircraft' }: { label?: Label }): JSX.Element => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        data-testid="em-empty-data"
        sx={{
          width: 'fit-content',
          p: 13,
          borderRadius: 4,
          boxShadow: 0,
          mt: 13,
        }}
      >
        <Stack direction="column" alignItems="center">
          <AirframeIcon name="default" width="111" height="30" style={{ marginBottom: '24px' }} />
          <Typography variant="h6" sx={{ mb: 3 }}>
            No {label} found
          </Typography>
          <Typography variant="body1">
            Aircraft and equipment details of the selected unit will display here.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default EmptyEquipmentManager;
