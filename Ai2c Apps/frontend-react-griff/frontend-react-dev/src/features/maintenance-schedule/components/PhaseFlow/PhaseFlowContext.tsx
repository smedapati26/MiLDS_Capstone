import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useTheme } from '@mui/material/styles';

import { getChartColors } from '@utils/helpers/chartHelpers';

export type CompanyOption = {
  uic: string;
  color: string;
  selected: boolean;
};
export type PhaseFamilies = 'CHINOOK' | 'BLACK HAWK' | 'APACHE';
const FamilyPhaseHours: Record<PhaseFamilies, number> = {
  'BLACK HAWK': 480,
  CHINOOK: 640,
  APACHE: 500,
};

type PhaseFlowContextType = {
  selectedFamily: PhaseFamilies[];
  setSelectedFamily: (name: PhaseFamilies[]) => void;
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  companyOption: CompanyOption[] | undefined;
  toggleCompanyOption: (companyUic: string) => void;
  initializeCompany: (companyUic: string[] | undefined) => void;
  chinookPhase: string;
  setChinookPhase: (phase: string) => void;
  getFamilyPhaseHours: () => number;
};

const PhaseFlowContext = createContext<PhaseFlowContextType | null>(null);

export const PhaseFlowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedFamily, setSelectedFamily] = useState<PhaseFamilies[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [companyOption, setCompanyOption] = useState<CompanyOption[] | undefined>(undefined);
  const [chinookPhase, setChinookPhase] = useState<string>('640');

  const getFamilyPhaseHours = useCallback(() => {
    if (selectedFamily.length > 0) {
      if (selectedFamily[0] === 'CHINOOK' && chinookPhase === '320') {
        return 320;
      }
      return FamilyPhaseHours[selectedFamily[0]];
    }

    return 360;
  }, [chinookPhase, selectedFamily]);

  const theme = useTheme();

  const initializeCompany = useCallback(
    (companyUic: string[] | undefined): void => {
      const value = companyUic?.map((uic, index) => ({
        uic,
        color: getChartColors(index, theme),
        selected: true,
      }));

      setCompanyOption(value);
    },
    [theme],
  );

  const toggleCompanyOption = useCallback((uic: string): void => {
    setCompanyOption((prev) => prev?.map((opt) => (opt.uic === uic ? { ...opt, selected: !opt.selected } : opt)));
  }, []);

  const contextValues = useMemo(
    () => ({
      selectedFamily,
      setSelectedFamily,
      selectedModels,
      setSelectedModels,
      companyOption,
      initializeCompany,
      toggleCompanyOption,
      chinookPhase,
      setChinookPhase,
      getFamilyPhaseHours,
    }),
    [
      selectedFamily,
      selectedModels,
      companyOption,
      initializeCompany,
      toggleCompanyOption,
      chinookPhase,
      getFamilyPhaseHours,
    ],
  );

  return <PhaseFlowContext.Provider value={contextValues}>{children}</PhaseFlowContext.Provider>;
};

export const usePhaseFlowContext = () => {
  const ctx = useContext(PhaseFlowContext);
  if (!ctx) throw new Error('usePhaseFlow context must be within PhaseFlowProvider.');
  return ctx;
};
