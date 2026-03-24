import React from 'react';

import { Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';

import PmxAutoComplete from '@components/PmxAutoComplete';
import { PmxTable } from '@components/PmxTable';
import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';
import { EventType } from '@store/amap_ai/events';

type TasksSectionProps = {
  showTaskCheckbox: boolean;
  taskType: string;
  setTaskType: (taskType: string) => void;
  tasks: Array<{ label: string; value: string }>;
  setTasks: (tasks: Array<{ label: string; value: string }>) => void;
  fetchingTasks: boolean;
  userTasks: { taskNumber: string; taskTitle: string; mos: string }[] | undefined;
  isTaskCheckboxChecked: boolean;
  setIsTaskCheckboxChecked: (checked: boolean) => void;
  handleTasksChange: (taskTitles: { label: string; value: string }[]) => void;
  tableData: Array<{ taskNumber: string; taskName: string; result: string }>;
  setTableData: (data: Array<{ taskNumber: string; taskName: string; result: string }>) => void;
  selectedEventType: EventType;
};

const TasksSection: React.FC<TasksSectionProps> = ({
  showTaskCheckbox,
  taskType,
  setTaskType,
  tasks,
  setTasks,
  fetchingTasks,
  userTasks,
  isTaskCheckboxChecked,
  setIsTaskCheckboxChecked,
  handleTasksChange,
  tableData,
  setTableData,
  selectedEventType,
}) => {
  return (
    <>
      {showTaskCheckbox && (
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Checkbox
                checked={isTaskCheckboxChecked}
                onChange={(e) => {
                  setIsTaskCheckboxChecked(e.target.checked);
                  setTaskType(e.target.checked ? 'ctl-tasks' : '');
                }}
              />
            }
            label="Associate Task(s) to Event"
          />
        </Grid>
      )}
      {(selectedEventType === 'Training' || selectedEventType === 'Evaluation') && (
        <>
          <Grid size={{ xs: 12 }}>
            <PmxToggleBtnGroup
              buttons={[
                { label: 'SOLDIER CTL TASKS', value: 'ctl-tasks', disabled: !isTaskCheckboxChecked },
                { label: 'SEARCH ALL TASKS', value: 'all-tasks', disabled: !isTaskCheckboxChecked },
              ]}
              selected={taskType}
              onChange={(value) => typeof value === 'string' && setTaskType(value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PmxAutoComplete
              multiple
              options={
                userTasks?.map((x) => ({ value: x.taskNumber, label: `${x.taskNumber} - ${x.taskTitle}` })) ?? []
              }
              disabled={!isTaskCheckboxChecked}
              value={tasks?.map((x) => ({ value: x.value, label: `${x.value} - ${x.label}` }))}
              label="Tasks"
              onChange={(values) => {
                const formattedValues = values?.map((item) => ({
                  label: item.label,
                  value: item.value,
                }));
                setTasks(formattedValues);
                handleTasksChange(formattedValues);
              }}
              loading={fetchingTasks}
            />
          </Grid>
          {isTaskCheckboxChecked && (
            <Grid size={{ xs: 12 }}>
              <Typography mt={4} mb={2}>
                Designate the results for each task.
              </Typography>
              <PmxTable
                enforceHeight={false}
                columns={[
                  { field: 'taskNumber', header: 'Task Number', width: 160 },
                  { field: 'taskName', header: 'Task Name' },
                  {
                    field: 'result',
                    header: 'Result',
                    renderCell: (val, row) => (
                      <PmxToggleBtnGroup
                        buttons={[
                          { label: 'GO', value: 'GO' },
                          { label: 'NO-GO', value: 'NOGO' },
                          ...(selectedEventType === 'Training' ? [{ label: 'N/A', value: 'N/A' }] : []),
                        ]}
                        selected={val}
                        onChange={(value) => {
                          const updatedData = tableData.map((task) => {
                            return task.taskName === row.taskName ? { ...task, result: value as string } : task;
                          });

                          setTableData(updatedData);
                        }}
                      />
                    ),
                  },
                ]}
                data={tableData}
                getRowId={(data) => data?.taskName}
              />
            </Grid>
          )}
        </>
      )}
    </>
  );
};

export default TasksSection;
