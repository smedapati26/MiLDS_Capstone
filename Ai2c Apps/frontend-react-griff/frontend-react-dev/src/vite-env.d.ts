/// <reference types="vite/client" />

declare module '*.png';
declare module '*.svg';

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly NODE_ENV: string;
  readonly VITE_GRIFFIN_API_URL: string;
  readonly VITE_GRIFFIN_BASE_URL: string;
  readonly VITE_AMAP_API_URL: string;
  readonly VITE_FF_INDEX_ROUTE: string;
  readonly VITE_FF_ACCOUNT_MANAGEMENT: number;
  readonly VITE_FF_COMPONENT_MANAGEMENT: number;
  readonly VITE_FF_MAINTENANCE_SCHEDULE: number;
  readonly VITE_FF_MAINTENANCE_SCHEDULE_CALENDAR: number;
  readonly VITE_FF_MAINTENANCE_SCHEDULE_PHASE_FLOW: number;
  readonly VITE_FF_READINESS_ANALYTICS: number;
  readonly VITE_FF_READINESS_ANALYTICS_OVERVIEW: number;
  readonly VITE_FF_READINESS_ANALYTICS_TRAINING: number;
  readonly VITE_FF_READINESS_ANALYTICS_EQUIPMENT: number;
  readonly VITE_FF_READINESS_ANALYTICS_MAINTENANCE_TIME: number;
  readonly VITE_FF_READINESS_ANALYTICS_PERSONNEL: number;
  readonly VITE_FF_TASK_FORCES: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
