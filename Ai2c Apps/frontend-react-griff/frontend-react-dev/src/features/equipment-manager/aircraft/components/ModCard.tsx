import React from 'react';

import EditIcon from '@mui/icons-material/Edit';
import { Card, Divider, Stack, Typography, useTheme } from '@mui/material';

interface Props {
  title: string;
  count: number;
  isSelected: boolean;
  onClick: (value: string) => void;
}

/**
 * ModsKitsCard for aircraft equipment-manager
 * @param {Props} props - component props
 * @param {string} props.title - title of Mods
 * @param {number} props.count - number of assigned mods
 * @param {(value: string[]) => void} props.onClick
 * @returns
 */

const ModCard: React.FC<Props> = (props: Props): React.ReactNode => {
  const { title, count, isSelected, onClick } = props;
  const theme = useTheme();

  return (
    <Card
      data-testid="mod-card"
      sx={{
        p: '20px 16px',
        cursor: 'pointer',
        width: 'fit-content',
        minWidth: '200px',
        bgcolor: theme.palette.layout.background12,
        borderColor: isSelected ? theme.palette.primary.main : 'none',
      }}
      onClick={() => onClick(title)}
    >
      <Stack direction="column" spacing={3}>
        <Typography variant="body2">{title.replace(/_/g, ' ')}</Typography>
        <Divider orientation="horizontal" flexItem sx={{ width: '100%' }} />
        <Typography variant="body3">Assigned</Typography>
        <Typography variant="h6">{count}</Typography>
        <Stack direction="row" justifyContent="flex-end">
          <EditIcon fontSize="small" />
        </Stack>
      </Stack>
    </Card>
  );
};

export default ModCard;
