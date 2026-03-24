import { useEffect, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Button } from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxDatePicker from '@components/PmxDatePicker';
import { UnitSelect } from '@components/UnitSelect';
import { setUpdateAvailability } from '@features/amtp-packet/slices';
import {
  ICreateSoldierFlagOut,
  ISoldierFlag,
  IUpdateSoldierFlagOut,
  useAddSoldierFlagMutation,
  useUpdateSoldierFlagMutation,
} from '@store/amap_ai/soldier_flag';
import { IUnitBrief } from '@store/amap_ai/units/models';
import { useGetUnitsQuery } from '@store/amap_ai/units/slices/unitsApiSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { ISoldierFlagOptionsMapping, MXAVAILABILITIES, SOLDIERFLAGTYPES } from '@utils/enums';

export interface IAddEditSoldierFlagDialogProps {
  soldierFlag: ISoldierFlag | null;
  open: boolean;
  handleClose: () => void;
  refetchSoldierFlags: () => void;
  isUnitFlag: boolean;
}

interface IEditSoldierFlagFormValues {
  flagType: string;
  flagInfo: string;
  unit: null | IUnitBrief | string;
  mxAvailability: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  noEndDate: boolean;
  remarks: string;
}

const AddEditSoldierFlagDialog = ({
  soldierFlag = null,
  open,
  handleClose,
  refetchSoldierFlags,
  isUnitFlag,
}: IAddEditSoldierFlagDialogProps) => {
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);
  const dispatch = useAppDispatch();
  const { data: units, isSuccess } = useGetUnitsQuery({
    role: 'Manager',
  });
  const [createSoldierFlag, { isLoading: createLoading }] = useAddSoldierFlagMutation();
  const [updateSoldierFlag, { isLoading: updateLoading }] = useUpdateSoldierFlagMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IEditSoldierFlagFormValues>({
    defaultValues: {
      flagType: soldierFlag?.flagType ?? '',
      flagInfo: soldierFlag?.flagInfo,
      unit: units?.find((unit) => unit.uic === soldierFlag?.unitUic) ?? null,
      mxAvailability: soldierFlag?.mxAvailability ?? '',
      startDate: soldierFlag ? dayjs(soldierFlag.startDate) : null,
      endDate: soldierFlag ? dayjs(soldierFlag.endDate) : null,
      noEndDate: soldierFlag?.endDate ? soldierFlag.endDate.length == 0 : true,
      remarks: soldierFlag?.flagRemarks ?? '',
    },
  });

  const selectedFlagType = watch('flagType');
  const noEndDate = watch('noEndDate');

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const onSubmitAddEditSoldierFlag = async (formData: IEditSoldierFlagFormValues) => {
    try {
      if (soldierFlag) {
        const editSoldierFlagPayload: IUpdateSoldierFlagOut = {
          flag_type: formData.flagType,
          admin_flag_info: formData.flagType === SOLDIERFLAGTYPES.ADMIN ? formData.flagInfo : undefined,
          profile_flag_info: formData.flagType === SOLDIERFLAGTYPES.PROFILE ? formData.flagInfo : undefined,
          tasking_flag_info: formData.flagType === SOLDIERFLAGTYPES.TASKING ? formData.flagInfo : undefined,
          unit_position_flag_info: formData.flagType === SOLDIERFLAGTYPES.UNITORPOS ? formData.flagInfo : undefined,
          mx_availability: formData.mxAvailability,
          start_date: formData.startDate?.format('YYYY-MM-DD') ?? undefined,
          end_date: !formData.noEndDate && formData.endDate ? formData.endDate.format('YYYY-MM-DD') : undefined,
          flag_remarks: formData.remarks,
        };

        await updateSoldierFlag({ soldier_flag_id: soldierFlag.id, updateData: editSoldierFlagPayload })
          .then(() => {
            reset();
            refetchSoldierFlags();
            handleClose();
          })
          .then(() => {
            dispatch(setUpdateAvailability(true));
          });
      } else {
        let soldier_id: string | undefined = undefined;
        let unit_uic: string | undefined = undefined;

        if (formData.flagType !== SOLDIERFLAGTYPES.UNITORPOS) {
          soldier_id = maintainer?.id ?? '1234567890';
        } else {
          if (typeof formData.unit === 'string') {
            unit_uic = formData.unit;
          } else {
            unit_uic = formData.unit?.uic ?? undefined;
          }
        }

        const addSoldierFlagPayload: ICreateSoldierFlagOut = {
          soldier_id: soldier_id,
          unit_uic: unit_uic,
          flag_type: formData.flagType,
          admin_flag_info: formData.flagType === SOLDIERFLAGTYPES.ADMIN ? formData.flagInfo : undefined,
          profile_flag_info: formData.flagType === SOLDIERFLAGTYPES.PROFILE ? formData.flagInfo : undefined,
          tasking_flag_info: formData.flagType === SOLDIERFLAGTYPES.TASKING ? formData.flagInfo : undefined,
          unit_position_flag_info: formData.flagType === SOLDIERFLAGTYPES.UNITORPOS ? formData.flagInfo : undefined,
          mx_availability: formData.mxAvailability,
          start_date: formData.startDate?.format('YYYY-MM-DD') ?? undefined,
          end_date: !formData.noEndDate && formData.endDate ? formData.endDate.format('YYYY-MM-DD') : undefined,
          flag_remarks: formData.remarks,
        };

        await createSoldierFlag({ creationData: addSoldierFlagPayload }).then(() => {
          reset();
          refetchSoldierFlags();
          handleClose();
        });
      }
    } catch (error) {
      console.error('Error Adding/Updating Soldier Flag', error);
      alert('An error occurred while adding/updating Soldier Flag. Please try again.');
    }
  };

  useEffect(() => {
    reset({
      flagType: soldierFlag?.flagType ?? '',
      flagInfo: soldierFlag?.flagInfo,
      unit: units?.find((unit) => unit.uic === soldierFlag?.unitUic) ?? null,
      mxAvailability: soldierFlag?.mxAvailability ?? '',
      startDate: soldierFlag ? dayjs(soldierFlag.startDate) : null,
      endDate: soldierFlag ? dayjs(soldierFlag.endDate) : null,
      noEndDate: soldierFlag?.endDate ? soldierFlag.endDate.length == 0 : true,
      remarks: soldierFlag?.flagRemarks ?? '',
    });
  }, [soldierFlag, open, units, reset]);

  const flagTypeOptions = useMemo(() => {
    if (soldierFlag) {
      return isUnitFlag
        ? [SOLDIERFLAGTYPES.UNITORPOS]
        : [SOLDIERFLAGTYPES.ADMIN, SOLDIERFLAGTYPES.OTHER, SOLDIERFLAGTYPES.PROFILE, SOLDIERFLAGTYPES.TASKING];
    } else {
      return Object.values(SOLDIERFLAGTYPES);
    }
  }, [soldierFlag, isUnitFlag]);

  return (
    <Dialog open={open} aria-label="Add/Edit Soldier Flag Dialog">
      <DialogTitle>Edit Flag</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmitAddEditSoldierFlag)}>
          <fieldset disabled={updateLoading || createLoading} style={{ border: 'none', padding: 0 }}>
            <Grid container sx={{ py: 2 }} spacing={4}>
              <Grid size={{ xs: 6 }}>
                <Controller
                  aria-label="Flag Type"
                  name="flagType"
                  control={control}
                  rules={{ required: 'Flag Type is required' }}
                  disabled={isUnitFlag}
                  render={({ field }) => (
                    <PmxDropdown
                      options={flagTypeOptions}
                      value={field.value}
                      shrinkLabel
                      label="Flag Type"
                      onChange={field.onChange}
                      error={!!errors.flagType}
                      helperText={errors.flagType ? errors.flagType.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Controller
                  aria-label="Flag Info"
                  name="flagInfo"
                  control={control}
                  rules={{ required: 'Flag Info is required' }}
                  render={({ field }) => (
                    <PmxDropdown
                      options={
                        // @ts-expect-error - The mapping will work as expected
                        selectedFlagType.length > 0 ? Object.values(ISoldierFlagOptionsMapping[selectedFlagType]) : []
                      }
                      value={field.value}
                      label="Flag Info"
                      onChange={field.onChange}
                      error={!!errors.flagInfo}
                      helperText={errors.flagInfo ? errors.flagInfo.message : ''}
                    />
                  )}
                />
              </Grid>
              {selectedFlagType === SOLDIERFLAGTYPES.UNITORPOS && (
                <Grid size={{ xs: 12 }}>
                  <Controller
                    aria-label="Unit Form"
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <UnitSelect
                        units={isSuccess ? units : []}
                        onChange={field.onChange}
                        value={field.value as IUnitBrief}
                        readOnly={false}
                        width="100%"
                        error={!!errors.unit}
                        helperText={errors.unit ? errors.unit.message : ''}
                        label="Unit"
                        disabled={!!soldierFlag}
                      />
                    )}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Controller
                  aria-label="MX Availability"
                  name="mxAvailability"
                  control={control}
                  rules={{ required: 'MX Availability is required' }}
                  render={({ field }) => (
                    <PmxDropdown
                      options={Object.values(MXAVAILABILITIES)}
                      value={field.value}
                      shrinkLabel
                      label="MX Availability"
                      onChange={field.onChange}
                      error={!!errors.mxAvailability}
                      helperText={errors.mxAvailability ? errors.mxAvailability.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box display={'flex'}>
                  <Controller
                    aria-label="start-date-controller"
                    name="startDate"
                    control={control}
                    rules={{ required: 'Start Date' }}
                    render={({ field }) => <PmxDatePicker label="Start Date" {...field} shrinkLabel />}
                  />
                  <Typography display="flex" alignItems={'center'} sx={{ px: 4 }}>
                    -
                  </Typography>
                  <Controller
                    aria-label="end-date-controller"
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <PmxDatePicker label="End Date" {...field} shrinkLabel disabled={noEndDate} />
                    )}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  aria-label="No End Date"
                  name="noEndDate"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      label="No End Date"
                      sx={{ pl: 1 }}
                      control={<Checkbox checked={field.value} onChange={field.onChange} />}
                    ></FormControlLabel>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  aria-label="Remarks"
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      multiline
                      label="Remarks"
                      value={field.value}
                      fullWidth
                      minRows={2}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </fieldset>
          <DialogActions sx={{ pr: 0, pt: 4 }}>
            <Button variant="outlined" onClick={handleClose} color="primary" size="large">
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              size="large"
              startIcon={
                (createLoading || updateLoading) && (
                  <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                )
              }
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditSoldierFlagDialog;
