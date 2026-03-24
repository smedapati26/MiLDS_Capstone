/**
 * Entry point of the React application.
 *
 * This file sets up the main rendering process using ReactDOM and integrates
 * the Redux store and React Router for state management and routing respectively.
 *
 * - React.StrictMode is used to highlight potential problems in the application.
 * - Provider from react-redux makes the Redux store available to the rest of the app.
 * - RouterProvider from react-router-dom sets up the routing configuration.
 *
 * @file This is the main entry point for the React application.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

import { store } from './store/store';

import { router } from './routes';

import './index.css';

const styleNonce = document.querySelector("meta[name='csp-nonce']")?.getAttribute('content') || '';

const emotionCache = createCache({
  key: 'amap',
  nonce: styleNonce,
  prepend: true,
});

if (styleNonce) {
  document.querySelectorAll('style').forEach((style) => {
    style.setAttribute('nonce', styleNonce);
    emotionCache.nonce = styleNonce;
  });
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </CacheProvider>
  </React.StrictMode>,
);
