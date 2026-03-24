import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { Grid, Stack, Typography } from '@mui/material';

import { getEchelonOptions } from '@ai2c/pmx-mui';

import {
  RHFDateRangePicker,
  RHFImageUploader,
  RHFLocationDropdown,
  RHFProgressIndicator,
  RHFTextField,
} from '@components/react-hook-form';
import { RHFAutocomplete } from '@components/react-hook-form/RHFAutocomplete';
import { useFormLogoImage } from '@features/task-forces/hooks/useFormLogoImage';
import { useOwnerOptions } from '@features/task-forces/hooks/useOwnerOptions';
import { IOptionType } from '@models/IOptions';

import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

import { LogoImage } from '../LogoImage';

/**
 * Step 1 - Task Force Details
 */

type Props = {
  includeCreatePrompts?: boolean;
};

export const Step1TaskForceDetails: React.FC<Props> = ({ includeCreatePrompts = true }) => {
  const appUser = useAppSelector(selectAppUser);
  const { setValue } = useFormContext();
  const logo = useFormLogoImage('logo');
  const ownerOptions = useOwnerOptions();

  // Updating default values
  useEffect(() => {
    if (ownerOptions) {
      setValue('ownerId', appUser.userId as string);
    }

    if (logo) {
      setValue('logo', logo);
    }
  }, [appUser, setValue, logo, ownerOptions]);

  return (
    <Stack gap={3}>
      {/** Image Uploader */}
      <Stack direction="row" gap={3} justifyContent="space-between" sx={{ pb: 1 }}>
        <Stack gap={3}>
          {!logo && includeCreatePrompts ? (
            <RHFImageUploader field="logo" text="Upload task force logo." />
          ) : (
            <LogoImage dataURL={logo} alt="Logo Uploader" />
          )}
          {includeCreatePrompts && <Typography>Enter task force details</Typography>}
        </Stack>
        {includeCreatePrompts && <RHFProgressIndicator />}
      </Stack>
      {/** Details */}
      <Stack gap={3}>
        <Grid container spacing={3}>
          {/** Name */}
          <Grid item xs={12} md={6}>
            <RHFTextField field="name" label="Task Force Name" required />
          </Grid>
          {/** Echelon */}
          <Grid item xs={12} md={6}>
            <RHFAutocomplete
              field="echelon"
              label="Echelon"
              options={getEchelonOptions() as IOptionType<string>[]}
              required
            />
          </Grid>
        </Grid>
      </Stack>

      <Grid container spacing={3}>
        {/** Short Name */}
        <Grid item xs={12} md={6}>
          <RHFTextField field="shortname" label="Short Name" required />
        </Grid>
        {/** Nickname */}
        <Grid item xs={12} md={6}>
          <RHFTextField field="nickname" label="Nick Name" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/** Start & Stop Date Range */}
        <Grid item xs={12} md={4}>
          <RHFDateRangePicker field="tfDateRange" startLabel="TF Start Date" endLabel="TF End Date" required />
        </Grid>

        {/** Location */}
        <Grid item xs={12} md={4}>
          <RHFLocationDropdown field="location" label="Location" required />
        </Grid>
        {/** Owner */}
        <Grid item xs={12} md={4}>
          <RHFAutocomplete field="ownerId" label="Owner" options={ownerOptions} required />
        </Grid>
      </Grid>
      {/** Slogan */}
      <RHFTextField field="slogan" label="Slogan" multiline rows={4} />
    </Stack>
  );
};
