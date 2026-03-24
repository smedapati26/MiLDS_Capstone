import React, { useEffect, useState } from 'react';

import { Box, Divider, Grid, Paper } from '@mui/material';
import { Typography } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import { Column } from '@components/PmxTable';
import { ReportType, setSelectedHealthUnit } from '@features/unit-health/slices/unitHealthSlice';
import {
  IEventReportSoldier,
  IMOSMLReportData,
  ITaskReportSoldier,
  IUnitMOSMLReport,
} from '@store/amap_ai/unit_health';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { MOSMLReport } from '../reports/mos-ml/MOSMLReport';
import { MOSMLReportConfigurations } from '../reports/mos-ml/MOSMLReportConfiguration';
import { EventsReport } from '../reports/unit-tracker/EventsReport';
import { TasksReport } from '../reports/unit-tracker/TasksReport';
import { UnitTrackerReportConfigurations } from '../reports/unit-tracker/UnitTrackerReportConfiguration';

const ReportsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reportType: globalReportType, unitHealthSelectedUnit } = useAppSelector((state) => state.unitHealth);
  const [reportType, setReportType] = useState<ReportType | undefined>(undefined);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportColumns, setReportColumns] = useState<Column<IMOSMLReportData>[] | Column<IEventReportSoldier>[] | null>(
    null,
  );
  const [reportData, setReportData] = useState<
    IUnitMOSMLReport | IEventReportSoldier[] | ITaskReportSoldier[] | undefined
  >(undefined);
  const [filterValue, setFilterValue] = useState<string>('');
  const [reportEvents, setReportEvents] = useState<string[]>([]);

  const { data: units } = useGetUnitsQuery({
    role: 'Manager',
  });

  useEffect(() => {
    if (globalReportType) setReportType(globalReportType);
  }, [globalReportType]);

  const reportXs = () => {
    if (reportType === 'mos/ml') {
      return 4;
    } else if (reportType === 'unit-tracker') {
      return 6;
    }
    return 4;
  };

  return (
    <Box aria-label="Reports Tab">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ pb: 4 }}>
          Report Configurations
        </Typography>
        <Grid container spacing={6}>
          <Grid size={{ xs: reportXs() }} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '100%', pr: 4 }}>
              <Typography variant="body2" sx={{ pb: 2 }}>
                Report Type*
              </Typography>
              <PmxDropdown
                label="Report Type"
                options={[
                  { label: 'Unit MOS/ML Breakdown', value: 'mos/ml' },
                  { label: 'Unit Tracker', value: 'unit-tracker' },
                ]}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                value={[reportType]}
                displayEmpty
                onChange={(value: string | string[]) => {
                  setReportType(value as ReportType);
                }}
              />
            </Box>
            <Divider orientation="vertical" sx={{ mr: -1 }} />
          </Grid>
          {reportType === 'mos/ml' && (
            <MOSMLReportConfigurations
              units={units}
              reportUnit={unitHealthSelectedUnit}
              setReportUnit={(unit) => dispatch(setSelectedHealthUnit(unit as IUnitBrief))}
              setFilterValue={setFilterValue}
              setReportTitle={setReportTitle}
              setReportData={setReportData}
              setReportColumns={setReportColumns}
            />
          )}
          {reportType === 'unit-tracker' && (
            <UnitTrackerReportConfigurations
              units={units}
              reportUnit={unitHealthSelectedUnit}
              setReportUnit={(unit) => dispatch(setSelectedHealthUnit(unit as IUnitBrief))}
              setFilterValue={setFilterValue}
              setReportTitle={setReportTitle}
              setReportData={setReportData}
              setReportColumns={setReportColumns}
              setReportEvents={setReportEvents}
            />
          )}
        </Grid>
      </Paper>
      {reportData && reportColumns ? (
        <Box>
          {reportType === 'mos/ml' && (
            <>
              <Box display="flex" justifyContent={'space-between'} alignItems={'center'} sx={{ py: 4 }}>
                <Typography variant="h6">{reportTitle}</Typography>
              </Box>
              <MOSMLReport
                reportData={reportData as IUnitMOSMLReport}
                reportColumns={reportColumns as Column<IMOSMLReportData>[]}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
              />
            </>
          )}

          {reportType === 'unit-tracker' &&
            (reportData as IEventReportSoldier[]).length > 0 &&
            (reportData as IEventReportSoldier[])[0].events !== undefined && (
              <EventsReport
                reportTitle={reportTitle}
                reportData={reportData as IEventReportSoldier[]}
                reportColumns={reportColumns as Column<IEventReportSoldier>[]}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
                reportEvents={reportEvents}
              />
            )}

          {reportType === 'unit-tracker' &&
            (reportData as ITaskReportSoldier[]).length > 0 &&
            (reportData as ITaskReportSoldier[])[0].individualTasksList !== undefined && (
              <TasksReport
                reportData={reportData as ITaskReportSoldier[]}
                filterValue={filterValue}
                setFilterValue={setFilterValue}
              />
            )}
        </Box>
      ) : (
        <Typography sx={{ py: 4 }}>Configure your report using the filters above.</Typography>
      )}
    </Box>
  );
};

export default ReportsTab;
