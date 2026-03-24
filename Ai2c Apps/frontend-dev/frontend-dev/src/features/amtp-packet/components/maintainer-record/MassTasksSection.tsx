import { useEffect, useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';

import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography, useTheme } from '@mui/material';

import PmxAutoComplete from '@components/PmxAutoComplete';
import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';
import { ISoldier } from '@store/amap_ai/soldier';
import { useLazyGetUserTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';
import { useAppSelector } from '@store/hooks';

import { IMassEventFormValues } from './MassEventDialog';

interface MassTasksSectionProps {
  eventType: 'Training' | 'Award' | 'TCS';
  soldiers: ISoldier[];
  control: Control<IMassEventFormValues, null>;
  errors: FieldErrors<IMassEventFormValues>;
  setValue: UseFormSetValue<IMassEventFormValues>;
  tasks: { label: string; value: string }[];
  setTasks: (values: { label: string; value: string }[]) => void;
}

export type SoldierTasks = { taskNumber: string; taskName: string; result: string };

const getSelectedTasks = (values: { label: string; value: string }[]) => {
  return values.map((item) => ({ taskNumber: item.value, taskName: item.label, result: 'GO' })) as SoldierTasks[];
};

const mergeTasks = (existingTasks: SoldierTasks[], selectedTasks: SoldierTasks[]) => {
  return selectedTasks.map((task) => {
    const existingTask = existingTasks.find((t) => t.taskName === task.taskName);
    return existingTask ? existingTask : task;
  });
};

const MassTasksSection = ({ soldiers, eventType, control, setValue, tasks, setTasks }: MassTasksSectionProps) => {
  const theme = useTheme();
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const [fetchTasks, { data: userTasks, isFetching: fetchingTasks }] = useLazyGetUserTasksQuery();
  const [taskType, setTaskType] = useState<string>('ctl-tasks');

  useEffect(() => {
    if (!maintainer?.id) return;

    taskType === 'ctl-tasks'
      ? fetchTasks({ user_id: maintainer.id, all_tasks: false })
      : fetchTasks({ user_id: maintainer.id, all_tasks: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskType, maintainer?.id]);

  return (
    <Grid container spacing={3} m={4}>
      <Grid size={{ xs: 6 }}>
        <PmxToggleBtnGroup
          buttons={[
            { label: 'SOLDIER CTL TASKS', value: 'ctl-tasks' },
            { label: 'SEARCH ALL TASKS', value: 'all-tasks' },
          ]}
          selected={taskType}
          onChange={(value) => typeof value === 'string' && setTaskType(value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }} mt={4}>
        <PmxAutoComplete
          multiple
          options={userTasks?.map((x) => ({ value: x.taskNumber, label: `${x.taskNumber} - ${x.taskTitle}` })) ?? []}
          value={tasks}
          label="Tasks"
          onChange={(values) => {
            const selectedTasks = getSelectedTasks(values);

            const soldierTasks = control._defaultValues.soldierTasks ?? [];

            const updatedSoldierTasks = soldiers.map((soldier) => {
              const existingTasks = soldierTasks.find((t) => t?.userId === soldier.userId)?.tasks ?? [];

              const filteredTasks = existingTasks.filter((task) => task !== undefined) as SoldierTasks[];

              return {
                userId: soldier.userId,
                tasks: mergeTasks(filteredTasks, selectedTasks),
              };
            });

            setValue('soldierTasks', updatedSoldierTasks);
            setTasks(values);
          }}
          loading={fetchingTasks}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="soldierTasks"
          control={control}
          render={({ field }) => (
            <>
              {soldiers.map((soldier) => (
                <Accordion
                  key={soldier.userId}
                  sx={{
                    m: 0,
                    '&.Mui-expanded': {
                      margin: 0,
                    },
                  }}
                >
                  {/* Header Section */}
                  <AccordionSummary expandIcon={null} sx={{ m: 0, backgroundColor: theme.palette.layout.background16 }}>
                    <Typography variant="h6">
                      {soldier.rank} {soldier.firstName} {soldier.lastName}
                    </Typography>
                  </AccordionSummary>

                  {/* Expandable Task List */}
                  <AccordionDetails>
                    {(field.value || [])
                      .find((t) => t.userId === soldier.userId)
                      ?.tasks?.map((task, index) => (
                        <Box
                          key={task.taskName}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 1,
                            backgroundColor:
                              index % 2 === 0 ? theme.palette.layout.base : theme.palette.layout.background5,
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <Typography>{task.taskName}</Typography>
                          <PmxToggleBtnGroup
                            buttons={[
                              { label: 'GO', value: 'GO' },
                              { label: 'NO-GO', value: 'NOGO' },
                              ...(eventType === 'Training' ? [{ label: 'N/A', value: 'N/A' }] : []),
                            ]}
                            selected={task.result}
                            // eslint-disable-next-line sonarjs/no-nested-functions
                            onChange={(resultValue) => {
                              field.onChange(
                                field.value.map((taskEntry) =>
                                  taskEntry.userId === soldier.userId
                                    ? {
                                        ...taskEntry,
                                        tasks: taskEntry.tasks.map((t) =>
                                          t.taskName === task.taskName ? { ...t, result: resultValue } : t,
                                        ),
                                      }
                                    : taskEntry,
                                ),
                              );
                            }}
                          />
                        </Box>
                      ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          )}
        />
      </Grid>
    </Grid>
  );
};

export default MassTasksSection;
