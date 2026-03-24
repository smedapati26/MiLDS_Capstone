import { ReactElement } from 'react';

declare module 'react-router-dom' {
  export interface IndexRouteObject {
    label: string;
    icon?: ReactElement | null;
  }
  export interface NonIndexRouteObject {
    label: string;
    icon?: ReactElement | null;
  }
}
