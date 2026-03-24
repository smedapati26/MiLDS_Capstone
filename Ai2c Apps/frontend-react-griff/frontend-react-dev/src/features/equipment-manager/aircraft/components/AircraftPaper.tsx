import React from 'react';

import { Box, Divider, Paper, Stack, Typography } from '@mui/material';

import { AirframeIcon } from '@components/AirframeIcon';
import ReadyToLaunch from '@features/equipment-manager/components/ReadyToLaunch';
import StatusCard from '@features/equipment-manager/components/StatusCard';

import { IAircraftModelStatus } from '@store/griffin_api/equipment/models/IEquipment';

interface Props {
  item: IAircraftModelStatus;
}

/**
 * Card component for aircraft information
 * @param {IAircraftModelStatus} item - Aircraft status data
 * @returns JSX.Element
 */

const AircraftPaper: React.FC<Props> = ({ item }: Props): JSX.Element => {
  return (
    <Paper sx={{ p: 0, width: 'fit-content' }} elevation={3} data-testid="em-aircraft-paper">
      <Stack sx={{ my: 5, mx: 4 }}>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {item.model}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ mb: 3 }} width="100%" display="flex" alignItems="center" justifyContent="center">
            <AirframeIcon data-testid={`airframe-icon-${item.model}`} name={item.model} width="111" height="30" />
          </Box>
        </Box>
        <Stack direction="row" spacing={6} sx={{ width: '100%', mb: 3 }}>
          <ReadyToLaunch title={'RTL'} value={`${item.rtl}`} />
          <ReadyToLaunch title={'NRTL'} value={`${item.nrtl}`} />
          <Divider orientation="vertical" flexItem />
          <ReadyToLaunch title={'In Phase'} value={`${item.inPhase} / ${item.total}`} />
        </Stack>
        <Stack direction="column" spacing={3}>
          <Stack direction="row" spacing={3}>
            <StatusCard
              title={item.model}
              label="Aircraft"
              status={'FMC'}
              total={item.fmcCount}
              percentage={`${Math.round(item.fmcPercent * 100)}%`}
            />
            <StatusCard
              title={item.model}
              label="Aircraft"
              status={'PMC'}
              total={item.pmcCount}
              percentage={`${Math.round(item.pmcPercent * 100)}%`}
            />
          </Stack>
          <Stack direction="row" spacing={3}>
            <StatusCard
              title={item.model}
              label="Aircraft"
              status={'NMC'}
              total={item.nmcCount}
              percentage={`${Math.round(item.nmcPercent * 100)}%`}
            />
            <StatusCard
              title={item.model}
              label="Aircraft"
              status={'DADE'}
              total={item.dadeCount}
              percentage={`${Math.round(item.dadePercent * 100)}%`}
            />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AircraftPaper;
