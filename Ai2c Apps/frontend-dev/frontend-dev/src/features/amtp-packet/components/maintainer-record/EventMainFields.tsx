/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable sonarjs/no-nested-conditional */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import React from 'react';
import { Dayjs } from 'dayjs';
import { Control, Controller, FieldErrors, FieldPath, UseFormSetValue, UseFormWatch, useWatch } from 'react-hook-form';

import { Divider, Grid, TextField } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxDatePicker from '@components/PmxDatePicker';
import { UnitSelect } from '@components/UnitSelect';
import { EventType, IDa7817s, useGetEventTypesQuery } from '@store/amap_ai/events';
import { IUnitBrief, useLazyGetUnitsQuery } from '@store/amap_ai/units';
import { useAppSelector } from '@store/hooks';

import { IEventFormValues, IMultiEventForm } from './AddEditEventForm';
import DynamicFormField from './DynamicFormField';
import { IMassEventFormValues } from './MassEventDialog';
import ProgressionAcknowledgement from './ProgressionAcknowledgement';
import ProgressionFields from './ProgressionFields';
import SignatureSection from './SignatureSection';
import TasksSection from './TasksSection';

interface EventMainFieldsProps {
  isInitialUpload?: boolean;
  control: Control<IMultiEventForm, null>;
  errors: FieldErrors<IEventFormValues>;
  watch: UseFormWatch<IMultiEventForm>;
  index: number;
  event: IDa7817s | undefined;
  isDirty: boolean;
  isAcknowledged: boolean;
  setIsAcknowledged: React.Dispatch<React.SetStateAction<boolean>>;
  isTaskCheckboxChecked: boolean;
  setIsTaskCheckboxChecked: React.Dispatch<React.SetStateAction<boolean>>;
  tableData: {
    taskNumber: string;
    taskName: string;
    result: string;
  }[];
  setTableData: React.Dispatch<
    React.SetStateAction<
      {
        taskNumber: string;
        taskName: string;
        result: string;
      }[]
    >
  >;
  signature: {
    signatureOne: boolean;
    signatureTwo: boolean;
  };
  setSignature: React.Dispatch<
    React.SetStateAction<{
      signatureOne: boolean;
      signatureTwo: boolean;
    }>
  >;
  taskType: string;
  setTaskType: React.Dispatch<React.SetStateAction<string>>;
  fetchingTasks: boolean;
  userTasks:
    | {
        taskNumber: string;
        taskTitle: string;
        mos: string;
      }[]
    | undefined;
  setValue: UseFormSetValue<IMultiEventForm>;
}
const EventMainFields = ({
  event,
  control,
  errors,
  isDirty,
  watch,
  index,
  signature,
  setSignature,
  isAcknowledged,
  setIsAcknowledged,
  tableData,
  setTableData,
  isTaskCheckboxChecked,
  setIsTaskCheckboxChecked,
  taskType,
  setTaskType,
  fetchingTasks,
  userTasks,
  isInitialUpload = false,
  setValue,
}: EventMainFieldsProps) => {
  const [fetchUnits, { data: units }] = useLazyGetUnitsQuery();
  const { eventTask, eventTrainingType } = useAppSelector((state) => state.amtpPacket);
  const [tasks, setTasks] = useState<{ label: string; value: string }[]>(
    event?.eventTasks?.length ? event?.eventTasks?.map((x) => ({ label: x.name, value: x.name })) : [],
  );
  const [showTaskCheckbox, setShowTaskCheckbox] = useState<boolean>(false);
  const { data: eventTypes, isFetching: fetchEvents } = useGetEventTypesQuery(null);

  const selectedEventType = useWatch({
    control,
    name: `events.${index}.eventType`,
  });

  useEffect(() => {
    if (selectedEventType === 'Training' || selectedEventType === 'Evaluation') {
      setShowTaskCheckbox(true);
    } else {
      setShowTaskCheckbox(false);
      setIsTaskCheckboxChecked(false);
    }
  }, [selectedEventType]);

  useEffect(() => {
    if (isInitialUpload) fetchUnits({});
  }, [isInitialUpload]);

  useEffect(() => {
    const allTasks = event?.eventTasks
      ? eventTask
        ? [...event.eventTasks, eventTask]
        : event.eventTasks
      : eventTask
        ? [eventTask]
        : [];

    setTasks(allTasks.map((x) => ({ label: x.name, value: x.number })));
    setTaskType(allTasks.length ? 'ctl-tasks' : '');
    setTableData(
      allTasks.map((x) => ({
        taskNumber: x.number,
        taskName: x.name,
        // @ts-expect-error
        result: x?.goNogo ?? (eventTrainingType ? 'GO' : 'N/A'),
      })),
    );
    setIsTaskCheckboxChecked(!!allTasks.length);
  }, [event]);

  const handleTasksChange = (tasks: { label: string; value: string }[]) => {
    const formattedTasks = tasks.map((task) => ({
      taskNumber: task.value,
      taskName: task.label,
      result: watch(`events.${index}.eventResult`) ?? 'GO',
    }));
    setTableData(formattedTasks);
  };

  const renderMxHours = () => {
    const eventType = watch(`events.${index}.eventType` as FieldPath<IMultiEventForm>) as string;
    const allowedEventTypes = ['Evaluation', 'Training', 'TCS', 'Other', 'PCS/ETS', 'In-Unit Transfer'];
    return allowedEventTypes.includes(eventType);
  };

  const getMxGridSize = (): number => {
    const eventType = watch(`events.${index}.eventType` as FieldPath<IMultiEventForm>);
    if (eventType === 'TCS' || eventType === 'PCS/ETS' || eventType === 'In-Unit Transfer') {
      return 6;
    } else if (eventType === 'Other') {
      return 12;
    } else {
      return 4;
    }
  };

  type EventFieldName = keyof IEventFormValues;

  const fieldName = (name: EventFieldName): FieldPath<IMultiEventForm> =>
    `events.${index}.${name}` as FieldPath<IMultiEventForm>;

  const events = watch('events');

  // sets the unit for the next even in mass manual entry
  useEffect(() => {
    if (index > 0) {
      const prevUnit = events?.[index - 1]?.gainingUnit;
      const currentUnit = events?.[index]?.gainingUnit;

      if (prevUnit && !currentUnit) {
        setValue(`events.${index}.gainingUnit`, prevUnit);
      }
    }
  }, [events?.[index - 1]?.gainingUnit]);

  const shouldShowProgressionFields = ({
    isInitialUpload,
    selectedEventType,
    event,
  }: {
    isInitialUpload: boolean;
    selectedEventType: string;
    event: IDa7817s | undefined;
  }) => {
    if (isInitialUpload) return false;

    const isEvaluation = selectedEventType === 'Evaluation';
    const isTraining = selectedEventType === 'Training';

    if (isEvaluation) return true;

    const isExistingEvent = event?.id;
    const hasProgressionData = event?.mos || event?.maintenanceLevel;

    return isTraining && isExistingEvent && hasProgressionData;
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: !isInitialUpload ? 6 : 3 }}>
        <Controller
          name={fieldName('eventType')}
          control={control}
          rules={{ required: 'Event Type is required' }}
          render={({ field }) => (
            <PmxDropdown
              options={eventTypes?.map((x) => x.type) ?? []}
              value={field.value as string}
              label="Event Type*"
              onChange={field.onChange}
              error={!!errors?.eventType}
              helperText={errors?.eventType?.message}
              loading={fetchEvents}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: !isInitialUpload ? 6 : 3 }}>
        <Controller
          name={fieldName('eventDate')}
          control={control}
          rules={{ required: 'Event Date is required' }}
          render={({ field }) => (
            <PmxDatePicker
              value={field.value as Dayjs}
              onChange={field.onChange}
              label="Event Date*"
              aria-label="event-date"
              error={!!errors?.eventDate}
              helperText={errors?.eventDate?.message}
            />
          )}
        />
      </Grid>
      {isInitialUpload && (
        <>
          <Grid size={{ xs: 3 }}>
            <Controller
              name={fieldName('gainingUnit')}
              control={control}
              rules={{ required: 'Unit is required.' }}
              render={({ field }) => (
                <UnitSelect
                  units={units ?? []}
                  showShortName
                  onChange={field.onChange}
                  value={field.value as IUnitBrief}
                  readOnly={false}
                  width="100%"
                  label="Unit"
                  error={!!errors?.gainingUnit}
                  helperText={errors?.gainingUnit?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Controller
              name={fieldName('originalRecorder')}
              control={control}
              rules={{ required: 'Original Recorder is required.' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value as string}
                  onChange={field.onChange}
                  label="Original Recorder*"
                  aria-label="original-recorder"
                  error={!!errors?.originalRecorder}
                  helperText={errors?.originalRecorder?.message}
                />
              )}
            />
          </Grid>
        </>
      )}
      <Grid size={{ xs: 12 }} mt={4} mb={4}>
        <Divider />
      </Grid>
      {selectedEventType && (
        <>
          <DynamicFormField
            formType={selectedEventType as string}
            control={control as Control<IMultiEventForm | IEventFormValues | IMassEventFormValues, null>}
            errors={errors}
          />
          {renderMxHours() && (
            <Grid size={{ xs: getMxGridSize() }}>
              <Controller
                name={fieldName('mxHours')}
                control={control}
                rules={{ required: 'Total Maintenance Hours is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Total MX Hours*"
                    fullWidth
                    error={!!errors?.mxHours}
                    helperText={errors?.mxHours?.message}
                  />
                )}
              />
            </Grid>
          )}
          {(selectedEventType === 'Evaluation' || selectedEventType === 'Training') && (
            <Grid size={{ xs: 4 }}>
              <Controller
                name={fieldName('eventResult')}
                control={control}
                rules={{ required: 'Event Result is required' }}
                render={({ field }) => (
                  <PmxDropdown
                    options={[
                      { label: 'Go', value: 'GO' },
                      { label: 'No-Go', value: 'NOGO' },
                      ...(selectedEventType === 'Training' ? [{ label: 'N/A', value: 'N/A' }] : []),
                    ]}
                    value={field.value as string}
                    label="Event Result*"
                    onChange={field.onChange}
                    error={!!errors?.eventResult}
                    helperText={errors?.eventResult?.message}
                  />
                )}
              />
            </Grid>
          )}
          {shouldShowProgressionFields({
            isInitialUpload,
            selectedEventType,
            event,
          }) && (
            <ProgressionFields
              formIndex={index}
              formType={selectedEventType}
              control={control as Control<IMultiEventForm | IEventFormValues | IMassEventFormValues, null>}
              errors={errors}
              isDisabled={isDirty && selectedEventType === 'Training'}
            />
          )}
          <Grid size={{ xs: 12 }}>
            <Controller
              name={fieldName('comments')}
              control={control}
              render={({ field }) => (
                <TextField
                  value={field.value}
                  label="Comments"
                  rows={4}
                  multiline
                  fullWidth
                  onChange={field.onChange}
                  error={!!errors?.comments}
                  helperText={errors?.comments?.message}
                />
              )}
            />
          </Grid>
        </>
      )}
      <TasksSection
        showTaskCheckbox={showTaskCheckbox}
        taskType={taskType}
        setTaskType={setTaskType}
        tasks={tasks}
        setTasks={setTasks}
        fetchingTasks={fetchingTasks}
        userTasks={userTasks}
        isTaskCheckboxChecked={isTaskCheckboxChecked}
        setIsTaskCheckboxChecked={setIsTaskCheckboxChecked}
        handleTasksChange={handleTasksChange}
        tableData={tableData}
        setTableData={setTableData}
        selectedEventType={selectedEventType as EventType}
      />
      <Grid size={{ xs: 12 }} mt={8}>
        {selectedEventType === 'Training' && event?.mos && event?.maintenanceLevel && (
          <ProgressionAcknowledgement isAcknowledged={isAcknowledged} setIsAcknowledged={setIsAcknowledged} />
        )}
      </Grid>

      {/* Card Component */}
      {!isInitialUpload && (
        <Grid size={{ xs: 12 }}>
          <SignatureSection signature={signature} setSignature={setSignature} />
        </Grid>
      )}
    </Grid>
  );
};

export default React.memo(EventMainFields);
