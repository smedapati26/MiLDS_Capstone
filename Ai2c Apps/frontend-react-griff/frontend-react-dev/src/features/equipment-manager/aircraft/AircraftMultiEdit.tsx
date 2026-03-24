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
import { LaunchStatusEnum } from '@models/LaunchStatusEnum';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import {
  IAircraftEditIn,
  IAircraftEquipmentDetailsInfo,
  mapToAircraftEditInDto,
} from '@store/griffin_api/aircraft/models';
import { useEditAircraftEquipmentDetailsMutation } from '@store/griffin_api/aircraft/slices';
import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

import AddRemarksStep from './AircraftEditSteps/AddRemarks';
import EditAircraftStatusStep from './AircraftEditSteps/EditAircraftStatus';
import EditLocationStep from './AircraftEditSteps/EditLocation';
import ReviewChangesStep from './AircraftEditSteps/ReviewChanges';
import SelectFieldsStep, { AircraftEditStepsEnum } from './AircraftEditSteps/SelectFields';

interface Props<T> extends PmxSectionedTableProps<T> {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdatedRows: React.Dispatch<React.SetStateAction<string[]>>;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Multi edit of an aircraft equipment.
 * @returns React.Node
 */

const AircraftMultiEdit = (props: Props<IAircraftEquipmentDetailsInfo>): React.ReactNode => {
  const { columns, data, keyTitleMapping, open, setOpen, setUpdatedRows, setShowSnackbar } = props;
  const [theme] = usePmxMuiTheme();

  // Data Editing State Declared Variables
  const [editAircraftEquipmentDetails, { isLoading: isEditLoading }] = useEditAircraftEquipmentDetailsMutation();

  const [launchStatus, setLaunchStatus] = useState<LaunchStatusEnum>(LaunchStatusEnum.RTL);
  const [ORStatus, setORStatus] = useState<OperationalReadinessStatusEnum>(OperationalReadinessStatusEnum.FMC);
  const [location, setLocation] = useState<IAutoDsrLocation | null>(null);
  const [remarks, setRemarks] = useState<string>('');
  const [autoSync, setAutoSync] = useState<{ [sync: string]: boolean }>({
    rtl: true,
    status: true,
    location: true,
  });

  // Stepper State Declared Variables
  const [steps, setSteps] = useState([AircraftEditStepsEnum.SELECT, AircraftEditStepsEnum.REVIEW]);
  const [activeStep, setActiveStep] = useState<AircraftEditStepsEnum>(AircraftEditStepsEnum.SELECT);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(steps.length).fill(false));

  /* Use Effect for updating stepper status */
  useEffect(() => {
    setCompletedSteps(Array(steps.length).fill(false));
  }, [steps.length]);

  /* Close modal and reset data */
  const handleClose = () => {
    setLaunchStatus(LaunchStatusEnum.RTL);
    setORStatus(OperationalReadinessStatusEnum.FMC);
    setLocation(null);
    setRemarks('');
    setAutoSync({
      launchStatus: true,
      ORStatus: true,
      location: true,
    });

    setSteps([AircraftEditStepsEnum.SELECT, AircraftEditStepsEnum.REVIEW]);
    setActiveStep(AircraftEditStepsEnum.SELECT);
    setCompletedSteps(Array(steps.length).fill(false));
    setOpen(false);
  };

  /* Navigate to a specific step */
  const handleStepClick = (step: number, label: string) => {
    if (completedSteps[step] || completedSteps[step - 1]) {
      setActiveStep(label as AircraftEditStepsEnum);
    }
  };

  /* Navigate to next step or save changes */
  const handleNextOrSave = async () => {
    if (activeStep === AircraftEditStepsEnum.REVIEW) {
      try {
        const editData: IAircraftEditIn[] = Object.values(data).flatMap((rows) =>
          rows.map((aircraft) => {
            const updatedAircraft: IAircraftEditIn = {
              serial: aircraft.serial,
              fieldSyncStatus: {},
            };

            if (steps.includes(AircraftEditStepsEnum.STATUS)) {
              updatedAircraft.rtl = launchStatus;
              updatedAircraft.status = ORStatus;
              updatedAircraft.fieldSyncStatus = {
                ...updatedAircraft.fieldSyncStatus,
                rtl: autoSync.rtl,
                status: autoSync.status,
              };
            }

            if (steps.includes(AircraftEditStepsEnum.LOCATION)) {
              updatedAircraft.locationId = location?.id;
              updatedAircraft.fieldSyncStatus = {
                ...updatedAircraft.fieldSyncStatus,
                location: autoSync.location,
              };
            }

            if (steps.includes(AircraftEditStepsEnum.REMARKS)) {
              updatedAircraft.remarks = remarks;
            }

            return updatedAircraft;
          }),
        );

        const response = await editAircraftEquipmentDetails(editData.map(mapToAircraftEditInDto)).unwrap();

        if (response) {
          handleClose();
          setShowSnackbar(true);
          setUpdatedRows(response.editedAircraft as string[]);
        }
      } catch (error) {
        console.error('Error editing aircraft equipment details:', error);
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
      case AircraftEditStepsEnum.SELECT:
        return <SelectFieldsStep steps={steps} setSteps={setSteps} />;
      case AircraftEditStepsEnum.STATUS:
        return (
          <EditAircraftStatusStep
            launchStatus={launchStatus}
            setLaunchStatus={setLaunchStatus}
            ORStatus={ORStatus}
            setORStatus={setORStatus}
            autoSync={autoSync}
            setAutoSync={setAutoSync}
          />
        );
      case AircraftEditStepsEnum.LOCATION:
        return (
          <EditLocationStep
            location={location}
            setLocation={setLocation}
            autoSync={autoSync}
            setAutoSync={setAutoSync}
          />
        );
      case AircraftEditStepsEnum.REMARKS:
        return <AddRemarksStep remarks={remarks} setRemarks={setRemarks} />;
      case AircraftEditStepsEnum.REVIEW:
        return (
          <ReviewChangesStep
            keyTitleMapping={keyTitleMapping}
            columns={columns}
            data={data}
            launchStatus={steps.includes(AircraftEditStepsEnum.STATUS) ? launchStatus : undefined}
            ORStatus={steps.includes(AircraftEditStepsEnum.STATUS) ? ORStatus : undefined}
            remarks={steps.includes(AircraftEditStepsEnum.REMARKS) ? remarks : undefined}
            location={steps.includes(AircraftEditStepsEnum.LOCATION) && location ? location : undefined}
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
            <Typography variant="body2">Edit Aircraft</Typography>
            <Button onClick={handleClose} sx={{ color: theme.palette.text.primary }}>
              <CloseIcon fontSize="small" data-testid="close-aircraft-multi-edit" />
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
              disabled={isEditLoading || (activeStep == AircraftEditStepsEnum.REVIEW && steps.length == 2)}
              startIcon={isEditLoading && <CircularProgress size={4} />}
              data-testid="multi-edit-next"
            >
              {activeStep !== AircraftEditStepsEnum.REVIEW ? 'Next' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default AircraftMultiEdit;
