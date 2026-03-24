import React, { FunctionComponent } from 'react';

import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from '@mui/material';

// Enum for Aircraft Edit Steps
export enum AGSEEditStepsEnum {
  SELECT = 'Select Fields',
  STATUS = 'Edit Operational Readiness Status',
  LOCATION = 'Edit Location',
  REMARKS = 'Add Remarks',
  REVIEW = 'Review Changes',
}

/* Props for the step component. */
interface Props {
  steps: AGSEEditStepsEnum[];
  setSteps: React.Dispatch<React.SetStateAction<AGSEEditStepsEnum[]>>;
}

/**
 * A functional component that acts as a form for the Select Fields step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const SelectFieldsStep: FunctionComponent<Props> = (props: Props) => {
  const { steps, setSteps } = props;

  const [selectedSteps, setSelectedSteps] = React.useState({
    status: steps.includes(AGSEEditStepsEnum.STATUS),
    location: steps.includes(AGSEEditStepsEnum.LOCATION),
    remarks: steps.includes(AGSEEditStepsEnum.REMARKS),
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSteps({
      ...selectedSteps,
      [event.target.name]: event.target.checked,
    });

    const step = AGSEEditStepsEnum[event.target.name.toUpperCase() as keyof typeof AGSEEditStepsEnum];
    if (event.target.checked) {
      setSteps((prev) => {
        const updatedSteps = prev.concat(step);
        return Object.values(AGSEEditStepsEnum).filter((item) => updatedSteps.includes(item));
      });
    } else {
      setSteps((prev) => prev.filter((item) => item !== step));
    }
  };

  /* ***************************
    Component UI
    *************************** */
  return (
    <Box>
      <Typography sx={{ p: 2 }}>Select which fields you want to edit.</Typography>
      <FormControl sx={{ ml: 4 }} component="fieldset" variant="standard">
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={selectedSteps.status} onChange={handleChange} name="status" />}
            label="Operational Readiness Status"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedSteps.location} onChange={handleChange} name="location" />}
            label="Location"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedSteps.remarks} onChange={handleChange} name="remarks" />}
            label="Remarks"
          />
        </FormGroup>
      </FormControl>
    </Box>
  );
};

export default SelectFieldsStep;
