import React from 'react';

import { Card, Stack, Theme, Typography } from '@mui/material';

import { OrStatusTableCell } from '@components/data-tables';

interface Props {
  title: string;
  status: string;
  icon: React.ReactNode;
  total: number;
}

/**
 * The pop up for condition status seen in UAS and AGSE
 * @param {string} props.title - title of status popup
 * @param {string} props.status - status name
 * @param {React.ReactNode} props.icon - icon to show
 * @param {number} props.total - total to show.
 * @returns React.ReactNode
 */
const ConditionTooltip: React.FC<Props> = ({ title, status, icon, total }: Props): React.ReactNode => {
  return (
    <Card data-testid="em-condition-status-tooltip" sx={{ m: 0, p: 0 }}>
      <Stack p={3} spacing={2}>
        <Typography variant="body4">{`${title} Status`}</Typography>
        <OrStatusTableCell status={status} />
        <Stack direction="row" spacing={2} alignItems="center">
          {icon}
          <Typography variant="body3" sx={{ color: (theme: Theme) => theme.palette.text.secondary }}>
            # of Aircraft in Status:
          </Typography>
          <Typography variant="body3">{total}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ConditionTooltip;
