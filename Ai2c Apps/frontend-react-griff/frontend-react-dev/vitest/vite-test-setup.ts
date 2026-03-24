import React from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { vi } from 'vitest';

import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

import { server } from './mocks/server';

// Global Plotly mocks
vi.mock('plotly.js-dist-min', () => ({
  newPlot: vi.fn(),
  react: vi.fn(),
  purge: vi.fn(),
}));

vi.mock('react-plotly.js', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-plot' }, 'Plot Component'),
}));

// Jest DOM matchers
expect.extend(matchers);

// Enable the API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable the API mocking after the tests finished.
afterAll(() => server.close());

// setting up for observer
if (typeof globalThis.ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    observe() { }
    unobserve() { }
    disconnect() { }
  };
}
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Polyfill IntersectionObserver for Vitest/JSDOM (TypeScript-safe)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) { }
    disconnect() { }
    observe(_target: Element) { }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    unobserve(_target: Element) { }
  }

  globalThis.IntersectionObserver = IntersectionObserver;
}

ChartJS.register(
  ArcElement, // For Doughnut/Pie charts
  BarElement, // For Bar charts
  CategoryScale, // For categorical axes (x-axis in Bar charts)
  PointElement, // for the points of the line chart
  LineElement, // for line charts
  LinearScale, // For numeric axes (y-axis in Bar charts)
  annotationPlugin, // For annotation support
);
