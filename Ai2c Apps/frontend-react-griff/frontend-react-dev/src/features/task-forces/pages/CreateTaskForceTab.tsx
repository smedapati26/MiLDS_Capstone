import React from 'react';
import { useNavigate } from 'react-router-dom';

import { MultiStepFormStep, RHFMultiStepFormProvider } from '@components/react-hook-form';

import { useCreateTaskforceMutation } from '@store/griffin_api/taskforce/slices';
import { useSnackbar } from '@store/providers/SnackbarProvider';

// Import step components
import {
  createTaskForceDefaultValues,
  createTaskForceSchema,
  CreateTaskForceSchemaType,
  step1Schema,
  Step1TaskForceDetails,
  Step2CreateSubordinates,
  Step3AddAircraft,
  Step4AddUAS,
  Step5AddAGSE,
  StepReview,
} from '../components/create-stepper';
import { step2Schema } from '../components/create-stepper/step 2/schema';
import { step3Schema } from '../components/create-stepper/step 3/schema';
import { step4Schema } from '../components/create-stepper/step 4/schema';
import { step5Schema } from '../components/create-stepper/step 5/schema';
import { getFormData } from '../utils/getFormData';

// Define the steps for the stepper
const steps: Array<MultiStepFormStep> = [
  { title: 'Task Force Details', component: <Step1TaskForceDetails />, schema: step1Schema },
  { title: 'Create Subordinates', component: <Step2CreateSubordinates />, schema: step2Schema },
  { title: 'Add Aircraft', component: <Step3AddAircraft />, schema: step3Schema },
  { title: 'Add UAS', component: <Step4AddUAS />, schema: step4Schema },
  { title: 'Add AGSE', component: <Step5AddAGSE />, schema: step5Schema },
  { title: 'Review', component: <StepReview />, schema: createTaskForceSchema }, // Combined Schema
];

/**
 * CreateTaskForceTab component renders a multi-step form for creating a task force.
 * It uses Material-UI Stepper for navigation and React Hook Form with Zod validation.
 */
const CreateTaskForceTab: React.FC = () => {
  // Session Storage name
  const LOCAL_STORAGE_CREATE_TASKFORCE = 'create-taskforce-form';

  // Hooks
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // API Calls
  const [createTaskforce] = useCreateTaskforceMutation();

  // Handle on Submit
  const handleOnSubmit = async (formValues: CreateTaskForceSchemaType) => {
    // FormData for multipart form
    const formData = getFormData(formValues);
    const errorMessage = 'Error creating your taskforce!';

    try {
      const response = await createTaskforce(formData);
      if (!response || response.error) {
        const error = response.error as { data?: { detail: string }; status: number };
        if (error.data) {
          showSnackbar(error.data.detail || errorMessage, 'error');
        } else {
          showSnackbar(errorMessage, 'error');
        }
      } else {
        showSnackbar(`${formValues.name} created`);
        navigate('/task-forces/list');
      }
    } catch (error) {
      showSnackbar(errorMessage, 'error');
    }
  };

  return (
    <RHFMultiStepFormProvider
      name={LOCAL_STORAGE_CREATE_TASKFORCE}
      steps={steps}
      schema={createTaskForceSchema}
      defaultValues={createTaskForceDefaultValues}
      onSubmit={handleOnSubmit}
      submitButtonText="Save Task Force"
      resetHeading="Reset Task Force Creator"
    />
  );
};

export default CreateTaskForceTab;
