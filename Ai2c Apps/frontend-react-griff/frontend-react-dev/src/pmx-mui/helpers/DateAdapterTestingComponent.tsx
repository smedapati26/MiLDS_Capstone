import React from 'react';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

/* Represents DateAdapterTestingComponent properties */
export interface Props {
  children: React.ReactNode;
}

/**
 * A React functional component that provides a localization context for date handling using the Day.js adapter.
 *
 * @component
 * @param {Props} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the localization provider.
 *
 * @example
 * ```tsx
 * <DateAdapterTestingComponent>
 *   <YourComponent />
 * </DateAdapterTestingComponent>
 * ```
 */
export const DateAdapterTestingComponent: React.FC<Props> = ({ children }) => {
  return <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>;
};
