import { Chip, Typography, useTheme } from '@mui/material';

import { CenterItem } from '@components/alignment';
import { StatusType } from '@utils/constants';

export interface StatusDisplayProps {
  status: StatusType;
  iconOnly?: boolean;
}

const StatusDisplay = ({ status, iconOnly = false }: StatusDisplayProps) => {
  const theme = useTheme();

  const statusConfig = {
    Available: {
      title: 'Available',
      color: theme.palette.mode === 'dark' ? theme.palette.success.l80 : theme.palette.success.d20,
      textColor: theme.palette.mode === 'dark' ? theme.palette.success.d60 : theme.palette.grey.white,
    },
    Approved: {
      title: 'Approved',
      color: theme.palette.mode === 'dark' ? theme.palette.success.l80 : theme.palette.success.d20,
      textColor: theme.palette.mode === 'dark' ? theme.palette.success.d60 : theme.palette.grey.white,
    },
    'Flagged - Available': {
      title: 'Flagged - Available',
      color: theme.palette.info.l60,
      textColor: theme.palette.common.white,
    },
    'Flagged - Limited': {
      title: 'Limited',
      color: theme.palette.mode === 'dark' ? theme.palette.warning.l60 : theme.palette.warning.main,
      textColor: theme.palette.mode === 'dark' ? theme.palette.warning.d60 : theme.palette.common.white,
    },
    'Flagged - Unavailable': {
      title: 'Unavailable',
      color: theme.palette.mode === 'dark' ? theme.palette.error.l80 : theme.palette.error.d20,
      textColor: theme.palette.mode === 'dark' ? theme.palette.error.d60 : theme.palette.grey.d80,
    },
    default: {
      title: 'Unknown Status',
      color: theme.palette.grey.d40,
      textColor: theme.palette.grey.d80,
    },
  };

  const { title, color, textColor } = statusConfig[status] || statusConfig.default;

  return (
    <CenterItem>
      {!iconOnly && <Typography variant="body1">Status:</Typography>}
      <Chip
        label={title}
        sx={{
          ml: iconOnly ? 0 : 4,
          bgcolor: color,
          fontWeight: 500,
          borderRadius: '3px',
          color: textColor,
        }}
      />
    </CenterItem>
  );
};

export default StatusDisplay;
