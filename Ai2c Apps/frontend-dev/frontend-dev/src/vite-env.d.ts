/// <reference types="vite/client" />

declare module '*.png';
declare module '*.svg';

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly NODE_ENV: string;
  readonly VITE_AMAP_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
