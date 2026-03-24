import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import LaunchIcon from '@mui/icons-material/Launch';
import TableViewIcon from '@mui/icons-material/TableView';
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { legendClasses } from '@mui/x-charts';
import { BarChart, BarChartProps } from '@mui/x-charts/BarChart';

import { PmxIconLink } from '@components/PmxIconLink';
import { setReportConfig, setReportType, setSubordinateView } from '@features/unit-health/slices/unitHealthSlice';
import { IUnitHealthData, IUnitHealthUnitMOSBreakdown } from '@store/amap_ai/unit_health';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useAppDispatch } from '@store/hooks';

export type SubordinateUnitsSummarySectionProps = {
  selectedUnit: IUnitBrief | undefined;
  unitHealthData: IUnitHealthData | null;
  loading: boolean;
};

const SubordinateUnitsSummarySection: React.FC<SubordinateUnitsSummarySectionProps> = ({
  selectedUnit,
  unitHealthData,
  loading = false,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const theme = useTheme();

  const visibleUnitMLBreakdownRows: IUnitHealthUnitMOSBreakdown[] = useMemo(() => {
    const startingIndex = page * rowsPerPage;
    const endingIndex = startingIndex + rowsPerPage;

    let currentIndex = 0;
    const result: IUnitHealthUnitMOSBreakdown[] = [];

    if (unitHealthData && unitHealthData.unitsMosBreakdowns) {
      for (const unitMos of unitHealthData.unitsMosBreakdowns) {
        if (currentIndex >= endingIndex) break;

        const remainingRows = endingIndex - currentIndex;

        if (currentIndex + unitMos.mosList.length <= startingIndex) {
          currentIndex += unitMos.mosList.length;
          continue;
        }

        const mosStartingIndex = Math.max(startingIndex - currentIndex, 0);
        const mosEndingIndex = Math.min(unitMos.mosList.length, mosStartingIndex + remainingRows);

        const visibleMoses = unitMos.mosList.slice(mosStartingIndex, mosEndingIndex);

        result.push({ unitName: unitMos.unitName, unitUic: unitMos.unitUic, mosList: visibleMoses });

        currentIndex += unitMos.mosList.length;
      }
    }
    return result;
  }, [page, rowsPerPage, unitHealthData]);

  const unitMLBreakdownTotal: number =
    unitHealthData?.unitsMosBreakdowns.reduce((count, mos) => count + mos.mosList.length, 0) ?? 0;

  const unitAvailabilitySettings: Partial<BarChartProps> = {
    //@ts-expect-error - Converstion works as intended
    dataset: unitHealthData?.unitsAvailability ?? [],
    borderRadius: 4,
    margin: { bottom: 75 },
    yAxis: [{ label: 'Number of Maintainers' }],
    //@ts-expect-error - barGapRatio is not found on v 7.25.0 of mui-x, but this works as intended
    xAxis: [{ dataKey: 'unitName', scaleType: 'band', label: 'Companies', barGapRatio: -0.04 }],
    tooltip: { trigger: 'item' },
    slotProps: {
      legend: {
        direction: 'row',
        position: { vertical: 'top', horizontal: 'left' },
      },
    },
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ p: 4, my: 4 }} aria-label="Subordinate Units Summary Section">
      <Typography variant="h6" sx={{ pb: 4 }}>
        {loading ? <Skeleton width={260} /> : `${selectedUnit?.displayName} - Subordinate Unit View`}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Paper
            sx={{ p: 4, height: '695px', background: theme.palette.layout.background5 }}
            aria-label="Subordinate Unit Summary Availability Breakdown"
          >
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
                {loading ? <Skeleton width={260} /> : 'Maintainer Availabilty by Subordinate Unit'}
              </Typography>

              {!loading && (
                <PmxIconLink
                  ComponentIcon={TableViewIcon}
                  text="Table View"
                  onClick={() => dispatch(setSubordinateView(true))}
                />
              )}
            </Box>

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
                    color: theme.palette.stacked_bars.purple,
                  },
                  {
                    dataKey: 'limitedCount',
                    label: 'Limited Availability',
                    layout: 'vertical',
                    color: theme.palette.stacked_bars.cyan2,
                  },
                  {
                    dataKey: 'unavailableCount',
                    label: 'Unavailable',
                    layout: 'vertical',
                    color: theme.palette.stacked_bars.teal2,
                  },
                ]}
                {...unitAvailabilitySettings}
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
            aria-label="Subordinate Unit Summary MOS Breakdown"
          >
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">
                {loading ? <Skeleton width={260} /> : 'MOS - ML Breakdown by Subordinate Unit'}
              </Typography>

              {!loading && (
                <PmxIconLink
                  ComponentIcon={LaunchIcon}
                  text="View Report"
                  onClick={() => {
                    dispatch(setReportConfig(['mos', 'ml']));
                    dispatch(setReportType('mos/ml'));
                    navigate('/unit-health/reports');
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                borderWidth: '2px',
                borderColor: theme.palette.divider,
                borderStyle: 'solid',
                borderRadius: '4px',
              }}
            >
              {loading ? (
                <Skeleton variant="rectangular" height={550} sx={{ borderRadius: 1 }} />
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>MOS</TableCell>
                          <TableCell>ML0</TableCell>
                          <TableCell>ML1</TableCell>
                          <TableCell>ML2</TableCell>
                          <TableCell>ML3</TableCell>
                          <TableCell>ML4</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {visibleUnitMLBreakdownRows.map((unit) => (
                          <React.Fragment key={`subordinate-unit-view-${unit.unitName}`}>
                            {unit.mosList.length !== 0 && (
                              <TableRow key={`subordinate-unit-view-${unit.unitName}-header`}>
                                <TableCell colSpan={6} sx={{ backgroundColor: theme.palette.layout.background16 }}>
                                  <Typography variant="body2">{unit.unitName}</Typography>
                                </TableCell>
                              </TableRow>
                            )}
                            {unit.mosList.length !== 0 &&
                              unit.mosList.map((unitMos) => (
                                <TableRow key={`subordinate-unit-view-${unit.unitName}-${unitMos.mos}`}>
                                  <TableCell>{unitMos.mos}</TableCell>
                                  <TableCell>{unitMos.ml0}</TableCell>
                                  <TableCell>{unitMos.ml1}</TableCell>
                                  <TableCell>{unitMos.ml2}</TableCell>
                                  <TableCell>{unitMos.ml3}</TableCell>
                                  <TableCell>{unitMos.ml4}</TableCell>
                                </TableRow>
                              ))}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    aria-label="Subordiante Unit Summary MOS Breakdown Footer"
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={unitMLBreakdownTotal}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      borderWidth: '2px 0px 0px 0px',
                      borderColor: theme.palette.divider,
                      borderStyle: 'solid',
                    }}
                  />
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SubordinateUnitsSummarySection;
