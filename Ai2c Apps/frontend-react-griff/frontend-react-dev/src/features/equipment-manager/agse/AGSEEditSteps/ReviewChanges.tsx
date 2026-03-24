import { useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import PmxComparisonTable from '@components/data-tables/PmxComparisonTable';
import { PmxSectionedTableProps } from '@components/data-tables/PmxSectionedTable';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAGSE } from '@store/griffin_api/agse/models/IAGSE';
import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

interface Props<T> extends PmxSectionedTableProps<T> {
  ORStatus?: OperationalReadinessStatusEnum;
  remarks?: string;
  location?: IAutoDsrLocation;
}

/**
 * A functional component that acts as a form for the step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const ReviewChangesStep = (props: Props<IAGSE>) => {
  const { columns, keyTitleMapping, data, ORStatus, remarks, location } = props;

  const updatedData: Record<string, IAGSE[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(data).map(([sub, rows]) => {
        const updatedAGSE = rows.map((agse: IAGSE) => ({
          ...agse,
          condition: ORStatus ?? agse.condition,
          remarks: remarks ?? agse.remarks,
          currentUnit: location?.code ?? agse.currentUnit,
        }));

        return [sub, updatedAGSE];
      }),
    );
  }, [ORStatus, data, location, remarks]);

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box width="100%">
      <Typography sx={{ pt: 1, pb: 5, pl: 1 }}>Review the changes shown in blue before saving.</Typography>
      <Box sx={{ height: '30vh', overflow: 'scroll' }}>
        <PmxComparisonTable
          columns={columns}
          keyTitleMapping={keyTitleMapping}
          data={updatedData}
          comparativeData={data}
          sectioned={true}
        />
      </Box>
    </Box>
  );
};

export default ReviewChangesStep;
