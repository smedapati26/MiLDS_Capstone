import React, { useEffect, useState } from 'react';
import { useDebounce } from 'src/hooks/useDebounce';

import { Box, Container, Divider, Skeleton, Stack, styled, Typography } from '@mui/material';

import PmxAccordion from '@components/PmxAccordion';
import PmxErrorDisplay from '@components/PmxErrorDisplay';
import PmxSlider from '@components/PmxSlider';

import { IFailureCount } from '@store/griffin_api/components/models';
import { useGetFailureCountQuery } from '@store/griffin_api/components/slices/componentsApi';

interface FailureType extends IFailureCount {
  failuresCount: number;
}

const BoxItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.layout?.background5,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '4px',
}));

export interface FailureCountsComponentProps {
  uic: string;
  selectedModels: string[];
  selectedSerials: string[];
}

export const FailureCountsComponent: React.FC<FailureCountsComponentProps> = ({
  uic,
  selectedModels,
  selectedSerials,
}) => {
  const defaultFailureVal = 5;
  const defaultFutureHour = 75;
  const [failureVal, setFailureVal] = useState<number>(defaultFailureVal);
  const [futureHour, setFutureHour] = useState<number>(defaultFutureHour);
  const [failureData, setFailureData] = useState<FailureType[]>([]);
  const [debouncedFailureVal] = useDebounce(failureVal, 500);
  const [debouncedFutureHour] = useDebounce(futureHour, 500);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { data, isLoading, error, isFetching, refetch } = useGetFailureCountQuery(
    {
      uic,
      hour: debouncedFutureHour,
      failure_percentage: debouncedFailureVal / 100,
    },
    {
      skip: !uic || debouncedFutureHour % 5 !== 0,
    },
  );

  useEffect(() => {
    if (data && hasInteracted) {
      const aggregated: { [key: string]: FailureType } = {};

      data.forEach((obj) => {
        if (!aggregated[obj.nomenclature]) {
          aggregated[obj.nomenclature] = {
            ...obj,
            failuresCount: 0,
          };
        }
        aggregated[obj.nomenclature].failuresCount += 1;
      });

      const filteredData = Object.values(aggregated)
        .filter(
          (failure) =>
            (selectedModels.length === 0 || selectedModels.includes(failure.model)) &&
            (selectedSerials.length === 0 || selectedSerials.includes(failure.serial)),
        )
        .sort((a, b) => b.failuresCount - a.failuresCount);

      setFailureData(filteredData);
    }
  }, [data, selectedModels, selectedSerials, hasInteracted]);

  // Handle slider changes
  const handleFailureValChange = (_event: Event | null, value: number | number[]) => {
    if (value !== defaultFailureVal) {
      setHasInteracted(true);
    }
    setFailureVal(value as number);
  };

  const handleFutureHourChange = (_event: Event | null, value: number | number[]) => {
    if (value !== defaultFutureHour) {
      setHasInteracted(true);
    }
    const roundedValue = Math.round((value as number) / 5) * 5;
    setFutureHour(roundedValue);
  };

  if (isLoading) {
    return (
      <Container sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} animation="wave" />
      </Container>
    );
  }

  return (
    <Container sx={{ px: 4, py: 5, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" pb={4}>
        Failure Counts
      </Typography>
      <Box sx={{ mb: 4, mr: 4 }}>
        <PmxSlider
          value={failureVal}
          handleChange={handleFailureValChange}
          label="Select a minimum failure probability"
          hasInput
          isPercentage
          step={5}
          marks={[
            { value: 0, label: '0%' },
            { value: 5, label: '' },
            { value: 10, label: '' },
            { value: 15, label: '' },
            { value: 20, label: '' },
            { value: 25, label: '25%' },
            { value: 30, label: '' },
            { value: 35, label: '' },
            { value: 40, label: '' },
            { value: 45, label: '' },
            { value: 50, label: '50%' },
            { value: 55, label: '' },
            { value: 60, label: '' },
            { value: 65, label: '' },
            { value: 70, label: '' },
            { value: 75, label: '75%' },
            { value: 80, label: '' },
            { value: 85, label: '' },
            { value: 90, label: '' },
            { value: 95, label: '' },
            { value: 100, label: '100%' },
          ]}
        />

        <PmxSlider
          value={futureHour}
          handleChange={handleFutureHourChange}
          label="Select future flight hours to see failure counts across the selected unit."
          hasInput
          step={5}
          marks={[
            { value: 0, label: '0' },
            { value: 5, label: '' },
            { value: 10, label: '' },
            { value: 15, label: '' },
            { value: 20, label: '' },
            { value: 25, label: '25' },
            { value: 30, label: '' },
            { value: 35, label: '' },
            { value: 40, label: '' },
            { value: 45, label: '' },
            { value: 50, label: '50' },
            { value: 55, label: '' },
            { value: 60, label: '' },
            { value: 65, label: '' },
            { value: 70, label: '' },
            { value: 75, label: '75' },
            { value: 80, label: '' },
            { value: 85, label: '' },
            { value: 90, label: '' },
            { value: 95, label: '' },
            { value: 100, label: '100' },
          ]}
          containerSx={{ mt: 6 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {error && <PmxErrorDisplay onRefresh={refetch} trackRetries />}
        {!hasInteracted && !error ? (
          <Typography variant="body2">Make selections to view failure data.</Typography>
        ) : (
          failureData.map((item) => (
            <PmxAccordion
              isLoading={isLoading || isFetching}
              key={item.nomenclature}
              sx={{
                mb: 3,
                '&.MuiAccordion-root.Mui-expanded:first-of-type': {
                  mt: 3,
                },
              }}
              heading={
                <Stack direction="row" gap={2}>
                  <Typography fontWeight="bold" sx={{ mr: 2 }}>
                    {item.nomenclature}
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                  <Typography fontWeight="bold">{item.failuresCount}</Typography>
                </Stack>
              }
            >
              {Array.from({ length: item.failuresCount }).map((_, index) => (
                <BoxItem key={`${item.serial}-${index}`}>
                  <Typography>
                    {item.serial}, {item.model}
                  </Typography>
                  <Typography>{Math.round(item.failureChance * 100)}% chance of failure</Typography>
                </BoxItem>
              ))}
            </PmxAccordion>
          ))
        )}
      </Box>
    </Container>
  );
};

export default FailureCountsComponent;
