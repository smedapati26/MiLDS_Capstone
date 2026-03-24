import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Autocomplete, MenuItem, Stack, TextField } from '@mui/material';

import { PmxTransferTable } from '@components/data-tables';
import { RHFProgressIndicator } from '@components/react-hook-form';
import { TaskforceLogoHeadingFormWrapper } from '@features/task-forces/components/TaskforceLogoHeading';
import { useTableTransfer } from '@features/task-forces/hooks/useTableTransfer';
import { useTransferTableFilters } from '@features/task-forces/hooks/useTransferTableFilters';

import { useGetUserEquipmentQuery } from '@store/griffin_api/taskforce/slices';

import { SubordinateSchemaType } from '../step 2/schema';
import { LEFT_COLUMNS, RIGHT_COLUMNS } from '../tableColumns';

/**
 * Step 4 - Add UAS
 */
type Props = {
  includeCreatePrompts?: boolean;
};

export const Step4AddUAS: React.FC<Props> = ({ includeCreatePrompts = true }) => {
  // Form State
  const { getValues } = useFormContext();
  const subordinates: SubordinateSchemaType[] = getValues('subordinates');
  const taskforceName: string = getValues('name');

  // Dynamic Form Options
  const subordinateOptions = [taskforceName, ...subordinates.map((subordinate) => subordinate.name)];

  // API: Admin access to Equipment in User Role Units
  const { data, isFetching, isUninitialized } = useGetUserEquipmentQuery(undefined);

  // isLoading for all API calls
  const isLoading = useMemo(() => isFetching || isUninitialized, [isFetching, isUninitialized]);

  // Custom hook that handles transfer of equipment data
  const { tableData, rightData, leftData, handleOnTransfer, selectedSubordinate, setSelectedSubordinate } =
    useTableTransfer(data, 'uas');

  // Custom hook that handles model & unit filtering
  const { unitOptions, setSelectedUnit, modelOptions, setSelectedModel, filteredData } = useTransferTableFilters(
    tableData,
    leftData,
  );

  return (
    <Stack direction="column" gap={3}>
      {/* Logo Header with taskforce details */}
      {includeCreatePrompts && (
        <Stack direction="row" gap={3} justifyContent="space-between" sx={{ pb: 1 }}>
          <TaskforceLogoHeadingFormWrapper />
          <RHFProgressIndicator />
        </Stack>
      )}

      {/* Transfer Tables */}
      <PmxTransferTable
        isLoading={isLoading}
        onChange={handleOnTransfer}
        leftLabel="UAS Catalog"
        leftColumns={LEFT_COLUMNS}
        leftData={filteredData}
        rightLabel="Subordinates UAS"
        rightColumns={RIGHT_COLUMNS}
        rightData={rightData}
        leftToolbar={
          <Stack id="left-toolbar" direction="row" gap={3} sx={{ width: '100%' }}>
            <Autocomplete
              options={modelOptions}
              renderInput={(params) => <TextField {...params} label="Model Filter" />}
              onChange={(_event, value) => setSelectedModel(value)}
              size="small"
              sx={{ width: '100%' }}
            />
            <Autocomplete
              options={unitOptions}
              renderInput={(params) => <TextField {...params} label="Unit Filter" />}
              onChange={(_event, value) => setSelectedUnit(value)}
              size="small"
              sx={{ width: '100%' }}
            />
          </Stack>
        }
        rightToolbar={
          <TextField
            label="Subordinate Unit"
            select
            size="small"
            sx={{ width: '100%' }}
            value={selectedSubordinate}
            onChange={(event) => setSelectedSubordinate(event.target.value)}
          >
            {subordinateOptions.map((option: string) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        }
      />
    </Stack>
  );
};
