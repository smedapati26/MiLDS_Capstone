import { useTheme } from '@mui/material';

import { OperationalReadinessStatusEnum } from '@models/OperationalReadinessStatusEnum';

export type TagColor = {
  color?: string;
  backgroundColor?: string;
};

export default function useDataDisplayTagColor(key: string | OperationalReadinessStatusEnum): TagColor {
  const { palette } = useTheme();
  const isDarkMode = palette.mode === 'dark';

  switch (key) {
    case OperationalReadinessStatusEnum.FMC:
    case OperationalReadinessStatusEnum.MTF:
      return {
        color: isDarkMode ? palette.success.d60 : palette.text.contrastText,
        backgroundColor: isDarkMode ? palette.success.l80 : palette.success.d20,
      };
    case OperationalReadinessStatusEnum.PMC:
    case OperationalReadinessStatusEnum.PMCS:
    case OperationalReadinessStatusEnum.PMCM:
      return {
        color: isDarkMode ? palette.warning.d60 : palette.text.primary,
        backgroundColor: isDarkMode ? palette.warning.l60 : palette.warning.main,
      };
    case OperationalReadinessStatusEnum.NMC:
    case OperationalReadinessStatusEnum.NMCM:
    case OperationalReadinessStatusEnum.NMCS:
    case OperationalReadinessStatusEnum.SUST:
    case OperationalReadinessStatusEnum.MOC:
    case OperationalReadinessStatusEnum.FIELD:
      return {
        color: isDarkMode ? palette.error.d60 : palette.text.contrastText,
        backgroundColor: isDarkMode ? palette.error.l80 : palette.error.d20,
      };
    case OperationalReadinessStatusEnum.DADE:
      return {
        color: isDarkMode ? palette.info.d60 : palette.text.contrastText,
        backgroundColor: isDarkMode ? palette.info.l60 : palette.info.d40,
      };
    default:
      return {
        color: palette.text.primary,
        backgroundColor: palette.grey.l40,
      };
  }
}
