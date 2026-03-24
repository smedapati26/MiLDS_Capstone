import React, { lazy, useEffect, useState } from 'react';
import { ScatterData } from 'plotly.js';
const Plot = lazy(() => import('react-plotly.js'));

import usePlotlyCleanup from 'src/hooks/usePlotlyCleanup';

import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Skeleton,
  Switch,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';

import PmxErrorDisplay from '@components/PmxErrorDisplay';
import PmxMultiSelect from '@components/PmxMultiSelect';

import { IAircraftRiskPrediction, IComponentRiskPrediction } from '@store/griffin_api/components/models';

interface IModelRiskPrediction {
  model_name: string;
  failure_detail: {
    [key: string]: number;
  };
}
type RiskPredictionUnion = IAircraftRiskPrediction | IComponentRiskPrediction | IModelRiskPrediction;

type ChartConfigModelType = 'component' | 'aircraftUnit' | 'aircraftAnalytics' | 'model';

interface ChartConfig {
  modelType: ChartConfigModelType;
  modelLabel?: string;
  maxSelections: number;
  showConfidenceToggle?: boolean;
  width?: string | number;
  isLoading?: boolean;
}

interface PredictionData {
  customOptions?: string[];
  riskPredictions?: RiskPredictionUnion[];
  availableSerialNumbers?: string[];
  isFetching: boolean;
  selectedSerial?: string;
}

interface ViewState {
  selectedView: string;
  setSelectedView: (view: string) => void;
  customComponents: string[];
  setCustomComponents: (components: string[]) => void;
  disableCustomComponents?: boolean;
}

interface ComponentFailurePredictionsProps {
  title: string;
  config: ChartConfig;
  data: PredictionData;
  viewState: ViewState;
  tab?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
}

type RiskPredictionType = IAircraftRiskPrediction | IComponentRiskPrediction | IModelRiskPrediction;
type ModelIdentifierType = 'name' | 'filter' | 'display';

type LegendItemType = {
  name: string;
  color?: string;
};

const getColorForIndex = (index: number, theme: Theme) => {
  const colors = [
    theme?.palette?.graph?.purple,
    theme?.palette?.graph?.cyan,
    theme?.palette?.graph?.teal,
    theme?.palette?.graph?.pink,
    theme?.palette?.graph?.green,
    theme?.palette?.graph?.blue,
    theme?.palette?.graph?.magenta,
    theme?.palette?.graph?.yellow,
    theme?.palette?.graph?.teal2,
    theme?.palette?.graph?.cyan2,
    theme?.palette?.graph?.orange,
    theme?.palette?.graph?.purple2,
  ];

  return colors[index % colors.length];
};

const getSerialNumberDisplay = (modelType: string): string => {
  if (modelType.includes('aircraft')) {
    return 'Aircraft*';
  }
  if (modelType === 'aircraftUnit') {
    return 'Serial Numbers*';
  }

  return `${modelType.charAt(0).toUpperCase() + modelType.slice(1)}s*`;
};

export const generateYValues = (
  prediction: IAircraftRiskPrediction | IComponentRiskPrediction | IModelRiskPrediction,
  prefix: string,
) => {
  const RELATIVE_MIN_RANGE = 0.15;

  return Array.from({ length: 21 }, (_, i) => {
    const hour = i * 5;
    const probKey = `failure_prob_${hour}` as keyof typeof prediction.failure_detail;
    const probValue = prediction.failure_detail[probKey] || 0;

    if (prefix === 'failure_prob') {
      return probValue * 100;
    }

    // Calculate bounds as a percentage of the probability value
    if (prefix === 'failure_upper') {
      return probValue * (1 - RELATIVE_MIN_RANGE) * 100;
    }
    if (prefix === 'failure_lower') {
      return probValue * (1 + RELATIVE_MIN_RANGE) * 100;
    }

    return probValue * 100;
  });
};

export const ComponentFailurePredictions: React.FC<ComponentFailurePredictionsProps> = ({
  title,
  config,
  data,
  viewState,
  isLoading,
  isError,
  onRefresh,
}) => {
  usePlotlyCleanup();
  const [showConfidence, setShowConfidence] = useState(false);
  const [isLegendLoading, setIsLegendLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setIsLegendLoading(
      viewState.selectedView === 'custom' &&
        viewState.customComponents.length > 0 &&
        data.isFetching &&
        !data.riskPredictions?.length,
    );
  }, [viewState.selectedView, viewState.customComponents, data.isFetching, data.riskPredictions]);

  if (isError) {
    return <PmxErrorDisplay onRefresh={onRefresh} title={title} />;
  }

  const { modelType, modelLabel, maxSelections, width = '90%' } = config;
  const { riskPredictions = [], availableSerialNumbers = [], isFetching = false } = data;
  const { selectedView, setSelectedView, customComponents, setCustomComponents, disableCustomComponents } = viewState;
  const isComparisonWithParent = maxSelections < 10;
  const isDarkMode = theme.palette.mode === 'dark';
  const modeColor = (isDarkMode: boolean) => {
    return isDarkMode ? theme.palette.common.white : theme.palette.common.black;
  };
  const textColor = modeColor(isDarkMode);

  const getModelIdentifier = (prediction: RiskPredictionType, type: ModelIdentifierType = 'name'): string => {
    if (modelType === 'component') {
      const componentPrediction = prediction as IComponentRiskPrediction;
      switch (type) {
        case 'filter':
          return componentPrediction.part_number;
        case 'display':
        case 'name':
        default:
          return componentPrediction.nomenclature;
      }
    } else if (modelType === 'model') {
      return (prediction as IModelRiskPrediction).model_name;
    } else {
      return (prediction as IAircraftRiskPrediction).serial_number;
    }
  };

  const formatPredictionsForChart = () => {
    if (!riskPredictions?.length) return [];

    if (isComparisonWithParent || selectedView === 'custom') {
      return customComponents.map((partNumber, index) => ({
        name: partNumber,
        color: getColorForIndex(index, theme),
        failureProbability:
          riskPredictions.find((p) => (p as IComponentRiskPrediction).part_number === partNumber)?.failure_detail
            .failure_prob_100 || 0,
      }));
    }

    return riskPredictions.map(
      (prediction: IAircraftRiskPrediction | IComponentRiskPrediction | IModelRiskPrediction, index) => ({
        name: getModelIdentifier(prediction),
        color: getColorForIndex(index, theme),
        failureProbability: prediction.failure_detail.failure_prob_100,
      }),
    );
  };

  const handleCustomChange = (selected: string[]) => {
    setIsLegendLoading(true);
    setCustomComponents(selected.slice(0, maxSelections));
  };

  const filteredComponents = formatPredictionsForChart();

  const generateTraces = (): Partial<ScatterData>[] => {
    const xValues = Array.from({ length: 21 }, (_, i) => i * 5);

    if (!riskPredictions?.length) {
      return [
        {
          x: xValues,
          y: Array(21).fill(0),
          type: 'scatter' as const,
          mode: 'lines' as const,
          line: { width: 0 },
          showlegend: false,
          hoverinfo: 'none',
        },
      ];
    }

    const getFilteredPredictions = () => {
      if (modelType === 'aircraftAnalytics') {
        return riskPredictions.filter(
          (p) =>
            customComponents.includes(getModelIdentifier(p, 'filter')) ||
            getModelIdentifier(p, 'filter') === data.selectedSerial,
        );
      }

      if (isComparisonWithParent || selectedView === 'custom') {
        return riskPredictions.filter((p) => customComponents.includes(getModelIdentifier(p, 'filter')));
      }

      return riskPredictions;
    };

    const predictionsToShow = getFilteredPredictions();

    const getHoverTemplate = (name: string): string => {
      return '<b>' + name + '</b><br>%{x} future flight hours<br>%{y:.1f}% probability of failure<extra></extra>';
    };

    return predictionsToShow
      .map((prediction, index) => {
        const name = getModelIdentifier(prediction, 'display');

        const mainTrace: Partial<ScatterData> = {
          x: xValues,
          y: generateYValues(prediction, 'failure_prob'),
          name,
          type: 'scatter' as const,
          mode: 'lines' as const,
          line: {
            color: getColorForIndex(index, theme),
            width: 3,
          },
          hovertemplate: getHoverTemplate(name),
          hoverlabel: {
            bgcolor: isDarkMode ? theme.palette.background.paper : theme.palette.grey[200],
            bordercolor: '#333',
            font: { color: modeColor(isDarkMode) },
          },
        };

        if (showConfidence) {
          const upperTrace: Partial<ScatterData> = {
            x: xValues,
            y: generateYValues(prediction, 'failure_upper'),
            name: `${name} Upper`,
            type: 'scatter' as const,
            mode: 'lines' as const,
            line: { width: 0 },
            showlegend: false,
            hoverinfo: 'none',
            fillcolor: `${getColorForIndex(index, theme)}15`,
            fill: 'tonexty',
          };

          const lowerTrace: Partial<ScatterData> = {
            x: xValues,
            y: generateYValues(prediction, 'failure_lower'),
            name: `${name} Lower`,
            type: 'scatter' as const,
            mode: 'lines' as const,
            line: { width: 0 },
            showlegend: false,
            hoverinfo: 'none',
            fill: 'tonexty',
            fillcolor: `${getColorForIndex(index, theme)}15`,
          };
          return [lowerTrace, mainTrace, upperTrace];
        }

        return [mainTrace];
      })
      .flat();
  };
  const renderLegendItem = (component: LegendItemType, index: number) => (
    <Grid item xs={6} key={`${component.name}-${index}`} pl={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '16px' }}>
        <Box
          sx={{
            width: 14,
            minWidth: 14,
            minHeight: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: component.color,
            mr: '8px',
            flexShrink: 0,
          }}
        />
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textTransform: 'capitalize',
          }}
        >
          {component.name?.toLowerCase() || ''}
        </Typography>
      </Box>
    </Grid>
  );

  const renderLoadingSkeleton = (index: number) => (
    <Grid item xs={6} key={`skeleton-${index}`}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '16px' }}>
        <Skeleton variant="circular" width={14} height={14} sx={{ mr: '10px', ml: '4px' }} />
        <Skeleton variant="text" width={80} />
      </Box>
    </Grid>
  );

  const renderLegend = (
    isLegendLoading: boolean,
    filteredComponents: LegendItemType[],
    maxSelections: number,
    customComponents: string[],
  ) => {
    if (isLegendLoading) {
      return Array.from({ length: maxSelections }).map((_, i) => renderLoadingSkeleton(i));
    }

    // If no filtered components but custom components exist, show custom components
    if (filteredComponents.length === 0 && customComponents.length > 0) {
      return customComponents.map((component, i) =>
        renderLegendItem(
          {
            name: component,
            color: getColorForIndex(customComponents.indexOf(component), theme),
          },
          i,
        ),
      );
    }

    return filteredComponents.map((component, i) => renderLegendItem(component, i));
  };

  const renderFilterSection = () => {
    if (modelType === 'model') {
      return (
        <FormControl fullWidth>
          <Typography sx={{ mb: 1, fontSize: '14px' }}>Filter risk predictions by model</Typography>
          <PmxMultiSelect
            disabled={disableCustomComponents}
            label={getSerialNumberDisplay(modelType)}
            values={customComponents}
            options={
              riskPredictions?.map(
                (prediction: RiskPredictionType) => (prediction as IModelRiskPrediction).model_name,
              ) || []
            }
            onChange={handleCustomChange}
            maxSelections={maxSelections}
          />
        </FormControl>
      );
    } else if (modelType === 'component' || modelType === 'aircraftUnit') {
      return (
        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedView}
            onChange={(e) => {
              const newView = e.target.value;
              setSelectedView(newView);
              if (newView !== 'custom') {
                setCustomComponents([]);
                setIsLegendLoading(true);
              }
              setCustomComponents([]);
            }}
            sx={{
              '& .MuiFormControlLabel-root': {
                alignItems: 'flex-start',
                mb: 1.5, // 12px spacing
              },
              '& .MuiRadio-root': {
                pt: 0, // Align radio to top
              },
            }}
          >
            <FormControlLabel
              value="highest"
              control={<Radio size="small" sx={{ color: '#888' }} />}
              label={
                <Typography sx={{ fontSize: '16px' }}>
                  {maxSelections}{' '}
                  {(modelLabel || modelType) === 'aircraft' ? 'aircraft' : `${modelLabel || modelType}s`} with the
                  highest failure probability
                </Typography>
              }
            />
            <FormControlLabel
              value="lowest"
              control={<Radio size="small" sx={{ color: '#888' }} />}
              label={
                <Typography sx={{ fontSize: '16px' }}>
                  {maxSelections}{' '}
                  {(modelLabel || modelType) === 'aircraft' ? 'aircraft' : `${modelLabel || modelType}s`} with the
                  lowest failure probability
                </Typography>
              }
            />
            <FormControlLabel
              value="custom"
              control={<Radio size="small" sx={{ color: '#888' }} />}
              label={<Typography sx={{ fontSize: '16px' }}>Custom</Typography>}
            />
          </RadioGroup>
          {selectedView === 'custom' && (
            <Box sx={{ mt: 1, mb: 2, ml: 4 }}>
              <PmxMultiSelect
                disabled={disableCustomComponents}
                label={getSerialNumberDisplay(modelType)}
                values={customComponents}
                options={availableSerialNumbers || []}
                onChange={handleCustomChange}
                maxSelections={maxSelections}
                data-testid="serial-numbers-select"
              />
            </Box>
          )}
        </FormControl>
      );
    } else {
      return (
        <FormControl fullWidth>
          <Typography sx={{ mb: 1, fontSize: '14px' }}>
            {`Select up to ${maxSelections - 1} additional ${modelLabel}s for comparison`}
          </Typography>
          <PmxMultiSelect
            disabled={disableCustomComponents}
            label={getSerialNumberDisplay(modelType)}
            values={customComponents}
            options={data.customOptions || []}
            onChange={handleCustomChange}
            maxSelections={maxSelections}
          />
        </FormControl>
      );
    }
  };

  const calculateYAxisRange = (traces: Partial<ScatterData>[]): [number, number] => {
    // Get all y values from all traces
    const allYValues = traces.flatMap((trace) => (trace.y as number[]) || []);

    if (allYValues.length === 0) return [0, 100];

    const maxValue = Math.max(...allYValues);

    // If max value is very small, use a reasonable minimum range
    if (maxValue < 10) return [0, 10];

    // Round up to the next reasonable tick interval
    const ceilings = [15, 30, 45, 60, 75, 100];
    const ceiling = ceilings.find((c) => c >= maxValue) || 100;

    return [0, ceiling];
  };

  const traces = generateTraces();
  const [minY, maxY] = calculateYAxisRange(traces);

  const generateTickValues = (max: number): { ticktext: string[]; tickvals: number[] } => {
    const intervals = {
      10: { step: 2.5, count: 5 },
      15: { step: 3, count: 6 },
      30: { step: 6, count: 6 },
      45: { step: 9, count: 6 },
      60: { step: 12, count: 6 },
      75: { step: 15, count: 6 },
      100: { step: 25, count: 5 },
    };

    const { step, count } = intervals[max as keyof typeof intervals] || intervals[100];
    const tickvals = Array.from({ length: count }, (_, i) => i * step);
    const ticktext = tickvals.map((val) => `${val}%`);

    return { ticktext, tickvals };
  };

  const { ticktext, tickvals } = generateTickValues(maxY);

  if (isLoading) {
    return <Skeleton variant="rectangular" height={'470px'} animation="wave" sx={{ flexGrow: 1 }} />;
  }

  return (
    <Box sx={{ px: 4, py: 5, borderRadius: 1, display: 'flex', flexDirection: 'column', height: '470px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {config.showConfidenceToggle && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Confidence swaths
            </Typography>
            <Switch
              size="small"
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
              data-testid="confidence-switch"
            />
          </Box>
        )}
      </Box>
      <Grid container sx={{ flex: 1 }}>
        <Grid item xs={3}>
          <Box sx={{ pr: 2, pl: 2 }}>
            {renderFilterSection()}
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  color: isDarkMode ? 'scale.white' : 'scale.d80',
                }}
              >
                Legend
              </Typography>
              <Grid container spacing={0.5} key={`legend-${selectedView}-${customComponents.join('-')}`}>
                {renderLegend(isLegendLoading, filteredComponents, maxSelections, customComponents)}
              </Grid>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={9}>
          <Box sx={{ height: '100%', width, position: 'relative' }}>
            {isFetching && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? 'rgba(35, 35, 35, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                  zIndex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <Plot
              key={`plot-${selectedView}`}
              data={traces}
              layout={{
                font: {
                  family: theme.typography.fontFamily,
                  size: 12,
                  color: textColor,
                },
                xaxis: {
                  title: {
                    text: 'Future Flight Hours',
                    font: {
                      family: theme.typography.fontFamily,
                      size: 14,
                      color: textColor,
                    },
                    standoff: 20,
                  },
                  showgrid: false,
                  showline: true,
                  linewidth: 1,
                  linecolor: modeColor(isDarkMode),
                  zeroline: true,
                  zerolinewidth: 1,
                  zerolinecolor: modeColor(isDarkMode),
                  range: [0, 100],
                  tickmode: 'array',
                  ticktext: ['0', '25', '50', '75', '100'],
                  tickvals: [0, 25, 50, 75, 100],
                  tickfont: {
                    family: theme.typography.fontFamily,
                    color: textColor,
                  },
                },
                yaxis: {
                  title: {
                    text: 'Probability',
                    font: {
                      family: theme.typography.fontFamily,
                      size: 14,
                      color: textColor,
                    },
                    standoff: 20,
                  },
                  showgrid: false,
                  showline: true,
                  linewidth: 1,
                  linecolor: modeColor(isDarkMode),
                  zeroline: true,
                  zerolinewidth: 1,
                  zerolinecolor: modeColor(isDarkMode),
                  range: [minY, maxY],
                  tickmode: 'array',
                  ticktext,
                  tickvals,
                  tickfont: {
                    family: theme.typography.fontFamily,
                    color: textColor,
                  },
                },
                hovermode: 'closest',
                margin: { t: 8, r: 20, b: 60, l: 100 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                showlegend: false,
                legend: {
                  bgcolor: 'transparent',
                  bordercolor: 'transparent',
                },
              }}
              style={{ width: '100%', height: '100%' }}
              config={{ responsive: true }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
