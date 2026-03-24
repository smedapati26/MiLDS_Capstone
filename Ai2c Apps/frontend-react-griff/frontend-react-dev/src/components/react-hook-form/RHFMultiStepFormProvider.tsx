/**
 * React Hook Form - Multi-Step form
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import z, { ZodType } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, Modal, Paper, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';

import useFormPersist from '@hooks/useFormPersist';

// Helper function to check if a field is required
export const isFieldRequired = (schema: z.ZodObject<any>, fieldName: string): boolean => {
  const fieldSchema = schema.shape[fieldName];
  return fieldSchema && !fieldSchema.isOptional(); // Zod's isOptional() checks for .optional()
};

// Multi-Step Form Type
export type MultiStepFormStep = {
  title: string; // Step Title
  component: ReactNode; // Component to render (Mini Form)
  schema?: ZodType<unknown>; // Step schema
};

/** Props */
export type Props = {
  name: string; // Name used for session storage
  steps: Array<MultiStepFormStep>; // Steps
  schema: ZodType<any>; // Combined Multi step form schema
  defaultValues: any; // Default form values
  onSubmit?: (formValues: any) => void;
  submitButtonText?: string;
  resetHeading?: React.ReactNode;
  resetContent?: React.ReactNode;
};

/**
 * RHFMultiStepFormProvider Functional Component
 * @param { Props } props
 */
export const RHFMultiStepFormProvider: React.FC<Props> = (props) => {
  const { name, steps, schema, defaultValues, onSubmit, submitButtonText, resetHeading, resetContent } = props;
  // State to track the currently active step
  const [activeStep, setActiveStep] = useState(0);
  // Validation schema
  const [validationSchema, setValidationSchema] = useState(schema);
  const [_defaultValues, setDefaultValues] = useState(defaultValues);
  // Reset modal
  const [open, setOpen] = React.useState(false);

  type SchemaType = z.infer<typeof schema>;

  // React Hook Form setup with Zod validation
  const methods = useForm<SchemaType>({
    mode: 'all', // Validation Mode All = On Blur, On Change, On Submit
    resolver: zodResolver(validationSchema), // Zod resolver for validations
    defaultValues: _defaultValues, // Default values
  });

  // Destructure necessary methods from useForm
  const {
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    formState: { isValid },
  } = methods;

  // Hook to set persist data
  const { clear } = useFormPersist(name, { watch, setValue, defaultValues });

  // Getting persisted data on page changes
  useEffect(() => {
    const persistedFormData = localStorage.getItem(name);
    if (persistedFormData) {
      const parsedData = JSON.parse(persistedFormData as string);
      setDefaultValues({ ...defaultValues, ...parsedData }); // Merged data
    }
  }, [defaultValues, name]);

  // Update validation schema when active step changes
  useEffect(() => {
    if (steps[activeStep].schema) {
      setValidationSchema(steps[activeStep].schema);
    }
  }, [activeStep, steps]);

  // Handler to go back to the previous step
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Handler to proceed to the next step, with validation for the current step
  const handleNext = async () => {
    const isValid = await trigger(); // Triggers validation schema
    // Validate the current step before proceeding
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    clear(); // Clear persisted form data
    reset({ ...defaultValues }); // Clear form data
  };

  const handleRestart = () => {
    setActiveStep(0);
    handleReset();
    setOpen(false);
  };

  const handleOnSubmit = (formValues: SchemaType) => {
    if (onSubmit) {
      handleReset();
      onSubmit(formValues);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Stack direction="column" gap={5}>
          {/* Stepper Indicator showing the progress through the steps */}
          <Stepper activeStep={activeStep} alternativeLabel>
            {/* Destructure title from step */}
            {steps.map(({ title }) => (
              <Step key={title}>
                <StepLabel>{title}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Render all step components, but show only the current one */}
          <Box>{steps[activeStep].component}</Box>

          {/* Navigation Buttons for moving between steps */}
          <Box display="flex" justifyContent="space-between" gap={3}>
            {activeStep === 0 ? (
              <Button type="button" onClick={handleReset} variant="outlined">
                Reset
              </Button>
            ) : (
              <Button type="button" onClick={() => setOpen(true)} variant="outlined" color="error">
                Restart
              </Button>
            )}

            <Stack direction="row" gap={3} justifySelf="flex-end">
              {activeStep > 0 && (
                <Button type="button" onClick={handleBack} variant="outlined">
                  Back
                </Button>
              )}

              {activeStep < steps.length - 1 && (
                <Button type="button" onClick={handleNext} disabled={!isValid} variant="contained">
                  Next
                </Button>
              )}

              {activeStep == steps.length - 1 && (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  disabled={!isValid}
                  onClick={handleSubmit(handleOnSubmit)}
                >
                  {submitButtonText || 'Submit'}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </form>

      {/** Restart Confirmation Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="confirm-restart-modal-title"
        aria-describedby="confirm-restart-modal-description"
      >
        <Paper
          data-testid="agse-single-edit-paper"
          sx={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '444px',
            minHeight: '204px',
            px: 3,
            py: 4,
          }}
        >
          <Stack gap={4}>
            <Typography id="confirm-restart-modal-title" variant="body2">
              {resetHeading ? resetHeading : 'Reset Form Values'}
            </Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 5, right: 4 }}>
              <CloseIcon />
            </IconButton>
            {resetContent ? (
              resetContent
            ) : (
              <Box>
                <Typography id="confirm-restart-modal-description" sx={{ mt: 2 }}>
                  Reset will erase all progress and take you to step 1. This action cannot be undone.
                </Typography>
                <Typography id="confirm-restart-modal-description" sx={{ mt: 2 }}>
                  Would you like to proceed?
                </Typography>
              </Box>
            )}
            <Stack direction="row" spacing={3} justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleRestart}>
                Reset
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Modal>
    </FormProvider>
  );
};
