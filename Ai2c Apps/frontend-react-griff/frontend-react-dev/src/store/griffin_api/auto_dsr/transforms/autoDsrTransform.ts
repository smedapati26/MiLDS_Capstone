import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

import { IAutoDsr, IAutoDsrDto, mapToIAutoDsr } from '../models/IAutoDsr';

/* IStatusStatInfo */
export type IStatusStatInfo = {
  status: string;
  count: number;
  percentage: number;
  data: Array<IAutoDsrDto>;
};

export type IAutoDsrUnit = {
  uic: string;
  name: string;
};

/* Transform structure for derived variables */
export type IAutoDsrTransform = {
  data: Array<IAutoDsr>;
  totalAircraft: number;
  aircraftStatusStats: Array<IStatusStatInfo>;
  rtl: number;
  nrtl: number;
  units: Array<IAutoDsrUnit>;
};

/**
 * Groups aircraft data by unit UIC efficiently using a Map-based approach
 * @param response Array of IAutoDsrDto to group by unit
 * @returns Array of units with their grouped aircraft data
 */
function groupDataByUnit(
  response: Array<IAutoDsrDto>,
): Array<{ uic: string; name: string; unitData: Array<IAutoDsr> }> {
  // Group data by unit UIC in a single pass - O(n) complexity
  const unitsMap = response.reduce((acc, data) => {
    const uic = data.current_unit_uic.toUpperCase();

    if (!acc.has(uic)) {
      acc.set(uic, {
        uic,
        name: data.current_unit_name,
        unitData: [],
      });
    }

    acc.get(uic)!.unitData.push(mapToIAutoDsr(data));
    return acc;
  }, new Map<string, { uic: string; name: string; unitData: Array<IAutoDsr> }>());

  return Array.from(unitsMap.values());
}

// Variables used to aggregate all status that are NMCM
export const NMCM_STATUSES = [
  OperationalReadinessStatusEnum.NMC,
  OperationalReadinessStatusEnum.NMCM,
  OperationalReadinessStatusEnum.SUST,
  OperationalReadinessStatusEnum.FIELD,
  OperationalReadinessStatusEnum.MOC, // MOC aggregates to NMCM
];

export const PMCM_STATUSES = [OperationalReadinessStatusEnum.PMC, OperationalReadinessStatusEnum.PMCM];

// FMC statuses (including MTF which aggregates to FMC)
export const FMC_STATUSES = [OperationalReadinessStatusEnum.FMC, OperationalReadinessStatusEnum.MTF];

/**
 * Transform IAutoDsrDto data into IAutoDsrTransform
 * @param response Array of raw aircraft data from API
 * @returns Transformed data structure with aggregated statistics and grouped units
 */
export function transformAutoDsr(response: Array<IAutoDsrDto>): IAutoDsrTransform {
  const fmcAircraft = response.filter((a) => FMC_STATUSES.includes(a.status as OperationalReadinessStatusEnum));
  const nmcmAircraft = response.filter((a) => NMCM_STATUSES.includes(a.status as OperationalReadinessStatusEnum));
  const pmcmAircraft = response.filter((a) => PMCM_STATUSES.includes(a.status as OperationalReadinessStatusEnum));

  // Derived variables
  const totalAircraft = response.length;
  const statusStats: Array<IStatusStatInfo> = [];

  // Use the efficient grouping function
  const unitsWithData = groupDataByUnit(response);

  // Display stat info & order
  const statusDisplay = [
    OperationalReadinessStatusEnum.FMC,
    OperationalReadinessStatusEnum.PMCS,
    OperationalReadinessStatusEnum.PMCM,
    OperationalReadinessStatusEnum.NMCS,
    OperationalReadinessStatusEnum.NMCM,
    OperationalReadinessStatusEnum.DADE,
  ];

  // Round by one decimal place

  // Loop through display status to build statistics
  statusDisplay.forEach((status) => {
    // Aircraft data with same status
    const aircraft = response.filter((a) => a.status === status);

    if (status === OperationalReadinessStatusEnum.FMC) {
      // Special handling for FMC status (includes MTF)
      statusStats.push({
        status: OperationalReadinessStatusEnum.FMC,
        count: fmcAircraft.length,
        percentage: totalAircraft > 0 ? Math.round((fmcAircraft.length / totalAircraft) * 100) / 100 : 0,
        data: fmcAircraft,
      });
    } else if (status === OperationalReadinessStatusEnum.NMCM) {
      // Special handling for NMCM status (includes MOC)
      statusStats.push({
        status: OperationalReadinessStatusEnum.NMCM,
        count: nmcmAircraft.length,
        percentage: totalAircraft > 0 ? Math.round((nmcmAircraft.length / totalAircraft) * 100) / 100 : 0,
        data: nmcmAircraft,
      });
    } else if (status === OperationalReadinessStatusEnum.PMCM) {
      statusStats.push({
        status: OperationalReadinessStatusEnum.PMCM,
        count: pmcmAircraft.length,
        percentage: totalAircraft > 0 ? Math.round((pmcmAircraft.length / totalAircraft) * 100) / 100 : 0,
        data: pmcmAircraft,
      });
    } else {
      // Append regular status
      statusStats.push({
        status: status,
        count: aircraft.length,
        percentage: totalAircraft > 0 ? Math.round((aircraft.length / totalAircraft) * 100) / 100 : 0,
        data: aircraft,
      });
    }
  });

  // Calculate RTL/NRTL counts
  const rtlCount = response.reduce((acc, aircraftData) => {
    const value = aircraftData.rtl === 'RTL' ? 1 : 0;
    return acc + value;
  }, 0);
  const nrtlCount = totalAircraft - rtlCount;

  return {
    data: response.map(mapToIAutoDsr),
    totalAircraft: totalAircraft,
    aircraftStatusStats: statusStats,
    rtl: rtlCount,
    nrtl: nrtlCount,
    units: unitsWithData.map((unit) => ({ uic: unit.uic, name: unit.name })).sort((a, b) => (a.uic < b.uic ? -1 : 1)),
  };
}
