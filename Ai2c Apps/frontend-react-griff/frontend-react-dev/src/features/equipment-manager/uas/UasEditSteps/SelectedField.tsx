import React, { useEffect } from 'react';

import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from '@mui/material';

import { UasType } from '@store/griffin_api/uas/models/IUAS';

import { useUasMultiStepData } from './MultiStepContext';

export enum UasEditStepsEnum {
  SELECT = 'Select Fields',
  STATUS = 'Edit {TODO: type} status',
  PERIOD = 'Edit Period Hours',
  LOCATION = 'Edit Location',
  REMARKS = 'Add Remarks',
  REVIEW = 'Review Changes',
}

interface Props {
  steps: UasEditStepsEnum[];
  setSteps: React.Dispatch<React.SetStateAction<UasEditStepsEnum[]>>;
  uasType: UasType;
}

/**
 * Initial selection field step for stepper
 * @param {UasEditStepsEnum[]} steps - that user can select
 * @param {React.Dispatch<React.SetStateAction<UasEditStepsEnum[]>>} setSteps - state setting function
 * @param {uasType} UasType - Uav or Uac
 * @return React.ReactNode
 */
export const SelectFieldsStep: React.FC<Props> = (props: Props): React.ReactNode => {
  const { steps, setSteps, uasType } = props;
  const { setIsNextReady } = useUasMultiStepData();

  const [selectedSteps, setSelectedSteps] = React.useState({
    status: steps.includes(UasEditStepsEnum.STATUS),
    period: steps.includes(UasEditStepsEnum.PERIOD),
    location: steps.includes(UasEditStepsEnum.LOCATION),
    remarks: steps.includes(UasEditStepsEnum.REMARKS),
  });

  useEffect(() => {
    setIsNextReady(steps.length > 2);
  }, [setIsNextReady, steps]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedSteps({
      ...selectedSteps,
      [event.target.name]: event.target.checked,
    });

    const step = UasEditStepsEnum[event.target.name.toUpperCase() as keyof typeof UasEditStepsEnum];
    if (event.target.checked) {
      setSteps((prev) => {
        const updatedSteps = prev.concat(step);
        return Object.values(UasEditStepsEnum).filter((item) => updatedSteps.includes(item));
      });
    } else {
      setSteps((prev) => prev.filter((item) => item !== step));
    }
  };

  return (
    <Box>
      <Typography sx={{ p: 2 }}>Select which fields you want to edit.</Typography>
      <FormControl sx={{ ml: 4 }} component="fieldset" variant="standard">
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={selectedSteps.status} onChange={handleChange} name="status" />}
            label={`${uasType === 'Uav' ? 'UAV' : 'Operational Readiness'} Status`}
          />
          {uasType === 'Uav' && (
            <FormControlLabel
              control={<Checkbox checked={selectedSteps.period} onChange={handleChange} name="period" />}
              label="Period Hrs"
            />
          )}
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
