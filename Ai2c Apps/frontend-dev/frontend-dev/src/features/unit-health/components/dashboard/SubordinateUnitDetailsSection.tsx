import React, { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';

import { Box, Grid, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import { Button } from '@mui/material';
import { legendClasses } from '@mui/x-charts';
import { BarChart, BarChartProps } from '@mui/x-charts/BarChart';

import { PmxDropdown } from '@components/dropdowns';
import { IUnitHealthData, useLazyGetUnitHealthDataQuery } from '@store/amap_ai/unit_health';
import { IUnitBrief } from '@store/amap_ai/units/models';

export type SubordinateUnitDetailsSectionProps = {
  childUnits: IUnitBrief[];
  asOfDate: Dayjs;
  setSelectedUnit: React.Dispatch<React.SetStateAction<IUnitBrief | undefined>>;
  setUnitTraversal: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
};

const SubordinateUnitDetailsSection: React.FC<SubordinateUnitDetailsSectionProps> = ({
  childUnits,
  asOfDate,
  setSelectedUnit,
  setUnitTraversal,
}) => {
  const [subordinateUnitHealthData, setSubordinateUnitHealthData] = useState<IUnitHealthData | null>(null);
  const [unitHealthSelectedUnit, setUnitHealthSelectedUnit] = useState<string>('');
  const theme = useTheme();

  const [getUnitHealthData, { isFetching: loading }] = useLazyGetUnitHealthDataQuery();

  useEffect(() => {
    if (childUnits.length > 0) {
      setUnitHealthSelectedUnit(childUnits[0].uic);
    }
  }, [childUnits]);

  useEffect(() => {
    const fetchUnitAndSubordianteUnitHealthData = async () => {
      if (unitHealthSelectedUnit) {
        try {
          const healthData = await getUnitHealthData({
            unit_uic: unitHealthSelectedUnit,
            as_of_date: asOfDate.format('YYYY-MM-DD'),
          }).unwrap();

          const suborinateUnitHealthData: IUnitHealthData = {
            unitEchelon: healthData?.unitEchelon ?? 'Unknown',
            unitsAvailability:
              healthData?.unitsAvailability.filter((avail) => avail.unitUic !== unitHealthSelectedUnit) ?? [],
            unitsEvals:
              healthData?.unitsEvals.filter((evaluation) => evaluation.unitUic !== unitHealthSelectedUnit) ?? [],
            unitsMosBreakdowns:
              healthData?.unitsMosBreakdowns.filter((mos) => mos.unitUic !== unitHealthSelectedUnit) ?? [],
          };

          setSubordinateUnitHealthData(suborinateUnitHealthData);
        } catch (error) {
          console.error('Error fetching unit health data:\t', error);
        }
      }
    };

    fetchUnitAndSubordianteUnitHealthData();
  }, [unitHealthSelectedUnit, asOfDate, getUnitHealthData]);

  const handleChangePrimaryUnit = () => {
    const newUnit = childUnits.find((unit) => unit.uic === unitHealthSelectedUnit);

    setUnitTraversal((prev) => (subordinateUnitHealthData ? [...prev, newUnit?.shortName ?? ''] : [...prev]));
    setSelectedUnit(newUnit);
  };

  const subordinateUnitEvaluationSettings: Partial<BarChartProps> = {
    //@ts-expect-error - Converstion works as intended
    dataset: subordinateUnitHealthData?.unitsEvals ?? [],
    borderRadius: 4,
    margin: { bottom: 75 },
    yAxis: [{ label: 'Number of Maintainers' }], //domainLimit: (minValue, maxValue) => ({ min: 0, max: maxValue })
    //@ts-expect-error - barGapRatio is not found on v 7.25.0 of mui-x, but this works as intended
    xAxis: [{ dataKey: 'unitName', scaleType: 'band', label: `Evaluations`, barGapRatio: -0.04 }],
    tooltip: { trigger: 'item' },
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'top', horizontal: 'left' },
      },
    },
  };

  const subordinateUnitAvailabilitySettings: Partial<BarChartProps> = {
    //@ts-expect-error - Converstion works as intended
    dataset: subordinateUnitHealthData?.unitsAvailability ?? [],
    borderRadius: 4,
    margin: { bottom: 75 },
    yAxis: [{ label: 'Number of Maintainers' }],
    //@ts-expect-error - barGapRatio is not found on v 7.25.0 of mui-x, but this works as intended
    xAxis: [{ dataKey: 'unitName', scaleType: 'band', label: `Availability`, barGapRatio: -0.04 }],
    tooltip: { trigger: 'item' },
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'top', horizontal: 'left' },
      },
    },
  };

  return (
    <Box>
      {childUnits.length > 0 && (
        <Paper sx={{ p: 4, my: 4 }} aria-label="Subordinate Unit Details Section">
          <Typography variant="h6" sx={{ pb: 4 }}>
            {loading ? <Skeleton width={220} /> : 'Subordinate Units'}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Box width="50%" display="flex">
                {loading ? (
                  <>
                    <Skeleton width={200} height={40} sx={{ mr: 4 }} />
                    <Skeleton width={140} height={40} />
                  </>
                ) : (
                  <>
                    <PmxDropdown
                      label="Subordinate"
                      onChange={(value: string | string[]) => {
                        setUnitHealthSelectedUnit(value as string);
                      }}
                      options={childUnits.map((unit) => ({ label: unit.uic, value: unit.uic }))}
                      value={unitHealthSelectedUnit}
                    />
                    <Button variant="contained" size="small" sx={{ mx: 4 }} onClick={handleChangePrimaryUnit}>
                      Make Primary View
                    </Button>
                  </>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Paper
                sx={{ p: 4, height: '695px', background: theme.palette.layout.background5 }}
                aria-label="Subordinate Unit Availability"
              >
                <Typography variant="h6">
                  {loading ? <Skeleton width={200} /> : `${subordinateUnitHealthData?.unitEchelon} Availability`}
                </Typography>

                {loading ? (
                  <Skeleton variant="rectangular" height={550} sx={{ mt: 3, borderRadius: 2 }} />
                ) : (
                  <BarChart
                    series={[
                      {
                        dataKey: 'availableCount',
                        label: 'Available',
                        layout: 'vertical',
                        stack: 'stack',
                        color: theme.palette.graph.purple,
                      },
                      {
                        dataKey: 'limitedCount',
                        label: 'Limited Availability',
                        layout: 'vertical',
                        color: theme.palette.graph.cyan,
                      },
                      {
                        dataKey: 'unavailableCount',
                        label: 'Unavailable',
                        layout: 'vertical',
                        color: theme.palette.graph.teal,
                      },
                    ]}
                    {...subordinateUnitAvailabilitySettings}
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

            <Grid size={{ xs: 6 }}>
              <Paper
                sx={{ p: 4, height: '695px', background: theme.palette.layout.background5 }}
                aria-label="Subordinate Unit Evaluations"
              >
                <Typography variant="h6">
                  {loading ? <Skeleton width={200} /> : `${subordinateUnitHealthData?.unitEchelon} Evaluations`}
                </Typography>

                {loading ? (
                  <Skeleton variant="rectangular" height={550} sx={{ mt: 3, borderRadius: 2 }} />
                ) : (
                  <BarChart
                    series={[
                      {
                        dataKey: 'metCount',
                        label: 'Met',
                        layout: 'vertical',
                        color: theme.palette.graph.teal,
                      },
                      {
                        dataKey: 'dueCount',
                        label: 'Due',
                        layout: 'vertical',
                        color: theme.palette.graph.yellow,
                      },
                      {
                        dataKey: 'overdueCount',
                        label: 'Overdue',
                        layout: 'vertical',
                        color: theme.palette.graph.pink,
                      },
                    ]}
                    {...subordinateUnitEvaluationSettings}
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
      )}
    </Box>
  );
};

export default SubordinateUnitDetailsSection;
