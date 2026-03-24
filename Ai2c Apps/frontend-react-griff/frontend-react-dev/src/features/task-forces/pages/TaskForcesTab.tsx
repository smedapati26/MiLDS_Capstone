import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';

import { ArchivedTaskforceFilterForm } from '@features/task-forces/components/archived-filter/ArchivedTaskforceFilterForm';
import {
  taskForceFilterDefaultValues,
  TaskForceFilterSchema,
  TaskForceFilterSchemaType,
} from '@features/task-forces/components/archived-filter/schema';
import { getNestedField, isSameOrAfter, isSameOrBefore } from '@features/task-forces/components/archived-filter/utils';
import { TaskforceLogoHeading } from '@features/task-forces/components/TaskforceLogoHeading';
import { IOptionType } from '@models/IOptions';

import { ITaskForceSimple } from '@store/griffin_api/taskforce/models/ITaskforce';
import { useDeleteTaskforceMutation, useGetTaskforcesQuery } from '@store/griffin_api/taskforce/slices';

type Props = {
  archived: boolean;
};

const TaskForcesTab: React.FC<Props> = ({ archived }) => {
  const { data: taskforceData } = useGetTaskforcesQuery({ archived });
  const [deleteTaskforce] = useDeleteTaskforceMutation();

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [selectedTaskforce, setSelectedTaskforce] = useState<ITaskForceSimple | undefined>();
  const [filters, setFilters] = useState<TaskForceFilterSchemaType>(taskForceFilterDefaultValues);
  const [searchQuery, setSearchQuery] = useState<IOptionType<string> | undefined>(undefined);

  const handleDeleteClick = (taskforce: ITaskForceSimple) => {
    setSelectedTaskforce(taskforce);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (selectedTaskforce) {
        await deleteTaskforce(selectedTaskforce.unit.uic);
      }
    } catch (error) {
      console.error('Error deleting taskforce.', error);
    }

    handleCancel();
  };

  const handleCancel = () => {
    setSelectedTaskforce(undefined);
    setConfirmOpen(false);
  };

  // React Hook Form Methods
  const methods = useForm<TaskForceFilterSchemaType>({
    mode: 'all', // Validation Mode All = On Blur, On Change, On Submit
    resolver: zodResolver(TaskForceFilterSchema), // Zod resolver for validations
    defaultValues: taskForceFilterDefaultValues, // Default values
  });

  const filteredData = useMemo(() => {
    if (!taskforceData) return [];
    if (!archived) return taskforceData;

    const SEARCHABLE_FIELDS = ['unit.uic', 'unit.displayName', 'unit.shortName', 'owner.rankAndName'];

    // Apply date and location filters first
    let preFilteredData = taskforceData.filter((taskforce) => {
      const matchesLocation = filters.location?.code ? taskforce.location?.code === filters.location?.code : true;
      const afterStartDate = filters.tfDateRange?.startDate
        ? isSameOrAfter(taskforce.startDate, filters.tfDateRange?.startDate)
        : true;
      const beforeEndDate = filters.tfDateRange?.endDate
        ? isSameOrBefore(taskforce.endDate, filters.tfDateRange?.endDate)
        : true;
      return matchesLocation && afterStartDate && beforeEndDate;
    });

    // Apply search text filter if it exists
    if (searchQuery) {
      // Get just the string values from the selected options
      const searchQueryValue = searchQuery.value.toLowerCase();

      preFilteredData = preFilteredData.filter((taskforce) => {
        // Check if ANY of the item's searchable fields match ANY of the selected options.
        return SEARCHABLE_FIELDS.some((path) => {
          const value = getNestedField(taskforce, path);

          if (value !== null && value !== undefined) {
            return String(value).toLowerCase().includes(searchQueryValue);
          }

          return false;
        });
      });
    }

    return preFilteredData;
  }, [archived, taskforceData, filters, searchQuery]);

  return (
    <Box>
      {archived && (
        <FormProvider {...methods}>
          <ArchivedTaskforceFilterForm
            data={taskforceData ?? []}
            onFilterChange={(newFilters: TaskForceFilterSchemaType) => setFilters(newFilters)}
            onSearchChange={(newSearchQuery: IOptionType<string>) => setSearchQuery(newSearchQuery)}
          />
        </FormProvider>
      )}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {filteredData?.map((taskforce) => (
          <Card
            sx={{
              flex: '0 1 calc(50% - 16px)',
              boxSizing: 'border-box',
            }}
            key={taskforce.unit.uic}
          >
            <CardContent sx={{ height: '100%' }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ height: '100%' }}>
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
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <Box sx={{ textAlign: 'right' }}>
                    {!archived && (
                      <IconButton
                        onClick={() => handleDeleteClick(taskforce)}
                        data-testid={`delete-btn-${taskforce.unit.uic}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Link to={`${taskforce.unit.uic}`}>
                    <Button variant="outlined" onClick={() => {}} data-testid={`view-btn-${taskforce.unit.uic}`}>
                      <ArrowForwardIcon fontSize="small" sx={{ mr: 2 }} /> View
                    </Button>
                  </Link>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Dialog
          open={confirmOpen}
          onClose={handleCancel}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <DialogTitle id="confirm-dialog-title">Delete Task Force</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              Deleting this task force will remove all data associated with it. This cannot be undone.
            </DialogContentText>
            <DialogContentText id="confirm-dialog-confirmation-text" sx={{ mt: 4 }}>
              Are you sure you want to delete?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} variant="outlined" data-testid="cancel-btn">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained" data-testid="confirm-delete-btn">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default TaskForcesTab;
