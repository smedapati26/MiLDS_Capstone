import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export interface Props {
  children: React.ReactNode;
}

/* Test Component */
export const DateAdapterTestingComponent: React.FC<Props> = ({ children }) => {
  return <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>;
};
