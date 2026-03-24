import React, { FunctionComponent } from 'react';

import { Box, TextField, Typography } from '@mui/material';

/* Props for the step component. */
interface Props {
  remarks: string;
  setRemarks: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * A functional component that acts as a form for the step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const AddRemarksStep: FunctionComponent<Props> = (props: Props) => {
  const { remarks, setRemarks } = props;

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box width="100%">
      <Typography sx={{ pt: 1, pb: 5 }}> Add remarks to aircraft.</Typography>
      <TextField
        id="add-remarks-textbox"
        data-testid="add-remarks-textbox"
        label="Remarks"
        multiline
        size="small"
        value={remarks}
        rows={3}
        sx={{ width: '100%' }}
        onChange={(e) => setRemarks(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ 'data-testid': 'add-remarks-textbox-input' }}
      />
    </Box>
  );
};

export default AddRemarksStep;
