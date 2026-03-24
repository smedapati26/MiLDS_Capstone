import React, { useEffect, useMemo, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { TableHead } from '@mui/material';

import PmxSearch from '@components/PmxSearch';
import { Column } from '@components/PmxTable';
import ExportMenu from '@features/amtp-packet/components/tables/ExportMenu';
import { UnitTaskReportExportableColumns } from '@features/unit-health/constants';
import { ITaskReportData, ITaskReportExportableData, ITaskReportSoldier } from '@store/amap_ai/unit_health';
import { handleCopy, handleExportCsv, handleExportExcel, handleExportPdf, handlePrint } from '@utils/helpers';

export interface ITasksReportProps {
  reportData: ITaskReportSoldier[] | undefined;
  filterValue: string;
  setFilterValue: React.Dispatch<React.SetStateAction<string>>;
}

export const TasksReport: React.FC<ITasksReportProps> = ({ reportData, filterValue, setFilterValue }) => {
  const theme = useTheme();
  const [expandedSoldierAccordions, setExpandedSoldierAccordions] = useState<string[]>(
    reportData ? [reportData[0].soldierId] : [],
  );
  const [tablePageMap, setTablePageMap] = useState<Record<string, number>>({});
  const [tableRowsPerPageMap, setTableRowsPerPageMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const initPageMap: Record<string, number> = {};
    const initRowsMap: Record<string, number> = {};

    reportData?.forEach((soldier) => {
      initPageMap[soldier.soldierId] = 0;
      initRowsMap[soldier.soldierId] = 10;
    });

    setTablePageMap(initPageMap);
    setTableRowsPerPageMap(initRowsMap);
  }, [reportData]);

  const filteredData = useMemo(() => {
    const lowercaseFilter = filterValue.toLowerCase();

    return reportData?.filter((soldier) => {
      const nameMatch = soldier.soldierName.toLowerCase().includes(lowercaseFilter);
      const mosMatch = soldier.mos?.toLowerCase().includes(lowercaseFilter) ?? true;
      const unitMatch = soldier.unit.toLowerCase().includes(lowercaseFilter);

      return nameMatch || mosMatch || unitMatch;
    });
  }, [reportData, filterValue]);

  const exportableData: ITaskReportExportableData[] = useMemo(() => {
    if (reportData) {
      return reportData?.flatMap((soldier) => {
        const uctlTasks: ITaskReportExportableData[] = [];
        soldier.tasksList.forEach((uctl) =>
          // eslint-disable-next-line sonarjs/no-nested-functions
          uctl.tasks.forEach((task) => {
            uctlTasks.push({
              birthMonth: soldier.birthMonth,
              ctlName: uctl.ctlName,
              evaluatedDate: task.evaluatedDate,
              evaluatedGoNoGo: task.evaluatedGoNoGo,
              trainedDate: task.trainedDate,
              trainedGoNoGo: task.trainedGoNoGo,
              familiarizedDate: task.familiarizedDate,
              familiarizedGoNoGo: task.familiarizedGoNoGo,
              mos: soldier.mos,
              soldierId: soldier.soldierId,
              soldierName: soldier.soldierName,
              taskName: task.taskName,
              unit: soldier.unit,
            });
          }),
        );

        const ictlTasks: ITaskReportExportableData[] = [];
        soldier.individualTasksList.forEach((task) => {
          uctlTasks.push({
            birthMonth: soldier.birthMonth,
            ctlName: 'Other Task',
            evaluatedDate: task.evaluatedDate,
            evaluatedGoNoGo: task.evaluatedGoNoGo,
            trainedDate: task.trainedDate,
            trainedGoNoGo: task.trainedGoNoGo,
            familiarizedDate: task.familiarizedDate,
            familiarizedGoNoGo: task.familiarizedGoNoGo,
            mos: soldier.mos,
            soldierId: soldier.soldierId,
            soldierName: soldier.soldierName,
            taskName: task.taskName,
            unit: soldier.unit,
          });
        });

        return [...uctlTasks, ...ictlTasks];
      });
    }
    return [];
  }, [reportData]);

  const handleAccordionChange = (soldierId: string) => {
    if (expandedSoldierAccordions.includes(soldierId)) {
      setExpandedSoldierAccordions((prev) => prev.filter((currId) => currId !== soldierId));
    } else {
      setExpandedSoldierAccordions((prev) => [...prev, soldierId]);
    }
  };

  const handleChangePage = (soldierId: string, newPage: number) => {
    setTablePageMap((prev) => ({ ...prev, [soldierId]: newPage }));
  };

  const handleChangeRowsPerPage = (soldierId: string, newRowsPerPage: number) => {
    setTableRowsPerPageMap((prev) => ({ ...prev, [soldierId]: newRowsPerPage }));
    setTablePageMap((prev) => ({ ...prev, [soldierId]: 0 }));
  };

  const flattenSoldierTaskData = (soldier: ITaskReportSoldier): { label: string; task: ITaskReportData }[] => {
    const rows: { label: string; task: ITaskReportData }[] = [];

    soldier.tasksList.forEach((ctl) => ctl.tasks.forEach((task) => rows.push({ label: ctl.ctlName, task: task })));
    soldier.individualTasksList.forEach((task) => rows.push({ label: 'Other Tasks', task: task }));

    return rows;
  };

  const renderSoldierTable = (soldier: ITaskReportSoldier) => {
    const soldierTasks = flattenSoldierTaskData(soldier);

    const page = tablePageMap[soldier.soldierId] ?? 0;
    const rowsPerPage = tableRowsPerPageMap[soldier.soldierId] ?? 10;
    const totalTaskCount = soldierTasks.length;

    const paginatedStart = page * rowsPerPage;
    const paginatedEnd = paginatedStart + rowsPerPage;

    const paginatedTasks = soldierTasks.slice(paginatedStart, paginatedEnd);

    const paginatedData: { label: string; tasks: ITaskReportData[] }[] = [];
    paginatedTasks.forEach((task) => {
      let group = paginatedData.find((group) => group.label === task.label);
      if (!group) {
        group = { label: task.label, tasks: [] };
        paginatedData.push(group);
      }

      group.tasks.push(task.task);
    });

    return (
      <Box>
        <TableContainer key={soldier.soldierId}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '50%' }}>Task</TableCell>
                <TableCell>Familarized</TableCell>
                <TableCell>Trained</TableCell>
                <TableCell>Evaluated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((ctl, index) => (
                <>
                  <TableRow key={`${soldier.soldierId}-${ctl.label}-${index}`}>
                    <TableCell colSpan={4} sx={{ backgroundColor: theme.palette.layout.background16 }}>
                      {ctl.label}
                    </TableCell>
                  </TableRow>
                  {ctl.tasks.map((task, taskIndex) => (
                    <TableRow key={`${soldier.soldierId}-${task.taskName}-${taskIndex}`}>
                      <TableCell sx={{ width: '50%' }}>{task.taskName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getDateIcon(task.familiarizedGoNoGo)}
                          {task.familiarizedDate ?? '--'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getDateIcon(task.trainedGoNoGo)}
                          {task.trainedDate ?? '--'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getDateIcon(task.evaluatedGoNoGo)}
                          {task.evaluatedDate ?? '--'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          sx={{
            borderTop: 'none',
            '.MuiTablePagination-toolbar': {
              minHeight: '52px',
            },
          }}
          count={totalTaskCount}
          page={page}
          onPageChange={(_, newPage) => handleChangePage(soldier.soldierId, newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => handleChangeRowsPerPage(soldier.soldierId, parseInt(e.target.value, 10))}
        />
      </Box>
    );
  };

  const getDateIcon = (result: string | undefined) => {
    if (result === 'GO') {
      return <CheckIcon sx={{ height: '20px', width: '20px' }} />;
    } else if (result === 'NOGO') {
      return <CloseIcon sx={{ height: '20px', width: '20px' }} />;
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      {filteredData && (
        <Box>
          <Box display="flex" justifyContent={'space-between'} alignItems={'center'} sx={{ pb: 2 }}>
            <Typography variant="h6">Task Report</Typography>
            <Box display="flex" justifyContent={'space-between'} alignItems={'center'}>
              <PmxSearch value={filterValue} onChange={(event) => setFilterValue(event.target.value)} />
              <ExportMenu
                handleCsv={() => handleExportCsv(exportableData ?? [], 'Task Report')}
                handleExcel={() =>
                  handleExportExcel(
                    UnitTaskReportExportableColumns as Column<ITaskReportExportableData>[],
                    exportableData ?? [],
                    'Task Report',
                  )
                }
                handlePdf={() =>
                  handleExportPdf(
                    UnitTaskReportExportableColumns as Column<ITaskReportExportableData>[],
                    exportableData ?? [],
                    'Task Report',
                  )
                }
                handleCopy={() =>
                  handleCopy(
                    UnitTaskReportExportableColumns as Column<ITaskReportExportableData>[],
                    exportableData ?? [],
                  )
                }
                handlePrint={() =>
                  handlePrint(
                    UnitTaskReportExportableColumns as Column<ITaskReportExportableData>[],
                    exportableData ?? [],
                    'Task Report',
                  )
                }
              />
            </Box>
          </Box>
          <Paper sx={{ p: 4, mb: 2 }} aria-label="Tasks Reports">
            <Typography sx={{ pb: 4 }} variant="h6">
              Critical Task Progression
            </Typography>
            {filteredData.map((soldier) => (
              <Accordion
                sx={{ borderRadius: '8px !important', p: 2 }}
                key={soldier.soldierId}
                expanded={expandedSoldierAccordions.includes(soldier.soldierId)}
                onChange={() => handleAccordionChange(soldier.soldierId)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">
                    {`${soldier.soldierName} - ${soldier.mos} - ${soldier.birthMonth} - ${soldier.unit}`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>{renderSoldierTable(soldier)}</AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  );
};
