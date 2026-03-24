import * as React from 'react';
import { useState } from 'react';

import { useTheme } from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';

import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';

import { AgseTable } from './AGSE/AgseTable';
import { AircraftTable } from './Aircraft/AircraftTable';
import { UACTable } from './UAS/Components/UACTable';
import { UASAccordions } from './UAS/UASAccordions';
import { UAVTable } from './UAS/UAV/UAVTable';

/**
 * Props for the EquipmentDetailsGridItem component.
 * @param uic - Unit Identification Code, used to fetch equipment data. Can be undefined initially.
 * @param startDate - Start date for the data range in string format.
 * @param endDate - End date for the data range in string format.
 */
export type EquipmentDetailsGridItemProps = {
  uic: string | undefined;
  startDate: string;
  endDate: string;
};

/**
 * EquipmentDetailsGridItem component function.
 * Renders an accordion containing equipment details table with filtering and search capabilities.
 */
const EquipmentDetailsGridItem: React.FC<EquipmentDetailsGridItemProps> = (props: EquipmentDetailsGridItemProps) => {
  // Destructure props
  const { uic, startDate, endDate } = props;
  // Access theme for styling
  const { palette } = useTheme();

  // State for equipment type selection (currently disabled, default to 'Aircraft')
  type EquipmentTypes = 'Aircraft' | 'UAS' | 'AGSE';
  const [equipmentType, setEquipmentType] = useState<EquipmentTypes>('Aircraft');

  // Api call for loading
  const { isUninitialized, isFetching } = useGetAutoDsrQuery(
    {
      uic: uic,
      start_date: startDate,
      end_date: endDate,
    },
    { skip: !uic },
  );

  // Render the component
  return (
    <PmxAccordion
      heading="Equipment Details"
      launchPath="/equipment-manager"
      isLoading={isUninitialized || isFetching}
      sx={{
        backgroundImage: 'none',
        borderColor: palette.mode === 'dark' ? palette.layout.background11 : palette.layout.background7,
        margin: 0,
      }}
    >
      <>
        {equipmentType === 'Aircraft' && (
          <AircraftTable
            uic={uic}
            startDate={startDate}
            endDate={endDate}
            onToggle={(value) => setEquipmentType(value as EquipmentTypes)}
          />
        )}
        {equipmentType === 'UAS' && (
          <UASAccordions onToggle={(value) => setEquipmentType(value as EquipmentTypes)}>
            <UAVTable uic={uic} />
            <UACTable uic={uic} />
          </UASAccordions>
        )}
        {equipmentType === 'AGSE' && (
          <AgseTable uic={uic} onToggle={(value) => setEquipmentType(value as EquipmentTypes)} />
        )}
      </>
    </PmxAccordion>
  );
};

export default EquipmentDetailsGridItem;
