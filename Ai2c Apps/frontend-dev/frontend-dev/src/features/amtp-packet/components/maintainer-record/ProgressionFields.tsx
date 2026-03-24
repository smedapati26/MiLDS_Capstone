import { Control, Controller, FieldErrors, FieldPath } from 'react-hook-form';

import { Checkbox, FormControlLabel, Grid, Typography } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';

import { IEventFormValues, IMultiEventForm } from './AddEditEventForm';
import { IMassEventFormValues } from './MassEventDialog';

interface ProgressionFieldsProps {
  isDisabled: boolean;
  formIndex?: number;
  formType: string | undefined;
  control: Control<IMultiEventForm | IEventFormValues | IMassEventFormValues, null>;
  errors: FieldErrors<IEventFormValues | IMassEventFormValues>;
}

const ProgressionFields = ({ formType, control, errors, formIndex = 0, isDisabled }: ProgressionFieldsProps) => {
  const { data: allMOS, isLoading: loadingMos } = useGetAllMOSQuery();

  const isProgressionTraining = formType !== 'Evaluation';

  const fieldName = (name: string): FieldPath<IMultiEventForm> =>
    `events.${formIndex}.${name}` as FieldPath<IMultiEventForm>;

  return (
    <>
      <Grid size={{ xs: 12 }}>
        {isProgressionTraining && (
          <FormControlLabel
            checked={!isDisabled}
            sx={{ ml: 0 }}
            control={<Checkbox checked={!isDisabled} disabled={isDisabled} />}
            label="Progression Event"
          />
        )}
        {!isProgressionTraining && <Typography>Progression Event</Typography>}
      </Grid>
      {isProgressionTraining && <Grid size={{ xs: 1 }} />}
      <Grid size={{ xs: isProgressionTraining ? 5.5 : 6 }} mb={4}>
        <Controller
          name={fieldName('mos')}
          disabled={isDisabled}
          control={control}
          {...(!isProgressionTraining && { rules: { required: 'MOS is required' } })}
          render={({ field }) => (
            <PmxDropdown
              options={allMOS?.map((x: { mos: string }) => ({ label: x.mos, value: x.mos })) ?? []}
              value={(field?.value as string) ?? undefined}
              label={formType === 'Evaluation' ? 'MOS*' : 'MOS'}
              onChange={field.onChange}
              error={!!errors?.mos}
              helperText={errors?.mos?.message}
              loading={loadingMos}
              disabled={field.disabled}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: isProgressionTraining ? 5.5 : 6 }} mb={4}>
        <Controller
          name={fieldName('maintenanceLevel')}
          control={control}
          disabled={isDisabled}
          {...(!isProgressionTraining && { rules: { required: 'ML is required' } })}
          render={({ field }) => (
            <PmxDropdown
              options={[
                { label: 'ML0', value: 'ML0' },
                { label: 'ML1', value: 'ML1' },
                { label: 'ML2', value: 'ML2' },
                { label: 'ML3', value: 'ML3' },
                { label: 'ML4', value: 'ML4' },
              ]}
              value={(field?.value as string) ?? undefined}
              label={formType === 'Evaluation' ? 'ML*' : 'ML'}
              onChange={field.onChange}
              error={!!errors?.maintenanceLevel}
              helperText={errors?.maintenanceLevel?.message}
              disabled={field.disabled}
            />
          )}
        />
      </Grid>
    </>
  );
};

export default ProgressionFields;
