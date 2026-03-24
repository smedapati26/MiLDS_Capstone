import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Card,
  CircularProgress,
  Modal,
  Paper,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';

import { PmxTable, PmxTableProps } from '@components/data-tables/PmxTable';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';
import { IModification, IModificationEditIn, mapToIModificationEditInDto } from '@store/griffin_api/mods/models';
import { useEditModificationsMutation } from '@store/griffin_api/mods/slices';

import AddRemarksStep from './ModEditSteps/AddRemarks';
import EditAircraftAssignmentStep from './ModEditSteps/EditAircraftAssignment';
import EditLocationStep from './ModEditSteps/EditLocation';
import EditSerialNumber from './ModEditSteps/EditSerialNumber';
import EditVariableAndStatusStep from './ModEditSteps/EditVariableAndStatus';
import ReviewChangesStep from './ModEditSteps/ReviewChanges';
import SelectFieldsStep, { ModEditStepsEnum } from './ModEditSteps/SelectFields';

import { ModAircraftAssignment } from './helper';

interface Props<T> extends PmxTableProps<T> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditSave: () => void;
  modelType: string;
}

/**
 * Multi edit of an aircraft equipment.
 * @returns React.Node
 */

const ModsMultiEdit = (props: Props<IModification>): React.ReactNode => {
  const { columns, rows, open, setOpen, modelType, handleEditSave } = props;
  const theme = useTheme();

  // Data Editing State Declared Variables
  const [editModifications, { isLoading: isEditLoading }] = useEditModificationsMutation();
  const [assignedAircraft, setAssignedAircraft] = useState<ModAircraftAssignment[]>([]);
  const [trackingVariable, setTrackingVariable] = useState<string | undefined>(undefined);
  const [value, setValue] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<IAutoDsrLocation | null>(null);
  const [remarks, setRemarks] = useState<string>('');

  // Stepper State Declared Variables
  const [steps, setSteps] = useState([ModEditStepsEnum.SELECT, ModEditStepsEnum.REVIEW]);
  const [activeStep, setActiveStep] = useState<ModEditStepsEnum>(ModEditStepsEnum.SELECT);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(steps.length).fill(false));

  useEffect(() => {
    setAssignedAircraft(
      rows.map((mod) => {
        return { id: mod.id, mod: mod.serialNumber, aircraft: mod.assignedAircraft, serialNumber: mod.serialNumber };
      }),
    );
  }, [rows]);

  /* Use Effect for updating stepper status */
  useEffect(() => {
    setCompletedSteps(Array(steps.length).fill(false));
  }, [steps.length]);

  /* Close modal and reset data */
  const handleClose = () => {
    setAssignedAircraft([]);
    setTrackingVariable(undefined);
    setValue(undefined);
    setLocation(null);
    setRemarks('');

    setSteps([ModEditStepsEnum.SELECT, ModEditStepsEnum.REVIEW]);
    setActiveStep(ModEditStepsEnum.SELECT);
    setCompletedSteps(Array(steps.length).fill(false));
    setOpen(false);
  };

  /* Navigate to a specific step */
  const handleStepClick = (step: number, label: string) => {
    if (completedSteps[step] || completedSteps[step - 1]) {
      setActiveStep(label as ModEditStepsEnum);
    }
  };

  /* Navigate to next step or save changes */
  const handleNextOrSave = async () => {
    if (activeStep === ModEditStepsEnum.REVIEW) {
      try {
        const editData: IModificationEditIn[] = rows.map((mod: IModification) => {
          const updatedMod: IModificationEditIn = {
            id: mod.id,
            serialNumber: mod.serialNumber,
            model: mod.model,
            unit: mod.unit,
          };

          if (steps.includes(ModEditStepsEnum.SERIAL)) {
            const serialNumberAssignment = assignedAircraft.find((aircraft) => aircraft['id'] === mod.id);
            if (serialNumberAssignment) {
              updatedMod.serialNumber = serialNumberAssignment.serialNumber;
            }
          }

          if (steps.includes(ModEditStepsEnum.AIRCRAFT)) {
            const aircraftAssignment = assignedAircraft.find((aircraft) => aircraft['id'] === mod.id);
            updatedMod.assignedAircraft = aircraftAssignment ? aircraftAssignment.aircraft : undefined;
          }

          if (steps.includes(ModEditStepsEnum.STATUS)) {
            updatedMod.trackingVariable = trackingVariable;
            updatedMod.value = value;
          }

          if (steps.includes(ModEditStepsEnum.LOCATION)) {
            updatedMod.locationId = location?.id;
          }

          if (steps.includes(ModEditStepsEnum.REMARKS)) {
            updatedMod.remarks = remarks;
          }

          if (updatedMod.trackingVariable?.toLowerCase() === 'other') {
            updatedMod.value = updatedMod.remarks;
          }
          return updatedMod;
        });

        const response = await editModifications(editData.map(mapToIModificationEditInDto)).unwrap();

        if (response) {
          handleClose();
          handleEditSave();
        }
      } catch (error) {
        console.error('Error editing modifications: ', error);
      }
    } else {
      const activeIndex = steps.indexOf(activeStep);

      setCompletedSteps((prev) => {
        const updatedCompletedSteps = [...prev];
        updatedCompletedSteps[activeIndex] = true;
        return updatedCompletedSteps;
      });

      setActiveStep(steps[activeIndex + 1]);
    }
  };

  /* Current Step UI Component */
  const getCurrentStep = () => {
    switch (activeStep) {
      case ModEditStepsEnum.SELECT:
        return <SelectFieldsStep steps={steps} setSteps={setSteps} />;
      case ModEditStepsEnum.SERIAL:
        return <EditSerialNumber assignedAircraft={assignedAircraft} setAssignedAircraft={setAssignedAircraft} />;
      case ModEditStepsEnum.AIRCRAFT:
        return (
          <EditAircraftAssignmentStep assignedAircraft={assignedAircraft} setAssignedAircraft={setAssignedAircraft} />
        );
      case ModEditStepsEnum.STATUS:
        return (
          <EditVariableAndStatusStep
            trackingVariable={trackingVariable}
            setTrackingVariable={setTrackingVariable}
            value={value}
            setValue={setValue}
          />
        );
      case ModEditStepsEnum.LOCATION:
        return <EditLocationStep location={location} setLocation={setLocation} />;
      case ModEditStepsEnum.REMARKS:
        return <AddRemarksStep remarks={remarks} setRemarks={setRemarks} />;
      case ModEditStepsEnum.REVIEW:
        return (
          <ReviewChangesStep
            columns={columns}
            rows={rows}
            assignedAircraft={
              steps.includes(ModEditStepsEnum.AIRCRAFT) || steps.includes(ModEditStepsEnum.SERIAL)
                ? assignedAircraft
                : undefined
            }
            trackingVariable={steps.includes(ModEditStepsEnum.STATUS) ? trackingVariable : undefined}
            value={steps.includes(ModEditStepsEnum.STATUS) ? value : undefined}
            remarks={steps.includes(ModEditStepsEnum.REMARKS) ? remarks : undefined}
            location={steps.includes(ModEditStepsEnum.LOCATION) && location ? location : undefined}
          />
        );
      default:
        return <Typography>Invalid Stepper Index: {activeStep}.</Typography>;
    }
  };

  /* Multi Aircraft Edit Modal UI Component */
  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        sx={{
          width: '83%',
          padding: '20px 16px',
          margin: 'auto',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Stack direction="column" spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">Edit {modelType}</Typography>
            <Button onClick={handleClose} sx={{ color: theme.palette.text.primary }}>
              <CloseIcon fontSize="small" data-testid="close-mods-multi-edit" />
            </Button>
          </Stack>
          <Card
            sx={{
              height: '35vh',
              overflowY: 'scroll',
              p: 4,
              '&:hover': {
                border: 'none',
              },
            }}
          >
            <PmxTable columns={columns} rows={rows} />
          </Card>

          <Stepper nonLinear activeStep={steps.indexOf(activeStep)} sx={{ width: `${steps.length * 20}%`, pt: 1 }}>
            {steps.map((label, index) => {
              const isInProgress = completedSteps[index] || completedSteps[index - 1];
              return (
                <Step key={label} completed={completedSteps[index]}>
                  <StepButton
                    onClick={() => handleStepClick(index, label)}
                    aria-label={`StepButton-${index + 1}`}
                    disabled={!isInProgress}
                    sx={
                      isInProgress
                        ? {
                            '.MuiSvgIcon-root': {
                              color: `${theme.palette.primary.main} !important`,
                            },
                            '.MuiStepLabel-label': {
                              color: `${theme.palette.text.primary} !important`,
                            },
                          }
                        : undefined
                    }
                  >
                    <StepLabel>{activeStep === label ? label : ''}</StepLabel>
                  </StepButton>
                </Step>
              );
            })}
          </Stepper>
          {getCurrentStep()}
          <Stack direction="row" spacing={3} justifyContent="flex-end">
            <Button color="primary" variant="outlined" onClick={handleClose} data-testid="multi-edit-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleNextOrSave}
              variant="contained"
              disabled={isEditLoading || (activeStep == ModEditStepsEnum.REVIEW && steps.length == 2)}
              startIcon={isEditLoading && <CircularProgress size={4} />}
              data-testid="multi-edit-next"
            >
              {activeStep !== ModEditStepsEnum.REVIEW ? 'Next' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default ModsMultiEdit;
