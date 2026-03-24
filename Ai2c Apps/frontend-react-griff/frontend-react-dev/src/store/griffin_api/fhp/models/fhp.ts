// DTO
export interface IFhpModelsDto {
  model: string;
  hours: number;
}

export interface IFhpSummaryDetailsDto {
  fiscal_year_to_date: number;
  reporting_period: number;
  models: IFhpModelsDto[];
}

export interface IFhpSummaryDto {
  day: IFhpSummaryDetailsDto;
  night: IFhpSummaryDetailsDto;
  hood: IFhpSummaryDetailsDto;
  weather: IFhpSummaryDetailsDto;
  night_goggles: IFhpSummaryDetailsDto;
}

export interface IFhpProgressDetailsDto {
  date: string | Date | null;
  actual_flight_hours: number;
  projected_flight_hours: number;
  predicted_flight_hours: number;
}

export interface IFhpModelsProgressDto {
  model: string;
  family: string;
  dates: IFhpProgressDetailsDto[];
}

export interface IFhpProgressDto {
  unit: IFhpProgressDetailsDto[];
  models: IFhpModelsProgressDto[];
}

export interface IFhpProgressMultiDto {
  uic: string;
  data: IFhpProgressDto;
}

// Javascript Models

export interface IFhpModels {
  model: string;
  hours: number;
}

export interface IFhpSummaryDetails {
  fiscalYearToDate: number;
  reportingPeriod: number;
  models: IFhpModels[];
}

export interface IFhpSummary {
  day: IFhpSummaryDetails;
  night: IFhpSummaryDetails;
  hood: IFhpSummaryDetails;
  weather: IFhpSummaryDetails;
  nightGoggles: IFhpSummaryDetails;
}

export interface IFhpProgressDetails {
  date: string | Date | null;
  actualFlightHours: number;
  projectedFlightHours: number;
  predictedFlightHours: number;
}

export interface IFhpModelsProgress {
  model: string;
  family: string;
  dates: IFhpProgressDetails[];
}

export interface IFhpProgress {
  unit: IFhpProgressDetails[];
  models: IFhpModelsProgress[];
}

export interface IFhpProgressMulti {
  uic: string;
  data: IFhpProgress;
}

// Mapping function

export const mapToIFhpModels = (dto: IFhpModelsDto): IFhpModels => ({
  model: dto.model,
  hours: dto.hours,
});

export const mapToFhpSummaryDetails = (dto: IFhpSummaryDetailsDto): IFhpSummaryDetails => ({
  fiscalYearToDate: dto.fiscal_year_to_date,
  reportingPeriod: dto.reporting_period,
  models: dto.models.map(mapToIFhpModels),
});

export const mapToFhpSummary = (dto: IFhpSummaryDto): IFhpSummary => ({
  day: mapToFhpSummaryDetails(dto.day),
  night: mapToFhpSummaryDetails(dto.night),
  hood: mapToFhpSummaryDetails(dto.hood),
  weather: mapToFhpSummaryDetails(dto.weather),
  nightGoggles: mapToFhpSummaryDetails(dto.night_goggles),
});

export const mapToIFhpProgressDetails = (dto: IFhpProgressDetailsDto): IFhpProgressDetails => ({
  date: dto.date,
  actualFlightHours: dto.actual_flight_hours,
  projectedFlightHours: dto.projected_flight_hours,
  predictedFlightHours: dto.predicted_flight_hours,
});

export const mapToIFhpModelProgress = (dto: IFhpModelsProgressDto): IFhpModelsProgress => ({
  model: dto.model,
  family: dto.family,
  dates: dto.dates.map(mapToIFhpProgressDetails),
});

export const mapToIFhpProgress = (dto: IFhpProgressDto): IFhpProgress => ({
  unit: dto.unit.map(mapToIFhpProgressDetails),
  models: dto.models.map(mapToIFhpModelProgress),
});

export const mapToIFhpProgressMulti = (dto: IFhpProgressMultiDto): IFhpProgressMulti => ({
  uic: dto.uic,
  data: mapToIFhpProgress(dto.data),
});
