import React, { useMemo, useState } from 'react';

import { Container, FormControl, Grid, styled, Typography } from '@mui/material';

import { PmxTreeDropdown, TreeNode } from '@ai2c/pmx-mui';

import PmxErrorDisplay from '@components/PmxErrorDisplay';
import { getVariant } from '@utils/helpers';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { IUnitBrief } from '@store/griffin_api/auto_dsr/models/IUnitBrief';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import {
  useGetAircraftRiskPredictionsQuery,
  useGetComponentPartListQuery,
  useGetComponentRiskQuery,
} from '@store/griffin_api/components/slices/componentsApi';
import { useAppSelector } from '@store/hooks';

import { ComponentFailurePredictions } from './ComponentFailurePredictions';
import FailureCountsComponent from './FailureCountsComponent';
import { UpcomingMaintenanceChart } from './UpcomingMaintenanceChart';

interface AnalyticsUnitViewProps {}

export const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(5),
  paddingBottom: theme.spacing(5),
  paddingRight: theme.spacing(4),
  paddingLeft: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export const AnalyticsUnitView: React.FC<AnalyticsUnitViewProps> = () => {
  const [filterUnits, setFilterUnits] = useState<string[]>([]);
  const [componentView, setComponentView] = useState('highest');
  const [aircraftView, setAircraftView] = useState('highest');
  const [componentCustom, setComponentCustom] = useState<string[]>([]);
  const [aircraftCustom, setAircraftCustom] = useState<string[]>([]);

  const isNested = true;

  const globalSelectedUnit: IUnitBrief = useAppSelector((state) => state.appSettings.currentUnit);
  const {
    data: units,
    isLoading: isUnitsDropdownLoading,
    isError: isUnitsError,
    refetch: refetchUnits,
  } = useGetUnitsQuery({ topLevelUic: globalSelectedUnit.uic });
  const {
    data: unitAircraft,
    isError: isUnitAircraftError,
    refetch: refetchUnitAircraft,
  } = useGetAircraftByUicQuery(globalSelectedUnit.uic);
  const {
    data: partList,
    isError: isPartListError,
    refetch: refetchPartList,
  } = useGetComponentPartListQuery({ uic: globalSelectedUnit.uic });
  const {
    data: riskPredictions,
    isFetching,
    isLoading: isAircraftRiskPredictionsLoading,
    isError: isRiskPredictionsError,
    refetch: refetchRiskPredictions,
  } = useGetAircraftRiskPredictionsQuery(
    {
      uic: globalSelectedUnit.uic,
      variant: getVariant(aircraftView),
      serial_numbers: aircraftView === 'custom' ? aircraftCustom : undefined,
      other_uics: filterUnits,
    },
    {
      skip: aircraftView === 'custom' && aircraftCustom.length === 0,
    },
  );
  const {
    data: componentPredictions,
    isFetching: isComponentFetching,
    isLoading: isComponentApiLoading,
    isError: isComponentPredictionsError,
    refetch: refetchComponentPredictions,
  } = useGetComponentRiskQuery(
    {
      uic: globalSelectedUnit.uic,
      variant: getVariant(componentView),
      part_numbers: componentView === 'custom' ? componentCustom : undefined,
      other_uics: filterUnits,
    },
    {
      skip: componentView === 'custom' && componentCustom.length === 0,
    },
  );

  // Transforms units within the globalSelectedUnit to the format needed for the nested tree dropdown
  const unitOptions = useMemo(() => {
    if (!units) return [];

    // Recursive function to loop through and build the tree for the PMxTreeDropdown component
    const transformUnitsToTree = (parentUic: string): TreeNode[] => {
      const children = units.filter((unit) => unit.parentUic === parentUic);
      return children.map((unit) => {
        const childNodes = transformUnitsToTree(unit.uic);
        return {
          id: unit.uic,
          value: unit.displayName,
          level: unit.level,
          ...(childNodes.length > 0 && { children: childNodes }),
        };
      });
    };

    const topLevel = units.filter((unit) => unit.uic === globalSelectedUnit.uic);
    return topLevel.map((unit) => ({
      id: unit.uic,
      value: unit.displayName,
      level: unit.level,
      children: transformUnitsToTree(unit.uic),
    }));
  }, [globalSelectedUnit, units]);

  // Calculate root level to the nested tree dropdown from options
  const rootLevel = React.useMemo(() => {
    if (!unitOptions.length || !isNested) return 1;
    return unitOptions[0].level;
  }, [unitOptions, isNested]);

  const handleUnitFilterChange = (values: string[]) => {
    setFilterUnits(values);
  };

  const renderFilterText = () => {
    return <Typography variant="body1">{`Filter your view of ${globalSelectedUnit.shortName} below`}</Typography>;
  };

  return (
    <>
      {renderFilterText()}
      <FormControl sx={{ '& .MuiFormControl-root': { margin: 0 } }}>
        {isUnitsError ? (
          <PmxErrorDisplay onRefresh={refetchUnits} />
        ) : (
          <PmxTreeDropdown
            label="Unit Filter"
            values={filterUnits}
            options={unitOptions}
            onChange={handleUnitFilterChange}
            minWidth={302}
            maxWidth={302}
            maxDepth={4}
            loading={isUnitsDropdownLoading}
            isNested={isNested}
            rootLevel={rootLevel}
          />
        )}
      </FormControl>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledContainer>
            <ComponentFailurePredictions
              title="Component Failure Predictions"
              config={{
                modelType: 'component',
                maxSelections: 10,
                width: '95%',
                showConfidenceToggle: false,
                isLoading: true,
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
              tab="AnalyticsUnit"
              isLoading={isComponentApiLoading}
              isError={isComponentPredictionsError || isPartListError}
              onRefresh={() => {
                refetchComponentPredictions();
                refetchPartList();
              }}
            />
          </StyledContainer>
        </Grid>

        <Grid item xs={12}>
          <StyledContainer>
            {
              <ComponentFailurePredictions
                isError={isRiskPredictionsError || isUnitAircraftError}
                title="Aircraft Risk Predictions"
                config={{
                  modelType: 'aircraftUnit',
                  modelLabel: 'aircraft',
                  maxSelections: 10,
                  showConfidenceToggle: true,
                  width: '95%',
                  isLoading: true,
                }}
                onRefresh={() => {
                  refetchRiskPredictions();
                  refetchUnitAircraft();
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
            }
          </StyledContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <FailureCountsComponent uic={globalSelectedUnit.uic} selectedModels={[]} selectedSerials={[]} />
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledContainer>
            <Typography variant="h6" gutterBottom>
              Upcoming Maintenance
            </Typography>
            <UpcomingMaintenanceChart uic={globalSelectedUnit.uic} otherUics={filterUnits} />
          </StyledContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default AnalyticsUnitView;
