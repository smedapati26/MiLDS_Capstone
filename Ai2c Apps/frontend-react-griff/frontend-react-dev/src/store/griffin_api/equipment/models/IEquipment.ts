export interface IAircraftModelStatusDto {
  model: string;
  total: number;
  rtl: number;
  nrtl: number;
  in_phase: number;
  fmc_count: number;
  fmc_percent: number;
  pmc_count: number;
  pmc_percent: number;
  nmc_count: number;
  nmc_percent: number;
  dade_count: number;
  dade_percent: number;
}

export interface IAircraftModelStatus {
  model: string;
  total: number;
  rtl: number;
  nrtl: number;
  inPhase: number;
  fmcCount: number;
  fmcPercent: number;
  pmcCount: number;
  pmcPercent: number;
  nmcCount: number;
  nmcPercent: number;
  dadeCount: number;
  dadePercent: number;
}

/**
 * Maps of Dto object to react friendly object
 */

export const mapToAircraftModelStatus = (dto: IAircraftModelStatusDto): IAircraftModelStatus => ({
  model: dto.model,
  total: dto.total,
  rtl: dto.rtl,
  nrtl: dto.nrtl,
  inPhase: dto.in_phase,
  fmcCount: dto.fmc_count,
  fmcPercent: dto.fmc_percent,
  pmcCount: dto.pmc_count,
  pmcPercent: dto.pmc_percent,
  nmcCount: dto.nmc_count,
  nmcPercent: dto.nmc_percent,
  dadeCount: dto.dade_count,
  dadePercent: dto.dade_percent,
});
