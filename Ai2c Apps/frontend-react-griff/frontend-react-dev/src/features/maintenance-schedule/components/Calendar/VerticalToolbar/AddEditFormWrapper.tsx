import React, { useEffect, useState } from 'react';

import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { Heading } from '@ai2c/pmx-mui';

import AddEditLaneForm from '@features/maintenance-schedule/components/Calendar/AddEditLaneForm/AddEditLaneForm';
import AddEditMaintenanceForm from '@features/maintenance-schedule/components/Calendar/AddEditMaintenance/AddEditMaintenanceForm';
import { resetMaintenanceLaneSlice, selectActiveLane } from '@features/maintenance-schedule/slices';
import { resetEditEvent } from '@features/maintenance-schedule/slices/maintenanceEditEventSlice';
import { resetPhaseTeam } from '@features/maintenance-schedule/slices/phaseTeamSlice';

import { useAppDispatch, useAppSelector } from '@store/hooks';

/* Represents Add/Edit type of forms to display */
type AddEditType = 'maint' | 'lane';

/** Props for the AddEditFormWrapper component. */
type AddEditFormWrapperProps = {
  type: 'add' | 'edit'; // determines whether you're adding or editing
  defaultFormType?: AddEditType;
  onCancel: () => void;
  onSubmit: () => void;
};

/** Component for adding or editing maintenance schedule. */
const AddEditFormWrapper = ({
  type,
  defaultFormType = 'lane',
  onCancel,
  onSubmit,
}: AddEditFormWrapperProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [formType, setFormType] = useState<AddEditType>(defaultFormType ?? 'maint');
  const activeLane = useAppSelector(selectActiveLane);

  // Reset edit state when switching into "add" mode
  useEffect(() => {
    if (type === 'add') {
      dispatch(resetEditEvent());
      dispatch(resetPhaseTeam());
      dispatch(resetMaintenanceLaneSlice());
    }
  }, [type, dispatch]);

  useEffect(() => {
    if (defaultFormType) {
      setFormType(defaultFormType);
    }
  }, [defaultFormType]);

  const handleTypeOnChange = (_event: React.MouseEvent<HTMLElement>, newType: AddEditType) => {
    if (newType !== null) {
      dispatch(resetMaintenanceLaneSlice());
      setFormType(newType);
    }
  };

  const getFormTitle = () => {
    const action = type === 'edit' ? 'Edit' : 'Add';
    if (formType === 'maint') return `${action} Maintenance`;
    if (formType === 'lane') return `${action} Lane`;
    return action;
  };

  const renderAddEditForm = () => {
    switch (formType) {
      case 'maint':
        return (
          <AddEditMaintenanceForm
            buttonLabel={type === 'edit' ? 'Update' : 'Add'}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        );
      case 'lane':
        return <AddEditLaneForm onCancel={onCancel} onSubmit={onSubmit} lane={activeLane} />;
    }
  };

  const htmlIdPrefix = `${type}-form`;

  return (
    <Box data-testid="maintenance-add-edit-form-wrapper-content">
      <Stack id={htmlIdPrefix} gap={4}>
        <Box>
          <Heading variant="h6">{getFormTitle()}</Heading>
          <ToggleButtonGroup
            id={`${htmlIdPrefix}-type-button-group`}
            exclusive
            size="small"
            value={formType}
            onChange={handleTypeOnChange}
            aria-label="schedule item form type"
            sx={{ '& .MuiToggleButton-root': { px: '23px' } }}
          >
            <ToggleButton
              id={`${htmlIdPrefix}-type-button-group-maintenance-button`}
              value="maint"
              aria-label="Maintenance"
            >
              MAINT.
            </ToggleButton>
            <ToggleButton id={`${htmlIdPrefix}-type-button-group-lane-button`} value="lane" aria-label="Lane">
              LANE
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>

      <Stack flexGrow={1} sx={{ mt: 3 }}>
        {renderAddEditForm()}
      </Stack>
    </Box>
  );
};

export default AddEditFormWrapper;
