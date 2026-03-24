import { useTheme } from '@mui/material';

import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

export default function useOrStatusColor(key: string | OperationalReadinessStatusEnum) {
  const { palette } = useTheme();

  switch (key) {
    case OperationalReadinessStatusEnum.FMC:
      return palette.operational_readiness_status.fmc;
    case OperationalReadinessStatusEnum.PMCS:
      return palette.operational_readiness_status.pmcs;
    case OperationalReadinessStatusEnum.PMCM:
      return palette.operational_readiness_status.pmcm;
    case OperationalReadinessStatusEnum.NMCS:
      return palette.operational_readiness_status.nmcs;
    case OperationalReadinessStatusEnum.NMC:
    case OperationalReadinessStatusEnum.NMCM:
    case OperationalReadinessStatusEnum.SUST:
    case OperationalReadinessStatusEnum.FIELD:
      return palette.operational_readiness_status.nmcm;
    case OperationalReadinessStatusEnum.DADE:
      return palette.operational_readiness_status.dade;
    default:
      return palette.text.secondary;
  }
}
