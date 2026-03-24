export interface IUnitHealthUnitAvailabilityDTO {
  unit_name: string;
  unit_uic: string;
  available_count: number;
  limited_count: number;
  unavailable_count: number;
}

export interface IUnitHealthUnitAvailability {
  unitName: string;
  unitUic: string;
  availableCount: number;
  limitedCount: number;
  unavailableCount: number;
}

export const mapToIUnitHealthUnitAvailability = (dto: IUnitHealthUnitAvailabilityDTO): IUnitHealthUnitAvailability => ({
  unitName: dto.unit_name,
  unitUic: dto.unit_uic,
  availableCount: dto.available_count,
  limitedCount: dto.limited_count,
  unavailableCount: dto.unavailable_count,
});

export interface IUnitHealthUnitEvalsDTO {
  unit_name: string;
  unit_uic: string;
  met_count: number;
  due_count: number;
  overdue_count: number;
}

export interface IUnitHealthUnitEvals {
  unitName: string;
  unitUic: string;
  metCount: number;
  dueCount: number;
  overdueCount: number;
}

export const mapToIUnitHealthUnitEvals = (dto: IUnitHealthUnitEvalsDTO): IUnitHealthUnitEvals => ({
  unitName: dto.unit_name,
  unitUic: dto.unit_uic,
  metCount: dto.met_count,
  dueCount: dto.due_count,
  overdueCount: dto.overdue_count,
});

export interface IUnitHealthMOSData {
  mos: string;
  ml0: number;
  ml1: number;
  ml2: number;
  ml3: number;
  ml4: number;
}

export interface IUnitHealthUnitMOSBreakdownDTO {
  unit_name: string;
  unit_uic: string;
  mos_list: IUnitHealthMOSData[];
}

export interface IUnitHealthUnitMOSBreakdown {
  unitName: string;
  unitUic: string;
  mosList: IUnitHealthMOSData[];
}

export const mapToIUnitHealthUnitMOSBreakdown = (dto: IUnitHealthUnitMOSBreakdownDTO): IUnitHealthUnitMOSBreakdown => ({
  unitName: dto.unit_name,
  unitUic: dto.unit_uic,
  mosList: dto.mos_list,
});

export interface IUnitHealthDataDTO {
  unit_echelon: string;
  units_availability: IUnitHealthUnitAvailabilityDTO[];
  units_evals: IUnitHealthUnitEvalsDTO[];
  units_mos_breakdowns: IUnitHealthUnitMOSBreakdownDTO[];
}

export interface IUnitHealthData {
  unitEchelon: string;
  unitsAvailability: IUnitHealthUnitAvailability[];
  unitsEvals: IUnitHealthUnitEvals[];
  unitsMosBreakdowns: IUnitHealthUnitMOSBreakdown[];
}

export const mapToIUnitHealthData = (dto: IUnitHealthDataDTO): IUnitHealthData => ({
  unitEchelon: dto.unit_echelon,
  unitsAvailability: dto.units_availability.map(mapToIUnitHealthUnitAvailability),
  unitsEvals: dto.units_evals.map(mapToIUnitHealthUnitEvals),
  unitsMosBreakdowns: dto.units_mos_breakdowns.map(mapToIUnitHealthUnitMOSBreakdown),
});
