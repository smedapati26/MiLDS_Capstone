/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useMemo, useState } from 'react';
import { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

import TableViewIcon from '@mui/icons-material/TableView';
import { Box, Grid, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import { legendClasses } from '@mui/x-charts';
import { BarChart, BarChartProps } from '@mui/x-charts/BarChart';

import { PmxStatusCountBar } from '@components/index';
import { PmxIconLink } from '@components/PmxIconLink';
import { setReportConfig, setReportType } from '@features/unit-health/slices/unitHealthSlice';
import { IUnitHealthData } from '@store/amap_ai/unit_health';
import { useGetUnitMissingPacketsDataQuery } from '@store/amap_ai/unit_health/slices/unitHealthApi';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { UnitAvailabilityDialog } from './UnitAvailabilityDialog';
import { UnitEvaluationsDialog } from './UnitEvaluationsDialog';
import { UnitMissingPacketsDialog } from './UnitMissingPacketsDialog';

export type UnitSummarySectionProps = {
  selectedUnit: IUnitBrief | undefined;
  asOfDate: Dayjs;
  unitHealthData: IUnitHealthData | null;
  loading: boolean;
};

const UnitSummarySection: React.FC<UnitSummarySectionProps> = ({
  selectedUnit,
  asOfDate,
  unitHealthData,
  loading = false,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { subordinateTableView } = useAppSelector((state) => state.unitHealth);
  const [unitAvailabilityOpen, setUnitAvailabilityOpen] = useState<boolean>(false);
  const [unitMissingPacketsOpen, setUnitMissingPacketsOpen] = useState<boolean>(false);
  const [unitEvaluationsOpen, setUnitEvaluationsOpen] = useState<boolean>(false);
  const theme = useTheme();

  const { data: unitMissingPacketQueryData, isFetching: loadingPackets } = useGetUnitMissingPacketsDataQuery(
    {
      // @ts-expect-error This will be skipped if no uic.
      unit_uic: selectedUnit?.uic,
      as_of_date: asOfDate.format('YYYY-MM-DD'),
    },
    { skip: selectedUnit === undefined },
  );

  useEffect(() => {
    if (subordinateTableView) {
      setUnitAvailabilityOpen(true);
    }
  }, [subordinateTableView]);

  const unitAvailabilityData = useMemo(() => {
    if (!unitHealthData) {
      return { available: 0, limited: 0, unavailable: 0, total: 0 };
    } else {
      return unitHealthData.unitsAvailability.reduce(
        (totals, unit) => {
          totals.available += unit.availableCount;
          totals.limited += unit.limitedCount;
          totals.unavailable += unit.unavailableCount;
          totals.total += unit.availableCount + unit.limitedCount + unit.unavailableCount;
          return totals;
        },
        { available: 0, limited: 0, unavailable: 0, total: 0 },
      );
    }
  }, [unitHealthData]);

  const unitEvaluationsData = useMemo(() => {
    if (!unitHealthData) {
      return { met: 0, due: 0, overdue: 0, total: 0 };
    } else {
      return unitHealthData.unitsEvals.reduce(
        (totals, unit) => {
          totals.met += unit.metCount;
          totals.due += unit.dueCount;
          totals.overdue += unit.overdueCount;
          totals.total += unit.metCount + unit.dueCount + unit.overdueCount;
          return totals;
        },
        { met: 0, due: 0, overdue: 0, total: 0 },
      );
    }
  }, [unitHealthData]);

  const unitMOSBreakdownData = useMemo(() => {
    if (!unitHealthData) {
      return [];
    } else {
      const mosTotals: Record<string, { ml0: number; ml1: number; ml2: number; ml3: number; ml4: number }> = {};
      unitHealthData.unitsMosBreakdowns.map((hierarchy) => {
        hierarchy.mosList.map((mos) => {
          if (!mosTotals[mos.mos]) {
            mosTotals[mos.mos] = { ml0: 0, ml1: 0, ml2: 0, ml3: 0, ml4: 0 };
          }
          mosTotals[mos.mos].ml0 += mos.ml0;
          mosTotals[mos.mos].ml1 += mos.ml1;
          mosTotals[mos.mos].ml2 += mos.ml2;
          mosTotals[mos.mos].ml3 += mos.ml3;
          mosTotals[mos.mos].ml4 += mos.ml4;
        });
      });

      return Object.entries(mosTotals).map(([mosName, mosNums]) => {
        return {
          mos: mosName,
          ml0: mosNums.ml0,
          ml1: mosNums.ml1,
          ml2: mosNums.ml2,
          ml3: mosNums.ml3,
          ml4: mosNums.ml4,
        };
      });
    }
  }, [unitHealthData]);

  const hideZero = (value: number | null) => (value === 0 ? null : value?.toString());

  const mosBreakdownSettings: Partial<BarChartProps> = {
    dataset: unitMOSBreakdownData,
    borderRadius: 4,
    margin: { bottom: 75 },
    yAxis: [{ label: 'Number of Maintainers' }],
    xAxis: [{ dataKey: 'mos', scaleType: 'band', label: 'MOS' }],
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'top', horizontal: 'left' },
      },
    },
  };

  const sharedIconSX = {
    borderRadius: '50%',
    width: '15px',
    height: '15px',
    borderColor: theme.palette.text.primary,
    borderWidth: '1px',
    borderStyle: 'solid',
    mr: 2,
  };

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

  return (
    <Paper sx={{ p: 4, my: 4 }} aria-label="Unit Summary Section">
      <Typography variant="h6" sx={{ pb: 4 }}>
        {loading ? <Skeleton width={200} /> : selectedUnit?.displayName}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 5 }}>
          <Paper
            sx={{ p: 4, height: '173px', background: theme.palette.layout.background5 }}
            aria-label="Unit Availability Bar"
          >
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">{loading ? <Skeleton width={150} /> : 'Unit Availability'}</Typography>

              {!loading && (
                <PmxIconLink
                  label="Unit Availability Table View Button"
                  ComponentIcon={TableViewIcon}
                  text="Table View"
                  onClick={() => setUnitAvailabilityOpen(true)}
                />
              )}

              <UnitAvailabilityDialog
                unitAvailabilityData={unitAvailabilityData}
                unitUic={selectedUnit?.uic ?? ''}
                asOfDate={asOfDate}
                open={unitAvailabilityOpen}
                setOpen={setUnitAvailabilityOpen}
              />
            </Box>

            {loading ? (
              <Skeleton variant="rectangular" height={60} sx={{ my: 2, borderRadius: 2 }} />
            ) : (
              <PmxStatusCountBar data={availabilityDisplayData} total={unitAvailabilityData.total} />
            )}

            <Box display="flex">
              {loading ? (
                <>
                  <Skeleton width={80} sx={{ mr: 2 }} />
                  <Skeleton width={80} sx={{ mr: 2 }} />
                  <Skeleton width={80} />
                </>
              ) : (
                <>
                  {availabilityDisplayData.map((obj) => (
                    <Box key={obj.title} display="flex" sx={{ pr: 4 }}>
                      <Box sx={{ background: obj.color, ...sharedIconSX }} />
                      <Typography variant="body1">{obj.title}</Typography>
                    </Box>
                  ))}
                  <Typography variant="body1">Total: {unitAvailabilityData.total}</Typography>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 5 }}>
          <Paper
            sx={{ p: 4, height: '173px', background: theme.palette.layout.background5 }}
            aria-label="Unit Evaluations Bar"
          >
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">{loading ? <Skeleton width={150} /> : 'Unit Evaluations'}</Typography>

              {!loading && (
                <PmxIconLink
                  ComponentIcon={TableViewIcon}
                  text="Table View"
                  onClick={() => setUnitEvaluationsOpen(true)}
                />
              )}

              <UnitEvaluationsDialog
                unitEvaluationsData={unitEvaluationsData}
                unitUic={selectedUnit?.uic ?? ''}
                asOfDate={asOfDate}
                open={unitEvaluationsOpen}
                setOpen={setUnitEvaluationsOpen}
              />
            </Box>

            {loading ? (
              <Skeleton variant="rectangular" height={60} sx={{ my: 2, borderRadius: 2 }} />
            ) : (
              <PmxStatusCountBar data={evalDisplayData} total={unitEvaluationsData.total} />
            )}

            <Box display="flex">
              {loading ? (
                <>
                  <Skeleton width={80} sx={{ mr: 2 }} />
                  <Skeleton width={80} sx={{ mr: 2 }} />
                  <Skeleton width={80} />
                </>
              ) : (
                <>
                  {evalDisplayData.map((obj) => (
                    <Box key={obj.title} display="flex" sx={{ pr: 4 }}>
                      <Box sx={{ background: obj.color, ...sharedIconSX }} />
                      <Typography variant="body1">{obj.title}</Typography>
                    </Box>
                  ))}
                  <Typography variant="body1">Total: {unitEvaluationsData.total}</Typography>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 2 }}>
          <Paper
            sx={{ p: 4, height: '173px', background: theme.palette.layout.background5 }}
            aria-label="Unit Missing Packets"
          >
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">Missing Packets</Typography>

              {!loadingPackets && (
                <PmxIconLink
                  ComponentIcon={TableViewIcon}
                  text="Table View"
                  onClick={() => setUnitMissingPacketsOpen(true)}
                />
              )}

              <UnitMissingPacketsDialog
                unitMissingPacketsData={unitMissingPacketQueryData}
                open={unitMissingPacketsOpen}
                setOpen={setUnitMissingPacketsOpen}
              />
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '63px', my: 4 }}>
              {loadingPackets ? (
                <Skeleton variant="rectangular" width={140} height={80} sx={{ borderRadius: 2 }} />
              ) : (
                <Typography variant="h2">
                  {unitMissingPacketQueryData?.filter((p) => p.packetStatus === 'Missing').length ?? 0}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{ p: 4, height: '579px', background: theme.palette.layout.background5 }}
            aria-label="MOS Breakdown"
          >
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
                {loading ? <Skeleton width={260} /> : `${selectedUnit?.shortName} Maintainer Breakdown by MOS`}
              </Typography>

              {!loading && (
                <PmxIconLink
                  ComponentIcon={TableViewIcon}
                  text="View Report"
                  onClick={async () => {
                    await dispatch(setReportConfig(['mos']));
                    await dispatch(setReportType('mos/ml'));
                    await navigate('/unit-health/reports');
                  }}
                />
              )}
            </Box>

            {loading ? (
              <Skeleton variant="rectangular" height={450} sx={{ mt: 4, borderRadius: 2 }} />
            ) : (
              <BarChart
                series={[
                  {
                    dataKey: 'ml0',
                    label: 'ML 0',
                    layout: 'vertical',
                    stack: 'stack',
                    color: theme.palette.graph.green,
                    // @ts-expect-error
                    valueFormatter: hideZero,
                  },
                  {
                    dataKey: 'ml1',
                    label: 'ML 1',
                    layout: 'vertical',
                    stack: 'stack',
                    color: theme.palette.stacked_bars.cyan2,
                    // @ts-expect-error
                    valueFormatter: hideZero,
                  },
                  {
                    dataKey: 'ml2',
                    label: 'ML 2',
                    layout: 'vertical',
                    stack: 'stack',
                    color: theme.palette.stacked_bars.blue,
                    // @ts-expect-error
                    valueFormatter: hideZero,
                  },
                  {
                    dataKey: 'ml3',
                    label: 'ML 3',
                    layout: 'vertical',
                    stack: 'stack',
                    color: theme.palette.stacked_bars.magenta,
                    // @ts-expect-error
                    valueFormatter: hideZero,
                  },
                  {
                    dataKey: 'ml4',
                    label: 'ML 4',
                    layout: 'vertical',
                    stack: 'stack',
                    color: theme.palette.stacked_bars.purple,
                    // @ts-expect-error
                    valueFormatter: hideZero,
                  },
                ]}
                {...mosBreakdownSettings}
                sx={{
                  [`& .${legendClasses.mark}`]: {
                    ry: 10,
                    stroke: theme.palette.text.primary,
                    strokeWidth: 1,
                  },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UnitSummarySection;
