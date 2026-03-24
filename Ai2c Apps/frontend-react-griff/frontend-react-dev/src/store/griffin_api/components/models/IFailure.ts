// Extend IUnitDateRange for failure predictions
export interface IFailurePredictionsQuery {
  horizon: number;
  aircraft: string[];
}

export interface IFailureDetail {
  // Upper bounds
  failure_upper_0: number;
  failure_upper_5: number;
  failure_upper_10: number;
  failure_upper_15: number;
  failure_upper_20: number;
  failure_upper_25: number;
  failure_upper_30: number;
  failure_upper_35: number;
  failure_upper_40: number;
  failure_upper_45: number;
  failure_upper_50: number;
  failure_upper_55: number;
  failure_upper_60: number;
  failure_upper_65: number;
  failure_upper_70: number;
  failure_upper_75: number;
  failure_upper_80: number;
  failure_upper_85: number;
  failure_upper_90: number;
  failure_upper_95: number;
  failure_upper_100: number;

  // Lower bounds
  failure_lower_0: number;
  failure_lower_5: number;
  failure_lower_10: number;
  failure_lower_15: number;
  failure_lower_20: number;
  failure_lower_25: number;
  failure_lower_30: number;
  failure_lower_35: number;
  failure_lower_40: number;
  failure_lower_45: number;
  failure_lower_50: number;
  failure_lower_55: number;
  failure_lower_60: number;
  failure_lower_65: number;
  failure_lower_70: number;
  failure_lower_75: number;
  failure_lower_80: number;
  failure_lower_85: number;
  failure_lower_90: number;
  failure_lower_95: number;
  failure_lower_100: number;

  // Probability values
  failure_prob_0: number;
  failure_prob_5: number;
  failure_prob_10: number;
  failure_prob_15: number;
  failure_prob_20: number;
  failure_prob_25: number;
  failure_prob_30: number;
  failure_prob_35: number;
  failure_prob_40: number;
  failure_prob_45: number;
  failure_prob_50: number;
  failure_prob_55: number;
  failure_prob_60: number;
  failure_prob_65: number;
  failure_prob_70: number;
  failure_prob_75: number;
  failure_prob_80: number;
  failure_prob_85: number;
  failure_prob_90: number;
  failure_prob_95: number;
  failure_prob_100: number;
}

export interface IFailurePredictionDto {
  model: string;
  wuc: string;
  part_number: string;
  nomenclature: string;
  num_failure: string;
  most_likely: string;
  future_fh: string;
}

// Failure Count Types
export interface IFailureCountDto {
  part_number: string;
  nomenclature: string;
  model: string;
  serial: string;
  failure_chance: number;
  work_unit_code: string;
}

// Mapped interface for frontend use
export interface IFailureCount {
  partNumber: string;
  nomenclature: string;
  model: string;
  serial: string;
  failureChance: number;
  wuc: string;
}

// Mapper function
export function mapToIFailureCount(dto: IFailureCountDto): IFailureCount {
  return {
    model: dto.model,
    serial: dto.serial,
    nomenclature: dto.nomenclature,
    partNumber: dto.part_number,
    failureChance: dto.failure_chance,
    wuc: dto.work_unit_code,
  };
}
