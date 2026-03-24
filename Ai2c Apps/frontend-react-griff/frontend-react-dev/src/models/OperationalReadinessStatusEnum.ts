/* Operational Readiness Status Enum */
export enum OperationalReadinessStatusEnum {
  FMC = 'FMC', // Fully Mission Capable
  PMC = 'PMC', // Partially Mission Capable
  PMCS = 'PMCS', // Fully Mission Capable - Sustainment
  PMCM = 'PMCM', // Fully Mission Capable - Maintenance
  NMC = 'NMC', // Non Mission Capable
  NMCS = 'NMCS', // Non Mission Capable - Supply
  NMCM = 'NMCM', // // Non Mission Capable - Maintenance
  FIELD = 'FIELD', // NMCM
  SUST = 'SUST', // Sustainment
  DADE = 'DADE', // Department of the Army Directed Event
  MTF = 'MTF', // Maintenance Test Flight
  MOC = 'MOC', // Maintenance Operational Check
  UNK = 'UNK', // Unknown
}

// Gets Basic Operational Readiness status
export const getBasicOrStatus = (status: OperationalReadinessStatusEnum | string): OperationalReadinessStatusEnum => {
  switch (status) {
    case OperationalReadinessStatusEnum.FMC:
    case OperationalReadinessStatusEnum.MTF:
      return OperationalReadinessStatusEnum.FMC;
    case OperationalReadinessStatusEnum.PMC:
    case OperationalReadinessStatusEnum.PMCM:
    case OperationalReadinessStatusEnum.PMCS:
      return OperationalReadinessStatusEnum.PMC;
    case OperationalReadinessStatusEnum.NMC:
    case OperationalReadinessStatusEnum.NMCM:
    case OperationalReadinessStatusEnum.NMCS:
    case OperationalReadinessStatusEnum.FIELD:
    case OperationalReadinessStatusEnum.SUST:
    case OperationalReadinessStatusEnum.MOC:
      return OperationalReadinessStatusEnum.NMC;
    case OperationalReadinessStatusEnum.DADE:
      return OperationalReadinessStatusEnum.DADE;
    default:
      return OperationalReadinessStatusEnum.UNK;
  }
};

// Gets Operational Readiness status
export const getOrStatus = (status: OperationalReadinessStatusEnum | string): OperationalReadinessStatusEnum => {
  switch (status) {
    case OperationalReadinessStatusEnum.FMC:
    case OperationalReadinessStatusEnum.MTF:
      return OperationalReadinessStatusEnum.FMC;
    case OperationalReadinessStatusEnum.PMC:
    case OperationalReadinessStatusEnum.PMCM:
      return OperationalReadinessStatusEnum.PMCM;
    case OperationalReadinessStatusEnum.PMCS:
      return OperationalReadinessStatusEnum.PMCS;
    case OperationalReadinessStatusEnum.NMC:
    case OperationalReadinessStatusEnum.NMCM:
    case OperationalReadinessStatusEnum.SUST:
    case OperationalReadinessStatusEnum.FIELD:
    case OperationalReadinessStatusEnum.MOC:
      return OperationalReadinessStatusEnum.NMCM;
    case OperationalReadinessStatusEnum.NMCS:
      return OperationalReadinessStatusEnum.NMCS;
    case OperationalReadinessStatusEnum.DADE:
      return OperationalReadinessStatusEnum.DADE;
    default:
      return OperationalReadinessStatusEnum.UNK;
  }
};
