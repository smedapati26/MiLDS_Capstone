import React from 'react';

import { Stack, Typography } from '@mui/material';

interface Props {
  isTransmitting?: boolean;
}

/**
 * Component that shows message of Pending file
 * @returns ReactNode
 */
const AcdPending: React.FC<Props> = ({ isTransmitting = false }: Props): React.ReactNode => {
  return (
    <Stack spacing={3}>
      <Typography variant="body1">
        Your file is pending upload. Uploads are started every 10 minutes. You can close the modal and we will e-mail
        you when your ACD is complete.
      </Typography>
      <Typography variant="body1">Cancelling your upload will remove all uploaded data</Typography>
      {isTransmitting && (
        <Typography variant="body1">
          Your file is currently <b>Transmitting</b>.
        </Typography>
      )}
    </Stack>
  );
};

export default AcdPending;
