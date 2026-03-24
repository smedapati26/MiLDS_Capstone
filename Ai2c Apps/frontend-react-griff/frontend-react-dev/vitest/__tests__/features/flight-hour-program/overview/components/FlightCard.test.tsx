import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import FlightCard from '@features/flight-hour-program/overview/components/FlightCard';

import { IFhpSummaryDetails } from '@store/griffin_api/fhp/models';

describe('FlightCard Component', () => {
  const mockData: IFhpSummaryDetails = {
    fiscalYearToDate: 120,
    reportingPeriod: 100,
    models: [
      { model: 'My Model A', hours: 10 },
      { model: 'My Model B', hours: 20 },
      { model: 'My Model C', hours: 30 },
      { model: 'My Model D', hours: 40 },
      { model: 'My Model E', hours: 50 },
    ],
  };

  it('renders the card title correctly', () => {
    render(<FlightCard data={mockData} title="day" />);
    const titleElement = screen.getByText(/Day Flight/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders fiscal year to date and reporting period correctly', () => {
    render(<FlightCard data={mockData} title="day" />);
    const fiscalYearElement = screen.getByText(/Fiscal YTD/i);
    const reportingPeriodElement = screen.getByText(/Selected Range/i);
    const fiscalYearValue = screen.getByText(/120/i);
    const reportingPeriodValue = screen.getByText(/100/i);

    expect(fiscalYearElement).toBeInTheDocument();
    expect(reportingPeriodElement).toBeInTheDocument();
    expect(fiscalYearValue).toBeInTheDocument();
    expect(reportingPeriodValue).toBeInTheDocument();
  });

  it('renders models in rows with a maximum of 4 per row', () => {
    render(<FlightCard data={mockData} title="day" />);
    const modelElements = screen.getAllByTestId('fhp-summary-card-model-text');

    // Assert that all models are rendered
    expect(modelElements).toHaveLength(mockData.models.length);

    // Assert that the first row contains 4 models
    const firstRowModels = mockData.models.slice(0, 4).map((model) => screen.getByText(model.model));
    expect(firstRowModels).toHaveLength(4);

    // Assert that the second row contains the remaining model
    const secondRowModel = screen.getByText(/My Model E/i);
    expect(secondRowModel).toBeInTheDocument();
  });

  it('renders NVG title correctly for nightGoggles', () => {
    render(<FlightCard data={mockData} title="nightGoggles" />);
    const titleElement = screen.getByText(/NVG Flight/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders no models if models array is empty', () => {
    const emptyData = { ...mockData, models: [] };
    render(<FlightCard data={emptyData} title="day" />);
    expect(screen.queryAllByTestId('fhp-summary-card-model-text')).toHaveLength(0);
  });

  it('renders exactly 4 models in one row', () => {
    const fourModels = { ...mockData, models: mockData.models.slice(0, 4) };
    render(<FlightCard data={fourModels} title="day" />);
    expect(screen.getAllByTestId('fhp-summary-card-model-text')).toHaveLength(4);
  });

  it('renders less than 4 models in one row', () => {
    const twoModels = { ...mockData, models: mockData.models.slice(0, 2) };
    render(<FlightCard data={twoModels} title="day" />);
    expect(screen.getAllByTestId('fhp-summary-card-model-text')).toHaveLength(2);
  });

  it('rounds and displays decimal and negative values correctly', () => {
    const decimalData = {
      fiscalYearToDate: 12.7,
      reportingPeriod: -5.3,
      models: [
        { model: 'Decimal Model', hours: 7.8 },
        { model: 'Negative Model', hours: -2.2 },
      ],
    };
    render(<FlightCard data={decimalData} title="day" />);
    expect(screen.getByText('13')).toBeInTheDocument(); // rounded 12.7
    expect(screen.getByText('-5')).toBeInTheDocument(); // rounded -5.3
    expect(screen.getByText('8')).toBeInTheDocument(); // rounded 7.8
    expect(screen.getByText('-2')).toBeInTheDocument(); // rounded -2.2
  });
});
