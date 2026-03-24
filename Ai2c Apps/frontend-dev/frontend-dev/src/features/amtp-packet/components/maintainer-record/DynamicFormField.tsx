import { useEffect } from 'react';
import { Control, Controller, FieldErrors, FieldPath } from 'react-hook-form';

import { Grid } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import { UnitSelect } from '@components/UnitSelect';
import {
  useLazyGetAwardTypesQuery,
  useLazyGetEvaluationTypesQuery,
  useLazyGetTCSLocationsQuery,
  useLazyGetTrainingTypesQuery,
} from '@store/amap_ai/events/slices';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useLazyGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';

import { IEventFormValues, IMultiEventForm } from './AddEditEventForm';
import { IMassEventFormValues } from './MassEventDialog';

type EventFieldName = keyof IEventFormValues;

interface DynamicFormFieldProps {
  formType: string | undefined;
  control: Control<IMultiEventForm | IEventFormValues | IMassEventFormValues, null>;
  errors: FieldErrors<IEventFormValues | IMassEventFormValues>;
  awardGridSize?: number;
  isMultipleForms?: boolean;
  index?: number;
  isMass?: boolean;
}

const DynamicFormField = ({
  formType,
  control,
  errors,
  awardGridSize,
  isMultipleForms,
  isMass,
  index,
}: DynamicFormFieldProps) => {
  const [fetchUnits, { data: units, isSuccess }] = useLazyGetUnitsQuery();
  const [fetchTrainingTypes, { data: trainingTypes, isFetching: fetchingTraining }] = useLazyGetTrainingTypesQuery();
  const [fetchEvaluationTypes, { data: evaluationTypes, isFetching: fetchingEvaluation }] =
    useLazyGetEvaluationTypesQuery();
  const [fetchAwardTypes, { data: awardTypes, isFetching: fetchingAwards }] = useLazyGetAwardTypesQuery();

  const [fetchTcsLocations, { data: tcsLocations, isFetching: fetchingLocations }] = useLazyGetTCSLocationsQuery();

  useEffect(() => {
    if (formType === 'Training') {
      fetchTrainingTypes(null);
    } else if (formType === 'Evaluation') {
      fetchEvaluationTypes(null);
    } else if (formType === 'Award') {
      fetchAwardTypes(null);
    } else if (formType === 'TCS') {
      fetchTcsLocations(null);
    } else if (formType === 'PCS/ETS') {
      fetchUnits({});
    }
  }, [formType, fetchTrainingTypes, fetchEvaluationTypes, fetchAwardTypes, fetchTcsLocations, fetchUnits]);

  const getFieldName = (name: EventFieldName, isMultipleForms?: boolean, index?: number): FieldPath<IMultiEventForm> =>
    isMultipleForms && typeof index === 'number'
      ? (`events.${index}.${name}` as FieldPath<IMultiEventForm>)
      : (`events.0.${name}` as FieldPath<IMultiEventForm>);

  const getFieldError = <T extends keyof IEventFormValues>(
    name: T,
    isMultipleForms?: boolean,
    index?: number,
    errors?: FieldErrors<IMultiEventForm> | FieldErrors<IEventFormValues>,
  ): { error: boolean; helperText?: string } => {
    if (isMultipleForms && typeof index === 'number') {
      const entryErrors = (errors as FieldErrors<IMultiEventForm>)?.events?.[index];
      return {
        error: !!entryErrors?.[name],
        helperText: entryErrors?.[name]?.message,
      };
    } else {
      const flatErrors = errors as FieldErrors<IEventFormValues>;
      return {
        error: !!flatErrors?.[name],
        helperText: flatErrors?.[name]?.message,
      };
    }
  };

  return (
    <>
      {formType === 'Evaluation' && (
        <Grid size={{ xs: 4 }}>
          <Controller
            name={!isMass ? getFieldName('evaluationType', isMultipleForms, index) : 'evaluationType'}
            control={control}
            rules={{ required: 'Evaluation Type is required' }}
            render={({ field }) => (
              <PmxDropdown
                options={evaluationTypes?.map((x) => x.type) ?? []}
                value={(field?.value as string) ?? null}
                label="Evaluation Type*"
                onChange={field.onChange}
                error={!!getFieldError('evaluationType', isMultipleForms, index, errors).error}
                helperText={getFieldError('evaluationType', isMultipleForms, index, errors).helperText}
                loading={fetchingEvaluation}
              />
            )}
          />
        </Grid>
      )}

      {formType === 'Training' && (
        <Grid size={{ xs: 4 }}>
          <Controller
            name={!isMass ? getFieldName('trainingType', isMultipleForms, index) : 'trainingType'}
            control={control}
            rules={{ required: 'Training Type is required' }}
            render={({ field }) => (
              <PmxDropdown
                options={trainingTypes?.map((x) => x.type) ?? []}
                value={(field?.value as string) ?? null}
                label="Training Type*"
                onChange={field.onChange}
                error={!!getFieldError('trainingType', isMultipleForms, index, errors).error}
                helperText={getFieldError('trainingType', isMultipleForms, index, errors).helperText}
                loading={fetchingTraining}
              />
            )}
          />
        </Grid>
      )}

      {formType === 'Award' && (
        <Grid size={{ xs: awardGridSize ?? 12 }}>
          <Controller
            name={!isMass ? getFieldName('awardType', isMultipleForms, index) : 'awardType'}
            control={control}
            rules={{ required: 'Award Type is required' }}
            render={({ field }) => (
              <PmxDropdown
                options={
                  awardTypes?.map((x) => ({
                    label: x.description,
                    value: x.type,
                  })) ?? []
                }
                value={(field?.value as string) ?? null}
                label="Award Type*"
                onChange={field.onChange}
                error={!!getFieldError('awardType', isMultipleForms, index, errors).error}
                helperText={getFieldError('awardType', isMultipleForms, index, errors).helperText}
                loading={fetchingAwards}
              />
            )}
          />
        </Grid>
      )}

      {formType === 'TCS' && (
        <Grid size={{ xs: 6 }}>
          <Controller
            name={getFieldName('tcsLocation', isMultipleForms, index)}
            control={control}
            rules={{ required: 'TCS Location is required' }}
            render={({ field }) => (
              <PmxDropdown
                options={tcsLocations?.map((x) => ({ label: x.location, value: x.abbreviation })) ?? []}
                value={(field?.value as string) ?? null}
                label="TCS Location*"
                onChange={field.onChange}
                error={!!getFieldError('tcsLocation', isMultipleForms, index, errors).error}
                helperText={getFieldError('tcsLocation', isMultipleForms, index, errors).helperText}
                loading={fetchingLocations}
              />
            )}
          />
        </Grid>
      )}
      {(formType === 'PCS/ETS' || formType === 'In-Unit Transfer') && (
        <Grid size={{ xs: 6 }}>
          <Controller
            name={getFieldName('gainingUnit', isMultipleForms, index)}
            control={control}
            rules={{ required: 'Gaining Unit is required' }}
            render={({ field }) => (
              <UnitSelect
                units={isSuccess ? units : []}
                onChange={field.onChange}
                value={(field?.value as IUnitBrief) ?? null}
                readOnly={false}
                width="100%"
                error={!!getFieldError('gainingUnit', isMultipleForms, index, errors).error}
                helperText={getFieldError('tcsLocation', isMultipleForms, index, errors).helperText}
                label="Gaining Unit*"
              />
            )}
          />
        </Grid>
      )}
    </>
  );
};

export default DynamicFormField;
