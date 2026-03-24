import { useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Controller, useForm } from 'react-hook-form';

import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';

import { PmxDropdown } from '@components/dropdowns';
import PmxDatePicker from '@components/PmxDatePicker';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import { IUpdateSoldierOut, useUpdateSoldierMutation } from '@store/amap_ai/soldier';
import { IAppUser } from '@store/amap_ai/user/models';
import { MONTHS } from '@utils/enums';

interface ISoldierFormValues {
  primaryMos: string;
  allMosAndMl: { label: string; value: string }[];
  birthMonth: string;
  pv2: Dayjs | null;
  privateFirst: Dayjs | null;
  specialist: Dayjs | null;
  sergeant: Dayjs | null;
  staffSergeant: Dayjs | null;
  sergeantFirst: Dayjs | null;
}

const SoldierEditDialog = ({
  open,
  soldier,
  handleClose,
  handleUpdate,
}: {
  open: boolean;
  soldier: IAppUser;
  handleClose: () => void;
  handleUpdate: () => void;
}) => {
  const [updateSoldier, { isLoading }] = useUpdateSoldierMutation();
  const { data: allMOS, isLoading: loadingMos } = useGetAllMOSQuery();

  const primaryMos = typeof soldier?.primaryMos === 'string' ? soldier.primaryMos : undefined;
  const allMosAndMl = Object.keys(soldier?.allMosAndMl ?? {})
    .map((key) => ({
      label: key,
      value: key,
    }))
    .filter((item) => item.value !== primaryMos);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ISoldierFormValues>({
    defaultValues: {
      primaryMos,
      allMosAndMl,
      birthMonth: soldier?.birthMonth ?? undefined,
      pv2: soldier?.pv2Dor ? dayjs(soldier.pv2Dor) : null,
      privateFirst: soldier?.pfcDor ? dayjs(soldier.pfcDor) : null,
      specialist: soldier?.spcDor ? dayjs(soldier.spcDor) : null,
      sergeant: soldier?.sgtDor ? dayjs(soldier.sgtDor) : null,
      staffSergeant: soldier?.ssgDor ? dayjs(soldier.ssgDor) : null,
      sergeantFirst: soldier?.sfcDor ? dayjs(soldier.sfcDor) : null,
    },
  });

  const onSubmit = async (formData: ISoldierFormValues) => {
    try {
      const payload: IUpdateSoldierOut = {
        user_id: soldier.userId,
        primary_mos: formData.primaryMos,
        additional_mos: formData?.allMosAndMl?.map((x) => x.value) ?? [],
        birth_month: formData?.birthMonth ?? null,
        pv2_dor: formData?.pv2 ? dayjs(formData.pv2).format('YYYY-MM-DD') : null,
        pfc_dor: formData?.privateFirst ? dayjs(formData.privateFirst).format('YYYY-MM-DD') : null,
        spc_dor: formData?.specialist ? dayjs(formData.specialist).format('YYYY-MM-DD') : null,
        sgt_dor: formData?.sergeant ? dayjs(formData.sergeant).format('YYYY-MM-DD') : null,
        ssg_dor: formData?.staffSergeant ? dayjs(formData.staffSergeant).format('YYYY-MM-DD') : null,
        sfc_dor: formData?.sergeantFirst ? dayjs(formData.sergeantFirst).format('YYYY-MM-DD') : null,
      };

      await updateSoldier(payload).then(() => {
        reset();
        handleUpdate();
      });
    } catch (error) {
      console.error('Error updating soldier:', error);
      alert('An error occurred while updating soldier information. Please try again.');
    }
  };

  useEffect(() => {
    reset({
      primaryMos: typeof soldier?.primaryMos === 'string' ? soldier.primaryMos : 'None',
      allMosAndMl: Object.keys(soldier?.allMosAndMl ?? {}).map((key) => ({
        label: key,
        value: key,
      })),
      birthMonth: soldier?.birthMonth ?? undefined,
      pv2: soldier?.pv2Dor ? dayjs(soldier.pv2Dor) : null,
      privateFirst: soldier?.pfcDor ? dayjs(soldier.pfcDor) : null,
      specialist: soldier?.spcDor ? dayjs(soldier.spcDor) : null,
      sergeant: soldier?.sgtDor ? dayjs(soldier.sgtDor) : null,
      staffSergeant: soldier?.ssgDor ? dayjs(soldier.ssgDor) : null,
      sergeantFirst: soldier?.sfcDor ? dayjs(soldier.sfcDor) : null,
    });
  }, [soldier, open, reset]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>Edit Soldier Information</DialogTitle>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isLoading} style={{ border: 'none', padding: 0 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" fontWeight="bold">
                  Personnel Information
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="primaryMos"
                  control={control}
                  rules={{ required: 'Primary MOS is required' }}
                  render={({ field }) => (
                    <PmxDropdown
                      options={allMOS?.map((x: { mos: string }) => x.mos) ?? []}
                      value={field.value}
                      shrinkLabel
                      label="Primary MOS*"
                      onChange={field.onChange}
                      loading={loadingMos}
                      error={!!errors.primaryMos}
                      helperText={errors.primaryMos ? errors.primaryMos.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="allMosAndMl"
                  control={control}
                  render={({ field }) => (
                    <PmxDropdown
                      multiple
                      shrinkLabel
                      options={allMOS?.map((x: { mos: string }) => x.mos).filter((x: string) => x !== primaryMos) ?? []}
                      value={field.value.map((item) => item.value).filter((x: string) => x !== primaryMos)}
                      label="Additional MOS*"
                      onChange={(value: string | string[]) => {
                        if (Array.isArray(value)) {
                          const selectedOptions = value.map((val) => ({ label: val, value: val }));
                          field.onChange(selectedOptions);
                        } else {
                          field.onChange([{ label: value, value }]);
                        }
                      }}
                      loading={loadingMos}
                      error={!!errors.allMosAndMl}
                      helperText={errors.allMosAndMl ? errors.allMosAndMl.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="birthMonth"
                  control={control}
                  rules={{ required: 'Birth Month is required' }}
                  render={({ field }) => (
                    <PmxDropdown
                      options={Object.values(MONTHS)}
                      value={field.value}
                      shrinkLabel
                      label="Birth Month*"
                      onChange={field.onChange}
                      error={!!errors.birthMonth}
                      helperText={errors.birthMonth ? errors.birthMonth.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" fontWeight="bold">
                  Career Progression Date of Rank
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="pv2"
                  control={control}
                  render={({ field }) => <PmxDatePicker label="Private (PV2)" {...field} shrinkLabel />}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="privateFirst"
                  control={control}
                  render={({ field }) => <PmxDatePicker label="Private First Class" {...field} shrinkLabel />}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="specialist"
                  control={control}
                  render={({ field }) => <PmxDatePicker label="Specialist" {...field} shrinkLabel />}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="sergeant"
                  control={control}
                  render={({ field }) => <PmxDatePicker label="Sergeant" {...field} shrinkLabel />}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="staffSergeant"
                  control={control}
                  render={({ field }) => <PmxDatePicker label="Staff Sergeant" {...field} shrinkLabel />}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Controller
                  name="sergeantFirst"
                  control={control}
                  render={({ field }) => <PmxDatePicker label="Sergeant First Class" {...field} shrinkLabel />}
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
                isLoading && (
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

export default SoldierEditDialog;
