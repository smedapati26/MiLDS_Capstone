/* Represents the output data transfer object */
export interface IStatusOverTimeDto {
  reporting_month: string;
  total_fmc_hours: number;
  total_field_hours: number;
  total_pmcm_hours: number;
  total_pmcs_hours: number;
  total_dade_hours: number;
  total_sust_hours: number;
  total_nmcs_hours: number;
  total_hours_in_status: number;
}

/*  Represents Equipment Status over time monthly reporting period */
export interface IStatusOverTime {
  reportingMonth: string;
  totalFieldHours: number;
  totalFmcHours: number;
  totalPmcsHours: number;
  totalPmcmHours: number;
  totalNmcsHours: number;
  totalDadeHours: number;
  totalSustHours: number;
  totalHoursInStatus: number;
  nmcmHours?: number;
  fmcHoursPercentage: number;
  pmcsHoursPercentage: number;
  pmcmHoursPercentage: number;
  nmcsHoursPercentage: number;
  dadeHoursPercentage: number;
  nmcmHoursPercentage: number;
}

/**
 * Maps an StatusOverTimeDto object to an IStatusOverTime object.
 *
 * @param dto - The data transfer object containing status over time information for a units monthly reporting period.
 * @derivedParams Calculates percentages
 * @returns An IStatusOverTime object with the mapped properties.
 */
export function mapToIStatusOverTime(dto: IStatusOverTimeDto): IStatusOverTime {
  return {
    reportingMonth: dto.reporting_month,
    totalFmcHours: dto.total_fmc_hours,
    totalPmcmHours: dto.total_pmcm_hours,
    totalPmcsHours: dto.total_pmcs_hours,
    totalNmcsHours: dto.total_nmcs_hours,
    totalDadeHours: dto.total_dade_hours,
    totalSustHours: dto.total_sust_hours,
    totalFieldHours: dto.total_field_hours,
    totalHoursInStatus: dto.total_hours_in_status,
    // Derived Variables
    fmcHoursPercentage: dto.total_fmc_hours / dto.total_hours_in_status,
    pmcsHoursPercentage: dto.total_pmcm_hours / dto.total_hours_in_status,
    pmcmHoursPercentage: dto.total_pmcs_hours / dto.total_hours_in_status,
    nmcsHoursPercentage: dto.total_nmcs_hours / dto.total_hours_in_status,
    dadeHoursPercentage: dto.total_dade_hours / dto.total_hours_in_status,
    nmcmHoursPercentage: (dto.total_sust_hours + dto.total_field_hours) / dto.total_hours_in_status,
  };
}
