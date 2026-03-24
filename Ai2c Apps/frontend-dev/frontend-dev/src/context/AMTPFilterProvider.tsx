import React, { createContext, ReactNode, useContext, useState } from 'react';

import { Echelon } from '@ai2c/pmx-mui';

import { DropdownOption } from '@components/dropdowns/PmxDropdown';
import { IUnitBrief } from '@store/amap_ai/units/models';

interface AMTPFilterContextType {
  selectedFilterMOS: { label: string; value: string }[];
  setSelectedFilterMOS: React.Dispatch<React.SetStateAction<{ label: string; value: string }[]>>;
  skillLevel: { label: string; value: string }[];
  setSkillLevel: React.Dispatch<React.SetStateAction<{ label: string; value: string }[]>>;
  daysUntilDue: string;
  setDaysUntilDue: React.Dispatch<React.SetStateAction<string>>;
  isCheckboxChecked: boolean;
  setIsCheckboxChecked: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUnit?: IUnitBrief;
  setSelectedUnit: React.Dispatch<React.SetStateAction<IUnitBrief | undefined>>;
  documentType: string[];
  setDocumentType: React.Dispatch<React.SetStateAction<string[]>>;
  eventTypes: string[];
  setEventTypes: React.Dispatch<React.SetStateAction<string[]>>;
  eventInfo: string[];
  setEventInfo: React.Dispatch<React.SetStateAction<string[]>>;
  eventInfoOptions: DropdownOption[];
  setEventInfoOptions: React.Dispatch<React.SetStateAction<DropdownOption[]>>;
  recorders: string[];
  setRecorders: React.Dispatch<React.SetStateAction<string[]>>;
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  closedStartDate: string;
  setClosedStartDate: React.Dispatch<React.SetStateAction<string>>;
  closedEndDate: string;
  setClosedEndDate: React.Dispatch<React.SetStateAction<string>>;
  soldierFlagTypes: string[];
  setSoldierFlagTypes: React.Dispatch<React.SetStateAction<string[]>>;
  soldierFlagInformation: string[];
  setSoldierFlagInformation: React.Dispatch<React.SetStateAction<string[]>>;
  soldierFlagMXAvailability: string[];
  setSoldierFlagMXAvailability: React.Dispatch<React.SetStateAction<string[]>>;
  updaters: string[];
  setUpdaters: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStatusCodes: { label: string; value: string }[];
  setSelectedStatusCodes: React.Dispatch<React.SetStateAction<{ label: string; value: string }[]>>;
  selectedFaultIds: string[];
  setSelectedFaultIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedWucs: string[];
  setSelectedWucs: React.Dispatch<React.SetStateAction<string[]>>;
  clearFilters: () => void;
}

const AMTPFilterContext = createContext<AMTPFilterContextType | undefined>(undefined);

export const AMTPFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedFilterMOS, setSelectedFilterMOS] = useState<{ label: string; value: string }[]>([]);
  const [skillLevel, setSkillLevel] = useState<{ label: string; value: string }[]>([]);
  const [daysUntilDue, setDaysUntilDue] = useState<string>('');
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<IUnitBrief | undefined>(undefined);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [eventInfo, setEventInfo] = useState<string[]>([]);
  const [eventInfoOptions, setEventInfoOptions] = useState<DropdownOption[]>([]);
  const [documentType, setDocumentType] = useState<string[]>([]);
  const [recorders, setRecorders] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [closedStartDate, setClosedStartDate] = useState<string>('');
  const [closedEndDate, setClosedEndDate] = useState<string>('');
  const [soldierFlagTypes, setSoldierFlagTypes] = useState<string[]>([]);
  const [soldierFlagInformation, setSoldierFlagInformation] = useState<string[]>([]);
  const [soldierFlagMXAvailability, setSoldierFlagMXAvailability] = useState<string[]>([]);
  const [updaters, setUpdaters] = useState<string[]>([]);
  const [selectedStatusCodes, setSelectedStatusCodes] = useState<{ label: string; value: string }[]>([]);
  const [selectedFaultIds, setSelectedFaultIds] = useState<string[]>([]);
  const [selectedWucs, setSelectedWucs] = useState<string[]>([]);

  const clearFilters = () => {
    setSelectedFilterMOS([]);
    setSkillLevel([]);
    setDaysUntilDue('');
    setIsCheckboxChecked(false);
    setSelectedUnit({
      uic: '',
      shortName: '',
      displayName: '',
      echelon: Echelon.UNKNOWN,
      parentUic: '',
      nickName: '',
      component: '',
      state: '',
      level: -1,
    });
    setEventTypes([]);
    setEventInfo([]);
    setEventInfoOptions([]);
    setDocumentType([]);
    setRecorders([]);
    setStartDate('');
    setEndDate('');
    setClosedStartDate('');
    setClosedEndDate('');
    setSoldierFlagTypes([]);
    setSoldierFlagInformation([]);
    setSoldierFlagMXAvailability([]);
    setUpdaters([]);
    setSelectedStatusCodes([]);
    setSelectedFaultIds([]);
    setSelectedWucs([]);
  };

  return (
    <AMTPFilterContext.Provider
      value={{
        selectedFilterMOS,
        setSelectedFilterMOS,
        skillLevel,
        setSkillLevel,
        daysUntilDue,
        setDaysUntilDue,
        isCheckboxChecked,
        setIsCheckboxChecked,
        selectedUnit,
        setSelectedUnit,
        eventTypes,
        setEventTypes,
        eventInfo,
        setEventInfo,
        eventInfoOptions,
        setEventInfoOptions,
        documentType,
        setDocumentType,
        recorders,
        setRecorders,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        soldierFlagTypes,
        setSoldierFlagTypes,
        soldierFlagInformation,
        setSoldierFlagInformation,
        soldierFlagMXAvailability,
        setSoldierFlagMXAvailability,
        updaters,
        setUpdaters,
        selectedStatusCodes,
        setSelectedStatusCodes,
        selectedFaultIds,
        setSelectedFaultIds,
        selectedWucs,
        setSelectedWucs,
        closedStartDate,
        setClosedStartDate,
        closedEndDate,
        setClosedEndDate,
        clearFilters,
      }}
    >
      {children}
    </AMTPFilterContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAMTPFilterContext = () => {
  const context = useContext(AMTPFilterContext);
  if (!context) {
    throw new Error('useAMTPFilterContext must be used within an AMTPFilterProvider');
  }
  return context;
};
