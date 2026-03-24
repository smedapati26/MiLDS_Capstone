import { useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import PmxComparisonTable from '@components/data-tables/PmxComparisonTable';
import { PmxSectionedTableProps } from '@components/data-tables/PmxSectionedTable';
import { LaunchStatusEnum } from '@models/LaunchStatusEnum';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAircraftEquipmentDetailsInfo } from '@store/griffin_api/aircraft/models';
import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

interface Props<T> extends PmxSectionedTableProps<T> {
  launchStatus?: LaunchStatusEnum;
  ORStatus?: OperationalReadinessStatusEnum;
  remarks?: string;
  location?: IAutoDsrLocation;
}

/**
 * A functional component that acts as a form for the step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const ReviewChangesStep = (props: Props<IAircraftEquipmentDetailsInfo>) => {
  const { columns, keyTitleMapping, data, launchStatus, ORStatus, remarks, location } = props;

  const updatedData: Record<string, IAircraftEquipmentDetailsInfo[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(data).map(([model, rows]) => {
        const updatedAircraft = rows.map((aircraft: IAircraftEquipmentDetailsInfo) => ({
          ...aircraft,
          rtl: launchStatus ?? aircraft.rtl,
          ORStatus: ORStatus ?? aircraft.ORStatus,
          remarks: remarks ?? aircraft.remarks,
          location: location ?? aircraft.location,
        }));

        return [model, updatedAircraft];
      }),
    );
  }, [ORStatus, data, launchStatus, location, remarks]);

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
