import { Divider, Stack } from '@mui/material'; // Material-UI Stack component for layout

import { RHFAutocomplete, RHFFilterFormProvider } from '@components/react-hook-form';
import { RHFChipButtonGroup } from '@components/react-hook-form/RHFChipButtonGroup';
// Custom hooks for extracting filter options and max values from data
import { useFilterOptions } from '@hooks/useFilterOptions';
import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAircraftTransferData } from '@store/griffin_api/aircraft/models';

import {
  aircraftTransferDefaultValues,
  AircraftTransferFilterSchema,
  AircraftTransferFilterSchemaType,
} from './schema';

/**
 * Props for the AircraftTransferFilterForm component.
 */
type AircraftTransferFilterFormProps = {
  tableData: Array<IAircraftTransferData> | undefined;
  onApplyFilters: (values: AircraftTransferFilterSchemaType) => void;
};

/**
 * AircraftTransferFilterForm Component
 *
 * Renders a vertical stack of filter components for aircraft transfer.
 * Uses custom hooks to derive filter options and max values from the table data.
 *
 * @param tableData - The data array from which filter options are extracted.
 * @returns JSX element representing the filter form.
 */
export const AircraftTransferFilterForm: React.FC<AircraftTransferFilterFormProps> = ({
  tableData = [],
  onApplyFilters,
}) => {
  // Extract unique filter options for various fields from the table data
  const models = useFilterOptions(tableData, 'model');

  return (
    <RHFFilterFormProvider
      title="Filters"
      schema={AircraftTransferFilterSchema}
      defaultValues={aircraftTransferDefaultValues}
      onSubmitFilters={(filters) => onApplyFilters(filters)}
      disabled={tableData.length == 0}
    >
      <Stack direction="column" gap={4}>
        {/* Chip button group for selecting operational readiness status */}
        <RHFChipButtonGroup
          label="Operational Readiness Status"
          field="statuses"
          options={[
            OperationalReadinessStatusEnum.FMC,
            OperationalReadinessStatusEnum.PMC,
            OperationalReadinessStatusEnum.NMC,
          ]}
          multiselect={true}
        />

        {/* Divider to separate status filters from other filters */}
        <Divider />

        {/* Multi-chip autocomplete for selecting models */}
        <RHFAutocomplete multiple field="models" label="Models" options={models} />
      </Stack>
    </RHFFilterFormProvider>
  );
};
