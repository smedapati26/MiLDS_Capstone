import React, { useState } from 'react';

import { Box, Skeleton, Tab, Tabs, Typography } from '@mui/material';

import { PmxModularGauge } from '@components/PmxGauge';

import { useGetLongevityQuery } from '@store/griffin_api/components/slices/componentsApi';

interface LongevityProps {
  tbo: number;
  flightHours: number;
  componentName?: string;
  selectedPart: string;
  uic: string;
}

export const Longevity: React.FC<LongevityProps> = ({ tbo, flightHours, componentName, selectedPart, uic }) => {
  const [selectedTab, setSelectedTab] = useState<'Unit' | 'Fleet'>('Unit');
  const {
    data: longevityData,
    isLoading,
    error,
  } = useGetLongevityQuery({
    uic,
    part_number: selectedPart,
  });

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', p: 2, height: '100%' }} data-testid="longevity-skeleton">
        <Tabs value={selectedTab} onChange={(_e, v) => setSelectedTab(v)}>
          <Tab label="UNIT" value="Unit" sx={{ width: '50%' }} />
          <Tab label="FLEET" value="Fleet" sx={{ width: '50%' }} />
        </Tabs>
        <Box sx={{ my: 2 }}>
          <Skeleton variant="rectangular" width={180} height={90} sx={{ mx: 'auto', borderRadius: 2 }} />
        </Box>
        <Skeleton width="60%" height={32} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton width="80%" height={24} sx={{ mx: 'auto' }} />
      </Box>
    );
  }

  // Error or no data state
  const isErrorOrNoData =
    error ||
    !longevityData ||
    longevityData.tbo === undefined ||
    longevityData.unit_average === undefined ||
    longevityData.fleet_average === undefined;

  if (isErrorOrNoData) {
    // Determine label for the value type
    let valueTypeLabel = 'TBO';
    if (longevityData?.value_type === 'maot') valueTypeLabel = 'MAOT';
    else if (selectedTab === 'Fleet') valueTypeLabel = 'Fleet Avg';

    return (
      <Box sx={{ textAlign: 'center', p: 2, height: '100%' }}>
        <Tabs value={selectedTab} onChange={(_e, v) => setSelectedTab(v)}>
          <Tab label="UNIT" value="Unit" sx={{ width: '50%' }} />
          <Tab label="FLEET" value="Fleet" sx={{ width: '50%' }} />
        </Tabs>
        <Box sx={{ my: 2 }}>
          <PmxModularGauge value={0} showAs="namedResult" width={300} height={120} data-testid="longevity-gauge" />
        </Box>
        <Typography
          sx={{
            mt: 2,
            color: 'text.primary',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          {valueTypeLabel} &mdash; flight hours
        </Typography>
        <Typography
          sx={{
            mt: 1,
            color: 'text.secondary',
            fontSize: '14px',
            lineHeight: 1.4,
          }}
        >
          No data has been found for selected part and/or model. Update selections and try again.
        </Typography>
      </Box>
    );
  }
  const mergedLongevityData = longevityData;

  // Determine which average to use based on the selected tab
  const average =
    selectedTab === 'Unit'
      ? (mergedLongevityData.unit_average ?? flightHours)
      : (mergedLongevityData.fleet_average ?? flightHours);

  // Use TBO from API if available, else fallback to prop
  const tboValue = mergedLongevityData.tbo ?? tbo;

  // Calculate the value as a ratio (0 to 1)
  // If average is higher than TBO, that's good (closer to 1)
  // If average is lower than TBO, that's bad (closer to 0)
  const value = tboValue ? Math.min(average / tboValue, 1) : 0;

  // Add a warning if fleet average is significantly higher than TBO
  const isFleetAverageUnrealistic = selectedTab === 'Fleet' && mergedLongevityData.fleet_average > tboValue * 2;

  // Determine label for the value type
  const valueTypeLabel =
    mergedLongevityData.value_type === 'maot' ? 'Mean Active Operating Time' : 'Time Between Overhaul';

  return (
    <Box sx={{ textAlign: 'center', p: 2, height: '100%' }} data-testid="longevity-section">
      <Tabs value={selectedTab} onChange={(_e, v) => setSelectedTab(v)}>
        <Tab label="UNIT" value="Unit" sx={{ width: '50%' }} />
        <Tab label="FLEET" value="Fleet" sx={{ width: '50%' }} />
      </Tabs>

      <Box sx={{ my: 2 }}>
        <PmxModularGauge value={value} showAs="namedResult" width={300} height={120} data-testid="longevity-gauge" />
      </Box>

      <Typography
        sx={{
          mt: 2,
          color: 'text.primary',
          fontSize: '16px',
          fontWeight: 500,
        }}
      >
        {valueTypeLabel}: {tboValue} flight hours
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: 'text.secondary',
          fontSize: '14px',
          lineHeight: 1.4,
        }}
      >
        On average, {componentName || 'components'} are lasting
        <br />
        {average} flight hours before overhaul
        {isFleetAverageUnrealistic && (
          <Box sx={{ mt: 1, color: 'warning.main' }}>Note: Fleet average appears unusually high compared to TBO</Box>
        )}
      </Typography>
    </Box>
  );
};

export default Longevity;
