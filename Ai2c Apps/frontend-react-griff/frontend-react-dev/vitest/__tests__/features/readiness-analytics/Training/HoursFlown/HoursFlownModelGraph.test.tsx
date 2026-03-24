import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ParamsContext } from '@features/readiness-analytics/Training/HoursFlown/HoursFlownContext';
import HoursFlownModelGraph from '@features/readiness-analytics/Training/HoursFlown/HoursFlownModelGraph';

import { ProviderWrapper } from '@vitest/helpers/ProviderWrapper';

// Mock dayjs
vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '15OCT23'),
  })),
}));

// Mock the MultiSelectDropDown component
vi.mock('@components/dropdowns/MultiSelectDropDown', () => ({
  default: ({
    value,
    onSelectionChange,
    label,
  }: {
    value?: string[];
    onSelectionChange: (values: string[]) => void;
    label: string;
  }) => (
    <div data-testid="multi-select-dropdown">
      <span>{label}</span>
      <button data-testid="dropdown-button" onClick={() => onSelectionChange(['CH-047f'])}>
        Select Models
      </button>
      <div data-testid="selected-values">{value?.join(', ')}</div>
    </div>
  ),
}));

// Mock react-plotly.js locally to override global mock
vi.mock('react-plotly.js', () => ({
  default: ({ data }: { data?: unknown[] }) => (
    <div data-testid="plot-graph-template">{data && data.length > 0 ? 'Plot rendered' : 'No data'}</div>
  ),
}));

describe('HoursFlownModelGraph', () => {
  const mockContextValue = {
    uic: 'TEST_UIC',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    validDateRange: true,
    similarUnits: {},
    units: undefined,
    subordinates: undefined,
    models: ['CH-047f'],
    setUnits: vi.fn(),
    setModels: vi.fn(),
    setSubordinates: vi.fn(),
  };

  const renderComponent = (contextValue = mockContextValue) => {
    return render(
      <ProviderWrapper>
        <ParamsContext.Provider value={contextValue}>
          <HoursFlownModelGraph />
        </ParamsContext.Provider>
      </ProviderWrapper>,
    );
  };

  it('renders the component with data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('multi-select-dropdown')).toBeInTheDocument();
      expect(screen.getByTestId('plot-graph-template')).toBeInTheDocument();
    });

    expect(screen.getByText('Choose the models you want to view.')).toBeInTheDocument();
    expect(screen.getByText('Models')).toBeInTheDocument();
  });

  it('displays selected models in dropdown', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('selected-values')).toHaveTextContent('CH-047f');
    });
  });

  it('calls setModels when selection changes', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('dropdown-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('dropdown-button'));

    expect(mockContextValue.setModels).toHaveBeenCalledWith(['CH-047f']);
  });

  it('renders plot data correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('plot-graph-template')).toHaveTextContent('Plot rendered');
    });
  });
});
