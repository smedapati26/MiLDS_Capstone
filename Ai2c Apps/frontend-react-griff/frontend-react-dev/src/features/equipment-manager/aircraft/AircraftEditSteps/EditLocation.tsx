import React, { FunctionComponent } from 'react';

import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';

import LocationDropdown from '@components/dropdowns/LocationDropdown';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

/* Props for the step component. */
interface Props {
  location: IAutoDsrLocation | null;
  setLocation: React.Dispatch<React.SetStateAction<IAutoDsrLocation | null>>;
  autoSync: { [sync: string]: boolean };
  setAutoSync: React.Dispatch<React.SetStateAction<{ [sync: string]: boolean }>>;
}

/**
 * A functional component that acts as a form for the Edit Aircraft Status step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const EditLocationStep: FunctionComponent<Props> = (props: Props) => {
  const { location, setLocation, autoSync, setAutoSync } = props;

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box width="100%">
      <Typography sx={{ pt: 1, pb: 5 }}>Select a location to assign aircraft.</Typography>
      <LocationDropdown
        onChange={(e) => {
          setLocation(e);
        }}
        sx={{ width: '100%' }}
        shrink={true}
        defaultValue={location}
      />
      <FormControlLabel
        sx={{ pl: 1, pt: 2 }}
        control={
          <Checkbox
            checked={autoSync.location}
            onChange={(e) => setAutoSync((prev) => ({ ...prev, location: e.target.checked }))}
          />
        }
        label="Auto-sync data"
      />
    </Box>
  );
};

export default EditLocationStep;
