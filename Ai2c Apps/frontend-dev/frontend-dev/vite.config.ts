import path from 'path';
import { loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react';
import os from 'os';

const cpus = os.cpus().length;
// In CI, adjust thread count to prevent excessive memory consumption
const osThreads = process.env.CI ? Math.ceil(cpus / 4) : undefined;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '',
    define: {
      __APP_VERSION__: JSON.stringify('v0.0.1'),
      __APP_ENV__: env.APP_ENV,
    },
    optimizeDeps: {
      exclude: ['node_modules', 'dist', 'tests', 'coverage'],
    },
    html: {
      cspNonce: '__NGINX_CSP_NONCE__',
    },
    plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 8000000, // Large max size to support react-plotly.js
          globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => {
                return url.pathname.startsWith('/data');
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        manifest: {
          name: 'A-MAP',
          short_name: 'A-MAP',
          description: 'US Army Aviation-Maintainer Analytics Platform',
          theme_color: '#0073E6',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
      {
        name: 'html-add-csp-nonce',
        enforce: 'post',
        transformIndexHtml(html) {
          // Style Regex
          const styleRegex = /(<[^>]+)style="([^"]*)"/g;

          return html.replace(styleRegex, (match, p1, p2) => {
            return `${p1}style="${p2}" nonce="__NGINX_CSP_NONCE__"`;
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@features': path.resolve(__dirname, './src/features'),
        '@loaders': path.resolve(__dirname, './src/loaders'),
        '@models': path.resolve(__dirname, './src/models'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@store': path.resolve(__dirname, './src/store'),
        '@theme': path.resolve(__dirname, './src/theme'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@ai2c/pmx-mui': path.resolve(__dirname, './src/pmx-mui'),
        '@pmx-mui-components': path.resolve(__dirname, './src/pmx-mui/components'),
        '@constants': path.resolve(__dirname, './src/pmx-mui/constants'),
        '@helpers': path.resolve(__dirname, './src/pmx-mui/helpers'),
        '@icons': path.resolve(__dirname, './src/pmx-mui/icons'),
        '@pmx-mui-models': path.resolve(__dirname, './src/pmx-mui/models'),
        '@pmx-mui-theme': path.resolve(__dirname, './src/pmx-mui/theme'),
        '@mui/styled-engine': '@mui/styled-engine-sc',
      },
    },
    test: {
      server: {
        deps: {
          fallbackCJS: true,
        },
      },
      testTimeout: 75000,
      environment: 'jsdom',
      include: ['./vitest/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      globals: true,
      setupFiles: './vitest/vite-test-setup.ts',
      pool: 'threads',
      minWorkers: osThreads,
      maxWorkers: osThreads,
      all: true,
      coverage: {
        reportsDirectory: './coverage',
        reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
        provider: 'v8',
        cleanOnRerun: true,
        enabled: true,
        exclude: [
          ...configDefaults.exclude,
          '**/*index.ts',
          '**/*.cjs',
          '**/*.d.ts',
          '**/*.json',
          '**/*vite-test-setup.ts',
          '**/*vitest/helpers/**/*',
          '**/*vitest/mocks/**/*',
          'node_modules',
        ],
      },
    },
  };
});
