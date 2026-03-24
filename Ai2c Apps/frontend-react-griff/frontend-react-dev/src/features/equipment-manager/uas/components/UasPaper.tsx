import React from 'react';

import { Paper, Stack, Typography } from '@mui/material';

import ReadyToLaunch from '@features/equipment-manager/components/ReadyToLaunch';
import StatusCard from '@features/equipment-manager/components/StatusCard';

export interface UasPaperData {
  model: string;
  rtl: number;
  nrtl: number;
  inPhase: number;
  total: number;
  fmc: number;
  pmc: number;
  nmc: number;
  dade: number;
}

const UasPaper: React.FC<{ data: UasPaperData }> = ({ data }: { data: UasPaperData }): React.ReactNode => {
  return (
    <Paper sx={{ p: 0, width: 'fit-content' }} elevation={3} data-testid="em-uas-paper">
      <Stack direction="column" sx={{ my: 5, mx: 4 }} spacing={3}>
        <Typography variant="body2">{data.model}</Typography>
        <Stack direction="row" spacing={6}>
          <ReadyToLaunch title="RTL" value={data.rtl as unknown as string} />
          <ReadyToLaunch title="NRTL" value={data.nrtl as unknown as string} />
        </Stack>
        <Stack direction="column" spacing={3}>
          <Stack direction="row" spacing={3}>
            <StatusCard
              title={data.model}
              label="UAS"
              status="FMC"
              total={data.fmc}
              percentage={`${Math.round((data.fmc / data.total) * 100)}%`}
            />
            <StatusCard
              title={data.model}
              label="UAS"
              status="PMC"
              total={data.pmc}
              percentage={`${Math.round((data.pmc / data.total) * 100)}%`}
            />
          </Stack>
          <Stack direction="row" spacing={3}>
            <StatusCard
              title={data.model}
              label="UAS"
              status="NMC"
              total={data.nmc}
              percentage={`${Math.round((data.nmc / data.total) * 100)}%`}
            />
            <StatusCard
              title={data.model}
              label="UAS"
              status="DADE"
              total={data.dade}
              percentage={`${Math.round((data.dade / data.total) * 100)}%`}
            />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default UasPaper;
