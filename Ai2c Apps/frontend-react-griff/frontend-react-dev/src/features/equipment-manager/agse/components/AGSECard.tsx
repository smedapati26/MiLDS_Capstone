import React from 'react';

import { Paper, Stack, Typography } from '@mui/material';

import ConditionStatus from '@features/equipment-manager/components/ConditionStatus';

import { IAggregateCondition } from '@store/griffin_api/agse/models';

interface Props {
  data: IAggregateCondition;
}

/**
 * AGSE Card that shows the status of the AGSE Carousel
 * @param {IAggregateCondition} props.data - aggregated data to show
 * @returns JSX.Element
 */

const AGSECard: React.FC<Props> = ({ data }: Props): JSX.Element => {
  return (
    <Paper sx={{ width: 'fit-content' }} elevation={3} data-testid="em-agse-status-paper">
      <Stack sx={{ m: '20px 16px' }} spacing={3} direction="column">
        <Typography variant="body2">{data.displayName}</Typography>
        <ConditionStatus title={data.displayName} status={'FMC'} count={data.fmc} total={data.total} />
        <ConditionStatus title={data.displayName} status={'PMC'} count={data.pmc} total={data.total} />
        <ConditionStatus title={data.displayName} status={'NMC'} count={data.nmc} total={data.total} />
      </Stack>
    </Paper>
  );
};

export default AGSECard;
