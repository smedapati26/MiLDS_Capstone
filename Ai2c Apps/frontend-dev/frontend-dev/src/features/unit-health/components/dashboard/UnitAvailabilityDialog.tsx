import React from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { Box, Dialog, DialogContent, DialogTitle, Paper, Typography, useTheme } from '@mui/material';

import { PmxStatusCountBar } from '@components/index';
import { setSubordinateView } from '@features/unit-health/slices/unitHealthSlice';
import { useGetUnitAvailabilityDataQuery } from '@store/amap_ai/unit_health/slices/unitHealthApi';
import { useAppDispatch } from '@store/hooks';

import { AvailabilityTable } from '../tables/UnitAvailability/AvailabilityTable';

export interface IUnitAvailabilityDialogProps {
  unitAvailabilityData: {
    available: number;
    limited: number;
    unavailable: number;
    total: number;
  };
  unitUic: string;
  asOfDate: Dayjs;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UnitAvailabilityDialog: React.FC<IUnitAvailabilityDialogProps> = ({
  unitAvailabilityData,
  unitUic,
  asOfDate,
  open,
  setOpen,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { data: unitAvailabilityQueryData } = useGetUnitAvailabilityDataQuery({
    unit_uic: unitUic,
    as_of_date: asOfDate?.format('YYYY-MM-DD') ?? dayjs(),
  });

  const availabilityDisplayData = [
    {
      title: 'Available',
      color: theme.palette.graph.purple,
      count: unitAvailabilityData.available,
    },
    {
      title: 'Limited Availability',
      color: theme.palette.graph.cyan,
      count: unitAvailabilityData.limited,
    },
    {
      title: 'Unavailable',
      color: theme.palette.graph.teal,
      count: unitAvailabilityData.unavailable,
    },
  ];

  const sharedIconSX = {
    borderRadius: '50%',
    width: '15px',
    height: '15px',
    borderColor: theme.palette.text.primary,
    borderWidth: '1px',
    borderStyle: 'solid',
    mr: 2,
  };

  return (
    <Dialog
      maxWidth={'xl'}
      fullWidth
      open={open}
      onClose={() => {
        dispatch(setSubordinateView(false));
        setOpen(false);
      }}
      aria-label="Unit Availability Dialog"
    >
      <DialogTitle>Unit Availability</DialogTitle>
      <DialogContent>
        <Paper
          sx={{ p: 4, height: '173px', backgroundColor: theme.palette.layout.background5 }}
          aria-label="Unit Availability Bar"
        >
          <Typography variant="h6">Unit Availability</Typography>
          <PmxStatusCountBar data={availabilityDisplayData} total={unitAvailabilityData.total} />
          <Box display={'flex'}>
            {availabilityDisplayData.map((obj) => (
              <Box
                key={`${obj.title}-icon-and-title`}
                display={'flex'}
                justifyItems={'center'}
                sx={{ pr: 4 }}
                aria-label={`${obj.title}-icon-and-title`}
              >
                <Box
                  sx={{
                    background: obj.color,
                    ...sharedIconSX,
                  }}
                ></Box>
                <Typography variant="body1">{obj.title}</Typography>
              </Box>
            ))}
            <Box display={'flex'} justifyItems={'center'}>
              <Typography variant="body1">Total: {unitAvailabilityData.total}</Typography>
            </Box>
          </Box>
        </Paper>
        <AvailabilityTable unitAvailabilityData={unitAvailabilityQueryData} />
      </DialogContent>
    </Dialog>
  );
};
