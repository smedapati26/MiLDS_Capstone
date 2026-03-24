import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { IconButton, Stack, Typography } from '@mui/material';

import { titlecaseAcronym } from '@ai2c/pmx-mui/helpers/titlecase';

import { useFormLogoImage } from '@features/task-forces/hooks/useFormLogoImage';

import { ILocation } from '@store/griffin_api/auto_dsr/models';
import { useGetUserQuery } from '@store/griffin_api/users/slices';

import { LogoImage } from './create-stepper/LogoImage';

// Gray Pipe separator
export const VerticalPipe = () => <Typography color="text.secondary">|</Typography>;

/** TaskforceLogoHeading Props */
export type Props = {
  owner: string | undefined;
  logoUrl: string | null;
  name: string;
  slogan: string;
  shortName: string;
  echelon: string;
  location: ILocation | undefined;
  startDate: string;
  endDate: string;
};

/**
 * TaskforceLogoHeadingFormWrapper Functional Component
 *
 * Initialize TaskforceLogoHeading with form data
 */
export const TaskforceLogoHeadingFormWrapper: React.FC = () => {
  // Form Values
  const { getValues, setValue } = useFormContext();

  const ownerId = getValues('ownerId');
  const { data: owner } = useGetUserQuery({ userId: ownerId }, { skip: !ownerId });

  // Taskforce Form State
  const dataURL = useFormLogoImage('logo');

  useEffect(() => {
    if (dataURL) {
      setValue('logo', dataURL);
    }
  }, [dataURL, setValue]);

  return (
    <TaskforceLogoHeading
      owner={owner?.rankAndName}
      logoUrl={dataURL}
      name={getValues('name')}
      slogan={getValues('slogan')}
      shortName={getValues('shortname')}
      echelon={getValues('echelon')}
      location={getValues('location')}
      startDate={getValues('tfDateRange.startDate')}
      endDate={getValues('tfDateRange.endDate')}
    />
  );
};

/**
 * TaskforceLogoHeading Functional Component
 *
 * Displays Taskforce Logo Heading box with prop data
 */
export const TaskforceLogoHeading: React.FC<Props> = (props) => {
  // Prop data for form
  const { owner, logoUrl, name, slogan, shortName, echelon, location, startDate, endDate } = props;

  return (
    <Stack direction="row" spacing={4} alignItems="center" mb={1}>
      {/** Logo Image; ELSE Taskforce name to acronym */}
      <IconButton component="span" sx={{ width: 100, height: 100 }}>
        <label htmlFor="logo-upload-input" aria-label="Logo Upload">
          <LogoImage dataURL={logoUrl} alt={titlecaseAcronym(name)} />
        </label>
      </IconButton>
      {/** Text Stack */}
      <Stack direction="column" gap={3}>
        <Typography variant="h6">{name}</Typography>
        <Stack direction="row" gap={2}>
          <Typography>{shortName}</Typography>
          <VerticalPipe />
          <Typography>{echelon}</Typography>
          {location && (
            <>
              <VerticalPipe />
              <Typography>{location?.name}</Typography>
            </>
          )}
        </Stack>
        <Stack direction="row" gap={2}>
          <Typography>
            {startDate} – {endDate}
          </Typography>
          {owner && (
            <>
              <VerticalPipe />
              <Typography>{owner}</Typography>
            </>
          )}
          {location && (
            <>
              <VerticalPipe />
              <Typography>{location?.code}</Typography>
            </>
          )}
        </Stack>
        <Typography>{slogan}</Typography>
      </Stack>
    </Stack>
  );
};
