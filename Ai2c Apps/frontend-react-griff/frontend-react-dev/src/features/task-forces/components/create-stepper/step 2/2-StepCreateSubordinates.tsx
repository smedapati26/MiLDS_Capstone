import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

import { RHFProgressIndicator } from '@components/react-hook-form';
import { TaskforceLogoHeadingFormWrapper } from '@features/task-forces/components/TaskforceLogoHeading';

import { TOP_LEVEL } from '@store/griffin_api/taskforce/models/ITaskforce';

import { DeleteParentDialog } from './DeleteParentDialog';
import { SubordinateSchemaType } from './schema';
import { SubordinateDynamicForm } from './SubordinateDynamicForm';

/**
 * Step 2 - Create Subordinate Task Force units
 */

type Props = {
  includeCreatePrompts?: boolean;
  showCreateSubGroup?: boolean;
  confirmDelete?: boolean;
};

export const Step2CreateSubordinates: React.FC<Props> = ({
  includeCreatePrompts = true,
  showCreateSubGroup = true,
  confirmDelete = false,
}) => {
  // Form values
  const { control, getValues } = useFormContext();
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [uuidToDelete, setUuidToDelete] = useState<string | undefined>(undefined);

  type SubordinateSchemaFieldType = SubordinateSchemaType & { id: string };

  // useFieldArray for Dynamic forms to quickly Add and Remove form fields with validation
  // @see ./schema.ts for validation config
  const {
    fields: subordinateFields,
    append: appendSubordinate,
    remove: removeSubordinate,
  } = useFieldArray({
    control,
    name: 'subordinates', // Array list for dynamic fields
  });

  // Helper function
  const createNewUnit = (parentId = TOP_LEVEL, level = 0) => ({
    id: '', // For useFieldArray
    uuid: uuid(), // useFieldArray uses id field
    parentId: parentId,
    level: level,
    name: '',
    shortname: '',
    echelon: '',
    ownerId: '',
    nickname: '',
  });

  // Recursive removes the children of deleted parent
  const recursiveRemove = (uuid: string) => {
    const subordinates: SubordinateSchemaType[] = getValues('subordinates');
    const indicesToRemove: number[] = [];

    // A recursive helper to find all descendants' indices
    const findDescendantIndices = (currentUuid: string) => {
      const currentIndex = (subordinateFields as SubordinateSchemaFieldType[]).findIndex(
        (field) => field.uuid === currentUuid,
      );

      if (currentIndex !== -1) {
        indicesToRemove.push(currentIndex);
        const children = subordinates.filter((sub) => sub.parentId === currentUuid);
        children.forEach((child) => findDescendantIndices(child.uuid));
      }
    };

    findDescendantIndices(uuid);
    const sortedIndices = indicesToRemove.sort((a, b) => b - a);
    sortedIndices.forEach((index) => {
      removeSubordinate(index);
    });
  };

  // Checks if subordinate to delete is a parent unit or needs confirmation
  const handleRemoveClick = (subordinateToRemove: SubordinateSchemaType) => {
    const allSubordinates: SubordinateSchemaType[] = getValues('subordinates');
    const hasChildren = allSubordinates.some((sub) => sub.parentId === subordinateToRemove.uuid);

    if (confirmDelete && hasChildren) {
      setUuidToDelete(subordinateToRemove.uuid);
      setConfirmOpen(true);
    } else {
      recursiveRemove(subordinateToRemove.uuid);
    }
  };

  // Used by confirmation deletion dialog to actually delete selected uuid
  const handleConfirmedDeletion = () => {
    if (uuidToDelete) {
      recursiveRemove(uuidToDelete);
    }

    setConfirmOpen(false);
    setUuidToDelete(undefined);
  };

  // Renders subordinate form fields
  const renderSubordinateFormFields = (subordinate: SubordinateSchemaType, fieldArrayIndex: number) => {
    return (
      <SubordinateDynamicForm
        index={fieldArrayIndex}
        onAdd={(_index) => {
          const nestedUnit = createNewUnit(subordinate.uuid, subordinate.level + 1);
          appendSubordinate(nestedUnit);
        }}
        onRemove={() => handleRemoveClick(subordinate)}
      />
    );
  };

  // Recursive rendering for hierarchical structure
  const renderSubordinates = (fields: SubordinateSchemaType[], parentId = TOP_LEVEL, wrapInPaper = true) => {
    const children = fields.filter((subordinate) => subordinate.parentId === parentId);

    return children.map((subordinate) => {
      const leftMargin = subordinate.level === 1 ? 0 : 10; // Setting margin here to limit rerendering
      const globalIndex = subordinateFields.findIndex((field) => field.id === subordinate.id);
      if (globalIndex === -1) return null;

      return (
        <Box key={subordinate.uuid || subordinate.name}>
          {wrapInPaper ? (
            <Paper variant="outlined" sx={{ py: 5, px: 4, mb: 2 }}>
              <Stack direction="column" gap={3} sx={{ marginLeft: leftMargin }}>
                {renderSubordinateFormFields(subordinate as SubordinateSchemaType, globalIndex)}
                {renderSubordinates(fields, subordinate.uuid, false)}
              </Stack>
            </Paper>
          ) : (
            <Stack direction="column" gap={3} sx={{ marginLeft: leftMargin }}>
              {renderSubordinateFormFields(subordinate as SubordinateSchemaType, globalIndex)}
              {renderSubordinates(fields, subordinate.uuid, false)}
            </Stack>
          )}
        </Box>
      );
    });
  };

  return (
    <Stack direction="column" gap={3}>
      {/* Header with logo + TF details */}
      {includeCreatePrompts && (
        <Stack direction="row" gap={3} justifyContent="space-between" sx={{ pb: 1 }}>
          <TaskforceLogoHeadingFormWrapper />
          <RHFProgressIndicator />
        </Stack>
      )}

      {/* Create Subordinate Group button - left aligned under logo/details */}
      {showCreateSubGroup && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => appendSubordinate(createNewUnit(TOP_LEVEL, 1))}
          >
            Create Subordinate Group
          </Button>
        </Box>
      )}

      {subordinateFields.length === 0 ? (
        <Paper variant="outlined" sx={{ py: 4, px: 3 }}>
          {/* Empty state */}
          <Typography variant="body1" color="text.secondary">
            Create one to start building your task force.
          </Typography>
        </Paper>
      ) : (
        <Stack direction="column" gap={2}>
          {/* Recursive rendering of subordinates */}
          {renderSubordinates(subordinateFields as SubordinateSchemaType[])}
        </Stack>
      )}

      {/* Add confirmation modal for deleting parent units */}
      {confirmDelete && (
        <DeleteParentDialog
          open={confirmOpen}
          handleClose={() => setConfirmOpen(false)}
          handleDelete={handleConfirmedDeletion}
        />
      )}
    </Stack>
  );
};
