import { Divider, Stack } from '@mui/material'; // Material-UI Stack component for layout

import { RHFAutocomplete, RHFDualRangeSlider, RHFFilterFormProvider } from '@components/react-hook-form';
import { RHFChipButtonGroup } from '@components/react-hook-form/RHFChipButtonGroup';
// Custom hooks for extracting filter options and max values from data
import { useFilterOptions } from '@hooks/useFilterOptions';
import { useMaxValue } from '@hooks/useMaxValue';
import { LaunchStatusEnum } from '@models/LaunchStatusEnum';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IUAS } from '@store/griffin_api/uas/models/IUAS';

import { uavFilterDefaultValues, UAVFilterSchema, UAVFilterSchemaType } from './schema';

/**
 * Props for the UAVFilterForm component.
 */
type Props = {
  tableData: Array<IUAS> | undefined;
  /** Callback function invoked when the Apply button is clicked. */
  onApplyFilters: (values: UAVFilterSchemaType) => void;
};

/**
 * UAVFilterForm Component
 *
 * Renders a vertical stack of filter components for aircraft equipment.
 * Uses custom hooks to derive filter options and max values from the table data.
 *
 * @param tableData - The data array from which filter options are extracted.
 * @returns JSX element representing the filter form.
 */
export const UAVFilterForm: React.FC<Props> = ({ tableData = [], onApplyFilters }) => {
  // Extract unique filter options for various fields from the table data
  const serialNumbers = useFilterOptions(tableData, 'serialNumber');
  const models = useFilterOptions(tableData, 'model');
  const units = useFilterOptions(tableData, 'currentUnit');
  const locations = useFilterOptions(tableData, 'locationCode');

  // Get the maximum values for hours flown and hours to phase for slider ranges
  const maxHoursFlown = useMaxValue(tableData, 'flightHours');
  const maxAirframeHours = useMaxValue(tableData, 'totalAirframeHours');

  return (
    <RHFFilterFormProvider
      title="Filters"
      schema={UAVFilterSchema}
      defaultValues={uavFilterDefaultValues}
      onSubmitFilters={(filters) => onApplyFilters(filters)}
    >
      <Stack direction="column" gap={4}>
        {/* Chip button group for selecting operational readiness status */}
        <RHFChipButtonGroup
          label="Operational Readiness Status"
          field="status"
          options={[
            OperationalReadinessStatusEnum.FMC,
            OperationalReadinessStatusEnum.PMC,
            OperationalReadinessStatusEnum.NMC,
            OperationalReadinessStatusEnum.DADE,
          ]}
        />

        {/* Launch Status */}
        <RHFChipButtonGroup label="Launch Status" field="launchStatus" options={Object.values(LaunchStatusEnum)} />

        <Divider />

        {/* Multi-chip autocomplete for selecting serial numbers */}
        <RHFAutocomplete multiple field="serialNumbers" label="Serial Numbers" options={serialNumbers} />

        {/* Multi-chip autocomplete for selecting models */}
        <RHFAutocomplete multiple field="models" label="Models" options={models} />

        {/* Multi-chip autocomplete for selecting units */}
        <RHFAutocomplete multiple field="units" label="Unit" options={units} />

        {/* Multi-chip autocomplete for selecting locations */}
        <RHFAutocomplete multiple field="location" label="Location" options={locations} />

        <Divider />

        {/* Dual range slider for filtering by hours flown */}
        <RHFDualRangeSlider
          field="hoursFlown"
          checkboxField="isHoursFlownChecked"
          label="Hours Flown"
          max={maxHoursFlown}
        />

        {/* Dual range slider for filtering by hours to aircraft */}
        <RHFDualRangeSlider
          field="totalAirframeHours"
          checkboxField="isTotalAirframeHoursChecked"
          label="Airframe Hours"
          max={maxAirframeHours}
        />
      </Stack>
    </RHFFilterFormProvider>
  );
};
