import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

import { server } from './mocks/server';

// Jest DOM matchers
expect.extend(matchers);

// Enable the API mocking before tests.
beforeAll(() => {
  server.listen();

  const url = new URL('http://localhost/');

  Object.defineProperty(window, 'location', {
    value: {
      ...url,
      href: url.href,
      origin: url.origin,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  });
});

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  vi.clearAllTimers();
  vi.clearAllMocks();
  cleanup();
});

// Disable the API mocking after the tests finished.
afterAll(() => server.close());
