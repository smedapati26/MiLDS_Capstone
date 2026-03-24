import { useRef, useState } from 'react';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';

import { IDa7817s, useUploadXMLFileMutation } from '@store/amap_ai/events';
import { useAppSelector } from '@store/hooks';

import AddEditEventForm from './AddEditEventForm';
import XMLFileUpload from './XMLFileUpload';

interface IXMLData extends IDa7817s {
  uic: string;
  eventRemarks: string;
  eventDate: string;
}
/**
 * A dialog with a stepper to upload XML documents step-by-step.
 *
 * @param {boolean} open - Controls whether the dialog is visible
 * @param {() => void} handleClose - Function to close the dialog
 * @returns {React.JSX.Element}
 */
const XMLUploadDialog = ({ open, handleClose }: { open: boolean; handleClose: () => void }) => {
  const { appUser } = useAppSelector((state) => state.appSettings);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadXMLFile, { isLoading }] = useUploadXMLFileMutation();
  const [events, setEvents] = useState<IDa7817s[] | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formRef = useRef<{ submitForm: () => void }>(null);

  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Select File',
      content: <XMLFileUpload attachedFile={attachedFile} setAttachedFile={setAttachedFile} />,
    },
    {
      label: 'Verify',
      content: (
        <AddEditEventForm
          ref={formRef}
          events={events}
          handleClose={handleClose}
          formSubmitted={() => {
            setAttachedFile(null);
            setEvents(undefined);
            handleClose();
          }}
          isInitialUpload
          isXMLUpload
          setIsSubmitting={setIsSubmitting}
        />
      ),
    },
  ];

  const handleNext = () => {
    if (activeStep === 0 && attachedFile) {
      uploadXMLFile({ soldier_id: appUser?.userId ?? '', file: attachedFile }).then((res) => {
        if (res.data?.soldierRecords) {
          const records = res.data.soldierRecords as IXMLData[];
          const transformedData = records.map(({ eventDate, eventRemarks, ...rest }) => ({
            ...rest,
            date: eventDate,
            comment: eventRemarks,
          }));

          setEvents(transformedData);
          setActiveStep((prev) => prev + 1);
        }
      });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  return (
    <Dialog
      onClose={() => {
        setAttachedFile(null);
        setEvents(undefined);
        handleClose();
      }}
      open={open}
      aria-label="XML Upload Dialog"
      maxWidth={activeStep === 0 ? 'sm' : 'lg'}
      fullWidth
    >
      <DialogTitle>XML File Upload</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>{steps[activeStep].content}</Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="space-between" mt={3}>
          {activeStep === steps.length - 1 ? (
            <>
              <Button variant="outlined" onClick={handleClose} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => formRef.current?.submitForm()}
                disabled={!attachedFile}
                startIcon={
                  isSubmitting && (
                    <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                  )
                }
              >
                Upload
              </Button>
            </>
          ) : (
            <Box>
              <Button
                variant="outlined"
                onClick={() => {
                  setAttachedFile(null);
                  setEvents(undefined);
                  handleClose();
                }}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!attachedFile}
                startIcon={
                  isLoading && (
                    <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                  )
                }
              >
                Next
              </Button>
            </Box>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default XMLUploadDialog;
