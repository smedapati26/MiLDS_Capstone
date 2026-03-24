import { createContext, Dispatch, SetStateAction } from 'react';

interface HoursFlownData {
  uic: string;
  start_date: string;
  end_date: string;
  validDateRange: boolean;
}

interface ParamsContext extends HoursFlownData {
  similarUnits: { [key: string]: { label: string; value: string } };
  units: string[] | undefined;
  subordinates: string[] | undefined;
  models: string[] | undefined;
  setUnits: Dispatch<SetStateAction<ParamsContext['units']>>;
  setModels: Dispatch<SetStateAction<ParamsContext['models']>>;
  setSubordinates: Dispatch<SetStateAction<ParamsContext['subordinates']>>;
}

const safeParams: ParamsContext = {
  uic: '',
  start_date: '',
  end_date: '',
  validDateRange: false,
  similarUnits: {},
  units: undefined,
  subordinates: undefined,
  models: undefined,
  setUnits: () => {},
  setModels: () => {},
  setSubordinates: () => {},
};

export const ParamsContext = createContext<ParamsContext>(safeParams);
