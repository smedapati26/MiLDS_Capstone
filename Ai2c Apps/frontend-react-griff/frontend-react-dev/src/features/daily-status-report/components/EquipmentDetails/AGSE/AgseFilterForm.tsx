import { Divider, Stack } from '@mui/material'; // Material-UI Stack component for layout

import { RHFAutocomplete, RHFFilterFormProvider } from '@components/react-hook-form';
import { RHFChipButtonGroup } from '@components/react-hook-form/RHFChipButtonGroup';
// Custom hooks for extracting filter options and max values from data
import { useFilterOptions } from '@hooks/useFilterOptions';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAGSE } from '@store/griffin_api/agse/models';

import { agseDefaultValues, AgseFilterSchema, AgseFilterSchemaType } from './schema';

/**
 * Props for the AgseFilterForm component.
 */
type AgseFilterFormProps = {
  tableData: Array<IAGSE> | undefined;
  /** Callback function invoked when the Apply button is clicked. */
  onApplyFilters: (values: AgseFilterSchemaType) => void;
};

/**
 * AgseFilterForm Component
 *
 * Renders a vertical stack of filter components for aircraft equipment.
 * Uses custom hooks to derive filter options and max values from the table data.
 *
 * @param tableData - The data array from which filter options are extracted.
 * @returns JSX element representing the filter form.
 */
export const AgseFilterForm: React.FC<AgseFilterFormProps> = ({ tableData = [], onApplyFilters }) => {
  // Extract unique filter options for various fields from the table data
  const serialNumbers = useFilterOptions(tableData, 'serialNumber');
  const models = useFilterOptions(tableData, 'model');
  const units = useFilterOptions(tableData, 'currentUnit');
  const locations = useFilterOptions(tableData, 'lin');

  return (
    <RHFFilterFormProvider
      title="Filters"
      schema={AgseFilterSchema}
      defaultValues={agseDefaultValues}
      onSubmitFilters={(filters) => onApplyFilters(filters)}
    >
      <Stack direction="column" gap={4}>
        {/* Chip button group for selecting operational readiness status */}
        <RHFChipButtonGroup
          label="Operational Readiness Status"
          field="conditions"
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
      </Stack>
    </RHFFilterFormProvider>
  );
};
