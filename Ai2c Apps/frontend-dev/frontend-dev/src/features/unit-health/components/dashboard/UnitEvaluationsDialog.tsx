import React from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { Box, Dialog, DialogContent, DialogTitle, Paper, Typography, useTheme } from '@mui/material';

import { PmxStatusCountBar } from '@components/index';
import { useGetUnitEvaluationsDataQuery } from '@store/amap_ai/unit_health/slices/unitHealthApi';

import { EvaluationsTable } from '../tables/UnitEvaluations/EvaluationsTable';

export interface IUnitEvaluationsDialogProps {
  unitEvaluationsData: {
    met: number;
    due: number;
    overdue: number;
    total: number;
  };
  unitUic: string;
  asOfDate: Dayjs;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UnitEvaluationsDialog: React.FC<IUnitEvaluationsDialogProps> = ({
  unitEvaluationsData,
  unitUic,
  asOfDate,
  open,
  setOpen,
}) => {
  const { data: unitEvaluationsQueryData, isLoading } = useGetUnitEvaluationsDataQuery({
    unit_uic: unitUic,
    as_of_date: asOfDate?.format('YYYY-MM-DD') ?? dayjs(),
  });

  const theme = useTheme();

  const evalDisplayData = [
    {
      title: 'Met',
      color: theme.palette.graph.green,
      count: unitEvaluationsData.met,
      total: unitEvaluationsData.total,
    },
    {
      title: 'Due',
      color: theme.palette.graph.yellow,
      count: unitEvaluationsData.due,
      total: unitEvaluationsData.total,
    },
    {
      title: 'Overdue',
      color: theme.palette.graph.pink,
      count: unitEvaluationsData.overdue,
      total: unitEvaluationsData.total,
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
    <Dialog maxWidth={'xl'} fullWidth open={open} onClose={() => setOpen(false)} aria-label="Unit Evaluations Dialog">
      <DialogTitle>Unit Evaluations</DialogTitle>
      <DialogContent>
        <Paper
          sx={{ p: 4, height: '173px', backgroundColor: theme.palette.layout.background5 }}
          aria-label="Unit Evaluations Bar"
        >
          <Typography variant="h6">Unit Evaluations</Typography>
          <PmxStatusCountBar data={evalDisplayData} total={unitEvaluationsData.total} />
          <Box display={'flex'}>
            {evalDisplayData.map((obj) => (
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
              <Typography variant="body1">Total: {unitEvaluationsData.total}</Typography>
            </Box>
          </Box>
        </Paper>
        <EvaluationsTable unitEvaluationsData={unitEvaluationsQueryData} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};
