import React, { useRef } from 'react';

import { Box, Divider, styled, Typography } from '@mui/material';

import { slugify } from '@ai2c/pmx-mui';

import {
  setActiveFormType,
  setActiveLane,
  setIsLaneEditFormOpen,
} from '@features/maintenance-schedule/slices/maintenanceLaneEditSlice';

import { IMaintenanceLane } from '@store/griffin_api/events/models';
import { useAppDispatch } from '@store/hooks';

import LaneTypeIndicator from './LaneTypeIndicator';

export interface Props {
  lane: IMaintenanceLane;
}

const StyledTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexGrow: 1,
  marginLeft: theme.spacing(3),
  marginRight: theme.spacing(3),
}));

export const LaneTitle: React.FC<Props> = ({ lane }) => {
  const { name, isInternal, isContractor } = lane;
  const dispatch = useAppDispatch();
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);

    clickTimer.current = setTimeout(() => {
      dispatch(setActiveLane(lane));
      dispatch(setActiveFormType('lane'));
      dispatch(setIsLaneEditFormOpen(true));

      clickCount.current = 0;
      clickTimer.current = null;
    }, 250);
  };

  return (
    <Box
      key={`lane-title-${slugify(name)}`}
      onClick={handleClick}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '80px',
        cursor: 'pointer',
      }}
    >
      <LaneTypeIndicator isInternal={isInternal} isContractor={isContractor} />
      <StyledTitle>{name}</StyledTitle>
      <Divider orientation="vertical" sx={{ mr: 2 }} />
    </Box>
  );
};
