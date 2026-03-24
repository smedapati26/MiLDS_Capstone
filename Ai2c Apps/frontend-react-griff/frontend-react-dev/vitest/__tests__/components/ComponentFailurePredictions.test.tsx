import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { ComponentFailurePredictions } from '@features/component-management/components/Analytics/ComponentFailurePredictions';

import { IComponentRiskPrediction, IFailureDetail } from '@store/griffin_api/components/models';

import { mockPalette } from '@vitest/mocks/theme/mockPalette';

vi.mock('react-plotly.js', () => ({
  default: (props: { data: unknown }) => <div data-testid="plot" data-plot-data={JSON.stringify(props.data)} />,
}));

describe('ComponentFailurePredictions component', () => {
  const mockTheme = createTheme({
    palette: {
      ...mockPalette,
      mode: 'light',
      graph: { ...mockPalette.graph, purple: '#7B61FF' },
    },
  });

  const mockFailureDetail: IFailureDetail = {
    ...Array.from({ length: 13 }, (_, i) => i * 5).reduce(
      (acc, num) => ({
        ...acc,
        [`failure_prob_${num}`]: 0.5,
        [`failure_upper_${num}`]: 0.6,
        [`failure_lower_${num}`]: 0.4,
      }),
      {},
    ),
  } as IFailureDetail;

  const mockRiskPrediction: IComponentRiskPrediction = {
    nomenclature: 'Test Component',
    part_number: 'TEST123',
    serial_number: 'SN123',
    failure_detail: mockFailureDetail,
  };

  const defaultProps = {
    title: 'Test Chart',
    config: {
      modelType: 'aircraftUnit' as const,
      modelLabel: 'aircraft',
      maxSelections: 10,
      showConfidenceToggle: true,
      width: '95%',
      isLoading: true,
    },
    data: {
      riskPredictions: [mockRiskPrediction],
      availableSerialNumbers: ['SN123'],
      isFetching: false,
    },
    viewState: {
      selectedView: 'highest',
      setSelectedView: vi.fn(),
      customComponents: [],
      setCustomComponents: vi.fn(),
    },
    tab: 'AnalyticsUnit',
    isLoading: false,
  };

  const getPlotData = () => {
    const plotElement = screen.getByTestId('plot');
    return JSON.parse(plotElement.getAttribute('data-plot-data') || '[]');
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders confidence toggle when showConfidenceToggle is true', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...defaultProps} />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(
      () => {
        expect(screen.getByText('Confidence swaths')).toBeInTheDocument();
        expect(screen.getByTestId('confidence-switch')).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('does not render confidence toggle when showConfidenceToggle is false', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions
            {...defaultProps}
            config={{ ...defaultProps.config, showConfidenceToggle: false }}
          />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(
      () => {
        expect(screen.queryByText('Confidence swaths')).not.toBeInTheDocument();
        expect(screen.queryByTestId('confidence-switch')).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('applies correct relative minimum range to confidence bounds', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...defaultProps} />
        </ThemeProvider>,
      );
    });

    await act(async () => {
      const switchBase = screen.getByTestId('confidence-switch');
      fireEvent.click(switchBase);
    });

    await vi.waitFor(
      () => {
        const plotData = getPlotData();
        expect(plotData).toBeDefined();
        expect(Array.isArray(plotData)).toBe(true);

        const trace = plotData[0];
        expect(trace.y).toBeDefined();
        expect(Array.isArray(trace.y)).toBe(true);
        expect(trace.y.length).toBeGreaterThan(0);

        expect(trace.y[0]).toBe(50); // First value
        expect(trace.y[trace.y.length - 1]).toBe(0); // Last value
      },
      { timeout: 1000 },
    );
  });

  it('applies correct fill color opacity to confidence bounds', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...defaultProps} />
        </ThemeProvider>,
      );
    });

    await act(async () => {
      const switchBase = screen.getByTestId('confidence-switch');
      fireEvent.click(switchBase);
    });

    await vi.waitFor(
      () => {
        const plotData = getPlotData();
        const trace = plotData[0];

        expect(trace.line).toBeDefined();
        expect(trace.line.color).toBe(mockTheme.palette.graph?.purple);
        expect(trace.line.width).toBe(3);
      },
      { timeout: 1000 },
    );
  });

  it('uses correct fill direction with tonexty', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...defaultProps} />
        </ThemeProvider>,
      );
    });

    await act(async () => {
      const switchBase = screen.getByTestId('confidence-switch');
      fireEvent.click(switchBase);
    });

    await vi.waitFor(
      () => {
        const plotData = getPlotData();
        expect(plotData).toBeDefined();
        expect(Array.isArray(plotData)).toBe(true);

        expect(plotData[0].name).toBe('SN123');
        expect(plotData[0].type).toBe('scatter');
        expect(plotData[0].mode).toBe('lines');
        expect(plotData[0].line.color).toBe(mockTheme.palette.graph?.purple);
      },
      { timeout: 1000 },
    );
  });

  it('toggles confidence intervals visibility on switch change', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...defaultProps} />
        </ThemeProvider>,
      );
    });

    let plotData = getPlotData();
    expect(plotData).toHaveLength(1); // Initially one trace

    await act(async () => {
      const switchBase = screen.getByTestId('confidence-switch');
      fireEvent.click(switchBase);
    });

    await vi.waitFor(
      () => {
        plotData = getPlotData();
        expect(plotData[0].y).toBeDefined();
        expect(Array.isArray(plotData[0].y)).toBe(true);
        expect(plotData[0].y.length).toBeGreaterThan(0);
      },
      { timeout: 1000 },
    );
  });

  it('renders filter section with radio buttons for aircraftUnit type', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...defaultProps} />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(() => {
      const radioButtons = [
        ...screen.getAllByText('10 aircraft with the highest failure probability'),
        ...screen.getAllByText('10 aircraft with the lowest failure probability'),
      ];
      expect(radioButtons).toHaveLength(2); // Verify we have both "highest" and "lowest" options
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();

      // Get all radio labels within the group
      const radioLabels = screen.getAllByRole('radio');
      expect(radioLabels).toHaveLength(3); // highest, lowest, custom

      // Check for the Custom option which should be unique
      const customOption = screen.getByLabelText('Custom');
      expect(customOption).toBeInTheDocument();
    });
  });

  it('shows loading state when fetching data', async () => {
    const propsWithLoading = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        isFetching: true,
      },
    };

    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...propsWithLoading} />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('renders empty plot when no risk predictions', async () => {
    const propsWithNoData = {
      ...defaultProps,
      data: {
        ...defaultProps.data,
        riskPredictions: [],
      },
    };

    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...propsWithNoData} />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(() => {
      const plotData = getPlotData();
      expect(plotData).toHaveLength(1);
      expect(plotData[0].showlegend).toBe(false);
      expect(plotData[0].line.width).toBe(0);
    });
  });

  it('handles model type filter section', async () => {
    const modelTypeProps = {
      ...defaultProps,
      config: {
        ...defaultProps.config,
        modelType: 'model' as const,
      },
      data: {
        ...defaultProps.data,
        availableSerialNumbers: ['SN123', 'SN124', 'SN125'],
        customOptions: ['Option1', 'Option2', 'Option3'],
      },
    };

    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...modelTypeProps} />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(() => {
      expect(screen.getByText('Filter risk predictions by model')).toBeInTheDocument();
    });
  });
  it('renders correctly for aircraftUnit type', async () => {
    const aircraftUnitProps = {
      ...defaultProps,
      config: {
        modelType: 'aircraftUnit' as const,
        modelLabel: 'aircraft',
        maxSelections: 10,
        showConfidenceToggle: false,
        width: '95%',
        isLoading: true,
      },
    };

    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...aircraftUnitProps} />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(() => {
      // Get the radio group and verify its options
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();

      // Verify confidence toggle is not shown
      expect(screen.queryByTestId('confidence-switch')).not.toBeInTheDocument();
    });
  });

  it('renders correctly for component type', async () => {
    const componentProps = {
      ...defaultProps,
      config: {
        modelType: 'component' as const,
        maxSelections: 10,
        width: '95%',
        showConfidenceToggle: false,
        isLoading: true,
      },
    };

    await act(async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <ComponentFailurePredictions {...componentProps} />
        </ThemeProvider>,
      );
    });

    await vi.waitFor(() => {
      // Get the radio group and verify its options
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();

      // Verify confidence toggle is not shown
      expect(screen.queryByTestId('confidence-switch')).not.toBeInTheDocument();
    });
  });
  
  describe('generateYValues', () => {
    const mockPredictionForYValues: IComponentRiskPrediction = {
      nomenclature: 'Test Component',
      part_number: 'TEST123',
      serial_number: 'SN123',
      failure_detail: {
        failure_prob_0: 0.5,
        failure_upper_0: 0.6,
        failure_lower_0: 0.4,
        failure_prob_5: 0.5,
        failure_upper_5: 0.6,
        failure_lower_5: 0.4,
      } as IFailureDetail,
    };

    it('generates correct probability values', async () => {
      await act(async () => {
        render(
          <ThemeProvider theme={mockTheme}>
            <ComponentFailurePredictions {...defaultProps} />
          </ThemeProvider>,
        );
      });

      await act(async () => {
        const switchBase = screen.getByTestId('confidence-switch');
        fireEvent.click(switchBase);
      });

      await vi.waitFor(() => {
        const plotData = getPlotData();
        expect(plotData[0].y).toBeDefined();
        expect(plotData[0].y).toHaveLength(21); // 0 to 100 in steps of 5
        expect(plotData[0].y[0]).toBe(50); // 0.5 * 100
      });
    });

    it('generates correct upper and lower bounds', async () => {
      const RELATIVE_MIN_RANGE = 0.15;
      await act(async () => {
        render(
          <ThemeProvider theme={mockTheme}>
            <ComponentFailurePredictions {...defaultProps} />
          </ThemeProvider>,
        );
      });

      await act(async () => {
        const switchBase = screen.getByTestId('confidence-switch');
        fireEvent.click(switchBase);
      });

      await vi.waitFor(() => {
        const plotData = getPlotData();
        const mainTrace = plotData[0];
        expect(mainTrace.y).toBeDefined();
        expect(mainTrace.y).toHaveLength(21);

        // Check first value
        const firstValue = mainTrace.y[0];
        expect(firstValue).toBe(50); // 0.5 * 100

        // Check bounds if they exist
        if (plotData.length > 1) {
          const upperTrace = plotData.find((t: { name: string | string[] }) => t.name.includes('Upper'));
          const lowerTrace = plotData.find((t: { name: string | string[] }) => t.name.includes('Lower'));

          if (upperTrace && lowerTrace) {
            expect(upperTrace.y[0]).toBe(50 * (1 - RELATIVE_MIN_RANGE));
            expect(lowerTrace.y[0]).toBe(50 * (1 + RELATIVE_MIN_RANGE));
          }
        }
      });
    });

    it('handles missing values by defaulting to 0', async () => {
      const propsWithIncompleteData = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          riskPredictions: [
            {
              ...mockPredictionForYValues,
              failure_detail: {
                failure_prob_0: 0.5,
              } as IFailureDetail,
            } as IComponentRiskPrediction,
          ],
        },
      };

      await act(async () => {
        render(
          <ThemeProvider theme={mockTheme}>
            <ComponentFailurePredictions {...propsWithIncompleteData} />
          </ThemeProvider>,
        );
      });

      await vi.waitFor(() => {
        const plotData = getPlotData();
        expect(plotData[0].y[0]).toBe(50); // 0.5 * 100
        expect(plotData[0].y[1]).toBe(0); // missing value defaults to 0
      });
    });

    it('generates traces with confidence bounds when showConfidence is true', async () => {
      const propsWithConfidence = {
        ...defaultProps,
        config: {
          ...defaultProps.config,
          showConfidenceToggle: true,
        },
      };

      await act(async () => {
        render(
          <ThemeProvider theme={mockTheme}>
            <ComponentFailurePredictions {...propsWithConfidence} />
          </ThemeProvider>,
        );
      });

      await act(async () => {
        const switchBase = screen.getByTestId('confidence-switch');
        fireEvent.click(switchBase);
      });

      await vi.waitFor(() => {
        const plotData = getPlotData();
        expect(plotData).toHaveLength(1); // Main trace only

        // Check main trace
        expect(plotData[0].name).toBe('SN123');
        expect(plotData[0].line.color).toBe(mockTheme.palette.graph?.purple);
        expect(plotData[0].line.width).toBe(3);
      });
    });

    it('generates all types of y-values', async () => {
      const mockPred = {
        ...mockRiskPrediction,
        failure_detail: {
          failure_prob_0: 0.5,
          failure_upper_0: 0.6,
          failure_lower_0: 0.4,
        } as IFailureDetail,
      };

      const propsWithData = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          riskPredictions: [mockPred],
        },
      };

      await act(async () => {
        render(
          <ThemeProvider theme={mockTheme}>
            <ComponentFailurePredictions {...propsWithData} />
          </ThemeProvider>,
        );
      });

      await act(async () => {
        const switchBase = screen.getByTestId('confidence-switch');
        fireEvent.click(switchBase);
      });

      await vi.waitFor(() => {
        const plotData = getPlotData();

        // Check main value only
        expect(plotData[0].y[0]).toBe(50); // 0.5 * 100
      });
    });
  });
});
