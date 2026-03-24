import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Echelon } from '@ai2c/pmx-mui/models';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

type EquipmentManagerContextType = {
  filteredUnit: IUnitBrief;
  setFilteredUnit: (uic: IUnitBrief) => void;
  resetFilteredUnit: () => void;
  chosenUic: string;
  setChosenUic: (uic: string) => void;
};

const EquipmentManagerContext = createContext<EquipmentManagerContextType | null>(null);

export const EquipmentManagerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const globalUic = useAppSelector(selectCurrentUic);
  const [chosenUic, setChosenUic] = useState<string>('');
  const [filteredUnit, setFilteredUnit] = useState<IUnitBrief>({
    uic: '',
    component: '',
    displayName: '',
    level: 0,
    echelon: Echelon.ACTIVITY,
    shortName: '',
  });

  const resetFilteredUnit = useCallback(() => {
    setFilteredUnit({
      uic: '',
      component: '',
      displayName: '',
      level: 0,
      echelon: Echelon.ACTIVITY,
      shortName: '',
    });
  }, []);

  useEffect(() => {
    if (filteredUnit.uic !== '') {
      setChosenUic(filteredUnit.uic);
    } else {
      setChosenUic(globalUic);
    }
  }, [filteredUnit.uic, globalUic]);

  const contextValues = useMemo(
    () => ({
      filteredUnit,
      setFilteredUnit,
      resetFilteredUnit,
      chosenUic,
      setChosenUic,
    }),
    [chosenUic, filteredUnit, resetFilteredUnit],
  );

  return <EquipmentManagerContext.Provider value={contextValues}>{children}</EquipmentManagerContext.Provider>;
};

export const useEquipmentManagerContext = () => {
  const ctx = useContext(EquipmentManagerContext);
  if (!ctx) throw new Error('useEquipmentManager context must be within EquipmentManagerProvider');
  return ctx;
};
