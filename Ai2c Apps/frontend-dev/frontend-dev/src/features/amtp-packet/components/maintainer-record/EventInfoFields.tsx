import { useEffect } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { Divider, Grid, TextField, Typography } from '@mui/material';

import { Column, PmxTable } from '@ai2c/pmx-mui';

import { PmxDropdown, PmxMultiSelect } from '@components/dropdowns';
import PmxDatePicker from '@components/PmxDatePicker';
import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';
import { UnitSelect } from '@components/UnitSelect';
import { ISoldier, useLazyGetUnitSoldiersQuery } from '@store/amap_ai/soldier';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';

import { IEventFormValues, IMultiEventForm } from './AddEditEventForm';
import DynamicFormField from './DynamicFormField';
import { IMassEventFormValues } from './MassEventDialog';

interface EventInfoFieldsProps {
  formType: string;
  control: Control<IMassEventFormValues, null>;
  errors: FieldErrors<IMassEventFormValues>;
  setValue: UseFormSetValue<IMassEventFormValues>;
  watch: UseFormWatch<IMassEventFormValues>;
  selectedSoldiers: ISoldier[] | undefined;
  setSelectedSoldiers: (values: ISoldier[]) => void;
  selectedUnit: IUnitBrief | undefined;
  setSelectedUnit: (value: IUnitBrief) => void;
}

export type IEventSoldier = ISoldier & { result: string; unit: string; comments: string };

const EventInfoFields = ({
  formType,
  control,
  errors,
  setValue,
  watch,
  selectedUnit,
  setSelectedUnit,
  selectedSoldiers,
  setSelectedSoldiers,
}: EventInfoFieldsProps) => {
  const { data: units } = useGetUnitsQuery({});
  const [fetchSoldiers, { data, isFetching }] = useLazyGetUnitSoldiersQuery();
  const unitSoldiers = data?.soldiers ?? [];
  const unit = data?.unit ?? null;
  console.log(unit, 'UNIT');

  const handleUnitOnChange = (selection: IUnitBrief) => {
    setSelectedUnit(selection);
  };

  useEffect(() => {
    if (selectedUnit) fetchSoldiers({ uic: selectedUnit.uic, type: 'all_maintainers' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit]);
  return (
    <>
      <DynamicFormField
        formType={formType}
        control={control as Control<IMultiEventForm | IEventFormValues | IMassEventFormValues, null>}
        errors={errors}
        awardGridSize={6}
        isMass
      />
      <Grid size={{ xs: formType !== 'Training' ? 6 : 4 }}>
        <Controller
          name="eventDate"
          control={control}
          rules={{ required: 'Event Date is required' }}
          render={({ field }) => (
            <PmxDatePicker
              {...field}
              label="Event Date*"
              aria-label="event-date"
              error={!!errors.eventDate}
              helperText={errors.eventDate?.message}
            />
          )}
        />
      </Grid>
      {formType === 'Training' && (
        <Grid size={{ xs: 4 }}>
          <Controller
            name="eventResult"
            control={control}
            rules={{ required: 'Event Result is required' }}
            render={({ field }) => (
              <PmxDropdown
                options={[
                  { label: 'Go', value: 'GO' },
                  { label: 'No-Go', value: 'NOGO' },
                  { label: 'N/A', value: 'NA' },
                ]}
                value={field.value}
                label="Event Result*"
                onChange={(value) => {
                  field.onChange(value);
                  const currentSoldierStatuses = watch('soldierStatuses') || [];
                  if (currentSoldierStatuses) {
                    setValue(
                      'soldierStatuses',
                      currentSoldierStatuses.map((soldier) => {
                        return {
                          ...soldier,
                          result: (value as string) ?? 'N/A',
                          unit: soldier?.unit ?? unit?.name ?? 'N/A',
                          comments: soldier?.comments ?? '',
                        };
                      }),
                    );
                  }
                }}
                error={!!errors.eventResult}
                helperText={errors.eventResult?.message}
              />
            )}
          />
        </Grid>
      )}
      <Grid size={{ xs: 12 }} mt={4} mb={4}>
        <Divider />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography paragraph aria-label="soldier-header">
          Soldier Selection
        </Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
        <UnitSelect
          units={units ?? []}
          showShortName
          onChange={handleUnitOnChange}
          value={selectedUnit}
          readOnly={false}
          width="100%"
          label="Unit"
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <PmxMultiSelect
          options={
            unitSoldiers?.map((x: ISoldier) => ({
              label: `${x.rank} ${x.firstName} ${x.lastName}`,
              value: x.userId,
            })) || []
          }
          disabled={!selectedUnit}
          values={selectedSoldiers?.map((x) => x.userId) as string[]}
          label="Unit Soldiers*"
          onChange={(value) => {
            const currentSoldierStatuses = watch('soldierStatuses') || [];
            const selected = unitSoldiers?.filter((soldier) => value.includes(soldier.userId)) || [];
            setSelectedSoldiers(selected);
            setValue(
              'soldierStatuses',
              selected.map((soldier) => {
                const existingSoldier = currentSoldierStatuses.find((s) => s.userId === soldier.userId);
                return {
                  ...soldier,
                  result: watch('eventResult') ?? 'N/A',
                  unit: existingSoldier?.unit ?? data?.unit?.name ?? selectedUnit?.uic ?? '--',
                  comments: existingSoldier?.comments ?? watch('comments'),
                };
              }),
            );
          }}
          loading={isFetching}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="comments"
          control={control}
          render={({ field }) => (
            <TextField
              value={field.value}
              aria-label="Event Comments"
              label="Event Comments"
              rows={4}
              multiline
              fullWidth
              onChange={(e) => {
                field.onChange(e);
                const currentSoldierStatuses = watch('soldierStatuses') || [];
                setValue(
                  'soldierStatuses',
                  currentSoldierStatuses.map((soldier) => {
                    return {
                      ...soldier,
                      result: soldier?.result ?? watch('eventResult'),
                      unit: soldier?.unit ?? unit?.name ?? 'N/A',
                      comments: e.target.value,
                    };
                  }),
                );
              }}
              error={!!errors.comments}
              helperText={errors.comments?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="soldierStatuses"
          control={control}
          render={({ field }) => (
            <PmxTable
              columns={
                [
                  {
                    field: 'firstName',
                    header: 'Soldier',
                    renderCell: (_val, row) => (
                      <Typography>
                        {row.rank} {row.firstName} {row.lastName}
                      </Typography>
                    ),
                  },
                  { field: 'userId', header: 'DOD ID' },
                  {
                    field: 'unit',
                    header: 'Unit',
                    renderCell: (val) => <span>{units?.filter((x) => x.uic === val)[0]?.shortName}</span>,
                  },
                  ...(formType !== 'Award' && formType !== 'TCS'
                    ? [
                        {
                          field: 'result',
                          header: 'Result',
                          renderCell: (_val: string, row: IEventSoldier) => (
                            <PmxToggleBtnGroup
                              buttons={[
                                { label: 'GO', value: 'GO' },
                                { label: 'NO-GO', value: 'NOGO' },
                                ...(formType === 'Training' ? [{ label: 'N/A', value: 'N/A' }] : []),
                              ]}
                              selected={row.result}
                              onChange={(value) => {
                                field.onChange(
                                  // eslint-disable-next-line sonarjs/no-nested-functions
                                  field.value.map((soldier) =>
                                    soldier.userId === row.userId ? { ...soldier, result: value } : soldier,
                                  ),
                                );
                              }}
                            />
                          ),
                        },
                      ]
                    : []),
                  {
                    field: 'comments',
                    header: 'Comments',
                    renderCell: (val, row) => (
                      <TextField
                        value={val}
                        onChange={(event) => {
                          const newComments = event.target.value;

                          field.onChange(
                            // eslint-disable-next-line sonarjs/no-nested-functions
                            field.value.map((soldier) =>
                              soldier.userId === row.userId ? { ...soldier, comments: newComments } : soldier,
                            ),
                          );
                        }}
                      />
                    ),
                  },
                ] as Column<IEventSoldier>[]
              }
              data={field.value || []}
              getRowId={(data) => data?.userId}
            />
          )}
        />
      </Grid>
    </>
  );
};

export default EventInfoFields;
