import React, { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@mui/material';

import { Step1TaskForceDetails, Step2CreateSubordinates } from '@features/task-forces/components/create-stepper';
import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';

import { ClearSubordinatesDialog } from './ClearSubordinatesDialog';

export const TaskforceEditUnitsForm: React.FC = () => {
  const { getValues, setValue, reset, control } = useFormContext();
  const [clearSubordinatesOpen, setClearSubordinatesOpen] = useState<boolean>(false);
  const watchedSubordinates = useWatch({
    control,
    name: 'subordinates',
  });
  const showCreateSubGroup: boolean = useMemo(() => {
    return watchedSubordinates.length == 0;
  }, [watchedSubordinates.length]);

  const handleClose = () => {
    setClearSubordinatesOpen(false);
  };

  // Clear name detail fields for subordinates
  const handleClearSubordinateFields = () => {
    const currentFormValues = getValues();
    const clearedSubordinates = currentFormValues.subordinates.map((sub: SubordinateSchemaType) => {
      return {
        // Do not clear hierarchal structure or equipment data
        ...sub,
        echelon: '',
        name: '',
        ownerId: null,
        shortname: '',
        nickname: '',
      };
    });

    reset({
      ...currentFormValues,
      subordinates: clearedSubordinates,
    });
    handleClose();
  };

  // Clear all subordinates for the taskfroce
  const handleClearAll = () => {
    setValue('subordinates', []);
    handleClose();
  };

  return (
    <>
      <Step1TaskForceDetails includeCreatePrompts={false} />
      <Button
        variant="text"
        onClick={() => setClearSubordinatesOpen(true)}
        data-testid={'clear-subordinates-btn'}
        sx={{ alignSelf: 'start' }}
      >
        Clear Subordinate Groups
      </Button>
      <Step2CreateSubordinates
        includeCreatePrompts={false}
        showCreateSubGroup={showCreateSubGroup}
        confirmDelete={true}
      />
      <ClearSubordinatesDialog
        open={clearSubordinatesOpen}
        handleClose={handleClose}
        handleClearAll={handleClearAll}
        handleClearFields={handleClearSubordinateFields}
      />
    </>
  );
};
