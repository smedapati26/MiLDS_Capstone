import * as React from 'react';
import { Provider } from 'react-redux';

import { EnhancedStore } from '@reduxjs/toolkit';

import { store as AppStore } from '@store/store';

export interface Props {
  store?: EnhancedStore;
  children?: React.ReactNode;
}

export const ProviderWrapper: React.FC<Props> = ({ store = AppStore, children }) => {
  return <Provider store={store}>{children}</Provider>;
};
