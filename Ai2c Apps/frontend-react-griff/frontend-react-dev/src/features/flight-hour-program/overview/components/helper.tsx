import { Theme } from '@mui/material';

import { IFhpModelsProgress, IFhpProgressDetails } from '@store/griffin_api/fhp/models';

/**
 * Function to group data by family type
 * @param {IFhpModelsProgress} models data to group
 * @returns
 */
export const groupByFamilyAndSumDates = (
  models: IFhpModelsProgress[],
): { family: string; dates: IFhpProgressDetails[] }[] => {
  const familyMap = new Map<string, Map<string, IFhpProgressDetails>>();

  models.forEach(({ family, dates }) => {
    if (!familyMap.has(family)) {
      familyMap.set(family, new Map());
    }
    const dateMap = familyMap.get(family)!;

    dates.forEach((detail) => {
      const dateKey = detail.date?.toString() as string;
      if (dateMap.has(dateKey)) {
        const existing = dateMap.get(dateKey)!;
        existing.actualFlightHours += detail.actualFlightHours;
        existing.projectedFlightHours += detail.projectedFlightHours;
        existing.predictedFlightHours += detail.predictedFlightHours;
      } else {
        dateMap.set(dateKey, { ...detail });
      }
    });
  });

  // Convert Map to desired array format
  return Array.from(familyMap.entries()).map(([family, dateMap]) => ({
    family,
    dates: Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
    ),
  }));
};

/**
 * Get the colors
 */
export const getGraphColorByIndex = (index: number, theme: Theme): string => {
  const colors = Object.values(theme.palette.graph);
  return colors[index % colors.length];
};
