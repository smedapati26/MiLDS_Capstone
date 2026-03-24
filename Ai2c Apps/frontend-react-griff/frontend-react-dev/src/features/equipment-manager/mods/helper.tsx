import { TrackingVariableOptions } from '@store/griffin_api/mods/models';

export type ModAircraftAssignment = {
  id: number;
  serialNumber: string;
  aircraft: string | undefined;
};

export const getTrackingValueOptions = (trackingVariable: string | undefined): string[] | undefined => {
  switch (trackingVariable) {
    case TrackingVariableOptions.STATUS.value:
      return ['FMC', 'PMC', 'NMC', 'DADE'];
    case TrackingVariableOptions.INSTALL.value:
      return ['INSTALLED', 'NOT INSTALLED'];
    default:
      return undefined;
  }
};
