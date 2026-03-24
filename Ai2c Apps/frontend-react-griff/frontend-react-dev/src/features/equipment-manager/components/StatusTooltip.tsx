import React from 'react';

import { Card, Stack, Typography, useTheme } from '@mui/material';

import { OrStatusTableCell } from '@components/data-tables';

export type StatusTooltipLabel = 'Aircraft' | 'UAS' | 'AGSE';

type Props = {
  title: string;
  status: string;
  total: number;
  percentage: string;
  color: string;
  label: StatusTooltipLabel;
};

/**
 * Tooltip to show status information
 * @param {string} props.title - aircraft model
 * @param {string} props.status - status name
 * @param {number} props.total - number of aircraft with that status
 * @param {string} props.percentage - percentage of aircraft with that status
 * @param {string} props.color - color of status
 * @param {StatusTooltipLabel} props.label - label wording for tooltip
 * @returns JSX.Element
 */

const StatusTooltip: React.FC<Props> = ({ title, status, total, percentage, label }: Props): JSX.Element => {
  const theme = useTheme();

  return (
    <Card data-testid="em-status-tooltip" sx={{ m: 0, p: 0 }}>
      <Stack direction="column" sx={{ p: 3 }} spacing={2}>
        <Typography variant="body3" sx={{ fontWeight: 500, lineHeight: '16px' }}>{`${title} Status`}</Typography>
        <OrStatusTableCell status={status} />
        <Stack direction="row" spacing={2}>
          <Typography variant="body3" sx={{ color: theme.palette.text.secondary }}>
            # of {label} in Status:
          </Typography>
          <Typography variant="body3">{total}</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Typography variant="body3" sx={{ color: theme.palette.text.secondary }}>
            % of {label} in Status:
          </Typography>
          <Typography variant="body3">{percentage}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export default StatusTooltip;
