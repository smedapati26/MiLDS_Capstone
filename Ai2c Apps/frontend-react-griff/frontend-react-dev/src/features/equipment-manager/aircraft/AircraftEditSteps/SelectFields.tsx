import React, { FunctionComponent } from 'react';

import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from '@mui/material';

// Enum for Aircraft Edit Steps
export enum AircraftEditStepsEnum {
  SELECT = 'Select Fields',
  STATUS = 'Edit Aircraft Status',
  LOCATION = 'Edit Location',
  REMARKS = 'Add Remarks',
  REVIEW = 'Review Changes',
}

/* Props for the step component. */
interface Props {
  steps: AircraftEditStepsEnum[];
  setSteps: React.Dispatch<React.SetStateAction<AircraftEditStepsEnum[]>>;
}

/**
 * A functional component that acts as a form for the Select Fields step in Aircraft Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const SelectFieldsStep: FunctionComponent<Props> = (props: Props) => {
  const { steps, setSteps } = props;

  const [selectedSteps, setSelectedSteps] = React.useState({
    status: steps.includes(AircraftEditStepsEnum.STATUS),
    location: steps.includes(AircraftEditStepsEnum.LOCATION),
    remarks: steps.includes(AircraftEditStepsEnum.REMARKS),
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSteps({
      ...selectedSteps,
      [event.target.name]: event.target.checked,
    });

    const step = AircraftEditStepsEnum[event.target.name.toUpperCase() as keyof typeof AircraftEditStepsEnum];
    if (event.target.checked) {
      setSteps((prev) => {
        const updatedSteps = prev.concat(step);
        return Object.values(AircraftEditStepsEnum).filter((item) => updatedSteps.includes(item));
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
            label="Aircraft Status"
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
