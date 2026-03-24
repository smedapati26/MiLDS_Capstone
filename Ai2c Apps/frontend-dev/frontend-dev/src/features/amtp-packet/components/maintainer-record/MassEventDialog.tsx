import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';

import { useSnackbar } from '@context/SnackbarProvider';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@mui/material';

import { GoNoGoStatus, useCreateMassEventMutation } from '@store/amap_ai/events';
import { ISoldier } from '@store/amap_ai/soldier';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useAppSelector } from '@store/hooks';

import EventInfoFields, { IEventSoldier } from './EventInfoFields';
import FormActions from './FormActions';
import MassTasksSection, { SoldierTasks } from './MassTasksSection';
import SignatureSection from './SignatureSection';

interface EventDialogProps {
  open: boolean;
  handleClose: () => void;
  formSubmitted: () => void;
  eventType: 'Training' | 'Award' | 'TCS';
}

export interface IMassEventFormValues {
  eventType: 'Training' | 'Award' | 'TCS';
  eventDate: Dayjs | null;
  eventResult: string;
  soldierStatuses: IEventSoldier[];
  soldierTasks: { userId: string; tasks: SoldierTasks[] }[];
  trainingType: string | undefined;
  awardType: string | undefined;
  tcsLocation: string | undefined;
  evaluationType: string | undefined;
  gainingUnit: IUnitBrief | undefined;
  comments: string;
  maintenanceLevel: string;
  mos: string;
}

const MassEventDialog = ({ open, handleClose, formSubmitted, eventType }: EventDialogProps) => {
  const { appUser } = useAppSelector((state) => state.appSettings);
  const { showAlert } = useSnackbar();
  const [tasks, setTasks] = useState<{ label: string; value: string }[]>([]);
  const [selectedSoldiers, setSelectedSoldiers] = useState<ISoldier[] | undefined>([]);
  const [selectedUnit, setSelectedUnit] = useState<IUnitBrief | undefined>(undefined);
  const [signature, setSignature] = useState<{ signatureOne: boolean; signatureTwo: boolean }>({
    signatureOne: false,
    signatureTwo: false,
  });
  const [activeStep, setActiveStep] = useState(0);

  const [createMassEvent, { isLoading }] = useCreateMassEventMutation();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<IMassEventFormValues>({
    defaultValues: {
      soldierStatuses: [],
      eventType: undefined,
      eventDate: null,
      trainingType: undefined,
      awardType: undefined,
      tcsLocation: undefined,
      gainingUnit: undefined,
      eventResult: undefined,
      comments: '',
    },
  });

  const onSubmit = async (data: IMassEventFormValues) => {
    if (!appUser || !selectedUnit || !selectedSoldiers) {
      return;
    }

    const soldiers = data.soldierStatuses.map((currentSoldier) => {
      const soldierTask = (data?.soldierTasks?.find((task) => task.userId === currentSoldier.userId) as {
        userId: string;
        tasks: SoldierTasks[];
      }) ?? { userId: '', tasks: [] };

      return {
        soldier_id: currentSoldier.userId,
        go_nogo: currentSoldier.result as GoNoGoStatus,
        comments: currentSoldier.comments,
        ...(soldierTask?.tasks?.length && {
          event_tasks: soldierTask.tasks.map((formTask) => ({
            go_nogo: formTask.result,
            number: formTask.taskNumber,
            name: formTask.taskName,
          })),
        }),
      };
    });

    const payload = {
      uic: selectedUnit?.uic ?? '',
      recorded_by: appUser?.userId ?? '',
      event_type: eventType,
      gaining_unit: selectedUnit.uic,
      date: data.eventDate ? dayjs(data.eventDate).format('YYYY-MM-DD') : '',
      comments: data.comments,
      soldiers,
      ...(data.evaluationType && { evaluation_type: data.evaluationType }),
      ...(data.trainingType && { training_type: data.trainingType }),
      ...(data.gainingUnit && { gaining_unit: selectedUnit?.uic }),
      ...(data.awardType && { award_type: data.awardType }),
      ...(data.tcsLocation && { tcs_location: data.tcsLocation }),
    };

    try {
      await createMassEvent(payload).then(() => {
        showAlert('Mass Training Event Saved', 'success', false);
        reset({
          eventType: undefined,
          eventDate: null,
          trainingType: undefined,
          evaluationType: undefined,
          awardType: undefined,
          tcsLocation: undefined,
          gainingUnit: undefined,
          eventResult: undefined,
          comments: '',
          soldierStatuses: [],
          soldierTasks: [],
        });
        formSubmitted();
      });
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const steps = [
    {
      label: 'Event Information*',
      description: (
        <EventInfoFields
          formType={eventType}
          control={control}
          errors={errors}
          setValue={setValue}
          watch={watch}
          selectedSoldiers={selectedSoldiers}
          setSelectedSoldiers={setSelectedSoldiers}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        />
      ),
    },
    ...(eventType === 'Training'
      ? [
          {
            label: 'Associated Tasks',
            description: (
              <MassTasksSection
                soldiers={selectedSoldiers ?? []}
                eventType={eventType}
                control={control}
                errors={errors}
                setValue={setValue}
                tasks={tasks}
                setTasks={setTasks}
              />
            ),
          },
        ]
      : []),
    {
      label: 'Confirmation*',
      description: <SignatureSection signature={signature} setSignature={setSignature} isPartySignature={false} />,
    },
  ];

  const isStepValid = () => {
    if (activeStep === 0) {
      return (
        (watch('trainingType') || watch('awardType') || watch('tcsLocation')) &&
        watch('eventDate') &&
        (watch('eventType') === 'Training' ? watch('eventResult') : true) &&
        watch('soldierStatuses')
      );
    } else if (activeStep === 2) {
      return signature.signatureOne;
    }
    return true;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>Add Mass {eventType} Event</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} aria-label="mass-event-form">
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Grid container spacing={3}>
                    {activeStep !== steps.length - 1 && step.description}
                    {activeStep === steps.length - 1 && <Grid size={{ xs: 12 }}>{step.description}</Grid>}
                    <Grid size={{ xs: 12 }}>
                      <Box display="flex" justifyContent={index !== 0 ? 'space-between' : 'flex-end'} sx={{ mb: 2 }}>
                        {index !== 0 && (
                          <Button aria-label="Back" onClick={handleBack} variant="outlined" sx={{ mt: 1 }}>
                            Back
                          </Button>
                        )}
                        {activeStep !== steps.length - 1 && (
                          <Button variant="contained" onClick={handleNext} sx={{ mt: 1 }} disabled={!isStepValid()}>
                            Next
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <FormActions
            handleClose={() => {
              reset();
              handleClose();
            }}
            isLoading={isLoading}
            isUpdating={false}
            canSubmit={signature.signatureOne}
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MassEventDialog;
