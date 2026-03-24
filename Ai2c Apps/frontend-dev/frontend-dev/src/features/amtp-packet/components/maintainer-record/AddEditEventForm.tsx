import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { FieldErrors, FieldPath, useFieldArray, useForm } from 'react-hook-form';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Divider, Grid, IconButton, Paper, Typography } from '@mui/material';

import {
  EventTaskDto,
  EventType,
  GoNoGoStatus,
  IDa7817s,
  useCreateEventMutation,
  useUpdateEventMutation,
} from '@store/amap_ai/events';
import { useLazyGetUserTasksQuery } from '@store/amap_ai/tasks/slices/tasksApi';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useAppSelector } from '@store/hooks';

import EventMainFields from './EventMainFields';
import FormActions from './FormActions';
import ProgressionWarning from './ProgressionWarning';

export interface IEventFormValues {
  id?: number;
  eventType: EventType;
  eventDate: Dayjs | null;
  trainingType: string | undefined;
  evaluationType: string | undefined;
  awardType: string | undefined;
  tcsLocation: string | undefined;
  gainingUnit: IUnitBrief | undefined;
  mxHours: number;
  maintenanceLevel: string | null;
  eventResult: string;
  comments: string;
  mos: string | null;
  originalRecorder?: string;
}

export interface IMultiEventForm {
  events: IEventFormValues[];
}

const AddEditEventForm = forwardRef(
  (
    {
      handleClose,
      formSubmitted,
      events,
      isInitialUpload = false,
      isXMLUpload = false,
      setIsSubmitting,
    }: {
      handleClose: () => void;
      formSubmitted: () => void;
      isInitialUpload?: boolean;
      isXMLUpload?: boolean;
      setIsSubmitting?: (val: boolean) => void;
      events: IDa7817s[] | undefined;
    },
    ref,
  ) => {
    const { appUser, currentUic } = useAppSelector((state) => state.appSettings);
    const { maintainer, eventType, eventTrainingType } = useAppSelector((state) => state.amtpPacket);
    const [trigger, { data: userTasks, isFetching: fetchingTasks }] = useLazyGetUserTasksQuery();

    const [taskType, setTaskType] = useState<string>('');
    const [isTaskCheckboxChecked, setIsTaskCheckboxChecked] = useState<boolean>(false);
    const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
    const [tableData, setTableData] = useState<{ taskNumber: string; taskName: string; result: string }[]>([]);
    const [signature, setSignature] = useState<{ signatureOne: boolean; signatureTwo: boolean }>({
      signatureOne: false,
      signatureTwo: false,
    });

    const [createEvent, { isLoading }] = useCreateEventMutation();
    const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        handleSubmit(onSubmit)();
      },
    }));

    const {
      control,
      handleSubmit,
      formState: { errors, isDirty },
      reset,
      watch,
      setValue,
    } = useForm<IMultiEventForm>({
      defaultValues: {
        events: events
          ? events.map((ev) => ({
              eventType: eventType ?? ev?.eventType,
              eventDate: ev?.date ? dayjs(ev.date) : dayjs(),
              trainingType: ev?.trainingType ? ev.trainingType : (eventTrainingType ?? ''),
              evaluationType: eventType ? 'Annual' : (ev?.evaluationType ?? ''),
              awardType: ev?.awardType ?? '',
              tcsLocation: ev?.tcsLocation ?? '',
              gainingUnit: ev?.gainingUnit ?? undefined,
              mxHours: ev?.totalMxHours ?? 0,
              maintenanceLevel: ev?.maintenanceLevel ?? '',
              // eslint-disable-next-line sonarjs/no-nested-conditional
              eventResult: ev?.goNogo ? ev.goNogo : eventTrainingType ? 'GO' : '',
              comments: ev?.comment ?? '',
              mos: ev?.mos ?? '',
            }))
          : [],
      },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'events' });

    useEffect(() => {
      if (!maintainer?.id || !isTaskCheckboxChecked) return;

      const taskTypeToUse = taskType || 'ctl-tasks';
      taskTypeToUse === 'ctl-tasks'
        ? trigger({ user_id: maintainer.id, all_tasks: false })
        : trigger({ user_id: maintainer.id, all_tasks: true });
    }, [taskType, maintainer?.id, isTaskCheckboxChecked, trigger]);

    const buildPayload = (singleEvent: IEventFormValues) => {
      const selectedTasks = tableData
        .map((task) => {
          const taskKey = task?.taskName?.split(' - ')[1] ?? task?.taskName;
          const matchedTask = userTasks?.find((userTask) => userTask.taskTitle === taskKey);

          if (!matchedTask) return undefined;

          return {
            number: matchedTask.taskNumber,
            name: taskKey,
            go_nogo: task?.result ?? 'N/A',
          };
        })
        .filter((task) => task !== undefined) as EventTaskDto[];
      return {
        ...(singleEvent?.id && { id: singleEvent.id }),
        user_id: maintainer?.id ?? '',
        uic: currentUic,
        recorded_by: appUser?.userId as string,
        event_type: singleEvent.eventType!,
        date: dayjs(singleEvent.eventDate).format('YYYY-MM-DD') || '',
        event_tasks: selectedTasks,
        go_nogo: singleEvent.eventResult as GoNoGoStatus,
        ...(isInitialUpload && singleEvent.originalRecorder && { recorded_by_legacy: singleEvent.originalRecorder }),
        ...(singleEvent.mos && { mos: singleEvent.mos }),
        ...(singleEvent.maintenanceLevel && { maintenance_level: singleEvent.maintenanceLevel }),
        ...(singleEvent.evaluationType && { evaluation_type: singleEvent.evaluationType }),
        ...(singleEvent.trainingType && { training_type: singleEvent.trainingType }),
        ...(singleEvent.gainingUnit && { gaining_unit: singleEvent.gainingUnit.uic }),
        ...(singleEvent.awardType && { award_type: singleEvent.awardType }),
        ...(singleEvent.tcsLocation && { tcs_location: singleEvent.tcsLocation }),
        ...(singleEvent.mxHours && { total_mx_hours: singleEvent.mxHours }),
        comments: singleEvent?.comments ?? '',
      };
    };

    const onSubmit = async (data: IMultiEventForm) => {
      if (!maintainer?.id) return;

      try {
        if (events) {
          setIsSubmitting && setIsSubmitting(true);
          const mergedEvents = data.events.map((event, i) => ({
            ...events[i],
            ...event,
          }));
          for (const mergedEvent of mergedEvents) {
            const payload = buildPayload(mergedEvent as IEventFormValues);
            if (mergedEvent?.id) {
              await updateEvent({ id: mergedEvent.id, ...payload });
            } else {
              await createEvent(payload);
            }
          }

          formSubmitted();
          setIsSubmitting && setIsSubmitting(false);
          reset();
        }
      } catch (err) {
        console.error('Error submitting event(s):', err);
      }
    };

    const canSubmit = () => {
      if (!isInitialUpload && events) {
        const hasSignatures = signature.signatureOne && signature.signatureTwo;
        const isLegacyTrainingEvent =
          watch(`events.${0}.eventType` as FieldPath<IMultiEventForm>) === 'Training' &&
          isDirty &&
          events[0]?.mos &&
          events[0]?.maintenanceLevel &&
          isAcknowledged;

        return hasSignatures && (!events[0]?.id || !!events[0]?.id || isLegacyTrainingEvent);
      }
      return true;
    };

    return (
      <>
        {events?.[0]?.eventType === 'Training' && events[0]?.mos && events[0]?.maintenanceLevel && (
          <ProgressionWarning isReadOnly={false} />
        )}
        <Typography paragraph aria-label="form-header">
          {isInitialUpload
            ? "Ensure all soldier's unit and ML is correct for each event. Enter in events from oldest to newest."
            : 'Ensure all information is accurate. Event needs confirmation from the SM and Supervisor before submitting the entry.'}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} aria-label="event-form" data-testid="event-form">
          {isInitialUpload && (
            <>
              {fields.map((item, index) => (
                <Grid size={{ xs: 12 }} key={item.id}>
                  <Paper sx={{ p: 4 }}>
                    {!events?.[index] && (
                      <Box display="flex" justifyContent="flex-end" mb={4}>
                        <IconButton onClick={() => remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}

                    <EventMainFields
                      control={control}
                      errors={errors.events?.[index] as FieldErrors<IEventFormValues>}
                      isDirty={isDirty}
                      index={index}
                      isInitialUpload={isInitialUpload}
                      taskType={taskType}
                      setTaskType={setTaskType}
                      isAcknowledged={isAcknowledged}
                      setIsAcknowledged={setIsAcknowledged}
                      tableData={tableData}
                      setTableData={setTableData}
                      isTaskCheckboxChecked={isTaskCheckboxChecked}
                      setIsTaskCheckboxChecked={setIsTaskCheckboxChecked}
                      userTasks={userTasks}
                      fetchingTasks={fetchingTasks}
                      signature={signature}
                      setSignature={setSignature}
                      watch={watch}
                      event={events?.[index]}
                      setValue={setValue}
                    />
                  </Paper>
                </Grid>
              ))}
              <Divider sx={{ mt: 4 }}>
                <Button variant="outlined" onClick={() => append({} as IEventFormValues)} startIcon={<AddIcon />}>
                  Add Event
                </Button>
              </Divider>
            </>
          )}
          {!isInitialUpload && (
            <EventMainFields
              index={0}
              control={control}
              errors={errors.events?.[0] as FieldErrors<IEventFormValues>}
              isDirty={isDirty}
              isInitialUpload={isInitialUpload}
              taskType={taskType}
              setTaskType={setTaskType}
              isAcknowledged={isAcknowledged}
              setIsAcknowledged={setIsAcknowledged}
              tableData={tableData}
              setTableData={setTableData}
              isTaskCheckboxChecked={isTaskCheckboxChecked}
              setIsTaskCheckboxChecked={setIsTaskCheckboxChecked}
              userTasks={userTasks}
              fetchingTasks={fetchingTasks}
              signature={signature}
              setSignature={setSignature}
              watch={watch}
              event={events ? events[0] : undefined}
              setValue={setValue}
            />
          )}
          {!isXMLUpload && (
            <FormActions
              handleClose={handleClose}
              isLoading={isLoading}
              isUpdating={isUpdating}
              canSubmit={!!canSubmit()}
            />
          )}
        </form>
      </>
    );
  },
);

AddEditEventForm.displayName = 'AddEditEventForm';

export default AddEditEventForm;
