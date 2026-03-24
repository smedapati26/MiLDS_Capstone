/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';

import { IosShare, OpenInNew } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Skeleton,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material';

import PmxTable from '@components/data-tables/PmxTable';
import { AircraftDropdown } from '@components/dropdowns';
import PmxAccordion from '@components/PmxAccordion';
import PmxSlider from '@components/PmxSlider';
import ExpectedFailureModal from '@features/component-management/components/Planning/ExpectedFailureModal';

import { IFailureCount } from '@store/griffin_api/components/models';
import {
  useExportChecklistMutation,
  useGetFailureCountQuery,
} from '@store/griffin_api/components/slices/componentsApi';
import { useAppSelector } from '@store/hooks';

interface FailureType extends IFailureCount {
  failuresCount: number;
}

interface ChecklistComponent {
  nomenclature: string;
  children: {
    failureChance: number;
    serial: string;
    wuc: string;
    model: string;
  }[];
}

const BoxItem = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.layout?.background5,
}));

function aggregateFailures(objects: IFailureCount[]): FailureType[] {
  const aggregated: { [key: string]: FailureType } = {};

  objects.forEach((obj) => {
    if (!aggregated[obj.nomenclature]) {
      aggregated[obj.nomenclature] = {
        ...obj,
        failuresCount: 0,
      };
    }
    aggregated[obj.nomenclature].failuresCount += 1;
  });

  return Object.values(aggregated);
}

function createChecklist(objects: IFailureCount[]): ChecklistComponent[] {
  const checklist: { [key: string]: ChecklistComponent } = {};

  objects.forEach((failure) => {
    const { nomenclature, wuc, model, failureChance, serial } = failure;

    if (!checklist[nomenclature]) {
      checklist[nomenclature] = {
        nomenclature,
        children: [],
      };
    }

    checklist[nomenclature].children.push({
      failureChance,
      serial,
      wuc,
      model,
    });
  });

  Object.values(checklist).forEach((item) => {
    item.children.sort((a, b) => b.failureChance - a.failureChance);
  });

  const sortedChecklist = Object.values(checklist).sort((a, b) => {
    const highestFailureA = Math.max(...a.children.map((child) => child.failureChance));
    const highestFailureB = Math.max(...b.children.map((child) => child.failureChance));
    return highestFailureB - highestFailureA;
  });

  return sortedChecklist;
}

const PlanningTab = () => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { palette } = useTheme();

  const [dataLoading, setDataLoading] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [failureVal, setFailureVal] = useState<number>(20);
  const [futureHour, setFutureHour] = useState<number>(20);
  const [failureData, setFailureData] = useState<FailureType[]>([]);
  const [checklistData, setChecklistData] = useState<ChecklistComponent[]>([]);

  const { data, isLoading, refetch } = useGetFailureCountQuery({
    uic,
    hour: futureHour,
    failure_percentage: failureVal / 100,
  });

  const [exportChecklist, { isLoading: downloadingChecklist }] = useExportChecklistMutation({});
  const [openPredictiveFailureModal, setOpenPredictiveFailureModal] = useState<boolean>(false);

  const handleExport = async () => {
    try {
      await exportChecklist({});
      // Handle the result here
    } catch (error) {
      console.error('Error downloading checklist: ', error);
    }
  };

  const handleRefetch = async () => {
    setDataLoading(true);
    await refetch();
    setDataLoading(false);
  };

  useEffect(() => {
    handleRefetch();
  }, [failureVal, futureHour, setFutureHour, setFailureVal, selectedModels, selectedSerials]);

  useEffect(() => {
    if (data) {
      if (selectedModels.length === 0 && selectedSerials.length === 0) {
        setFailureData([]);
        setChecklistData([]);
        return;
      }
      const failureData = aggregateFailures(data);

      const filteredFailureData =
        selectedModels.length > 0 || selectedSerials.length > 0
          ? failureData.filter(
              (failure) => selectedModels.includes(failure.model) || selectedSerials.includes(failure.serial),
            )
          : failureData;

      const checklistData = createChecklist(data);

      const filteredChecklistData =
        selectedModels.length > 0 || selectedSerials.length > 0
          ? checklistData
              .map((item) => ({
                ...item,
                children: item.children.filter(
                  (child) => selectedModels.includes(child.model) || selectedSerials.includes(child.serial),
                ),
              }))
              .filter((item) => item.children.length > 0)
          : checklistData;

      setFailureData(filteredFailureData.slice().sort((a, b) => b.failuresCount - a.failuresCount));
      setChecklistData(filteredChecklistData);
    }
  }, [data, selectedModels, selectedSerials]);

  const handleFailureValChange = (_event: Event | null, value: number | number[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setFailureVal(value as number);
    }, 500);
  };

  const handleFutureHourChange = (_event: Event | null, value: number | number[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setFutureHour(value as number);
    }, 500);
  };

  const handleOpenPredictiveFailureModal = (e: React.MouseEvent): void => {
    e.preventDefault();
    setOpenPredictiveFailureModal(true);
  };

  const handleClosePredictiveFailureModal = (): void => setOpenPredictiveFailureModal(false);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" sx={{ mb: 2.5 }}>
            Select aircraft(s):
          </Typography>
          <Box display="flex" gap={4}>
            <AircraftDropdown selected={selectedModels} handleSelect={setSelectedModels} selectAll />
            <AircraftDropdown
              selected={selectedSerials}
              handleSelect={setSelectedSerials}
              label="Serial Numbers"
              aircraftType="serial"
            />
          </Box>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box sx={{ p: 2 }}>
          <PmxSlider
            value={failureVal}
            handleChange={handleFailureValChange}
            label="Select a minimum failure probability:"
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
            label="Select future flight hours to see predicted component failures and supplies to have on hand:"
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
      </Grid>
      <Grid item xs={6} />
      <Grid item xs={6} mt={3} mb={3} sx={{ display: 'flex', flexDirection: 'column' }}>
        {(isLoading || dataLoading) && (
          <Skeleton variant="rectangular" height={400} animation="wave" sx={{ flexGrow: 1 }} />
        )}
        {!isLoading && !dataLoading && (
          <Container sx={{ px: 4, py: 5, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" mb={3}>
              Expected Failures
            </Typography>
            <Stack direction="row" mb={3} alignItems="last baseline">
              <Typography variant="body1" mb={3}>
                This feature utilizes predictive modeling to estimate part failure probabilities.
              </Typography>
              <Link
                onClick={handleOpenPredictiveFailureModal}
                underline="hover"
                href="#"
                data-testid="part-failure-predictive-model-learn-more-button"
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1 }}>
                  <OpenInNew fontSize="small" />
                  <Typography variant="body1">Learn More</Typography>
                </Stack>
              </Link>
              <ExpectedFailureModal open={openPredictiveFailureModal} handleClose={handleClosePredictiveFailureModal} />
            </Stack>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <PmxTable
                sx={{ minHeight: 300 }}
                columns={[
                  { key: 'nomenclature', label: 'Parts Description' },
                  { key: 'wuc', label: 'WUC' },
                  { key: 'partNumber', label: 'Part Number' },
                  { key: 'failuresCount', label: 'Expected Failures' },
                ]}
                rows={failureData ?? []}
              />
            </Box>
          </Container>
        )}
      </Grid>
      <Grid item xs={6} mt={3} mb={3} sx={{ display: 'flex', flexDirection: 'column' }}>
        {(isLoading || dataLoading) && (
          <Skeleton variant="rectangular" height={400} animation="wave" sx={{ flexGrow: 1 }} />
        )}
        {!isLoading && !dataLoading && (
          <Container sx={{ px: 4, py: 5, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" mb={4}>
                Component Checklist
              </Typography>
              {downloadingChecklist ? (
                <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
              ) : (
                <IconButton
                  onClick={handleExport}
                  sx={{ cursor: 'pointer' }}
                  role="button"
                  aria-label="export checklist"
                >
                  <IosShare />
                </IconButton>
              )}
            </Box>
            <Typography variant="subtitle1" mb={4}>
              Recommended amount of components to bring for selected flight hours.
            </Typography>
            <Stack gap={3}>
              {checklistData
                .sort((a, b) => b.children.length - a.children.length)
                .map((item) => (
                  <PmxAccordion
                    sx={{ margin: 0, '&.Mui-expanded': { margin: 0 } }}
                    key={item.nomenclature}
                    heading={
                      <Stack direction="row" gap={3}>
                        <Typography fontWeight="bold">{item.nomenclature}</Typography>
                        <Divider orientation="vertical" />
                        <Typography fontWeight="bold">{item.children.length}</Typography>
                      </Stack>
                    }
                    isLoading={false}
                  >
                    {item.children.map((child, index) => (
                      <BoxItem
                        key={`${child.serial}-${index}`}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 4,
                          mt: 3,
                          borderRadius: '3px',
                          backgroundColor:
                            palette.mode === 'dark' ? palette.layout.background9 : palette.layout.background5,
                        }}
                      >
                        <Typography fontWeight="bold">
                          {child.serial}, {child.model}
                        </Typography>
                        <Typography>{Math.round(child.failureChance * 100)}% chance of failure</Typography>
                      </BoxItem>
                    ))}
                  </PmxAccordion>
                ))}
            </Stack>
          </Container>
        )}
      </Grid>
    </Grid>
  );
};

export default PlanningTab;
