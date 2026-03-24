import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Stack } from '@mui/material';

import { PmxCollapsibleTreeTable } from '@components/data-tables/PmxCollapsibleTreeTable';
import { RHFProgressIndicator } from '@components/react-hook-form';
import { TaskforceLogoHeadingFormWrapper } from '@features/task-forces/components/TaskforceLogoHeading';
import { useOwnerOptions } from '@features/task-forces/hooks/useOwnerOptions';

import { TOP_LEVEL } from '@store/griffin_api/taskforce/models/ITaskforce';

import { EXPANDABLE_SUBORDINATE_COLUMNS as TABLE_COLUMNS, IExtSubordinate } from '../tableColumns';

/**
 * Step 6 - Review Taskforce step
 */
export const StepReview: React.FC = () => {
  // React Hook Form
  const { getValues } = useFormContext();
  const ownerId: string = getValues('ownerId');
  const subordinates: IExtSubordinate[] = getValues('subordinates');

  // API Hooks
  const ownerOptions = useOwnerOptions();

  const tableData = useMemo(() => {
    // Toplevel Taskforce
    const ownerRankName = ownerOptions.find((owner) => owner.value === ownerId)?.label;
    const taskforce = {
      id: TOP_LEVEL,
      level: 0,
      name: getValues('name'),
      echelon: getValues('echelon'),
      ownerId: ownerRankName,
      shortname: getValues('shortname'),
      nickname: getValues('nickname'),
      aircraft: getValues('aircraft'),
      uas: getValues('uas'),
      agse: getValues('agse'),
    };
    // Subordinates
    const subordinateData = subordinates.map((row) => {
      const _ownerRankName = ownerOptions.find((owner) => owner.value === row.ownerId)?.label;
      return { ...row, id: row.uuid, ownerId: _ownerRankName };
    });

    return [taskforce, ...subordinateData];
  }, [ownerOptions, getValues, subordinates, ownerId]);

  return (
    <Stack direction="column" gap={3}>
      {/* Logo Header with taskforce details */}
      <Stack direction="row" gap={3} justifyContent="space-between" sx={{ pb: 1 }}>
        <TaskforceLogoHeadingFormWrapper />
        <RHFProgressIndicator />
      </Stack>
      {/* Collapsible Data Table  */}
      <PmxCollapsibleTreeTable
        rows={tableData as IExtSubordinate[]}
        columns={TABLE_COLUMNS}
        collapsibleKey="collapsibleDrawerContent"
      />
    </Stack>
  );
};
