import React from 'react';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { ReturnByType } from '@store/griffin_api/aircraft/slices';

interface PhaseFlowToggleProps {
  abbreviated?: boolean;
  returnBy: ReturnByType;
  setReturnBy: (returnBy: ReturnByType) => void;
  'data-testid': string;
  sx?: object;
}

const PhaseFlowToggle: React.FC<PhaseFlowToggleProps> = ({
  returnBy,
  setReturnBy,
  abbreviated = false,
  'data-testid': dataTestId = 'return-by-toggle',
  sx = {},
}: PhaseFlowToggleProps): React.ReactElement => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newReturnBy: ReturnByType) => {
    if (newReturnBy) {
      setReturnBy(newReturnBy);
    }
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={returnBy}
      exclusive
      onChange={handleChange}
      aria-label="return-by-toggle"
      data-testid={dataTestId}
      sx={{
        display: 'inline-flex',
        ...sx,
      }}
    >
      <ToggleButton
        sx={abbreviated ? { flex: '1 1 0', width: 'auto' } : { minWidth: '131px' }}
        data-testid="unit-toggle-btn"
        value={'unit' as ReturnByType}
      >
        unit
      </ToggleButton>
      <ToggleButton
        sx={abbreviated ? { flex: '1 1 0', width: 'auto' } : { minWidth: '131px' }}
        data-testid="sub-toggle-btn"
        value={'subordinates' as ReturnByType}
      >
        {abbreviated ? 'subord.' : 'subordinate'}
      </ToggleButton>
      <ToggleButton
        sx={abbreviated ? { flex: '1 1 0', width: 'auto' } : { minWidth: '131px' }}
        data-testid="mds-toggle-btn"
        value={'model' as ReturnByType}
      >
        {abbreviated ? 'mds' : 'model'}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default PhaseFlowToggle;
