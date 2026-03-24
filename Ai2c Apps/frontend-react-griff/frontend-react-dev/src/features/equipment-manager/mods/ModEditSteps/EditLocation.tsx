import React, { FunctionComponent } from 'react';

import { Box, Typography } from '@mui/material';

import LocationDropdown from '@components/dropdowns/LocationDropdown';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';

/* Props for the step component. */
interface Props {
  location: IAutoDsrLocation | null;
  setLocation: React.Dispatch<React.SetStateAction<IAutoDsrLocation | null>>;
}

/**
 * A functional component that acts as a form for the Edit Aircraft Status step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const EditLocationStep: FunctionComponent<Props> = (props: Props) => {
  const { location, setLocation } = props;

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box width="100%">
      <Typography sx={{ pt: 1, pb: 5 }}>Edit the location for all selected modifications.</Typography>
      <LocationDropdown
        onChange={(e) => {
          setLocation(e);
        }}
        sx={{ width: '100%' }}
        shrink={true}
        defaultValue={location}
      />
    </Box>
  );
};

export default EditLocationStep;
