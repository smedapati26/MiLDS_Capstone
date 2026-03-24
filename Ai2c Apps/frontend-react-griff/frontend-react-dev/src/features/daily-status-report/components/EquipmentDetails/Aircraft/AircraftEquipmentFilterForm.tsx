import { Divider, Stack } from '@mui/material'; // Material-UI Stack component for layout

import { RHFAutocomplete, RHFFilterFormProvider } from '@components/react-hook-form';
import { RHFChipButtonGroup } from '@components/react-hook-form/RHFChipButtonGroup';
import { RHFDualRangeSlider } from '@components/react-hook-form/RHFDualRangeSlider';
// Custom hooks for extracting filter options and max values from data
import { useFilterOptions } from '@hooks/useFilterOptions';
import { useMaxValue } from '@hooks/useMaxValue';
import { LaunchStatusEnum } from '@models/LaunchStatusEnum';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { TableOverrideType } from './AircraftTable';
import { aircraftDefaultValues, AircraftFilterSchema, AircraftFilterSchemaType } from './schema';
import { useModifications } from './useModifications';

/**
 * Props for the AircraftEquipmentFilterForm component.
 */
type AircraftEquipmentFilterFormProps = {
  tableData: Array<TableOverrideType> | undefined;
  /** Callback function invoked when the Apply button is clicked. */
  onApplyFilters: (values: AircraftFilterSchemaType) => void;
};

/**
 * AircraftEquipmentFilterForm Component
 *
 * Renders a vertical stack of filter components for aircraft equipment.
 * Uses custom hooks to derive filter options and max values from the table data.
 *
 * @param tableData - The data array from which filter options are extracted.
 * @returns JSX element representing the filter form.
 */
export const AircraftEquipmentFilterForm: React.FC<AircraftEquipmentFilterFormProps> = ({
  tableData = [],
  onApplyFilters,
}) => {
  // Extract unique filter options for various fields from the table data
  const serialNumbers = useFilterOptions(tableData, 'serialNumber');
  const models = useFilterOptions(tableData, 'model');
  const units = useFilterOptions(tableData, 'currentUnitName');
  const locations = useFilterOptions(tableData, 'location');
  const modifications = useModifications(tableData);

  // Get the maximum values for hours flown and hours to phase for slider ranges
  const maxHoursFlown = useMaxValue(tableData, 'flyingHours');
  const maxHoursToPhase = useMaxValue(tableData, 'hoursToPhase');

  return (
    <RHFFilterFormProvider
      title="Filters"
      schema={AircraftFilterSchema}
      defaultValues={aircraftDefaultValues}
      onSubmitFilters={(filters) => onApplyFilters(filters)}
    >
      <Stack direction="column" gap={4}>
        {/* Chip button group for selecting launch status */}
        <RHFChipButtonGroup
          label="Launch Status"
          field="launchStatus"
          options={[LaunchStatusEnum.RTL, LaunchStatusEnum.NRTL]}
        />

        {/* Chip button group for selecting operational readiness status */}
        <RHFChipButtonGroup
          label="Operational Readiness Status"
          field="orStatus"
          options={[
            OperationalReadinessStatusEnum.FMC,
            OperationalReadinessStatusEnum.PMC,
            OperationalReadinessStatusEnum.NMC,
            OperationalReadinessStatusEnum.DADE,
          ]}
        />

        {/* Divider to separate status filters from other filters */}
        <Divider />

        {/* Multi-chip autocomplete for selecting serial numbers */}
        <RHFAutocomplete multiple field="serialNumbers" label="Serial Numbers" options={serialNumbers} />

        {/* Multi-chip autocomplete for selecting models */}
        <RHFAutocomplete multiple field="models" label="Models" options={models} />

        {/* Multi-chip autocomplete for selecting units */}
        <RHFAutocomplete multiple field="units" label="Unit" options={units} />

        {/* Multi-chip autocomplete for selecting locations */}
        <RHFAutocomplete multiple field="location" label="Location" options={locations} />

        {/* Multi-chip autocomplete for selecting modifications */}
        <RHFAutocomplete multiple field="modifications" label="Modifications" options={modifications} />

        {/* Divider to separate autocomplete filters from sliders */}
        <Divider />

        {/* Dual range slider for filtering by hours flown */}
        <RHFDualRangeSlider
          field="hoursFlown"
          checkboxField="isHoursFlownChecked"
          label="Hours Flown"
          max={maxHoursFlown}
        />

        {/* Dual range slider for filtering by hours to phase */}
        <RHFDualRangeSlider
          field="hoursToPhase"
          checkboxField="isHoursToPhaseChecked"
          label="Hours to Phase"
          max={maxHoursToPhase}
        />
      </Stack>
    </RHFFilterFormProvider>
  );
};
