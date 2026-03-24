import React, { useEffect, useState } from 'react';

import { Grid, Typography } from '@mui/material';

import { AircraftDropdown } from '@components/dropdowns';
import { getVariant } from '@utils/helpers/chartHelpers';

import { IAircraft } from '@store/griffin_api/aircraft/models/IAircraft';
import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import {
  useGetAircraftRiskPredictionsQuery,
  useGetComponentPartListQuery,
  useGetComponentRiskQuery,
} from '@store/griffin_api/components/slices/componentsApi';
import { useAppSelector } from '@store/hooks';

import { StyledContainer } from './AnalyticsUnitView';
import { ComponentFailurePredictions } from './ComponentFailurePredictions';
import { UpcomingMaintenanceChart } from './UpcomingMaintenanceChart';

export const AnalyticsAircraftView: React.FC = () => {
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const { data: aircraftData } = useGetAircraftByUicQuery(uic);
  const [aircraftSerials, setAircraftSerials] = useState<string[] | undefined>([]);

  useEffect(() => {
    const aircraftSerialNumbers = [...new Set(aircraftData?.map((aircraft: IAircraft) => aircraft.serial))];
    setAircraftSerials(aircraftSerialNumbers);
  }, [aircraftData]);
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [componentView, setComponentView] = useState('highest');
  const [aircraftView, setAircraftView] = useState('custom');
  const [componentCustom, setComponentCustom] = useState<string[]>([]);
  const [aircraftCustom, setAircraftCustom] = useState<string[]>([]);

  const globalSelectedUnit = useAppSelector((state) => state.appSettings.currentUnit);

  // Get component part list for selected aircraft
  const { data: partList } = useGetComponentPartListQuery({
    uic: globalSelectedUnit.uic,
    serial: selectedSerials[0], // Use first selected serial
  });

  // Component risk predictions for selected aircraft
  const {
    data: componentPredictions,
    isFetching: isComponentFetching,
    isLoading: isComponentApiLoading,
  } = useGetComponentRiskQuery(
    {
      uic: globalSelectedUnit.uic,
      serial: selectedSerials[0], // Use first selected serial
      variant: getVariant(componentView),
      part_numbers: componentView === 'custom' ? componentCustom : undefined,
    },
    {
      skip: !selectedSerials.length || (componentView === 'custom' && componentCustom.length === 0),
    },
  );

  // Aircraft risk predictions
  const {
    data: riskPredictions,
    isFetching,
    isLoading: isAircraftRiskPredictionsLoading,
  } = useGetAircraftRiskPredictionsQuery(
    {
      uic: globalSelectedUnit.uic,
      variant: getVariant(aircraftView),
      serial_numbers: aircraftCustom,
    },
    {
      skip: aircraftCustom.length === 0,
    },
  );

  // Loading states
  const isLoading = !partList || !riskPredictions || !componentPredictions || !selectedSerials.length;

  useEffect(() => {
    if (selectedSerials.length > 0 && !aircraftCustom.includes(selectedSerials[0])) {
      // For Aircraft Risk Predictions (maxSelections = 4), ensure selected serial is included
      setAircraftCustom([selectedSerials[0]]);
    }
  }, [selectedSerials, aircraftCustom]);

  return (
    <>
      <Typography variant="body1">Select an aircraft to see component analytics.</Typography>
      <AircraftDropdown
        selected={selectedSerials}
        handleSelect={setSelectedSerials}
        label="Serial Numbers"
        aircraftType="serial"
        multiSelect={false}
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledContainer>
            <ComponentFailurePredictions
              title="Component Failure Predictions"
              config={{
                modelType: 'component',
                maxSelections: 10,
                width: '95%',
                isLoading,
                showConfidenceToggle: false,
              }}
              data={{
                riskPredictions: componentPredictions || [],
                availableSerialNumbers: partList?.map((p) => p.part_number) || [],
                isFetching: isComponentFetching,
              }}
              viewState={{
                selectedView: componentView,
                setSelectedView: setComponentView,
                customComponents: componentCustom,
                setCustomComponents: setComponentCustom,
              }}
              tab="AnalyticsAircraft"
              isLoading={isComponentApiLoading}
            />
          </StyledContainer>
        </Grid>

        <Grid item container spacing={3}>
          <Grid item xs={9}>
            <StyledContainer>
              <ComponentFailurePredictions
                title="Aircraft Risk Predictions"
                config={{
                  modelType: 'aircraftAnalytics',
                  modelLabel: 'aircraft',
                  maxSelections: 5,
                  showConfidenceToggle: true,
                  width: '100%',
                  isLoading,
                }}
                data={{
                  riskPredictions,
                  availableSerialNumbers: selectedSerials,
                  isFetching,
                  selectedSerial: selectedSerials[0],
                  customOptions: aircraftSerials,
                }}
                viewState={{
                  selectedView: 'custom',
                  setSelectedView: setAircraftView,
                  customComponents: aircraftCustom,
                  setCustomComponents: setAircraftCustom,
                }}
                tab="AnalyticsAircraft"
                isLoading={isAircraftRiskPredictionsLoading}
              />
            </StyledContainer>
          </Grid>

          <Grid item xs={3}>
            <StyledContainer sx={{ maxHeight: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Maintenance
              </Typography>
              <UpcomingMaintenanceChart uic={globalSelectedUnit.uic} serial={selectedSerials[0]} />
            </StyledContainer>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default AnalyticsAircraftView;
