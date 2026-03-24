import React, { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import PmxTable, { PmxTableProps } from '@components/data-tables/PmxTable';
import { isSubsetEqual } from '@components/utils';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';

import { useUasMultiStepData } from './MultiStepContext';
import { UasEditStepsEnum } from './SelectedField';

interface Props extends PmxTableProps<IUAS> {
  steps: UasEditStepsEnum[];
}

/**
 * Final review step
 */
export const ReviewStep: React.FC<Props> = (props: Props): React.ReactNode => {
  const { rows, columns, steps } = props;
  const { launchStatus, flightHours, ORStatus, remarks, location, fieldSyncStatus } = useUasMultiStepData();

  const newRows = useMemo((): IUAS[] => {
    return rows.map((row: IUAS) => {
      const updatedFieldSyncStatus: { [sync: string]: boolean } = { ...row.fieldSyncStatus };

      if (steps.includes(UasEditStepsEnum.STATUS)) {
        if ('rtl' in fieldSyncStatus) {
          updatedFieldSyncStatus['rtl'] = fieldSyncStatus['rtl'];
        }
        if ('status' in fieldSyncStatus) {
          updatedFieldSyncStatus['status'] = fieldSyncStatus['status'];
        }
      }

      if (steps.includes(UasEditStepsEnum.PERIOD)) {
        if ('flightHours' in fieldSyncStatus) {
          updatedFieldSyncStatus['flightHours'] = fieldSyncStatus['flightHours'];
        }
      }

      if (steps.includes(UasEditStepsEnum.REMARKS)) {
        if ('remarks' in fieldSyncStatus) {
          updatedFieldSyncStatus['remarks'] = fieldSyncStatus['remarks'];
        }
      }

      if (steps.includes(UasEditStepsEnum.LOCATION)) {
        if ('location' in fieldSyncStatus) {
          updatedFieldSyncStatus['location'] = fieldSyncStatus['location'];
        }
      }
      return {
        ...row,
        ...(steps.includes(UasEditStepsEnum.STATUS) && {
          status: ORStatus,
          displayStatus: ORStatus as OperationalReadinessStatusEnum,
          rtl: launchStatus,
        }),
        ...(steps.includes(UasEditStepsEnum.PERIOD) && {
          flightHours: Number(flightHours),
        }),
        ...(steps.includes(UasEditStepsEnum.REMARKS) && {
          remarks: remarks,
        }),
        ...(steps.includes(UasEditStepsEnum.LOCATION) && {
          locationCode: location?.code,
          locationId: location?.id,
          locationName: location?.name,
        }),

        ...(!isSubsetEqual(row.fieldSyncStatus, updatedFieldSyncStatus) && {
          fieldSyncStatus: updatedFieldSyncStatus,
        }),
      };
    });
  }, [ORStatus, fieldSyncStatus, flightHours, launchStatus, location, remarks, rows, steps]);

  return (
    <Stack direction="column" spacing={3}>
      <Typography variant="body2">Review Changes</Typography>
      <Typography variant="body1">Review the changes shown in blue before saving.</Typography>
      <PmxTable columns={columns.slice(0, columns.length - 1)} rows={newRows} sx={{ boxShadow: 'none' }} />
    </Stack>
  );
};
