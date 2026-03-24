import React, { useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Button,
  Card,
  CircularProgress,
  Modal,
  Paper,
  Snackbar,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';

import PmxTable, { PmxTableProps } from '@components/data-tables/PmxTable';
import { isSubsetEqual } from '@components/utils';
import {
  FlightHourStep,
  LocationStep,
  RemarkStep,
  ReviewStep,
  SelectFieldsStep,
  StatusStep,
  UasEditStepsEnum,
  useUasMultiStepData,
} from '@features/equipment-manager/uas/UasEditSteps';

import { IUAS, IUASIn, UasType } from '@store/griffin_api/uas/models/IUAS';
import { useEditUacEquipmentMutation, useEditUavEquipmentMutation } from '@store/griffin_api/uas/slices';

interface Props<T> extends PmxTableProps<T> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdatedRows: React.Dispatch<React.SetStateAction<string[]>>;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  editUasType: UasType;
  editTitle: React.ReactNode;
}

/**
 * Multi step edit modal for Uas components
 * @param {boolean} open or close modal
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setOpen set status of open
 * @return React.ReactNode
 */
const UasMultiEdit: React.FC<Props<IUAS>> = (props: Props<IUAS>): React.ReactNode => {
  const { columns, rows, open, setOpen, setUpdatedRows, setShowSnackbar, editUasType, editTitle } = props;
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [steps, setSteps] = useState<UasEditStepsEnum[]>([UasEditStepsEnum.SELECT, UasEditStepsEnum.REVIEW]);
  const [activeStep, setActiveStep] = useState<UasEditStepsEnum>(UasEditStepsEnum.SELECT);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(steps.length).fill(false));
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);

  const {
    location,
    ORStatus,
    launchStatus,
    flightHours,
    fieldSyncStatus,
    remarks,
    isNextReady,
    resetUasMultiEditData,
  } = useUasMultiStepData();

  const [editUav] = useEditUavEquipmentMutation();
  const [editUac] = useEditUacEquipmentMutation();

  /* Use Effect for updating stepper status */
  useEffect(() => {
    setCompletedSteps(Array(steps.length).fill(false));
  }, [steps.length]);

  const handleClose = (): void => {
    setOpen(false);
    resetUasMultiEditData();
    setSteps([UasEditStepsEnum.SELECT, UasEditStepsEnum.REVIEW]);
    setActiveStep(UasEditStepsEnum.SELECT);
    setCompletedSteps(Array(steps.length).fill(false));
  };

  /* Navigate to a specific step */
  const handleStepClick = (step: number, label: string) => {
    if (completedSteps[step] || completedSteps[step - 1]) {
      setActiveStep(label as UasEditStepsEnum);
    }
  };

  const getCurrentStep = (): React.ReactNode => {
    switch (activeStep) {
      case UasEditStepsEnum.SELECT:
        return <SelectFieldsStep steps={steps} setSteps={setSteps} uasType={editUasType} />;
      case UasEditStepsEnum.STATUS:
        return <StatusStep uasType={editUasType} />;
      case UasEditStepsEnum.PERIOD:
        return <FlightHourStep />;
      case UasEditStepsEnum.LOCATION:
        return <LocationStep />;
      case UasEditStepsEnum.REMARKS:
        return <RemarkStep />;
      case UasEditStepsEnum.REVIEW:
        return <ReviewStep columns={columns} rows={rows} steps={steps} />;
      default:
        return <Typography>Invalid Stepper Index: {activeStep}.</Typography>;
    }
  };

  const handleNextOrSave = async () => {
    if (activeStep === UasEditStepsEnum.REVIEW) {
      setIsEditLoading(true);

      const editedData = rows.reduce<Record<number, IUASIn>>(
        (acc: Record<number, IUASIn>, row: IUAS) => {
          const payload: Partial<IUASIn> = {
            status: row.status,
            rtl: row.rtl,
            remarks: row.remarks,
          };
          const updatedFieldSyncStatus: { [sync: string]: boolean } = { ...row.fieldSyncStatus };

          if (steps.includes(UasEditStepsEnum.STATUS)) {
            payload.status = ORStatus;
            payload.rtl = launchStatus;
            if ('rtl' in fieldSyncStatus) {
              updatedFieldSyncStatus['rtl'] = fieldSyncStatus['rtl'];
            }
            if ('status' in fieldSyncStatus) {
              updatedFieldSyncStatus['status'] = fieldSyncStatus['status'];
            }
          }

          if (steps.includes(UasEditStepsEnum.PERIOD)) {
            payload.flightHours = flightHours;
            if ('flightHours' in fieldSyncStatus) {
              updatedFieldSyncStatus['flightHours'] = fieldSyncStatus['flightHours'];
            }
          }

          if (steps.includes(UasEditStepsEnum.REMARKS)) {
            payload.remarks = remarks;
            if ('remarks' in fieldSyncStatus) {
              updatedFieldSyncStatus['remarks'] = fieldSyncStatus['remarks'];
            }
          }

          if (steps.includes(UasEditStepsEnum.LOCATION)) {
            if (location === null) {
              payload.locationId = null;
            } else if (location) {
              payload.locationId = location.id;
            }
            if ('location' in fieldSyncStatus) {
              updatedFieldSyncStatus['location'] = fieldSyncStatus['location'];
            }
          }

          if (!isSubsetEqual(row.fieldSyncStatus, updatedFieldSyncStatus)) {
            payload.fieldSyncStatus = updatedFieldSyncStatus;
          }

          acc[Number(row.id)] = payload as IUASIn;
          return acc;
        },
        {} as Record<number, IUASIn>,
      );

      try {
        // Call mutation for each entry in editedData
        const editUas = editUasType === 'Uav' ? editUav : editUac;

        const results = await Promise.all(
          Object.entries(editedData).map(async ([id, payload]) => {
            await editUas({
              id: Number(id),
              payload: payload,
            }).unwrap();
            return id;
          }),
        );

        // Update parent component with successful updates
        setUpdatedRows(results);
        setShowSnackbar(true);

        // Close modal on success
        handleClose();
      } catch (error) {
        setIsEditLoading(false);
        console.error('Error updating UAVs:', error);
        setErrorMessage(`Failed to update UAVs. Please try again or contact support.`);
      } finally {
        setIsEditLoading(false);
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

  const getLabel = (activeStep: UasEditStepsEnum, label: UasEditStepsEnum): string => {
    if (activeStep === UasEditStepsEnum.STATUS) {
      return editUasType === 'Uav' ? 'Edit UAV Status' : 'Edit Operational Readiness Status';
    } else if (activeStep === label) {
      return label;
    } else {
      return '';
    }
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ overflow: 'scroll' }} data-testid="uas-multi-edit-modal">
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
            {<Typography variant="body2">{`Edit ${editUasType === 'Uav' ? 'UAV' : 'Components'}`}</Typography>}
            <Button onClick={handleClose} sx={{ color: theme.palette.text.primary }}>
              <CloseIcon fontSize="small" data-testid="close-multi-edit" />
            </Button>
          </Stack>
          <Card sx={{ p: 4 }}>
            <Stack direction="column" spacing={3}>
              {editTitle}
              <PmxTable columns={columns.slice(0, columns.length - 1)} rows={rows} sx={{ boxShadow: 'none' }} />
            </Stack>
          </Card>
          <Stepper nonLinear activeStep={steps.indexOf(activeStep)} sx={{ pt: 1 }}>
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
                    <StepLabel>{getLabel(activeStep, label)}</StepLabel>
                  </StepButton>
                </Step>
              );
            })}
          </Stepper>

          {getCurrentStep()}
          <Stack direction="row" spacing={3} justifyContent="flex-end" alignItems="center">
            <Button variant="outlined" size="large" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleNextOrSave}
              variant="contained"
              disabled={!isNextReady || isEditLoading || (activeStep == UasEditStepsEnum.REVIEW && steps.length == 2)}
              startIcon={isEditLoading && <CircularProgress size={4} />}
              data-testid="multi-edit-next"
            >
              {activeStep !== UasEditStepsEnum.REVIEW ? 'Next' : 'Save'}
            </Button>
          </Stack>
        </Stack>
        {/* Error Snackbar */}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Modal>
  );
};

export default UasMultiEdit;
