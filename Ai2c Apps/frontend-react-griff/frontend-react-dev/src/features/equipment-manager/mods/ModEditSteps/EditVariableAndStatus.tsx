import React, { FunctionComponent, useEffect, useMemo } from 'react';

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { TrackingVariableOptions } from '@store/griffin_api/mods/models';

import { getTrackingValueOptions } from '../helper';

/* Props for the step component. */
interface Props {
  trackingVariable: string | undefined;
  setTrackingVariable: React.Dispatch<React.SetStateAction<string | undefined>>;
  value: string | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
}

/**
 * A functional component that acts as a form for the Edit Variable and Status step in Mod Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const EditVariableAndStatusStep: FunctionComponent<Props> = (props: Props) => {
  const { trackingVariable, setTrackingVariable, value, setValue } = props;

  useEffect(() => {
    setValue('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingVariable]);

  const trackingValueOptions: string[] | undefined = useMemo(
    () => getTrackingValueOptions(trackingVariable),
    [trackingVariable],
  );

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box width="50%">
      <Typography sx={{ pt: 1, pb: 5 }}>Edit variable and status for selected modifications.</Typography>
      <Stack direction="row" spacing={3}>
        <FormControl fullWidth>
          <InputLabel shrink required id="tracking-var-selection-label">
            Tracking Variable
          </InputLabel>
          <Select
            label="Tracking Variable"
            labelId="tracking-var-selection-label"
            required
            notched
            size="small"
            value={trackingVariable ?? ''}
            onChange={(event) => setTrackingVariable(event.target.value as string)}
            inputProps={{
              'data-testid': 'tracking-var-select-input',
            }}
          >
            {Object.entries(TrackingVariableOptions).map(([key, { value, label }]) => (
              <MenuItem key={key} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {trackingValueOptions && (
        <Stack direction="row" spacing={3} sx={{ pt: 3 }}>
          <ToggleButtonGroup
            value={value ?? ''}
            exclusive
            onChange={(_, value) => value && setValue(value)}
            sx={{ width: '100%' }}
            size="small"
            data-testid="tracking-value-select"
          >
            {trackingValueOptions.map((value) => (
              <ToggleButton sx={{ width: '100%' }} key={value} value={value}>
                {value}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      )}
    </Box>
  );
};

export default EditVariableAndStatusStep;
