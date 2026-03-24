import { describe, expect, it, vi } from 'vitest';

import { routes } from '../../src/routes';

// Mock Plotly component
vi.mock('react-plotly.js', () => ({
  default: () => <div data-testid="mock-plot">Plot Component</div>,
}));

describe('routes configuration', () => {
  it('should have a root redirect route', () => {
    const rootRoute = routes(true).find((route) => route.index);
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.loader).toBeDefined();
  });
});
