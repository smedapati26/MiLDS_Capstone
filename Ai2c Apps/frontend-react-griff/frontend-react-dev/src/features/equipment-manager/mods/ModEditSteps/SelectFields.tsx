import React, { FunctionComponent } from 'react';

import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from '@mui/material';

// Enum for Mod Edit Steps
export enum ModEditStepsEnum {
  SELECT = 'Select Fields',
  SERIAL = 'Edit Modification Serial Number',
  AIRCRAFT = 'Assigned Aircraft',
  STATUS = 'Variable and Status',
  LOCATION = 'Edit Location',
  REMARKS = 'Add Remarks',
  REVIEW = 'Review Changes',
}

/* Props for the step component. */
interface Props {
  steps: ModEditStepsEnum[];
  setSteps: React.Dispatch<React.SetStateAction<ModEditStepsEnum[]>>;
}

/**
 * A functional component that acts as a form for the Select Fields step in Mod Multi Edit form.
 *
 * @component * @returns {JSX.Element} The rendered component.
 */
const SelectFieldsStep: FunctionComponent<Props> = (props: Props) => {
  const { steps, setSteps } = props;

  const [selectedSteps, setSelectedSteps] = React.useState({
    serial: steps.includes(ModEditStepsEnum.SERIAL),
    aircraft: steps.includes(ModEditStepsEnum.AIRCRAFT),
    status: steps.includes(ModEditStepsEnum.STATUS),
    remarks: steps.includes(ModEditStepsEnum.REMARKS),
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSteps({
      ...selectedSteps,
      [event.target.name]: event.target.checked,
    });

    const step = ModEditStepsEnum[event.target.name.toUpperCase() as keyof typeof ModEditStepsEnum];
    if (event.target.checked) {
      setSteps((prev) => {
        const updatedSteps = prev.concat(step);
        return Object.values(ModEditStepsEnum).filter((item) => updatedSteps.includes(item));
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
            control={<Checkbox checked={selectedSteps.serial} onChange={handleChange} name="serial" />}
            label="Serial Numbers"
          />

          <FormControlLabel
            control={<Checkbox checked={selectedSteps.aircraft} onChange={handleChange} name="aircraft" />}
            label="Assigned Aircraft"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedSteps.status} onChange={handleChange} name="status" />}
            label="Variable and Status"
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
