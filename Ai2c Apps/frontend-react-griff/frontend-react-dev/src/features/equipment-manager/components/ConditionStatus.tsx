import React from 'react';

import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { Box, Card, Divider, Stack, Tooltip, Typography } from '@mui/material';

import StatusTooltip from '@features/equipment-manager/components/StatusTooltip';
import useDataDisplayTagColor from '@hooks/useDataDisplayTagColor';

type Icon = 'airplane' | 'truck';
type Size = 'small' | 'medium';

interface Props {
  title: string;
  status: string;
  count: number;
  total: number;
  icon?: Icon;
  size?: Size;
}

/**
 * Simplified version of the Status Card tooltip, was used to simply show the data.
 */
const ConditionStatus: React.FC<Props> = ({ title, status, count, total, icon = 'truck' }: Props): JSX.Element => {
  const percentage: string = `${Math.round((count / total) * 100)}%`;

  const { color, backgroundColor } = useDataDisplayTagColor(status);
  const vehicleIcon =
    icon === 'truck' ? <LocalShippingIcon fontSize="small" /> : <AirplanemodeActiveIcon fontSize="small" />;
  return (
    <Tooltip
      placement="top"
      title={
        <StatusTooltip
          label="AGSE"
          title={title}
          status={status}
          total={count}
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
      <Card
        sx={{ p: '16px 12px', width: '100%', minWidth: '200px', height: 'fit-content' }}
        data-testid="em-condition-status"
      >
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" alignItems="center">
            <Box
              data-testid={`em-status-color-${backgroundColor}`}
              sx={{
                width: 10,
                height: 10,
                bgcolor: backgroundColor,
                borderRadius: '50%',
                mr: 2,
                ml: 2,
              }}
            />
            <Typography variant="body1">{status}</Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              {vehicleIcon}
              <Typography variant="body2">{count === 0 ? '\u2014' : count}</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2">{percentage}</Typography>
          </Stack>
        </Stack>
      </Card>
    </Tooltip>
  );
};

export default ConditionStatus;
