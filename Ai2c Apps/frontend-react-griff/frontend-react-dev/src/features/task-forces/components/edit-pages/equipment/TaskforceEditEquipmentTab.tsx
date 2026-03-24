import React, { useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Blocker } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Stack } from '@mui/material';

import { PmxToggleButtonGroup } from '@components/inputs';
import UnsavedChangesModal from '@components/UnsavedChangesModal';
import { Step3AddAircraft, Step4AddUAS, Step5AddAGSE } from '@features/task-forces/components/create-stepper';
import { TaskforceLogoHeading } from '@features/task-forces/components/TaskforceLogoHeading';
import { flattenSubordinates } from '@features/task-forces/utils/flattenSubordinates';
import { getEquipmentFormData } from '@features/task-forces/utils/getFormData';
import { useNavigationBlocker } from '@hooks/useNavigationBlocker';

import { ITaskForceDetails } from '@store/griffin_api/taskforce/models/ITaskforce';
import { useUpdateTaskforceEquipmentMutation } from '@store/griffin_api/taskforce/slices';
import { useSnackbar } from '@store/providers/SnackbarProvider';

import { editEquipmentSchema, EditEquipmentSchemaType } from './schema';

type EquipmentTabType = 'AIRCRAFT' | 'UAS' | 'AGSE';

type Props = {
  taskforce: ITaskForceDetails;
  closeEditMode: () => void;
};

export const TaskforceEditEquipmentTab: React.FC<Props> = ({ taskforce, closeEditMode }) => {
  const { showSnackbar } = useSnackbar();
  const [updateTaskforceEquipment] = useUpdateTaskforceEquipmentMutation();

  const [equipmentTab, setEquipmentTab] = useState<EquipmentTabType>('AIRCRAFT');
  const [showUnsavedChanges, setShowUnsavedChanges] = useState<boolean>(false);
  const [pendingBlocker, setPendingBlocker] = useState<Blocker | undefined>(undefined);

  // default taskforce form values
  const taskforceEquipmentForm: EditEquipmentSchemaType = useMemo(() => {
    return {
      uic: taskforce.unit.uic,
      name: taskforce.unit.displayName,
      aircraft: taskforce.aircraft,
      agse: taskforce.agse,
      uas: taskforce.uas,
      subordinates: flattenSubordinates(taskforce.subordinates),
    };
  }, [taskforce]);

  // React Hook Form Methods
  const methods = useForm<EditEquipmentSchemaType>({
    mode: 'all', // Validation Mode All = On Blur, On Change, On Submit
    resolver: zodResolver(editEquipmentSchema), // Zod resolver for validations
    defaultValues: taskforceEquipmentForm, // Default values
  });

  const {
    handleSubmit,
    formState: { isDirty: unsavedChanges },
  } = methods;

  // Navigation blocker for unsaved changes
  const blocker = useNavigationBlocker({
    shouldBlock: unsavedChanges,
    onTrigger: () => {
      setShowUnsavedChanges(true);
      setPendingBlocker(blocker);
    },
  });

  // Navigate back to TF details page
  const handleBackToSummary = () => {
    if (unsavedChanges) {
      setShowUnsavedChanges(true);
    } else {
      closeEditMode();
    }
  };

  // submit form updates and save changes
  const handleSaveChanges = async (formValues: EditEquipmentSchemaType) => {
    const formData = getEquipmentFormData(formValues);
    const errorMessage = 'Error updating your taskforce.';

    try {
      const response = await updateTaskforceEquipment({ uic: taskforce.unit.uic, formData: formData });
      if (!response || response.error) {
        const error = response.error as { data?: { detail: string }; status: number };
        if (error.data) {
          showSnackbar(error.data.detail || errorMessage, 'error');
        } else {
          showSnackbar(errorMessage, 'error');
        }
      } else {
        showSnackbar(`${formValues.name} updated.`);
        closeEditMode();
      }
    } catch (error) {
      showSnackbar(errorMessage, 'error');
    }
    closeEditMode();
  };

  // handle save unsaved changes
  const handleModalSave = useCallback(() => {
    handleSubmit(handleSaveChanges)();
    setShowUnsavedChanges(false);
    if (pendingBlocker && typeof pendingBlocker.proceed === 'function') {
      pendingBlocker.proceed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocker]);

  // handle discard unsaved changes
  const handleModalDiscard = useCallback(() => {
    closeEditMode();
    setShowUnsavedChanges(false);
    if (pendingBlocker && typeof pendingBlocker.proceed === 'function') {
      pendingBlocker.proceed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBlocker]);

  // handle cancel navigation away for unsaved changes
  const handleModalCancel = useCallback(() => {
    setShowUnsavedChanges(false);
    if (pendingBlocker && typeof pendingBlocker.reset === 'function') {
      pendingBlocker.reset();
    }
  }, [pendingBlocker]);

  return (
    <Box>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleSaveChanges)}>
          <Stack direction="column" spacing={2} sx={{ height: '100%' }}>
            <Stack direction="row" spacing={2} justifyContent={'space-between'} alignItems={'end'}>
              <Button variant="text" onClick={handleBackToSummary} data-testid={'back-btn'}>
                <ArrowBackIcon fontSize="small" sx={{ mr: 2 }} />
                Back to {taskforce.unit.displayName} Summary
              </Button>
              <Button variant="contained" type="submit" data-testid={'save-btn'}>
                <SaveIcon fontSize="small" sx={{ mr: 2 }} />
                Save Changes
              </Button>
            </Stack>
            <TaskforceLogoHeading
              owner={taskforce.owner?.rankAndName}
              logoUrl={taskforce.unit.logo ?? null}
              name={taskforce.unit.displayName}
              slogan={taskforce.unit.slogan ?? ''}
              shortName={taskforce.unit.shortName}
              echelon={taskforce.unit.echelon}
              location={taskforce.location}
              startDate={taskforce.startDate}
              endDate={taskforce.endDate}
            />
            <PmxToggleButtonGroup
              value={equipmentTab}
              onChange={(value) => setEquipmentTab(value as EquipmentTabType)}
              options={['AIRCRAFT', 'UAS', 'AGSE']}
            />
            {equipmentTab === 'AIRCRAFT' ? <Step3AddAircraft includeCreatePrompts={false} /> : null}
            {equipmentTab === 'UAS' ? <Step4AddUAS includeCreatePrompts={false} /> : null}
            {equipmentTab === 'AGSE' ? <Step5AddAGSE includeCreatePrompts={false} /> : null}
          </Stack>
          <UnsavedChangesModal
            open={showUnsavedChanges}
            handleSave={handleModalSave}
            handleDiscard={handleModalDiscard}
            handleCancel={handleModalCancel}
          />
        </form>
      </FormProvider>
    </Box>
  );
};
