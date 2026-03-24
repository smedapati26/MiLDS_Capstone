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
} from '@mui/material';

import { usePmxMuiTheme } from '@ai2c/pmx-mui';

import PmxSectionedTable, { PmxSectionedTableProps } from '@components/data-tables/PmxSectionedTable';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAGSE, IAGSEEditIn, mapToAGSEEditInDto } from '@store/griffin_api/agse/models';
import { useEditAGSEMutation } from '@store/griffin_api/agse/slices';
import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

import AddRemarksStep from './AGSEEditSteps/AddRemarks';
import EditLocationStep from './AGSEEditSteps/EditLocation';
import EditStatusStep from './AGSEEditSteps/EditStatus';
import ReviewChangesStep from './AGSEEditSteps/ReviewChanges';
import SelectFieldsStep, { AGSEEditStepsEnum } from './AGSEEditSteps/SelectFields';

interface Props<T> extends PmxSectionedTableProps<T> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdatedRows: React.Dispatch<React.SetStateAction<string[]>>;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Multi edit of AGSE.
 * @returns React.Node
 */

const AGSEMultiEdit = (props: Props<IAGSE>): React.ReactNode => {
  const { columns, data, keyTitleMapping, open, setOpen, setUpdatedRows, setShowSnackbar } = props;
  const [theme] = usePmxMuiTheme();

  // Data Editing State Declared Variables
  const [editAGSE, { isLoading: isEditLoading }] = useEditAGSEMutation();

  const [ORStatus, setORStatus] = useState<OperationalReadinessStatusEnum>(OperationalReadinessStatusEnum.FMC);
  const [location, setLocation] = useState<IAutoDsrLocation | null>(null);
  const [remarks, setRemarks] = useState<string>('');
  const [autoSync, setAutoSync] = useState<{ [sync: string]: boolean }>({
    status: true,
    location: true,
  });

  // Stepper State Declared Variables
  const [steps, setSteps] = useState([AGSEEditStepsEnum.SELECT, AGSEEditStepsEnum.REVIEW]);
  const [activeStep, setActiveStep] = useState<AGSEEditStepsEnum>(AGSEEditStepsEnum.SELECT);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(steps.length).fill(false));

  /* Use Effect for updating stepper status */
  useEffect(() => {
    setCompletedSteps(Array(steps.length).fill(false));
  }, [steps.length]);

  /* Close modal and reset data */
  const handleClose = () => {
    setORStatus(OperationalReadinessStatusEnum.FMC);
    setLocation(null);
    setRemarks('');
    setAutoSync({
      launchStatus: true,
      ORStatus: true,
      location: true,
    });

    setSteps([AGSEEditStepsEnum.SELECT, AGSEEditStepsEnum.REVIEW]);
    setActiveStep(AGSEEditStepsEnum.SELECT);
    setCompletedSteps(Array(steps.length).fill(false));
    setOpen(false);
  };

  /* Navigate to a specific step */
  const handleStepClick = (step: number, label: string) => {
    if (completedSteps[step] || completedSteps[step - 1]) {
      setActiveStep(label as AGSEEditStepsEnum);
    }
  };

  /* Navigate to next step or save changes */
  const handleNextOrSave = async () => {
    if (activeStep === AGSEEditStepsEnum.REVIEW) {
      try {
        const editData: IAGSEEditIn[] = Object.values(data).flatMap((rows) =>
          rows.map((agse) => {
            const updatedAGSE: IAGSEEditIn = {
              equipmentNumber: agse.equipmentNumber,
              fieldSyncStatus: {},
            };

            if (steps.includes(AGSEEditStepsEnum.STATUS)) {
              updatedAGSE.condition = ORStatus;
              updatedAGSE.fieldSyncStatus = {
                ...updatedAGSE.fieldSyncStatus,
                status: autoSync.status,
              };
            }

            if (steps.includes(AGSEEditStepsEnum.LOCATION)) {
              updatedAGSE.locationId = location?.id;
              updatedAGSE.fieldSyncStatus = {
                ...updatedAGSE.fieldSyncStatus,
                location: autoSync.location,
              };
            }

            if (steps.includes(AGSEEditStepsEnum.REMARKS)) {
              updatedAGSE.remarks = remarks;
            }

            return updatedAGSE;
          }),
        );

        const response = await editAGSE(editData.map(mapToAGSEEditInDto)).unwrap();

        if (response) {
          handleClose();
          setShowSnackbar(true);
          setUpdatedRows(response.editedAGSE as string[]);
        }
      } catch (error) {
        console.error('Error editing AGSE equipment details:', error);
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
      case AGSEEditStepsEnum.SELECT:
        return <SelectFieldsStep steps={steps} setSteps={setSteps} />;
      case AGSEEditStepsEnum.STATUS:
        return (
          <EditStatusStep ORStatus={ORStatus} setORStatus={setORStatus} autoSync={autoSync} setAutoSync={setAutoSync} />
        );
      case AGSEEditStepsEnum.LOCATION:
        return (
          <EditLocationStep
            location={location}
            setLocation={setLocation}
            autoSync={autoSync}
            setAutoSync={setAutoSync}
          />
        );
      case AGSEEditStepsEnum.REMARKS:
        return <AddRemarksStep remarks={remarks} setRemarks={setRemarks} />;
      case AGSEEditStepsEnum.REVIEW:
        return (
          <ReviewChangesStep
            keyTitleMapping={keyTitleMapping}
            columns={columns}
            data={data}
            ORStatus={steps.includes(AGSEEditStepsEnum.STATUS) ? ORStatus : undefined}
            remarks={steps.includes(AGSEEditStepsEnum.REMARKS) ? remarks : undefined}
            location={steps.includes(AGSEEditStepsEnum.LOCATION) && location ? location : undefined}
          />
        );
      default:
        return <Typography>Invalid Stepper Index: {activeStep}.</Typography>;
    }
  };

  /* Multi Aircraft Edit Modal UI Component */
  return (
    <Modal open={open} onClose={handleClose} data-testid="agse-multi-edit">
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
            <Typography variant="body2">Edit AGSE</Typography>
            <Button onClick={handleClose} sx={{ color: theme.palette.text.primary }}>
              <CloseIcon fontSize="small" data-testid="close-multi-edit" />
            </Button>
          </Stack>
          <Card
            sx={{
              height: '35vh',
              overflow: 'scroll',
              p: 4,
              '&:hover': {
                border: 'none',
              },
            }}
          >
            <PmxSectionedTable keyTitleMapping={keyTitleMapping} columns={columns} data={data} />
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
              disabled={isEditLoading || (activeStep == AGSEEditStepsEnum.REVIEW && steps.length == 2)}
              startIcon={isEditLoading && <CircularProgress size={4} />}
              data-testid="multi-edit-next"
            >
              {activeStep !== AGSEEditStepsEnum.REVIEW ? 'Next' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default AGSEMultiEdit;
