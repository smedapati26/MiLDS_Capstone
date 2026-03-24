// Represents bank time projection DTO
export interface IBankTimeForecastDto {
  [aircraftModel: string]: {
    [date: string]: number;
  };
}

export interface IBankTimeForecastDataItem {
  date: string;
  value: number;
}

export interface IBankTimeForecast {
  model: string;
  projections: Array<IBankTimeForecastDataItem>;
}

// This function maps a DTO (data transfer object) containing bank time forecasts
// into a structured array of IBankTimeForecast objects.
export function mapBankTimeForecast(dto: IBankTimeForecastDto): Array<IBankTimeForecast> {
  return Object.entries(dto).map(([model, forecasts]) => {
    const sortedDates = Object.keys(forecasts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const projections = sortedDates.map((date) => ({
      date,
      value: forecasts[date],
    }));

    return {
      model,
      projections,
    };
  });
}
