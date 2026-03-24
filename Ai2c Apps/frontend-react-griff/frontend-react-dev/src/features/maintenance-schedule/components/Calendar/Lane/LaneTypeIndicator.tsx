import React from 'react';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';

/**
 * Props for the LaneTypeIndicator component.
 */
export type Props = {
  isInternal: boolean;
  isContractor: boolean;
};

/**
 * A React functional component that renders a lane type indicator.
 * The indicator's border color and diagonal lines are determined by the `isContractor` and `isInternal` props.
 *
 * @component
 * @param {object} props - The component props.
 * @param {boolean} props.isInternal - Determines the spacing of the diagonal lines.
 * @param {boolean} props.isContractor - Determines the border color of the indicator.
 * @returns {JSX.Element} The rendered lane type indicator component.
 */
const LaneTypeIndicator: React.FC<Props> = (props) => {
  const { isInternal, isContractor } = props;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Border color determined by is Contractor or Army
  const contractorBorderColor = isDarkMode ? theme.palette.primary?.l40 : theme.palette.primary?.d40;
  const typeIndicatorBackgroundColor = isContractor ? contractorBorderColor : theme.palette.graph?.green;

  return (
    <Box
      data-testid="lane-type-indicator"
      sx={{
        width: '6px',
        backgroundColor: 'transparent',
        border: `1.5px solid ${typeIndicatorBackgroundColor}`,
        backgroundPosition: '0 0, 0 0, 100% 0, 0 100%',
        backgroundSize: '5px 100%, 100% 5px, 5px 100% , 100% 5px',
        backgroundRepeat: 'no-repeat',
        // Diagonal lines
        backgroundImage: `
        repeating-linear-gradient(-45deg, ${typeIndicatorBackgroundColor}, ${typeIndicatorBackgroundColor} 1.5px, transparent 1.5px, transparent ${!isInternal ? '5px' : '1.5px'}), // left, 1.5px is the width of the diagonal lines, 5px is space between each diagonal line
        repeating-linear-gradient(-135deg, transparent, transparent 0, transparent 0, transparent 0), // top
        repeating-linear-gradient(-225deg, transparent, transparent 0, transparent 0, transparent 0), // right
        repeating-linear-gradient(-315deg, transparent, transparent 0, transparent 0, transparent 0) // bottom`,
      }}
    />
  );
};

export default LaneTypeIndicator;
