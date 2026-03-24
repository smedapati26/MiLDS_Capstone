import path from 'path';
import { loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '',
    define: {
      __APP_VERSION__: JSON.stringify('v1.0.0'),
      __APP_ENV__: env.APP_ENV,
    },
    optimizeDeps: {
      exclude: ['node_modules', 'dist', 'tests', 'vitest', 'coverage'],
    },
    html: {
      cspNonce: '__NGINX_CSP_NONCE__',
    },
    plugins: [
      react(),
      svgr(),
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
          name: 'Griffin.ai',
          short_name: 'Griffin',
          description: 'US Army Aviation Predictive Maintenance',
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
        '@features': path.resolve(__dirname, './src/features'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@loaders': path.resolve(__dirname, './src/loaders'),
        '@models': path.resolve(__dirname, './src/models'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@store': path.resolve(__dirname, './src/store'),
        '@theme': path.resolve(__dirname, './src/theme'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@ai2c/pmx-mui': path.resolve(__dirname, './src/pmx-mui'),
      },
    },
    test: {
      env: {
        ...env,
        VITE_GRIFFIN_API_URL: 'http://127.0.0.1:8000/data',
        VITE_AMAP_API_URL: 'http://127.0.0.1:8080/v1/data',
      },
      environment: 'jsdom',
      include: ['./vitest/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      globals: true,
      setupFiles: './vitest/vite-test-setup.ts',
      coverage: {
        reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
        provider: 'v8',
        enabled: true,
        exclude: [
          ...configDefaults.exclude,
          '**/*index.ts',
          '**/*.cjs',
          '**/*.d.ts',
          '**/*.js',
          '**/*.json',
          '**/*vite-test-setup.ts',
          '**/*vitest/helpers/**/*',
          '**/*vitest/mocks/**/*',
          '**/*pwa-assets.config.ts',
        ],
      },
    },
  };
});
