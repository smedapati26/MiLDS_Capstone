import { useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import PmxComparisonTable from '@components/data-tables/PmxComparisonTable';
import { PmxTableProps } from '@components/data-tables/PmxTable';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';
import { IModification } from '@store/griffin_api/mods/models';

import { ModAircraftAssignment } from '../helper';

interface Props<T> extends PmxTableProps<T> {
  assignedAircraft?: ModAircraftAssignment[];
  trackingVariable?: string;
  value?: string;
  remarks?: string;
  location?: IAutoDsrLocation;
}

/**
 * A functional component that acts as a form for the step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const ReviewChangesStep = (props: Props<IModification>) => {
  const { columns, rows, assignedAircraft, trackingVariable, value, remarks, location } = props;

  const updatedData: IModification[] = useMemo(() => {
    return rows.map((mod: IModification) => {
      // 1. Determine the "base" values from props or existing data
      const currentTrackingVar = trackingVariable ?? mod.trackingVariable;
      const currentRemarks = remarks ?? mod.remarks;
      let currentValue = value ?? mod.value;

      // 2. Logic: If "Other", override the value with remarks
      // You can also concatenate them: `${currentValue} - ${currentRemarks}`
      if (currentTrackingVar?.toLowerCase() === 'other') {
        currentValue = currentRemarks;
      }

      return {
        ...mod,
        serialNumber: assignedAircraft?.find((pair) => pair.id === mod.id)?.serialNumber ?? mod.serialNumber,
        assignedAircraft: assignedAircraft?.find((pair) => pair.id === mod.id)?.aircraft ?? mod.assignedAircraft,
        trackingVariable: currentTrackingVar,
        value: currentValue,
        remarks: currentRemarks,
        location: location ?? mod.location,
      };
    });
  }, [rows, assignedAircraft, trackingVariable, value, location, remarks]);

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box width="100%">
      <Typography sx={{ pt: 1, pb: 5, pl: 1 }}>Review the changes shown in blue before saving.</Typography>
      <Box sx={{ height: '30vh', overflowY: 'scroll' }}>
        <PmxComparisonTable columns={columns} data={updatedData} comparativeData={rows} sectioned={false} />
      </Box>
    </Box>
  );
};

export default ReviewChangesStep;
