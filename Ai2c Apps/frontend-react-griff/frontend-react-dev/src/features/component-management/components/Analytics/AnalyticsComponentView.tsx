import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';

import Longevity from '@components/Longevity';
import PmxMultiSelect from '@components/PmxMultiSelect';
import PartsListDropdown from '@features/component-management/components/Analytics/PartsListDropdown';
import { getVariant } from '@utils/helpers';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import {
  useGetAircraftRiskPredictionsQuery,
  useGetComponentPartListQuery,
  useGetModelRiskPredictionsQuery,
} from '@store/griffin_api/components/slices/componentsApi';
import { useAppSelector } from '@store/hooks';

import { StyledContainer } from './AnalyticsUnitView';
import { ComponentFailurePredictions } from './ComponentFailurePredictions';

export const AnalyticsComponentView: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string[]>([]);
  const [aircraftView, setAircraftView] = useState('highest');
  const [aircraftCustom, setAircraftCustom] = useState<string[]>([]);
  const [modelCustom, setModelCustom] = useState<string[]>([]);

  const globalSelectedUnit = useAppSelector((state) => state.appSettings.currentUnit);

  // Reset all values when UIC changes
  useEffect(() => {
    setSelectedPart([]);
    setSelectedModel([]);
    setAircraftView('highest');
    setAircraftCustom([]);
    setModelCustom([]);
  }, [globalSelectedUnit.uic]);

  const { data: unitAircraft } = useGetAircraftByUicQuery([globalSelectedUnit.uic, selectedPart[0]], {
    skip: !selectedPart[0],
    refetchOnMountOrArgChange: true,
  });
  const {
    data: partList = [],
    isLoading: isModelsDataLoading,
    isFetching: isModelsDataFetching,
  } = useGetComponentPartListQuery({ uic: globalSelectedUnit.uic }, { skip: false });

  const {
    data: riskPredictions,
    isFetching,
    isLoading: isAircraftRiskPredictionsLoading,
  } = useGetAircraftRiskPredictionsQuery(
    {
      uic: globalSelectedUnit.uic,
      variant: getVariant(aircraftView),
      serial_numbers: aircraftView === 'custom' ? aircraftCustom : undefined,
      part_numbers: selectedPart,
    },
    {
      skip: aircraftView === 'custom' && aircraftCustom.length === 0,
    },
  );

  const {
    data: modelRiskPredictions,
    isFetching: isModelRiskFetching,
    isLoading: isModelRiskLoading,
  } = useGetModelRiskPredictionsQuery(
    {
      uic: globalSelectedUnit.uic,
      part_number: selectedPart[0],
    },
    {
      skip: selectedPart.length === 0,
    },
  );

  // Get models for selected part
  const models: string[] = partList
    .filter((part) => part.part_number === selectedPart[0])
    .map((it) => it.models)
    .flat();

  return (
    <>
      <Typography variant="body1">Select a component to see fleet analytics.</Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <PartsListDropdown values={selectedPart} handleSelect={setSelectedPart} multiSelect={false} />

        <PmxMultiSelect
          label="Model"
          values={selectedModel}
          options={models}
          disabled={models.length === 0 || selectedPart.length === 0}
          loading={isModelsDataLoading || isModelsDataFetching}
          onChange={(newValues) => setSelectedModel(newValues.slice(-1))}
          data-testid="models-select"
          aria-label="models-label"
          maxSelections={1}
        />
      </Box>

      {selectedPart.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledContainer>
              <ComponentFailurePredictions
                title="Aircraft Lead Lag Assy Risk"
                config={{
                  modelType: 'aircraftUnit',
                  modelLabel: 'aircraft',
                  maxSelections: 10,
                  showConfidenceToggle: false,
                  width: '95%',
                  isLoading: true,
                }}
                data={{
                  riskPredictions,
                  availableSerialNumbers: unitAircraft?.map((aircraft) => aircraft.serial) || [],
                  isFetching,
                }}
                viewState={{
                  selectedView: aircraftView,
                  setSelectedView: setAircraftView,
                  customComponents: aircraftCustom,
                  setCustomComponents: setAircraftCustom,
                }}
                tab="AnalyticsUnit"
                isLoading={isAircraftRiskPredictionsLoading}
              />
            </StyledContainer>
          </Grid>

          <Grid item xs={9}>
            <StyledContainer>
              <ComponentFailurePredictions
                title="Model Risk Predictions"
                config={{
                  modelType: 'model',
                  modelLabel: 'model',
                  maxSelections: 10,
                  showConfidenceToggle: true,
                  width: '95%',
                  isLoading: true,
                }}
                data={{
                  riskPredictions: modelRiskPredictions,
                  isFetching: isModelRiskFetching,
                }}
                viewState={{
                  selectedView: 'custom',
                  setSelectedView: () => {},
                  customComponents: selectedModel.length ? selectedModel : modelCustom,
                  setCustomComponents: setModelCustom,
                  disableCustomComponents: Boolean(selectedModel.length),
                }}
                tab="AnalyticsUnit"
                isLoading={isModelRiskLoading}
              />
            </StyledContainer>
          </Grid>
          <Grid item xs={3}>
            <StyledContainer sx={{ height: '500px' }}>
              <Longevity
                tbo={225}
                flightHours={200}
                componentName="Lead Lag Link Assy"
                selectedPart={selectedPart[0]}
                uic={globalSelectedUnit.uic}
              />
            </StyledContainer>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default AnalyticsComponentView;
