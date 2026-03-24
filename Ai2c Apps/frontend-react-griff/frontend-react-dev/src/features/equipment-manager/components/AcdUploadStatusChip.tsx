import React from 'react';

import CachedIcon from '@mui/icons-material/Cached';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/Pending';
import { Chip, Typography, useTheme } from '@mui/material';

import { AcdUploadStatus } from '@store/griffin_api/auto_dsr/models';

interface Props {
  status: AcdUploadStatus;
  succeeded: boolean;
}

/**
 * Upload status for ACD file based on status component
 *
 *
 */
const AcdUploadStatusChip: React.FC<Props> = ({ status, succeeded }: Props): React.ReactNode => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (status === 'Pending') {
    return (
      <Chip
        label={<Typography variant="body4">Pending</Typography>}
        icon={<PendingIcon />}
        variant="outlined"
        sx={{
          minWidth: '130px',
          ...(isDark
            ? { backgroundColor: theme.palette.grey[700], borderColor: theme.palette.grey[500], border: '1px solid' }
            : {
                backgroundColor: theme.palette.layout.background8,
                borderColor: theme.palette.grey[500],
                border: '1px solid',
              }),
        }}
      />
    );
  } else if (status === 'Processing') {
    return (
      <Chip
        label={<Typography variant="body4">Uploading</Typography>}
        icon={<CachedIcon />}
        variant="outlined"
        sx={{
          minWidth: '130px',
          ...(isDark
            ? { backgroundColor: theme.palette.info.d60, borderColor: theme.palette.info.dark, border: '1px solid' }
            : { backgroundColor: theme.palette.info.l80, borderColor: theme.palette.info.d40, border: '1px solid' }),
        }}
      />
    );
  } else if (status === 'Complete' && succeeded === true) {
    return (
      <Chip
        label={<Typography variant="body4">Complete</Typography>}
        icon={<CheckIcon />}
        variant="outlined"
        sx={{
          minWidth: '130px',
          ...(isDark
            ? {
                backgroundColor: theme.palette.success.d60,
                borderColor: theme.palette.success.l80,
                border: '1px solid',
              }
            : {
                backgroundColor: theme.palette.success.l80,
                borderColor: theme.palette.success.d20,
                border: '1px solid',
              }),
        }}
      />
    );
  } else if (status === 'Complete' && succeeded === false) {
    return (
      <Chip
        label={<Typography variant="body4">Failed</Typography>}
        icon={<ErrorOutlineIcon />}
        variant="outlined"
        sx={{
          minWidth: '130px',
          ...(isDark
            ? { backgroundColor: theme.palette.error.d60, borderColor: theme.palette.error.l20, border: '1px solid' }
            : { backgroundColor: theme.palette.error.l90, borderColor: theme.palette.error.d20, border: '1px solid' }),
        }}
      />
    );
  }

  return <>--</>;
};

export default AcdUploadStatusChip;
