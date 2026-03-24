import React from 'react';

import { Box, Skeleton, Typography } from '@mui/material';

/* Props for the AirframeCrewStat component. */
interface AirframeCrewStatProps {
  isLoading: boolean;
  title: string;
  rateChange: number;
  rate: number;
  authorizedCrew: number;
  totalCrew: number;
}

/**
 * Component to display the airframe statistics.
 *
 * @component
 * @param {AirframeCrewStatProps} props - The properties for the AirframeCrewStat component.
 * @param {boolean} props.isLoading - Flag to indicate if the data is still loading.
 * @param {string} props.title - The title of the stat card.
 * @param {string} props.rateChange - The rate change information.
 * @param {string} props.rate - The current rate.
 * @param {number} props.authorizedCrew - The number of authorized crew members.
 * @param {number} props.totalCrew - The total number of crew members.
 * @returns {JSX.Element} The rendered AirframeCrewStat component.
 */
const AirframeCrewStat: React.FC<AirframeCrewStatProps> = (props) => {
  const { isLoading, title, rateChange, rate, authorizedCrew, totalCrew } = props;

  if (isLoading)
    return <Skeleton data-testid="skeleton" variant="rectangular" sx={{ minHeight: '200px', width: '100%' }} />;

  return (
    <Box id="stat-card">
      <Typography variant="h3">{title}</Typography>
      <Typography>{rateChange}</Typography>
      <Typography>{rate}</Typography>
      <Typography>
        {authorizedCrew} / {totalCrew}
      </Typography>
    </Box>
  );
};

export default AirframeCrewStat;
