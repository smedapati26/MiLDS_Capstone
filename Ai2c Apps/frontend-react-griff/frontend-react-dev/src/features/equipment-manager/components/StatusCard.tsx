import React from 'react';

import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import { Box, Card, Divider, Stack, Tooltip, Typography } from '@mui/material';

import StatusTooltip, { StatusTooltipLabel } from '@features/equipment-manager/components/StatusTooltip';
import useDataDisplayTagColor from '@hooks/useDataDisplayTagColor';

type Props = {
  title: string;
  status: string;
  total: number;
  percentage: string;
  label: StatusTooltipLabel;
};

/**
 * Card of Status in Equipment manager
 * @param {string} props.title - aircraft model
 * @param {string} props.status - status name
 * @param {number} props.total - number of aircraft with that status
 * @param {string} props.percentage - percentage of aircraft with that status
 * @param {string} props.color - color of status
 * @param {StatusTooltipLabel} props.label - label for wording of tooltip
 * @returns JSX.Element
 */

const StatusCard: React.FC<Props> = ({ title, status, total, percentage, label }: Props): JSX.Element => {
  const { color, backgroundColor } = useDataDisplayTagColor(status);
  return (
    <Tooltip
      placement="top"
      title={
        <StatusTooltip
          label={label}
          title={title}
          status={status}
          total={total}
          percentage={percentage}
          color={color as string}
        />
      }
      slotProps={{
        tooltip: {
          sx: {
            p: 0,
            m: 0,
          },
        },
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -20] } }],
        },
      }}
    >
      <span>
        <Card
          sx={{
            width: 'fit-content',
            height: 'fit-content',
            minWidth: '142px',
            minHeight: '74px',
            p: 4,
            boxShadow: 'none',
          }}
          data-testid="em-status-card"
        >
          <Stack direction="column" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignContent="center" alignItems="center">
              <Box
                data-testid={`em-status-color-${backgroundColor}`}
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: backgroundColor,
                  borderRadius: '50%',
                  mr: 2,
                  ml: 2,
                }}
              />
              <Typography variant="body1">{status}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <AirplanemodeActiveIcon fontSize="small" />
                <Typography variant="body2">{total}</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">{percentage}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </span>
    </Tooltip>
  );
};

export default StatusCard;
