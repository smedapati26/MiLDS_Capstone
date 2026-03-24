import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models/IAutoDsr';

// Define the context value type
interface MultiStepContextValue {
  launchStatus: string;
  setLaunchStatus: React.Dispatch<React.SetStateAction<string>>;
  flightHours: string;
  setFlightHours: React.Dispatch<React.SetStateAction<string>>;
  ORStatus: string;
  setORStatus: React.Dispatch<React.SetStateAction<string>>;
  remarks: string;
  setRemarks: React.Dispatch<React.SetStateAction<string>>;
  location: IAutoDsrLocation | undefined | null;
  setLocation: React.Dispatch<React.SetStateAction<IAutoDsrLocation | undefined | null>>;
  fieldSyncStatus: { [sync: string]: boolean };
  setFieldSyncStatus: React.Dispatch<React.SetStateAction<{ [sync: string]: boolean }>>;
  isNextReady: boolean;
  setIsNextReady: React.Dispatch<React.SetStateAction<boolean>>;
  resetUasMultiEditData: () => void;
}

// Create the context with undefined as default
const MultiStepContext = createContext<MultiStepContextValue | undefined>(undefined);

// Provider props
interface MultiStepProviderProps {
  children: ReactNode;
}

// Define initial/default values
const INITIAL_VALUES = {
  launchStatus: 'RTL',
  flightHours: '0',
  ORStatus: 'FMC',
  remarks: '',
  location: undefined,
  fieldSyncStatus: {
    rtl: true,
    status: true,
    flightHours: true,
    remarks: true,
    location: true,
  },
  isNextReady: true,
};

// Provider component
export const MultiStepProvider: React.FC<MultiStepProviderProps> = ({ children }) => {
  const [launchStatus, setLaunchStatus] = useState<string>(INITIAL_VALUES.launchStatus);
  const [flightHours, setFlightHours] = useState<string>(INITIAL_VALUES.flightHours);
  const [ORStatus, setORStatus] = useState<string>(INITIAL_VALUES.ORStatus);
  const [remarks, setRemarks] = useState<string>(INITIAL_VALUES.remarks);
  const [location, setLocation] = useState<IAutoDsrLocation | undefined | null>(INITIAL_VALUES.location);
  const [fieldSyncStatus, setFieldSyncStatus] = useState<{ [sync: string]: boolean }>(INITIAL_VALUES.fieldSyncStatus);
  const [isNextReady, setIsNextReady] = useState<boolean>(INITIAL_VALUES.isNextReady);

  // Reset function to restore all values to initial state
  const resetUasMultiEditData = useCallback(() => {
    setLaunchStatus(INITIAL_VALUES.launchStatus);
    setFlightHours(INITIAL_VALUES.flightHours);
    setORStatus(INITIAL_VALUES.ORStatus);
    setRemarks(INITIAL_VALUES.remarks);
    setLocation(INITIAL_VALUES.location);
    setFieldSyncStatus(INITIAL_VALUES.fieldSyncStatus);
    setIsNextReady(INITIAL_VALUES.isNextReady);
  }, []);

  const value: MultiStepContextValue = {
    launchStatus,
    setLaunchStatus,
    flightHours,
    setFlightHours,
    ORStatus,
    setORStatus,
    remarks,
    setRemarks,
    location,
    setLocation,
    fieldSyncStatus,
    setFieldSyncStatus,
    isNextReady,
    setIsNextReady,
    resetUasMultiEditData,
  };

  return <MultiStepContext.Provider value={value}>{children}</MultiStepContext.Provider>;
};

// Custom hook to use the context
export const useUasMultiStepData = (): MultiStepContextValue => {
  const context = useContext(MultiStepContext);
  if (context === undefined) {
    throw new Error('useUasMultiStepData must be used within an MultiStepProvider');
  }
  return context;
};

export default MultiStepContext;
