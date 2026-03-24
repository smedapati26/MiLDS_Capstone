import z from 'zod';

import { Divider, Stack } from '@mui/material'; // Material-UI Stack component for layout

import { RHFAutocomplete, RHFFilterFormProvider } from '@components/react-hook-form';
import RHFDateRangePicker from '@components/react-hook-form/RHFDateRangePicker';
import { RHFDualRangeSlider } from '@components/react-hook-form/RHFDualRangeSlider';
// Custom hooks for extracting filter options and max values from data
import { useFilterOptions } from '@hooks/useFilterOptions';
import { dateRangeSchemaOptional } from '@models/react-hook-form';

import { IMaintenanceDetailsDto } from '@store/griffin_api/events/models';

// Validation schema
export const MaintDetailFilterSchema = z.object({
  serialNumbers: z.array(z.string()),
  models: z.array(z.string()),
  inspections: z.array(z.string()),
  lanes: z.array(z.string()),
  units: z.array(z.string()),
  startDateRange: dateRangeSchemaOptional,
  endDateRange: dateRangeSchemaOptional,
  isCompletionStatusChecked: z.boolean(),
  completionStatus: z.tuple([z.number(), z.number()]),
});

// Use schema to infer the Typescript type
export type MaintDetailFilterSchemaType = z.infer<typeof MaintDetailFilterSchema>;

// Default Values
export const maintDetailDefaultValues: MaintDetailFilterSchemaType = {
  serialNumbers: [],
  models: [],
  inspections: [],
  lanes: [],
  units: [],
  startDateRange: {
    startDate: null,
    endDate: null,
  },
  endDateRange: {
    startDate: null,
    endDate: null,
  },
  isCompletionStatusChecked: false,
  completionStatus: [0, 100],
};

/**
 * Props for the MaintDetailsFilterForm component.
 */
type Props = {
  tableData: Array<IMaintenanceDetailsDto> | undefined;
  /** Callback function invoked when the Apply button is clicked. */
  onApplyFilters: (values: MaintDetailFilterSchemaType) => void;
};

/**
 * MaintDetailsFilterForm Component
 *
 * Renders a vertical stack of filter components for aircraft equipment.
 * Uses custom hooks to derive filter options and max values from the table data.
 *
 * @param tableData - The data array from which filter options are extracted.
 * @returns JSX element representing the filter form.
 */
export const MaintDetailsFilterForm: React.FC<Props> = ({ tableData = [], onApplyFilters }) => {
  // Extract unique filter options for various fields from the table data
  const serialNumbers = useFilterOptions(tableData, 'serial');
  const models = useFilterOptions(tableData, 'model');
  const inspections = useFilterOptions(tableData, 'inspection_name');
  const lanes = useFilterOptions(tableData, 'lane_name');
  const units = useFilterOptions(tableData, 'responsible_unit');

  return (
    <RHFFilterFormProvider
      title="Filters"
      schema={MaintDetailFilterSchema}
      defaultValues={maintDetailDefaultValues}
      onSubmitFilters={(filters) => onApplyFilters(filters)}
    >
      <Stack direction="column" gap={4}>
        {/* Multi-chip autocomplete for selecting serial numbers */}
        <RHFAutocomplete multiple field="serialNumbers" label="Serial Numbers" options={serialNumbers} />

        {/* Multi-chip autocomplete for selecting models */}
        <RHFAutocomplete multiple field="models" label="Models" options={models} />

        {/* Multi-chip autocomplete for selecting lanes */}
        <RHFAutocomplete multiple field="inspections" label="Inspection Type" options={inspections} />

        {/* Multi-chip autocomplete for selecting lanes */}
        <RHFAutocomplete multiple field="lanes" label="Lane" options={lanes} />

        {/* Multi-chip autocomplete for selecting units */}
        <RHFAutocomplete multiple field="units" label="Responsible Unit" options={units} />

        {/* Divider to separate autocomplete filters from sliders */}
        <Divider />

        {/* Date Range Picker for Maintenance start periods */}
        <RHFDateRangePicker label="Maintenance Start Date Range" field="startDateRange" />

        {/* Date Range Picker for Maintenance end periods */}
        <RHFDateRangePicker label="Maintenance End Date Range" field="endDateRange" />

        {/* Divider to separate autocomplete filters from sliders */}
        <Divider />

        {/* Dual range slider for filtering by Completion Status */}
        <RHFDualRangeSlider
          field="completionStatus"
          checkboxField="isCompletionStatusChecked"
          label="Completion Status"
        />
      </Stack>
    </RHFFilterFormProvider>
  );
};
